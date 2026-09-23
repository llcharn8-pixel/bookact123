import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/data/entries";
import type { ActionStep, KeyPointForReview } from "@/lib/types";

// Simplified spaced-repetition schedule: day 1, day 7, day 30, then mastered.
const REVIEW_INTERVALS_DAYS = [1, 7, 30];
const MASTERED_AT_REVIEW_COUNT = REVIEW_INTERVALS_DAYS.length;

function isDue(reviewCount: number, createdAt: string, lastReviewedAt: string | null): boolean {
  if (reviewCount >= MASTERED_AT_REVIEW_COUNT) return false;
  const intervalDays = REVIEW_INTERVALS_DAYS[reviewCount];
  const anchor = lastReviewedAt ?? createdAt;
  const dueAt = new Date(anchor).getTime() + intervalDays * 24 * 60 * 60 * 1000;
  return Date.now() >= dueAt;
}

type Row = {
  id: string;
  user_id: string | null;
  entry_id: string;
  content: string;
  source: "human" | "ai";
  ai_confidence: number | null;
  review_count: number;
  last_reviewed_at: string | null;
  created_at: string;
  entries: { title: string; author: string | null };
  action_steps: ActionStep[];
};

export async function getDueKeyPoints(limit = 10): Promise<KeyPointForReview[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("key_points")
    .select("*, entries!inner(title, author), action_steps(*)")
    .eq("user_id", userId)
    .lt("review_count", MASTERED_AT_REVIEW_COUNT)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const due = (data as unknown as Row[]).filter((row) =>
    isDue(row.review_count, row.created_at, row.last_reviewed_at),
  );

  return due.slice(0, limit).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    entry_id: row.entry_id,
    content: row.content,
    source: row.source,
    ai_confidence: row.ai_confidence,
    review_count: row.review_count,
    last_reviewed_at: row.last_reviewed_at,
    created_at: row.created_at,
    entry_title: row.entries.title,
    entry_author: row.entries.author,
    action_steps: row.action_steps ?? [],
  }));
}

export async function getDueReviewCount(): Promise<number> {
  const due = await getDueKeyPoints(1000);
  return due.length;
}
