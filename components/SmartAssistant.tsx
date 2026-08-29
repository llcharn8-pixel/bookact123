"use client";

import { useState } from "react";
import { readWithAssistant } from "@/lib/actions/assistant";
import { DraftEntryReview } from "@/components/DraftEntryReview";
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
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftEntry | null>(null);

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
    try {
      const result = await readWithAssistant(
        mode === "url"
          ? { mode: "url", url: url.trim() }
          : { mode: "title", title: title.trim(), author: author.trim() },
      );
      if (result.error || !result.draft) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setDraft(result.draft);
    } catch {
      setError("The assistant took too long or the connection dropped. Try again.");
    } finally {
      setLoading(false);
    }
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
    return <DraftEntryReview draft={draft} onDiscard={reset} />;
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
      {loading && (
        <p className="text-xs text-ink-faint">
          This can take up to a minute for longer pages — please wait.
        </p>
      )}

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
