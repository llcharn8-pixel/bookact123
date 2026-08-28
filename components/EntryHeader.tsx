"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteEntry, updateEntry } from "@/lib/actions/entries";
import type { Entry } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

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
        className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            name="title"
            required
            defaultValue={entry.title}
            className={`${inputClass} sm:col-span-2`}
          />
          <select name="type" defaultValue={entry.type} className={inputClass}>
            <option value="book">Book</option>
            <option value="article">Article</option>
          </select>
          <input
            name="author"
            defaultValue={entry.author ?? ""}
            placeholder="Author"
            className={inputClass}
          />
          <textarea
            name="summary"
            defaultValue={entry.summary ?? ""}
            rows={2}
            placeholder="Summary"
            className={`${inputClass} sm:col-span-2`}
          />
        </div>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-2 text-sm text-ink-soft hover:text-primary"
        >
          ← Entries
        </button>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
            {entry.type}
          </span>
        </div>
        <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {entry.title}
        </h1>
        {entry.author && <p className="text-sm text-ink-soft">{entry.author}</p>}
        {entry.summary && (
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            {entry.summary}
          </p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-lg border border-red-200 bg-surface px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
