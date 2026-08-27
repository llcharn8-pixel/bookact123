"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { extractKeyPoints, ExtractionError } from "@/lib/ai/extractKeyPoints";
import type { DraftKeyPoint } from "@/lib/types";

export type SuggestResult =
  | { drafts: DraftKeyPoint[]; error?: undefined }
  | { drafts?: undefined; error: string };

export async function suggestKeyPoints(
  entryId: string,
  summary: string,
): Promise<SuggestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  if (!summary.trim()) {
    return { error: "This entry has no summary text to extract from." };
  }

  let drafts: DraftKeyPoint[];
  try {
    drafts = await extractKeyPoints(summary);
  } catch (err) {
    return {
      error:
        err instanceof ExtractionError
          ? err.message
          : "Couldn't reach the AI service. Try again.",
    };
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "extract_key_points",
    target_table: "entries",
    target_id: entryId,
    risk_level: "low",
    payload: { draft_count: drafts.length },
  });

  return { drafts };
}

export async function acceptDrafts(
  entryId: string,
  drafts: DraftKeyPoint[],
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  if (drafts.length === 0) return {};

  for (const draft of drafts) {
    const { data: keyPoint, error: kpError } = await supabase
      .from("key_points")
      .insert({
        entry_id: entryId,
        content: draft.content,
        user_id: user.id,
        source: "ai",
        ai_confidence: draft.confidence,
      })
      .select("id")
      .single();

    if (kpError || !keyPoint) {
      return { error: "Couldn't save the accepted key points. Try again." };
    }

    if (draft.action_steps.length > 0) {
      const { error: asError } = await supabase.from("action_steps").insert(
        draft.action_steps.map((step) => ({
          key_point_id: keyPoint.id,
          action: step.action,
          achievable_result: step.achievable_result,
          user_id: user.id,
          source: "ai",
          ai_confidence: step.confidence,
        })),
      );
      if (asError) {
        return { error: "Couldn't save the accepted action steps. Try again." };
      }
    }
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    action: "apply_drafts",
    target_table: "entries",
    target_id: entryId,
    risk_level: "medium",
    payload: { accepted_count: drafts.length },
  });

  revalidatePath(`/entries/${entryId}`);
  return {};
}
