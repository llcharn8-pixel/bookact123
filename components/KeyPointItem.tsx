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
    <div className="rounded-lg border border-neutral-200 p-4">
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
            className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
          />
          {state.error && (
            <p className="text-xs text-red-600">{state.error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={pending}
              className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium">{keyPoint.content}</p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs text-neutral-500 hover:text-neutral-900"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
            >
              {deleting ? "…" : "Delete"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3">
        <p className="text-xs font-semibold uppercase text-neutral-400">
          Action steps
        </p>
        {keyPoint.action_steps.length === 0 ? (
          <p className="text-xs text-neutral-400">No action steps yet.</p>
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
