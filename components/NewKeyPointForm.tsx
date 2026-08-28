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
        className="w-full rounded-lg border border-dashed border-primary/40 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary-soft sm:w-auto"
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
      className="space-y-2 rounded-xl border border-border bg-surface p-4 shadow-sm"
    >
      <textarea
        name="content"
        required
        rows={2}
        placeholder="Habits compound over time"
        className="w-full rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : "Add key point"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
