"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEntry, updateEntry } from "@/lib/actions/entries";
import type { Entry } from "@/lib/types";

export function EntryHeader({ entry }: { entry: Entry }) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const boundUpdate = updateEntry.bind(null, entry.id);
  const [state, formAction, pending] = useActionState(boundUpdate, {});
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !state.error) {
      submitted.current = false;
      setEditing(false);
    }
  }, [state]);

  async function handleDelete() {
    if (!confirm(`Delete "${entry.title}" and everything under it?`)) return;
    setDeleting(true);
    try {
      await deleteEntry(entry.id);
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
        className="space-y-3 rounded-lg border border-neutral-200 p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="title"
            required
            defaultValue={entry.title}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
          />
          <select
            name="type"
            defaultValue={entry.type}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="book">Book</option>
            <option value="article">Article</option>
          </select>
          <input
            name="author"
            defaultValue={entry.author ?? ""}
            placeholder="Author"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <textarea
            name="summary"
            defaultValue={entry.summary ?? ""}
            rows={2}
            placeholder="Summary"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm sm:col-span-2"
          />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-2 text-sm text-neutral-500 hover:text-neutral-900"
        >
          ← Entries
        </button>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium uppercase text-neutral-500">
            {entry.type}
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {entry.title}
        </h1>
        {entry.author && (
          <p className="text-sm text-neutral-500">{entry.author}</p>
        )}
        {entry.summary && (
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            {entry.summary}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-100"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
