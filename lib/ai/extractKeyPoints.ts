import type { DraftKeyPoint } from "@/lib/types";

const SYSTEM_PROMPT = `You extract structured, actionable notes from a reader's summary of a book or article.

Return ONLY valid JSON matching this exact shape, nothing else — no prose, no markdown fences:
{
  "key_points": [
    {
      "content": "one important takeaway, in the reader's own voice",
      "confidence": 0.0,
      "action_steps": [
        { "action": "a concrete action the reader could take", "achievable_result": "what success looks like", "confidence": 0.0 }
      ]
    }
  ]
}

Rules:
- Extract 2-4 key points from the text. If the text is too short or vague to extract anything meaningful, return { "key_points": [] }.
- Each key point gets 0-2 action steps. Skip action_steps if none are clearly implied.
- confidence is your own estimate (0 to 1) of how well-supported this point is by the text.
- Keep content and action text concise (under 140 characters each).`;

export class ExtractionError extends Error {}

const GEMINI_MODEL = "gemini-3.6-flash";

export async function extractKeyPoints(
  summary: string,
): Promise<DraftKeyPoint[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ExtractionError("AI extraction is not configured.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: summary }] }],
        generationConfig: {
          responseMimeType: "application/json",
          maxOutputTokens: 4096,
        },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    console.error("Gemini API error:", response.status, body);
    throw new ExtractionError(`AI request failed (${response.status}).`);
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new ExtractionError("AI returned an empty response.");

  let parsed: unknown;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    throw new ExtractionError("Couldn't parse the AI's response.");
  }

  const keyPoints = (parsed as { key_points?: unknown }).key_points;
  if (!Array.isArray(keyPoints)) {
    throw new ExtractionError("AI response was missing key_points.");
  }

  return keyPoints
    .filter(
      (kp): kp is Record<string, unknown> =>
        typeof kp === "object" && kp !== null && typeof (kp as { content?: unknown }).content === "string",
    )
    .map((kp) => ({
      content: String(kp.content),
      confidence: typeof kp.confidence === "number" ? kp.confidence : 0.5,
      action_steps: Array.isArray(kp.action_steps)
        ? kp.action_steps
            .filter(
              (as): as is Record<string, unknown> =>
                typeof as === "object" && as !== null && typeof (as as { action?: unknown }).action === "string",
            )
            .map((as) => ({
              action: String(as.action),
              achievable_result:
                typeof as.achievable_result === "string" ? as.achievable_result : null,
              confidence: typeof as.confidence === "number" ? as.confidence : 0.5,
            }))
        : [],
    }));
}
