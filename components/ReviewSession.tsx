"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { markKeyPointReviewed } from "@/lib/actions/review";
import type { KeyPointForReview } from "@/lib/types";

export function ReviewSession({ initialDue }: { initialDue: KeyPointForReview[] }) {
  const [queue, setQueue] = useState(initialDue);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(0);
  const [pending, startTransition] = useTransition();

  const current = queue[0];

  function respond(remembered: boolean) {
    if (!current) return;
    startTransition(async () => {
      await markKeyPointReviewed(current.id, remembered);
    });
    setQueue((q) => q.slice(1));
    setRevealed(false);
    setDone((d) => d + 1);
  }

  if (!current) {
    return (
      <div className="rounded-xl border border-dashed border-border p-8 text-center">
        <p className="text-sm text-ink-soft">
          {done > 0
            ? `Nice — you reviewed ${done} key point${done === 1 ? "" : "s"}. Nothing else is due right now.`
            : "Nothing to review right now. Come back later — key points surface here on a spaced schedule (day 1, day 7, day 30) as you log them."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">
        {queue.length} due{done > 0 ? ` · ${done} reviewed this session` : ""}
      </p>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <Link
          href={`/entries/${current.entry_id}`}
          className="text-xs font-semibold text-primary hover:underline"
        >
          {current.entry_title}
          {current.entry_author ? ` — ${current.entry_author}` : ""}
        </Link>

        {!revealed ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-ink-soft">
              Do you still remember the key point you logged from this?
            </p>
            <button
              type="button"
              onClick={() => setRevealed(true)}
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
            >
              Reveal it
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <p className="font-serif text-base text-ink">{current.content}</p>
            {current.action_steps.length > 0 && (
              <div className="space-y-1 border-t border-border-soft pt-3">
                {current.action_steps.map((step) => (
                  <p key={step.id} className="text-xs text-ink-soft">
                    → {step.action}
                  </p>
                ))}
              </div>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => respond(true)}
                disabled={pending}
                className="rounded-lg bg-done px-4 py-2.5 text-sm font-semibold text-white hover:brightness-95 disabled:opacity-50"
              >
                I remembered it
              </button>
              <button
                type="button"
                onClick={() => respond(false)}
                disabled={pending}
                className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface-muted disabled:opacity-50"
              >
                I forgot it
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
