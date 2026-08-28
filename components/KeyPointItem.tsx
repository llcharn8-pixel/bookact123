"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { deleteKeyPoint, updateKeyPoint } from "@/lib/actions/entries";
import type { KeyPointWithActions } from "@/lib/types";
import { ActionStepItem } from "@/components/ActionStepItem";
import { NewActionStepForm } from "@/components/NewActionStepForm";

export function KeyPointItem({
  keyPoint,
  entryId,
}: {
  keyPoint: KeyPointWithActions;
  entryId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const boundUpdate = updateKeyPoint.bind(null, keyPoint.id, entryId);
  const [state, formAction, pending] = useActionState(boundUpdate, {});
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !state.error) {
      submitted.current = false;
      setEditing(false);
    }
  }, [state]);

  async function handleDelete() {
    if (!confirm("Delete this key point and its action steps?")) return;
    setDeleting(true);
    try {
      await deleteKeyPoint(keyPoint.id, entryId);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      {editing ? (
        <form
          action={(fd) => {
            submitted.current = true;
            formAction(fd);
          }}
          className="space-y-2"
        >
          <textarea
            name="content"
            required
            defaultValue={keyPoint.content}
            rows={2}
            className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {state.error && (
            <p className="text-xs text-red-600">{state.error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-ink">
            {keyPoint.content}
            {keyPoint.source === "ai" && (
              <span className="ml-2 rounded-full bg-gold-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gold">
                AI
              </span>
            )}
          </p>
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md px-2 py-1.5 text-xs text-ink-soft hover:bg-surface-muted hover:text-primary"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-md px-2 py-1.5 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 disabled:opacity-50"
            >
              {deleting ? "…" : "Delete"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-2 border-t border-border-soft pt-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
          Action steps
        </p>
        {keyPoint.action_steps.length === 0 ? (
          <p className="text-xs text-ink-faint">No action steps yet.</p>
        ) : (
          <div className="space-y-2">
            {keyPoint.action_steps.map((step) => (
              <ActionStepItem key={step.id} step={step} entryId={entryId} />
            ))}
          </div>
        )}
        <NewActionStepForm keyPointId={keyPoint.id} entryId={entryId} />
      </div>
    </div>
  );
}
