"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createActionStep } from "@/lib/actions/entries";

export function NewActionStepForm({
  keyPointId,
  entryId,
}: {
  keyPointId: string;
  entryId: string;
}) {
  const [open, setOpen] = useState(false);
  const boundCreate = createActionStep.bind(null, keyPointId, entryId);
  const [state, formAction, pending] = useActionState(boundCreate, {});
  const submitted = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (submitted.current && !state.error) {
      submitted.current = false;
      formRef.current?.reset();
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary-soft"
      >
        + Add action step
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(fd) => {
        submitted.current = true;
        formAction(fd);
      }}
      className="space-y-2 rounded-lg border border-border bg-surface-muted p-3"
    >
      <input
        name="action"
        required
        placeholder="Track one habit daily"
        className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      <input
        name="achievable_result"
        placeholder="Achievable result (e.g. 30-day visible streak)"
        className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-soft hover:bg-surface"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
