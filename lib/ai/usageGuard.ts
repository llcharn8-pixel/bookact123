import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/data/entries";

// Two independent pools, since the two AI providers have very different real
// ceilings:
// - OpenRouter (DeepSeek): no observed quota pressure, kept generous.
// - Gemini: the free-tier API key caps at just 20 requests/day, PROJECT-WIDE
//   (not per user) — confirmed by hitting it during testing. A 10/user/day
//   cap does nothing to protect that; this pool has to be small enough that
//   a handful of users can't exhaust the whole app's Gemini quota in a day.
export const GENERAL_DAILY_LIMIT = 10;
export const GEMINI_DAILY_LIMIT = 3;

const GENERAL_ACTIONS = ["assistant_read", "get_recommendations"];
const GEMINI_ACTIONS = ["extract_key_points", "transcribe_media"];

function todayStartUtc(): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).toISOString();
}

async function countUsageToday(
  supabase: SupabaseClient,
  userId: string,
  actions: string[],
): Promise<number> {
  const { count } = await supabase
    .from("audit_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("action", actions)
    .gte("created_at", todayStartUtc());
  return count ?? 0;
}

type QuotaResult = { allowed: boolean; used: number; remaining: number };

export async function checkGeneralAiQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<QuotaResult> {
  const used = await countUsageToday(supabase, userId, GENERAL_ACTIONS);
  return {
    allowed: used < GENERAL_DAILY_LIMIT,
    used,
    remaining: Math.max(0, GENERAL_DAILY_LIMIT - used),
  };
}

export async function checkGeminiAiQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<QuotaResult> {
  const used = await countUsageToday(supabase, userId, GEMINI_ACTIONS);
  return {
    allowed: used < GEMINI_DAILY_LIMIT,
    used,
    remaining: Math.max(0, GEMINI_DAILY_LIMIT - used),
  };
}

export const GENERAL_AI_LIMIT_MESSAGE = `Daily limit reached (${GENERAL_DAILY_LIMIT}/${GENERAL_DAILY_LIMIT}). Resets at midnight UTC — try again tomorrow, or use the free file upload instead.`;
export const GEMINI_AI_LIMIT_MESSAGE = `Daily limit reached (${GEMINI_DAILY_LIMIT}/${GEMINI_DAILY_LIMIT}) for this feature — it's kept low because the underlying AI provider has a strict shared daily quota. Resets at midnight UTC, or use the free file upload instead.`;

export async function getAiUsageToday(): Promise<{
  general: { used: number; remaining: number; limit: number };
  gemini: { used: number; remaining: number; limit: number };
}> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      general: { used: 0, remaining: GENERAL_DAILY_LIMIT, limit: GENERAL_DAILY_LIMIT },
      gemini: { used: 0, remaining: GEMINI_DAILY_LIMIT, limit: GEMINI_DAILY_LIMIT },
    };
  }
  const supabase = await createClient();
  const [general, gemini] = await Promise.all([
    checkGeneralAiQuota(supabase, userId),
    checkGeminiAiQuota(supabase, userId),
  ]);
  return {
    general: { ...general, limit: GENERAL_DAILY_LIMIT },
    gemini: { ...gemini, limit: GEMINI_DAILY_LIMIT },
  };
}
