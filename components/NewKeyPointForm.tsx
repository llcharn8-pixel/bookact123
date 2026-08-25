"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createKeyPoint } from "@/lib/actions/entries";

export function NewKeyPointForm({ entryId }: { entryId: string }) {
  const [open, setOpen] = useState(false);
  const boundCreate = createKeyPoint.bind(null, entryId);
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
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
      >
        + Add key point
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
      className="space-y-2 rounded-lg border border-neutral-200 p-4"
    >
      <textarea
        name="content"
        required
        rows={2}
        placeholder="Habits compound over time"
        className="w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
      />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Add key point"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
