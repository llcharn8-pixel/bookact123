"use client";

import { useState } from "react";
import {
  createEntryFromAssistantDraft,
  readWithAssistant,
} from "@/lib/actions/assistant";
import type { DraftEntry } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

type Mode = "url" | "title";

export function SmartAssistant() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftEntry | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  function reset() {
    setOpen(false);
    setUrl("");
    setTitle("");
    setAuthor("");
    setDraft(null);
    setError(null);
  }

  async function handleRead() {
    setError(null);
    if (mode === "url" && !url.trim()) {
      setError("Paste a URL first.");
      return;
    }
    if (mode === "title" && !title.trim()) {
      setError("Type a title first.");
      return;
    }

    setLoading(true);
    const result = await readWithAssistant(
      mode === "url"
        ? { mode: "url", url: url.trim() }
        : { mode: "title", title: title.trim(), author: author.trim() },
    );
    setLoading(false);

    if (result.error || !result.draft) {
      setError(result.error ?? "Something went wrong.");
      return;
    }
    setDraft(result.draft);
    setSelected(new Set(result.draft.key_points.map((_, i) => i)));
  }

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function handleCreate() {
    if (!draft) return;
    setCreating(true);
    setError(null);
    const result = await createEntryFromAssistantDraft(draft, [...selected]);
    if (result?.error) {
      setCreating(false);
      setError(result.error);
    }
    // On success the server action redirects; component unmounts.
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-lg border border-gold/50 bg-gold-soft px-4 py-2.5 text-sm font-semibold text-gold hover:brightness-95 sm:w-auto"
      >
        🤖 Smart Assistant — read it for me
      </button>
    );
  }

  if (draft) {
    return (
      <div className="space-y-3 rounded-xl border border-gold/40 bg-gold-soft p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gold">
            {draft.grounded
              ? "Read from the page you linked"
              : "Generated from the assistant's own knowledge — verify before trusting it"}
          </p>
          <h3 className="mt-1 font-serif text-lg font-bold text-ink">
            {draft.title}
          </h3>
          {draft.author && <p className="text-sm text-ink-soft">{draft.author}</p>}
          <p className="mt-1 text-sm text-ink-soft">{draft.summary}</p>
        </div>

        <div className="space-y-2">
          {draft.key_points.length === 0 ? (
            <p className="text-xs text-ink-faint">No key points extracted.</p>
          ) : (
            draft.key_points.map((kp, i) => (
              <label
                key={i}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-gold/30 bg-surface p-3"
              >
                <input
                  type="checkbox"
                  checked={selected.has(i)}
                  onChange={() => toggle(i)}
                  className="mt-1 h-4 w-4 accent-gold"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">{kp.content}</p>
                  {kp.action_steps.map((step, j) => (
                    <p key={j} className="mt-1 text-xs text-ink-soft">
                      → {step.action}
                      {step.achievable_result && ` (${step.achievable_result})`}
                    </p>
                  ))}
                </div>
              </label>
            ))
          )}
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={handleCreate}
            disabled={creating}
            className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {creating ? "Creating…" : `Create entry (${selected.size} key points)`}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface"
          >
            Discard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-gold/40 bg-gold-soft p-4">
      <div className="flex gap-1 rounded-full border border-gold/40 bg-surface p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
            mode === "url" ? "bg-gold text-white" : "text-ink-soft hover:bg-gold-soft"
          }`}
        >
          Paste a URL
        </button>
        <button
          type="button"
          onClick={() => setMode("title")}
          className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
            mode === "title" ? "bg-gold text-white" : "text-ink-soft hover:bg-gold-soft"
          }`}
        >
          Give me a title
        </button>
      </div>

      {mode === "url" ? (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/some-article"
          className={inputClass}
        />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Atomic Habits"
            className={inputClass}
          />
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Author (optional)"
            className={inputClass}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleRead}
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? "Reading…" : "Read & summarize"}
        </button>
        <button
          type="button"
          onClick={reset}
          className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-soft hover:bg-surface"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
