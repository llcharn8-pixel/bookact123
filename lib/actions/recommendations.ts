"use server";

import { createClient } from "@/lib/supabase/server";
import { AssistantError } from "@/lib/ai/assistant";
import { getRecommendations } from "@/lib/ai/recommendations";
import type { Recommendation } from "@/lib/types";

export type RecommendationsResult =
  | { recommendations: Recommendation[]; error?: undefined }
  | { recommendations?: undefined; error: string };

export async function fetchRecommendations(
  category: string,
): Promise<RecommendationsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  if (!category.trim()) return { error: "Pick or type a category first." };

  const { data: existing } = await supabase
    .from("entries")
    .select("title")
    .eq("user_id", user.id);
  const alreadyRead = (existing ?? []).map((e) => e.title);

  let recommendations: Recommendation[];
  try {
    recommendations = await getRecommendations(category.trim(), alreadyRead);
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
    payload: { category: category.trim(), count: recommendations.length },
  });

  return { recommendations };
}
