import { createClient } from "@/lib/supabase/server";
import {
  computeCurrentStreak,
  computeLongestStreak,
  getAllActionSteps,
  getCompletedDays,
  getCurrentUserId,
  getEntries,
} from "@/lib/data/entries";

export type UserStats = {
  totalEntries: number;
  totalKeyPoints: number;
  totalActionSteps: number;
  todoCount: number;
  doingCount: number;
  doneCount: number;
  completionRate: number;
  mostActiveEntry: { id: string; title: string; count: number } | null;
  dailyCompletions: { date: string; count: number }[];
  currentStreak: number;
  longestStreak: number;
};

export async function getUserStats(): Promise<UserStats> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      totalEntries: 0,
      totalKeyPoints: 0,
      totalActionSteps: 0,
      todoCount: 0,
      doingCount: 0,
      doneCount: 0,
      completionRate: 0,
      mostActiveEntry: null,
      dailyCompletions: [],
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  const supabase = await createClient();

  const [entries, allSteps, days, keyPointsCountResult] = await Promise.all([
    getEntries(),
    getAllActionSteps(),
    getCompletedDays(),
    supabase
      .from("key_points")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const totalActionSteps = allSteps.length;
  const todoCount = allSteps.filter((s) => s.status === "todo").length;
  const doingCount = allSteps.filter((s) => s.status === "doing").length;
  const doneCount = allSteps.filter((s) => s.status === "done").length;
  const completionRate =
    totalActionSteps > 0 ? Math.round((doneCount / totalActionSteps) * 100) : 0;

  const doneByEntry = new Map<string, { title: string; count: number }>();
  for (const step of allSteps) {
    if (step.status !== "done") continue;
    const entry = doneByEntry.get(step.entry_id) ?? {
      title: step.entry_title,
      count: 0,
    };
    entry.count++;
    doneByEntry.set(step.entry_id, entry);
  }
  let mostActiveEntry: UserStats["mostActiveEntry"] = null;
  for (const [id, v] of doneByEntry) {
    if (!mostActiveEntry || v.count > mostActiveEntry.count) {
      mostActiveEntry = { id, title: v.title, count: v.count };
    }
  }

  const dailyCompletions: UserStats["dailyCompletions"] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const count = allSteps.filter(
      (s) => s.completed_at?.slice(0, 10) === key,
    ).length;
    dailyCompletions.push({ date: key, count });
  }

  return {
    totalEntries: entries.length,
    totalKeyPoints: keyPointsCountResult.count ?? 0,
    totalActionSteps,
    todoCount,
    doingCount,
    doneCount,
    completionRate,
    mostActiveEntry,
    dailyCompletions,
    currentStreak: computeCurrentStreak(days),
    longestStreak: computeLongestStreak(days),
  };
}
