"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  deleteActionStep,
  setActionReflection,
  setActionStatus,
  updateActionStep,
} from "@/lib/actions/entries";
import type { ActionStatus, ActionStep } from "@/lib/types";
import { AiBadge } from "@/components/AiBadge";

const STATUS_ORDER: ActionStatus[] = ["todo", "doing", "done"];
const STATUS_STYLE: Record<ActionStatus, string> = {
  todo: "bg-todo-soft text-todo",
  doing: "bg-doing-soft text-doing",
  done: "bg-done-soft text-done",
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
  const [reflecting, setReflecting] = useState(false);
  const [reflectionText, setReflectionText] = useState(step.reflection ?? "");
  const [savingReflection, setSavingReflection] = useState(false);
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

  async function handleSaveReflection() {
    setSavingReflection(true);
    try {
      await setActionReflection(step.id, entryId, reflectionText);
      setReflecting(false);
    } finally {
      setSavingReflection(false);
    }
  }

  if (editing) {
    return (
      <form
        action={(fd) => {
          submitted.current = true;
          formAction(fd);
        }}
        className="space-y-2 rounded-lg border border-border bg-surface-muted p-3"
      >
        <input
          name="action"
          required
          defaultValue={step.action}
          className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          name="achievable_result"
          defaultValue={step.achievable_result ?? ""}
          placeholder="Achievable result"
          className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
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
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {step.action}
            {step.source === "ai" && (
              <AiBadge confidence={step.ai_confidence} />
            )}
          </p>
          {step.achievable_result && (
            <p className="mt-0.5 text-xs text-ink-soft">
              → {step.achievable_result}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={cycleStatus}
            disabled={toggling}
            className={`rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${STATUS_STYLE[step.status]}`}
          >
            {toggling ? "…" : STATUS_LABEL[step.status]}
          </button>
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

      {step.status === "done" && (
        <div className="mt-2 border-t border-border-soft pt-2">
          {reflecting ? (
            <div className="space-y-2">
              <textarea
                value={reflectionText}
                onChange={(e) => setReflectionText(e.target.value)}
                rows={2}
                placeholder="What actually happened when you did this?"
                className="w-full rounded-lg border border-border bg-surface-muted px-2.5 py-2 text-xs text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveReflection}
                  disabled={savingReflection}
                  className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
                >
                  {savingReflection ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReflecting(false);
                    setReflectionText(step.reflection ?? "");
                  }}
                  className="rounded-lg px-3 py-1 text-xs font-medium text-ink-soft hover:bg-surface-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : step.reflection ? (
            <button
              type="button"
              onClick={() => setReflecting(true)}
              className="text-left text-xs italic text-ink-soft hover:text-primary"
            >
              💭 {step.reflection}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setReflecting(true)}
              className="text-xs font-medium text-primary hover:underline"
            >
              💭 What actually happened? (optional)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
