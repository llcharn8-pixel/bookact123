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
        className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
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
      className="space-y-2 rounded-md border border-neutral-200 bg-neutral-50 p-3"
    >
      <input
        name="action"
        required
        placeholder="Track one habit daily"
        className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      <input
        name="achievable_result"
        placeholder="Achievable result (e.g. 30-day visible streak)"
        className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Add"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-200"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
