"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createEntry } from "@/lib/actions/entries";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1 block text-xs font-medium text-ink-soft";

export function NewEntryForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createEntry, {});
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !state.error) {
      submitted.current = false;
      setOpen(false);
    }
  }, [state]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover sm:w-auto"
      >
        + New Entry
      </button>
    );
  }

  return (
    <form
      action={(formData) => {
        submitted.current = true;
        formAction(formData);
      }}
      className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Title</label>
          <input
            name="title"
            required
            className={inputClass}
            placeholder="Atomic Habits, Chapter 1"
          />
        </div>
        <div>
          <label className={labelClass}>Type</label>
          <select name="type" defaultValue="book" className={inputClass}>
            <option value="book">Book</option>
            <option value="article">Article</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Author</label>
          <input
            name="author"
            className={inputClass}
            placeholder="James Clear"
          />
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass}>Summary</label>
          <textarea
            name="summary"
            rows={2}
            className={inputClass}
            placeholder="Small habits compound."
          />
        </div>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save entry"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
