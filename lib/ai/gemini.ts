export class GeminiError extends Error {}

const RETRYABLE_STATUSES = new Set([503, 429]);
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Gemini returns 503 "model is currently experiencing high demand" fairly
// often on flash-tier models under load — Google's own guidance is that
// these spikes are usually short-lived, so a couple of quick retries
// resolves most of them transparently instead of surfacing a raw error.
export async function callGemini(
  apiKey: string,
  model: string,
  body: Record<string, unknown>,
  signal?: AbortSignal,
): Promise<unknown> {
  let lastStatus = 0;
  let lastBody = "";

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        signal,
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify(body),
      },
    );

    if (response.ok) {
      return response.json();
    }

    lastStatus = response.status;
    lastBody = await response.text();
    console.error(`Gemini API error (attempt ${attempt}/${MAX_ATTEMPTS}):`, lastStatus, lastBody);

    if (!RETRYABLE_STATUSES.has(response.status) || attempt === MAX_ATTEMPTS) {
      break;
    }
    await sleep(RETRY_DELAY_MS * attempt);
  }

  if (RETRYABLE_STATUSES.has(lastStatus)) {
    throw new GeminiError("The AI service is busy right now. Please try again in a minute.");
  }
  throw new GeminiError(`AI request failed (${lastStatus}).`);
}
