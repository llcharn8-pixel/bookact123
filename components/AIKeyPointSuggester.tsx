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
          className="w-full rounded-lg border border-gold/50 bg-gold-soft px-3 py-2.5 text-sm font-semibold text-gold hover:brightness-95 disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Thinking…" : "✨ Suggest key points"}
        </button>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <p className="text-xs text-ink-faint">
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
    <div className="space-y-3 rounded-xl border border-gold/40 bg-gold-soft p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-gold">
        AI suggestions — review before accepting
      </p>
      <div className="space-y-2">
        {drafts.map((draft, i) => (
          <label
            key={i}
            className="flex cursor-pointer items-start gap-2 rounded-lg border border-gold/30 bg-surface p-3"
          >
            <input
              type="checkbox"
              checked={selected.has(i)}
              onChange={() => toggle(i)}
              className="mt-1 h-4 w-4 accent-gold"
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink">{draft.content}</p>
              {draft.action_steps.map((step, j) => (
                <p key={j} className="mt-1 text-xs text-ink-soft">
                  → {step.action}
                  {step.achievable_result && ` (${step.achievable_result})`}
                </p>
              ))}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleAccept}
          disabled={accepting}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {accepting
            ? "Saving…"
            : `Accept selected (${selected.size})`}
        </button>
        <button
          type="button"
          onClick={() => setDrafts(null)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface"
        >
          Discard all
        </button>
      </div>
    </div>
  );
}
