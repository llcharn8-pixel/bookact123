import type { DraftEntry } from "@/lib/types";
import { AssistantError, JSON_SHAPE, callOpenRouter, parseDraftEntry } from "@/lib/ai/assistant";

export function extractYoutubeVideoId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    return parsed.pathname.slice(1) || null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
    const shorts = parsed.pathname.match(/^\/shorts\/([^/]+)/);
    if (shorts) return shorts[1];
    const embed = parsed.pathname.match(/^\/embed\/([^/]+)/);
    if (embed) return embed[1];
  }

  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

export async function fetchTranscriptText(videoId: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let html: string;
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      signal: controller.signal,
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) throw new AssistantError(`Couldn't reach YouTube (${res.status}).`);
    html = await res.text();
  } catch (err) {
    if (err instanceof AssistantError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new AssistantError("YouTube took too long to respond. Try again.");
    }
    throw new AssistantError("Couldn't reach YouTube.");
  } finally {
    clearTimeout(timeout);
  }

  const match = html.match(/"captionTracks":(\[.*?\])/);
  if (!match) {
    throw new AssistantError("This video doesn't have captions available (or they're disabled).");
  }

  let tracks: Array<{ baseUrl: string; languageCode: string; kind?: string }>;
  try {
    tracks = JSON.parse(match[1]);
  } catch {
    throw new AssistantError("Couldn't read this video's captions.");
  }
  if (tracks.length === 0) {
    throw new AssistantError("This video doesn't have captions available.");
  }

  const track =
    tracks.find((t) => t.languageCode === "en" && t.kind !== "asr") ??
    tracks.find((t) => t.languageCode?.startsWith("en")) ??
    tracks[0];

  const ttController = new AbortController();
  const ttTimeout = setTimeout(() => ttController.abort(), 15000);
  let xml: string;
  try {
    const ttRes = await fetch(track.baseUrl, {
      signal: ttController.signal,
      headers: { "user-agent": "Mozilla/5.0" },
    });
    xml = await ttRes.text();
  } catch {
    throw new AssistantError("Couldn't fetch this video's captions.");
  } finally {
    clearTimeout(ttTimeout);
  }

  const lines = [...xml.matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g)].map((m) =>
    decodeHtmlEntities(m[1].replace(/<[^>]+>/g, "")).trim(),
  );
  const text = lines.join(" ").replace(/\s+/g, " ").trim();

  if (text.length < 50) {
    throw new AssistantError(
      "Couldn't retrieve captions for this video right now (YouTube sometimes blocks caption requests from server IPs). Try again, or try a different video.",
    );
  }

  return text.slice(0, 8000);
}

export async function readFromYoutube(url: string): Promise<DraftEntry> {
  const videoId = extractYoutubeVideoId(url);
  if (!videoId) {
    throw new AssistantError("That doesn't look like a valid YouTube URL.");
  }
  const transcript = await fetchTranscriptText(videoId);

  const system = `You are a listening assistant. You are given the caption transcript of a YouTube video (a talk, lecture, tutorial, or similar). Read it and return ONLY valid JSON matching this exact shape, nothing else — no prose, no markdown fences:\n${JSON_SHAPE}\n\nRules:\n- Infer a title from the content and a speaker/creator if identifiable, else null.\n- type is "article".\n- summary should be a concise 2-4 sentence summary of what was actually said.\n- Extract 2-5 key points genuinely discussed, each with 0-2 action steps clearly implied by the content.\n- confidence is your estimate (0-1) of how well-supported each point is by the transcript.\n- Ignore filler, timestamps, and caption artifacts — focus on substance.`;
  const responseText = await callOpenRouter(system, transcript);
  return parseDraftEntry(responseText, true);
}
