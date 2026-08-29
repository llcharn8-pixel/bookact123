import type { Recommendation } from "@/lib/types";
import { AssistantError, callOpenRouter } from "@/lib/ai/assistant";

export async function getRecommendations(
  category: string,
  exclude: string[],
  language: string,
): Promise<Recommendation[]> {
  const system = `You are a knowledgeable reading advisor. Given a topic/category, recommend well-known, highly-regarded books and articles about it. Return ONLY valid JSON matching this exact shape, nothing else — no prose, no markdown fences:
{
  "recommendations": [
    { "title": "...", "author": "author name or null", "type": "book" or "article", "reason": "one concise sentence on why this fits the category" }
  ]
}

Rules:
- Recommend exactly 5 items.
- Prefer well-known, widely-respected works available in ${language}. If a work is originally in another language, use its official ${language} title/translation when one exists.
- Write "title", "author", and "reason" in ${language}.
- Prefer well-known, widely-respected works over obscure ones.
- Do not recommend anything in this already-read list: ${exclude.length ? exclude.join(", ") : "(none)"}.
- reason should be specific to this book/article, not generic.`;

  const responseText = await callOpenRouter(system, `Category: ${category}`);

  let parsed: unknown;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
  } catch {
    throw new AssistantError("Couldn't parse the recommendations.");
  }

  const list = (parsed as { recommendations?: unknown }).recommendations;
  if (!Array.isArray(list)) {
    throw new AssistantError("Response was missing recommendations.");
  }

  return list
    .filter(
      (r): r is Record<string, unknown> =>
        typeof r === "object" && r !== null && typeof (r as { title?: unknown }).title === "string",
    )
    .map((r) => ({
      title: String(r.title),
      author: typeof r.author === "string" && r.author.trim() ? r.author : null,
      type: r.type === "article" ? "article" : "book",
      reason: typeof r.reason === "string" ? r.reason : "",
    }));
}
