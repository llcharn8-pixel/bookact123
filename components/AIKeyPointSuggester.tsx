"use client";

import { useState } from "react";
import { acceptDrafts, suggestKeyPoints } from "@/lib/actions/ai";
import type { DraftKeyPoint } from "@/lib/types";

export function AIKeyPointSuggester({
  entryId,
  summary,
}: {
  entryId: string;
  summary: string | null;
}) {
  const [drafts, setDrafts] = useState<DraftKeyPoint[] | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!summary?.trim()) return null;

  async function handleSuggest() {
    setLoading(true);
    setError(null);
    const result = await suggestKeyPoints(entryId, summary!);
    setLoading(false);
    if (result.error || !result.drafts) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    setDrafts(result.drafts);
    setSelected(new Set(result.drafts.map((_, i) => i)));
  }

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function handleAccept() {
    if (!drafts) return;
    const chosen = drafts.filter((_, i) => selected.has(i));
    if (chosen.length === 0) {
      setDrafts(null);
      return;
    }
    setAccepting(true);
    setError(null);
    const result = await acceptDrafts(entryId, chosen);
    setAccepting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setDrafts(null);
  }

  if (drafts === null) {
    return (
      <div>
        <button
          type="button"
          onClick={handleSuggest}
          disabled={loading}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100 disabled:opacity-50"
        >
          {loading ? "Thinking…" : "✨ Suggest key points"}
        </button>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <p className="text-xs text-neutral-400">
        No suggestions found in that summary.{" "}
        <button
          type="button"
          onClick={() => setDrafts(null)}
          className="underline"
        >
          Dismiss
        </button>
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-violet-200 bg-violet-50/50 p-4">
      <p className="text-xs font-semibold uppercase text-violet-700">
        AI suggestions — review before accepting
      </p>
      <div className="space-y-2">
        {drafts.map((draft, i) => (
          <label
            key={i}
            className="flex cursor-pointer items-start gap-2 rounded-md border border-violet-200 bg-white p-3"
          >
            <input
              type="checkbox"
              checked={selected.has(i)}
              onChange={() => toggle(i)}
              className="mt-1"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium">{draft.content}</p>
              {draft.action_steps.map((step, j) => (
                <p key={j} className="mt-1 text-xs text-neutral-500">
                  → {step.action}
                  {step.achievable_result && ` (${step.achievable_result})`}
                </p>
              ))}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleAccept}
          disabled={accepting}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {accepting
            ? "Saving…"
            : `Accept selected (${selected.size})`}
        </button>
        <button
          type="button"
          onClick={() => setDrafts(null)}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          Discard all
        </button>
      </div>
    </div>
  );
}
