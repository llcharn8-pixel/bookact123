"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createEntry } from "@/lib/actions/entries";
import type { EntryType } from "@/lib/types";

const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";
const labelClass = "mb-1 block text-xs font-medium text-ink-soft";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB
const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15MB
const MAX_TEXT_CHARS = 20000;
const TEXT_EXTENSIONS = [".txt", ".md", ".markdown"];
const ACCEPTED_EXTENSIONS = [...TEXT_EXTENSIONS, ".pdf"];

function stripExtension(filename: string): string {
  return filename.replace(/\.[^./\\]+$/, "");
}

export function FileUpload() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EntryType>("article");
  const [author, setAuthor] = useState("");
  const [summary, setSummary] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState(createEntry, {});
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !state.error) {
      submitted.current = false;
      reset();
    }
  }, [state]);

  function reset() {
    setOpen(false);
    setTitle("");
    setAuthor("");
    setSummary("");
    setType("article");
    setFileError(null);
    setTruncated(false);
    setExtracting(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileButtonClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileError(null);
    const lowerName = file.name.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext))) {
      setFileError("Only .txt, .md, and .pdf files are supported right now.");
      return;
    }

    if (lowerName.endsWith(".pdf")) {
      if (file.size > MAX_PDF_BYTES) {
        setFileError("That PDF is too large (max 15MB).");
        return;
      }
      setExtracting(true);
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/extract-pdf", { method: "POST", body });
        const data = await res.json();
        if (!res.ok) {
          setFileError(data.error ?? "Couldn't read that PDF.");
          return;
        }
        setTitle(stripExtension(file.name));
        setSummary(data.text);
        setTruncated(Boolean(data.truncated));
        setOpen(true);
      } catch {
        setFileError("Couldn't read that PDF. Try again.");
      } finally {
        setExtracting(false);
      }
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setFileError("That file is too large (max 2MB).");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      const wasTruncated = text.length > MAX_TEXT_CHARS;
      setTitle(stripExtension(file.name));
      setSummary(wasTruncated ? text.slice(0, MAX_TEXT_CHARS) : text);
      setTruncated(wasTruncated);
      setOpen(true);
    };
    reader.onerror = () => {
      setFileError("Couldn't read that file. Try again.");
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.markdown,.pdf"
        onChange={handleFileChange}
        className="hidden"
      />

      {!open ? (
        <div>
          <button
            type="button"
            onClick={handleFileButtonClick}
            disabled={extracting}
            className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-ink shadow-sm transition-colors hover:bg-surface-muted disabled:opacity-50 sm:w-auto"
          >
            {extracting ? "Extracting text from PDF…" : "📄 Upload a file (.txt, .md, .pdf)"}
          </button>
          {fileError && <p className="mt-2 text-xs text-red-600">{fileError}</p>}
        </div>
      ) : (
        <form
          action={(formData) => {
            submitted.current = true;
            formAction(formData);
          }}
          className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-sm"
        >
          {truncated && (
            <p className="text-xs text-doing">
              This file was long, so only the first {MAX_TEXT_CHARS.toLocaleString()}{" "}
              characters were kept.
            </p>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Title</label>
              <input
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as EntryType)}
                className={inputClass}
              >
                <option value="book">Book</option>
                <option value="article">Article</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Author</label>
              <input
                name="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author (optional)"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>
                Content (edit freely — this becomes the entry's summary)
              </label>
              <textarea
                name="summary"
                rows={8}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={`${inputClass} font-mono text-xs`}
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
              onClick={reset}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
