"use client";

import { useRef, useState } from "react";
import { readWithAssistant } from "@/lib/actions/assistant";
import { DraftEntryReview } from "@/components/DraftEntryReview";
import type { DraftEntry } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

const MAX_MEDIA_BYTES = 4 * 1024 * 1024; // 4MB — matches the server's hard cap

type Mode = "url" | "title" | "media" | "youtube";

export function SmartAssistant() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftEntry | null>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setOpen(false);
    setUrl("");
    setYoutubeUrl("");
    setTitle("");
    setAuthor("");
    setMediaFile(null);
    setDraft(null);
    setError(null);
    if (mediaInputRef.current) mediaInputRef.current.value = "";
  }

  function handleMediaFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
      setError("Only audio or video files are supported.");
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setError("That file is too large (max 4MB — short clips only).");
      return;
    }
    setMediaFile(file);
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
    if (mode === "media" && !mediaFile) {
      setError("Choose an audio or video file first.");
      return;
    }
    if (mode === "youtube" && !youtubeUrl.trim()) {
      setError("Paste a YouTube link first.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "media") {
        const body = new FormData();
        body.append("file", mediaFile as File);
        const res = await fetch("/api/extract-media", { method: "POST", body });
        const data = await res.json();
        if (!res.ok || !data.draft) {
          setError(data.error ?? "Something went wrong.");
          return;
        }
        setDraft(data.draft);
        return;
      }

      const result = await readWithAssistant(
        mode === "url"
          ? { mode: "url", url: url.trim() }
          : mode === "youtube"
            ? { mode: "youtube", url: youtubeUrl.trim() }
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
        <button
          type="button"
          onClick={() => setMode("media")}
          className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
            mode === "media" ? "bg-gold text-white" : "text-ink-soft hover:bg-gold-soft"
          }`}
        >
          Audio/video
        </button>
      </div>

      {mode === "url" && (
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/some-article"
          className={inputClass}
        />
      )}
      {mode === "title" && (
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
      {mode === "youtube" && (
        <div>
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
          <p className="mt-1.5 text-[11px] text-ink-faint">
            Reads the video&apos;s captions/transcript (free — no video download). Only
            works if the video has captions available; may occasionally fail if YouTube
            blocks the request.
          </p>
        </div>
      )}
      {mode === "media" && (
        <div>
          <input
            ref={mediaInputRef}
            type="file"
            accept="audio/*,video/*"
            onChange={handleMediaFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => mediaInputRef.current?.click()}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-left text-sm text-ink-soft hover:bg-surface-muted"
          >
            {mediaFile ? mediaFile.name : "🎙️ Choose an audio or video file (max 4MB)"}
          </button>
          <p className="mt-1.5 text-[11px] text-ink-faint">
            Short clips only — roughly a couple minutes of audio, or a very short video.
            Only upload content you have the right to use. See{" "}
            <a href="/legal" className="underline hover:text-ink-soft">
              Disclaimer &amp; Terms
            </a>
            .
          </p>
        </div>
      )}

      {error && <p className="text-xs text-red-600">{error}</p>}
      {loading && (
        <p className="text-xs text-ink-faint">
          {mode === "media"
            ? "Transcribing your file — this can take up to a minute."
            : mode === "youtube"
              ? "Fetching captions and summarizing — this can take up to a minute."
              : "This can take up to a minute for longer pages — please wait."}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleRead}
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? "Reading…" : mode === "media" ? "Transcribe & summarize" : "Read & summarize"}
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
