import { createClient } from "@/lib/supabase/server";
import type {
  ActionStepWithContext,
  Entry,
  EntryWithDetails,
  KeyPointWithActions,
} from "@/lib/types";

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function getEntries(): Promise<Entry[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getDemoEntries(): Promise<Entry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .is("user_id", null)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getEntryWithDetails(
  entryId: string,
): Promise<EntryWithDetails | null> {
  const supabase = await createClient();

  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .select("*")
    .eq("id", entryId)
    .maybeSingle();

  if (entryError) throw new Error(entryError.message);
  if (!entry) return null;

  const { data: keyPoints, error: kpError } = await supabase
    .from("key_points")
    .select("*")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });

  if (kpError) throw new Error(kpError.message);

  const keyPointIds = (keyPoints ?? []).map((kp) => kp.id);

  const actionStepsByKeyPoint = new Map<string, KeyPointWithActions["action_steps"]>();
  if (keyPointIds.length > 0) {
    const { data: actionSteps, error: asError } = await supabase
      .from("action_steps")
      .select("*")
      .in("key_point_id", keyPointIds)
      .order("created_at", { ascending: true });

    if (asError) throw new Error(asError.message);

    for (const step of actionSteps ?? []) {
      const list = actionStepsByKeyPoint.get(step.key_point_id) ?? [];
      list.push(step);
      actionStepsByKeyPoint.set(step.key_point_id, list);
    }
  }

  const key_points: KeyPointWithActions[] = (keyPoints ?? []).map((kp) => ({
    ...kp,
    action_steps: actionStepsByKeyPoint.get(kp.id) ?? [],
  }));

  return { ...entry, key_points };
}

export async function getEntryCompletionStats(
  entryId: string,
): Promise<{ total: number; done: number }> {
  const supabase = await createClient();

  const { data: keyPoints, error: kpError } = await supabase
    .from("key_points")
    .select("id")
    .eq("entry_id", entryId);

  if (kpError) throw new Error(kpError.message);
  const keyPointIds = (keyPoints ?? []).map((kp) => kp.id);
  if (keyPointIds.length === 0) return { total: 0, done: 0 };

  const { data: steps, error: asError } = await supabase
    .from("action_steps")
    .select("status")
    .in("key_point_id", keyPointIds);

  if (asError) throw new Error(asError.message);
  const total = steps?.length ?? 0;
  const done = steps?.filter((s) => s.status === "done").length ?? 0;
  return { total, done };
}

export async function getAllActionSteps(): Promise<ActionStepWithContext[]> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from("action_steps")
    .select(
      "*, key_points!inner(content, entry_id, entries!inner(id, title))",
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  type Row = {
    id: string;
    user_id: string | null;
    key_point_id: string;
    action: string;
    achievable_result: string | null;
    status: "todo" | "doing" | "done";
    created_at: string;
    key_points: {
      content: string;
      entry_id: string;
      entries: { id: string; title: string };
    };
  };

  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    key_point_id: row.key_point_id,
    action: row.action,
    achievable_result: row.achievable_result,
    status: row.status,
    created_at: row.created_at,
    key_point_content: row.key_points.content,
    entry_id: row.key_points.entry_id,
    entry_title: row.key_points.entries.title,
  }));
}
