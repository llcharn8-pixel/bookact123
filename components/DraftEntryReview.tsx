"use client";

import { useState } from "react";
import { createEntryFromAssistantDraft } from "@/lib/actions/assistant";
import type { DraftEntry } from "@/lib/types";

export function DraftEntryReview({
  draft,
  onDiscard,
}: {
  draft: DraftEntry;
  onDiscard: () => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(
    new Set(draft.key_points.map((_, i) => i)),
  );
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const result = await createEntryFromAssistantDraft(draft, [...selected]);
      if (result?.error) {
        setCreating(false);
        setError(result.error);
      }
      // On success the server action redirects; component unmounts.
    } catch (err) {
      // next/navigation's redirect() throws internally — let that propagate.
      if (
        err &&
        typeof err === "object" &&
        "digest" in err &&
        typeof err.digest === "string" &&
        err.digest.startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      setCreating(false);
      setError("Couldn't create the entry. Try again.");
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-gold/40 bg-gold-soft p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gold">
          {draft.grounded
            ? "Read from the page you linked"
            : "Generated from the assistant's own knowledge — verify before trusting it"}
        </p>
        <h3 className="mt-1 font-serif text-lg font-bold text-ink">{draft.title}</h3>
        {draft.author && <p className="text-sm text-ink-soft">{draft.author}</p>}
        <p className="mt-1 text-sm text-ink-soft">{draft.summary}</p>
      </div>

      <div className="space-y-2">
        {draft.key_points.length === 0 ? (
          <p className="text-xs text-ink-faint">No key points extracted.</p>
        ) : (
          draft.key_points.map((kp, i) => (
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
                <p className="text-sm font-medium text-ink">{kp.content}</p>
                {kp.action_steps.map((step, j) => (
                  <p key={j} className="mt-1 text-xs text-ink-soft">
                    → {step.action}
                    {step.achievable_result && ` (${step.achievable_result})`}
                  </p>
                ))}
              </div>
            </label>
          ))
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {creating ? "Creating…" : `Create entry (${selected.size} key points)`}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface"
        >
          Discard
        </button>
      </div>
    </div>
  );
}
