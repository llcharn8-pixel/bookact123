"use server";

import { createClient } from "@/lib/supabase/server";
import { AssistantError } from "@/lib/ai/assistant";
import { getRecommendations, type RecommendationQuery } from "@/lib/ai/recommendations";
import type { Recommendation } from "@/lib/types";

export type RecommendationsResult =
  | { recommendations: Recommendation[]; error?: undefined }
  | { recommendations?: undefined; error: string };

const ALLOWED_COUNTS = [5, 10, 20];

export async function fetchRecommendations(
  query: RecommendationQuery,
  language: string,
  count: number,
): Promise<RecommendationsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const value = query.mode === "category" ? query.category : query.author;
  if (!value.trim()) {
    return {
      error:
        query.mode === "category"
          ? "Pick or type a category first."
          : "Type an author name first.",
    };
  }

  const safeCount = ALLOWED_COUNTS.includes(count) ? count : 5;

  const { data: existing } = await supabase
    .from("entries")
    .select("title")
    .eq("user_id", user.id);
  const alreadyRead = (existing ?? []).map((e) => e.title);

  let recommendations: Recommendation[];
  try {
    recommendations = await getRecommendations(query, alreadyRead, language, safeCount);
  } catch (err) {
    return {
      error:
        err instanceof AssistantError
          ? err.message
          : "Couldn't reach the assistant. Try again.",
    };
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "get_recommendations",
    target_table: "entries",
    target_id: null,
    risk_level: "low",
    payload: { query, language, count: recommendations.length },
  });

  return { recommendations };
}
