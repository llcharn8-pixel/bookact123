import { NextResponse } from "next/server";
import { fetchTranscriptText } from "@/lib/ai/youtube";

export async function GET(request: Request) {
  const videoId = new URL(request.url).searchParams.get("v") ?? "jNQXAC9IVRw";

  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "accept-language": "en-US,en;q=0.9",
    },
  });
  const html = await res.text();
  const hasCaptionTracks = html.includes('"captionTracks"');
  const hasConsent = /consent\.youtube\.com|Before you continue to YouTube/i.test(html);
  const hasCaptcha = /unusual traffic|g-recaptcha/i.test(html);

  let transcriptResult: { ok: boolean; length?: number; sample?: string; error?: string };
  try {
    const text = await fetchTranscriptText(videoId);
    transcriptResult = { ok: true, length: text.length, sample: text.slice(0, 200) };
  } catch (err) {
    transcriptResult = { ok: false, error: err instanceof Error ? err.message : String(err) };
  }

  return NextResponse.json({
    status: res.status,
    htmlLength: html.length,
    hasCaptionTracks,
    hasConsent,
    hasCaptcha,
    htmlSnippet: html.slice(0, 300),
    transcriptResult,
  });
}
