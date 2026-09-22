import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/data/entries";

// Kept low enough that normal use comfortably stays inside the free tiers of
// the underlying providers (Gemini, OpenRouter), so running the app costs
// nothing at this usage level.
export const DAILY_AI_LIMIT = 10;

const LIMITED_ACTIONS = [
  "extract_key_points",
  "assistant_read",
  "get_recommendations",
  "transcribe_media",
];

function todayStartUtc(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

async function countUsageToday(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count } = await supabase
    .from("audit_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("action", LIMITED_ACTIONS)
    .gte("created_at", todayStartUtc());
  return count ?? 0;
}

export async function checkAiQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const used = await countUsageToday(supabase, userId);
  return { allowed: used < DAILY_AI_LIMIT, used, remaining: Math.max(0, DAILY_AI_LIMIT - used) };
}

export const AI_LIMIT_MESSAGE = `Daily AI limit reached (${DAILY_AI_LIMIT}/${DAILY_AI_LIMIT}). Resets at midnight UTC — try again tomorrow, or use the free file upload instead.`;

export async function getAiUsageToday(): Promise<{ used: number; remaining: number; limit: number }> {
  const userId = await getCurrentUserId();
  if (!userId) return { used: 0, remaining: DAILY_AI_LIMIT, limit: DAILY_AI_LIMIT };
  const supabase = await createClient();
  const { used, remaining } = await checkAiQuota(supabase, userId);
  return { used, remaining, limit: DAILY_AI_LIMIT };
}
