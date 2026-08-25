"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ActionStatus, EntryType } from "@/lib/types";

export type ActionResult = { error: string } | { error?: undefined };

function fail(message: string): ActionResult {
  return { error: message };
}

// ── Entries ─────────────────────────────────────────────────────────────

export async function createEntry(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "book") as EntryType;
  const author = String(formData.get("author") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  if (!title) return fail("Title is required.");

  const supabase = await createClient();
  const { error } = await supabase.from("entries").insert({
    title,
    type,
    author: author || null,
    summary: summary || null,
  });

  if (error) return fail("Couldn't save. Check your connection and retry.");

  revalidatePath("/");
  return {};
}

export async function updateEntry(
  entryId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "book") as EntryType;
  const author = String(formData.get("author") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();

  if (!title) return fail("Title is required.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("entries")
    .update({ title, type, author: author || null, summary: summary || null })
    .eq("id", entryId);

  if (error) return fail("Couldn't save. Check your connection and retry.");

  revalidatePath("/");
  revalidatePath(`/entries/${entryId}`);
  return {};
}

export async function deleteEntry(entryId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("entries").delete().eq("id", entryId);
  revalidatePath("/");
  redirect("/");
}

// ── Key points ──────────────────────────────────────────────────────────

export async function createKeyPoint(
  entryId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return fail("Key point text is required.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("key_points")
    .insert({ entry_id: entryId, content });

  if (error) return fail("Couldn't save. Check your connection and retry.");

  revalidatePath(`/entries/${entryId}`);
  return {};
}

export async function updateKeyPoint(
  keyPointId: string,
  entryId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const content = String(formData.get("content") ?? "").trim();
  if (!content) return fail("Key point text is required.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("key_points")
    .update({ content })
    .eq("id", keyPointId);

  if (error) return fail("Couldn't save. Check your connection and retry.");

  revalidatePath(`/entries/${entryId}`);
  return {};
}

export async function deleteKeyPoint(
  keyPointId: string,
  entryId: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("key_points").delete().eq("id", keyPointId);
  revalidatePath(`/entries/${entryId}`);
}

// ── Action steps ────────────────────────────────────────────────────────

export async function createActionStep(
  keyPointId: string,
  entryId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const action = String(formData.get("action") ?? "").trim();
  const achievable_result = String(
    formData.get("achievable_result") ?? "",
  ).trim();

  if (!action) return fail("Action text is required.");

  const supabase = await createClient();
  const { error } = await supabase.from("action_steps").insert({
    key_point_id: keyPointId,
    action,
    achievable_result: achievable_result || null,
  });

  if (error) return fail("Couldn't save. Check your connection and retry.");

  revalidatePath(`/entries/${entryId}`);
  revalidatePath("/actions");
  return {};
}

export async function updateActionStep(
  actionStepId: string,
  entryId: string,
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const action = String(formData.get("action") ?? "").trim();
  const achievable_result = String(
    formData.get("achievable_result") ?? "",
  ).trim();

  if (!action) return fail("Action text is required.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("action_steps")
    .update({ action, achievable_result: achievable_result || null })
    .eq("id", actionStepId);

  if (error) return fail("Couldn't save. Check your connection and retry.");

  revalidatePath(`/entries/${entryId}`);
  revalidatePath("/actions");
  return {};
}

export async function deleteActionStep(
  actionStepId: string,
  entryId: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("action_steps").delete().eq("id", actionStepId);
  revalidatePath(`/entries/${entryId}`);
  revalidatePath("/actions");
}

export async function setActionStatus(
  actionStepId: string,
  entryId: string,
  status: ActionStatus,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("action_steps")
    .update({ status })
    .eq("id", actionStepId);
  revalidatePath(`/entries/${entryId}`);
  revalidatePath("/actions");
}
