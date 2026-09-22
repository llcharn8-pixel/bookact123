import type { DraftEntry } from "@/lib/types";
import { AssistantError, JSON_SHAPE, parseDraftEntry } from "@/lib/ai/assistant";

const GEMINI_MODEL = "gemini-3.6-flash";

const PROMPT = `You are a listening assistant. You are given an audio or video file (a talk, lecture, podcast episode, or similar). Listen to it and return ONLY valid JSON matching this exact shape, nothing else — no prose, no markdown fences:
${JSON_SHAPE}

Rules:
- Infer a title from the content (its subject or the talk's name) and an author/speaker if identifiable, else null.
- type is "article".
- summary should be a concise 2-4 sentence summary of what was actually said.
- Extract 2-5 key points genuinely discussed in the recording, each with 0-2 action steps clearly implied by the content.
- confidence is your estimate (0-1) of how well-supported each point is by the audio/video.
- If the file has no meaningful speech or content, return { "title": "Untitled recording", "author": null, "type": "article", "summary": "", "key_points": [] }.`;

export async function transcribeMedia(
  base64Data: string,
  mimeType: string,
): Promise<DraftEntry> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AssistantError("Media transcription is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ inlineData: { mimeType, data: base64Data } }, { text: PROMPT }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 4096,
          },
        }),
      },
    );
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new AssistantError("Transcription took too long. Try a shorter clip.");
    }
    throw new AssistantError("Couldn't reach the transcription service. Try again.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text();
    console.error("Gemini media transcription error:", response.status, body);
    throw new AssistantError(`Transcription failed (${response.status}).`);
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new AssistantError("Transcription returned an empty response.");

  return parseDraftEntry(text, true);
}
