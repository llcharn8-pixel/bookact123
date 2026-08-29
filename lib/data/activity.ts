import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/lib/data/entries";

export type ActivityLog = {
  id: string;
  action: string;
  risk_level: string;
  payload: Record<string, unknown> | null;
  target_id: string | null;
  entry_title: string | null;
  created_at: string;
};

export async function getActivityLog(): Promise<ActivityLog[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, risk_level, payload, target_id, target_table, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const entryIds = [
    ...new Set(
      data
        .filter((row) => row.target_table === "entries" && row.target_id)
        .map((row) => row.target_id as string),
    ),
  ];

  const titles = new Map<string, string>();
  if (entryIds.length > 0) {
    const { data: entries } = await supabase
      .from("entries")
      .select("id, title")
      .in("id", entryIds);
    for (const entry of entries ?? []) titles.set(entry.id, entry.title);
  }

  return data.map((row) => ({
    id: row.id,
    action: row.action,
    risk_level: row.risk_level,
    payload: row.payload as Record<string, unknown> | null,
    target_id: row.target_id,
    entry_title: row.target_id ? (titles.get(row.target_id) ?? null) : null,
    created_at: row.created_at,
  }));
}
