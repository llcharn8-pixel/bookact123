import type { DraftEntry } from "@/lib/types";
import { AssistantError, JSON_SHAPE, parseDraftEntry } from "@/lib/ai/assistant";
import { GeminiError, callGemini } from "@/lib/ai/gemini";

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

  let data: unknown;
  try {
    data = await callGemini(
      apiKey,
      GEMINI_MODEL,
      {
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
      },
      controller.signal,
    );
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new AssistantError("Transcription took too long. Try a shorter clip.");
    }
    throw new AssistantError(
      err instanceof GeminiError ? err.message : "Couldn't reach the transcription service. Try again.",
    );
  } finally {
    clearTimeout(timeout);
  }

  const text: string | undefined = (
    data as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  )?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new AssistantError("Transcription returned an empty response.");

  return parseDraftEntry(text, true);
}
