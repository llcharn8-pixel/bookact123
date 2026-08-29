import type { DraftEntry } from "@/lib/types";

export class AssistantError extends Error {}

const OPENROUTER_MODEL = "deepseek/deepseek-v4-flash-0731";

const JSON_SHAPE = `{
  "title": "the book or article title",
  "author": "author name, or null if unknown",
  "type": "book" or "article",
  "summary": "a concise 2-4 sentence summary",
  "key_points": [
    {
      "content": "one important takeaway",
      "confidence": 0.0,
      "action_steps": [
        { "action": "a concrete action the reader could take", "achievable_result": "what success looks like", "confidence": 0.0 }
      ]
    }
  ]
}`;

export async function callOpenRouter(system: string, user: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AssistantError("Smart Assistant is not configured.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);

  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: { type: "json_object" },
        max_tokens: 1200,
        reasoning: { enabled: false },
      }),
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new AssistantError("The assistant took too long to respond. Try again.");
    }
    throw new AssistantError("Couldn't reach the assistant. Try again.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const body = await response.text();
    console.error("OpenRouter API error:", response.status, body);
    throw new AssistantError(`Assistant request failed (${response.status}).`);
  }

  const data = await response.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) throw new AssistantError("Assistant returned an empty response.");
  return text;
}

function parseDraftEntry(text: string, grounded: boolean): DraftEntry {
  let parsed: unknown;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    throw new AssistantError("Couldn't parse the assistant's response.");
  }

  const obj = parsed as Record<string, unknown>;
  if (typeof obj.title !== "string" || !obj.title.trim()) {
    console.error("Assistant response missing title. Raw text:", text);
    throw new AssistantError("Assistant response was missing a title.");
  }

  const keyPoints = Array.isArray(obj.key_points) ? obj.key_points : [];

  return {
    title: obj.title,
    author: typeof obj.author === "string" && obj.author.trim() ? obj.author : null,
    type: obj.type === "article" ? "article" : "book",
    summary: typeof obj.summary === "string" ? obj.summary : "",
    grounded,
    key_points: keyPoints
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
      })),
  };
}

async function fetchReadableText(url: string): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new AssistantError("That doesn't look like a valid URL.");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new AssistantError("Only http/https URLs are supported.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  let response: Response;
  try {
    response = await fetch(parsed.toString(), {
      signal: controller.signal,
      headers: { "user-agent": "Mozilla/5.0 (compatible; ReadActBot/1.0)" },
    });
  } catch {
    throw new AssistantError("Couldn't reach that URL.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new AssistantError(`That URL returned an error (${response.status}).`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
    throw new AssistantError("That URL isn't a readable web page.");
  }

  const html = await response.text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length < 200) {
    throw new AssistantError(
      "Couldn't find enough readable text on that page (it may require JavaScript to load).",
    );
  }

  return text.slice(0, 6000);
}

export async function readFromUrl(url: string): Promise<DraftEntry> {
  const text = await fetchReadableText(url);
  const system = `You are a reading assistant. You are given the raw text of a web page (article or book excerpt). Read it and return ONLY valid JSON matching this exact shape, nothing else — no prose, no markdown fences:\n${JSON_SHAPE}\n\nRules:\n- Infer title and author from the text itself.\n- type is "article" unless the text is clearly from a book.\n- summary should be in the reader's own voice, concise.\n- Extract 2-5 key points, each with 0-2 action steps.\n- confidence is your estimate (0-1) of how well-supported each point is by the text.`;
  const responseText = await callOpenRouter(system, text);
  return parseDraftEntry(responseText, true);
}

export async function readFromTitle(
  title: string,
  author: string | null,
  language: string = "English",
): Promise<DraftEntry> {
  const system = `You are a well-read assistant. The user gives you a book or article title (and maybe an author). Using your own knowledge of that work, return ONLY valid JSON matching this exact shape, nothing else — no prose, no markdown fences:\n${JSON_SHAPE}\n\nRules:\n- Write "title", "author", "summary", "content", "action", and "achievable_result" all in ${language}. If the work has an official ${language} title, use it.\n- If you don't confidently recognize this specific work, still do your best but keep confidence scores low (below 0.4) on every key point and action step, and keep the summary honest about uncertainty.\n- Extract 2-5 key points, each with 0-2 action steps.\n- confidence is your estimate (0-1) of how accurate each point is to the real work — be honest, not optimistic.`;
  const userMessage = author ? `${title} by ${author}` : title;
  const responseText = await callOpenRouter(system, userMessage);
  return parseDraftEntry(responseText, false);
}
