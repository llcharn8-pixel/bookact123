"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  deleteActionStep,
  setActionStatus,
  updateActionStep,
} from "@/lib/actions/entries";
import type { ActionStatus, ActionStep } from "@/lib/types";

const STATUS_ORDER: ActionStatus[] = ["todo", "doing", "done"];
const STATUS_STYLE: Record<ActionStatus, string> = {
  todo: "bg-neutral-100 text-neutral-600",
  doing: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
};
const STATUS_LABEL: Record<ActionStatus, string> = {
  todo: "To do",
  doing: "Doing",
  done: "Done",
};

export function ActionStepItem({
  step,
  entryId,
}: {
  step: ActionStep;
  entryId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const boundUpdate = updateActionStep.bind(null, step.id, entryId);
  const [state, formAction, pending] = useActionState(boundUpdate, {});
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !state.error) {
      submitted.current = false;
      setEditing(false);
    }
  }, [state]);

  async function cycleStatus() {
    const next =
      STATUS_ORDER[(STATUS_ORDER.indexOf(step.status) + 1) % STATUS_ORDER.length];
    setToggling(true);
    try {
      await setActionStatus(step.id, entryId, next);
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this action step?")) return;
    setDeleting(true);
    try {
      await deleteActionStep(step.id, entryId);
    } catch {
      setDeleting(false);
    }
  }

  if (editing) {
    return (
      <form
        action={(fd) => {
          submitted.current = true;
          formAction(fd);
        }}
        className="space-y-2 rounded-md border border-neutral-200 bg-neutral-50 p-3"
      >
        <input
          name="action"
          required
          defaultValue={step.action}
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
        <input
          name="achievable_result"
          defaultValue={step.achievable_result ?? ""}
          placeholder="Achievable result"
          className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
        />
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
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
            className="rounded-md px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3 rounded-md border border-neutral-200 p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{step.action}</p>
        {step.achievable_result && (
          <p className="mt-0.5 text-xs text-neutral-500">
            → {step.achievable_result}
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={cycleStatus}
          disabled={toggling}
          className={`rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${STATUS_STYLE[step.status]}`}
        >
          {toggling ? "…" : STATUS_LABEL[step.status]}
        </button>
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
  );
}
