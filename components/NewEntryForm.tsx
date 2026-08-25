"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createEntry } from "@/lib/actions/entries";

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
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
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
      className="space-y-3 rounded-lg border border-neutral-200 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Title
          </label>
          <input
            name="title"
            required
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Atomic Habits, Chapter 1"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Type
          </label>
          <select
            name="type"
            defaultValue="book"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="book">Book</option>
            <option value="article">Article</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Author
          </label>
          <input
            name="author"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="James Clear"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-neutral-600">
            Summary
          </label>
          <textarea
            name="summary"
            rows={2}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Small habits compound."
          />
        </div>
      </div>
      {state.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save entry"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
