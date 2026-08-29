"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AssistantError, readFromTitle, readFromUrl } from "@/lib/ai/assistant";
import type { DraftEntry } from "@/lib/types";

export type AssistantResult =
  | { draft: DraftEntry; error?: undefined }
  | { draft?: undefined; error: string };

export async function readWithAssistant(
  input:
    | { mode: "url"; url: string }
    | { mode: "title"; title: string; author: string; language?: string },
): Promise<AssistantResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  let draft: DraftEntry;
  try {
    draft =
      input.mode === "url"
        ? await readFromUrl(input.url)
        : await readFromTitle(input.title, input.author || null, input.language);
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
    action: "assistant_read",
    target_table: "entries",
    target_id: null,
    risk_level: "low",
    payload: { mode: input.mode, key_point_count: draft.key_points.length },
  });

  return { draft };
}

export async function createEntryFromAssistantDraft(
  draft: DraftEntry,
  selectedIndexes: number[],
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: entry, error: entryError } = await supabase
    .from("entries")
    .insert({
      title: draft.title,
      author: draft.author,
      type: draft.type,
      summary: draft.summary,
      user_id: user.id,
    })
    .select("id")
    .single();

  if (entryError || !entry) {
    return { error: "Couldn't create the entry. Try again." };
  }

  const chosen = selectedIndexes
    .map((i) => draft.key_points[i])
    .filter((kp): kp is DraftEntry["key_points"][number] => Boolean(kp));

  for (const kp of chosen) {
    const { data: keyPoint, error: kpError } = await supabase
      .from("key_points")
      .insert({
        entry_id: entry.id,
        content: kp.content,
        user_id: user.id,
        source: "ai",
        ai_confidence: kp.confidence,
      })
      .select("id")
      .single();

    if (kpError || !keyPoint) {
      return { error: "Entry created, but saving key points failed. Add them manually." };
    }

    if (kp.action_steps.length > 0) {
      const { error: asError } = await supabase.from("action_steps").insert(
        kp.action_steps.map((step) => ({
          key_point_id: keyPoint.id,
          action: step.action,
          achievable_result: step.achievable_result,
          user_id: user.id,
          source: "ai",
          ai_confidence: step.confidence,
        })),
      );
      if (asError) {
        return { error: "Entry created, but saving some action steps failed." };
      }
    }
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "assistant_apply_drafts",
    target_table: "entries",
    target_id: entry.id,
    risk_level: "medium",
    payload: { accepted_count: chosen.length },
  });

  revalidatePath("/");
  redirect(`/entries/${entry.id}`);
}
