"use client";

import { useState } from "react";
import { fetchRecommendations } from "@/lib/actions/recommendations";
import { readWithAssistant } from "@/lib/actions/assistant";
import { DraftEntryReview } from "@/components/DraftEntryReview";
import type { DraftEntry, Recommendation } from "@/lib/types";

const CATEGORIES = [
  "Productivity",
  "Habits",
  "Finance",
  "Leadership",
  "Mindset",
  "Health",
  "Creativity",
  "Communication",
  "Psychology",
  "Startups",
];

export function Discover() {
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(
    null,
  );
  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<DraftEntry | null>(null);

  const activeCategory = category || customCategory.trim();

  async function handleGetRecommendations() {
    if (!activeCategory) {
      setError("Pick or type a category first.");
      return;
    }
    setError(null);
    setLoading(true);
    setRecommendations(null);
    try {
      const result = await fetchRecommendations(activeCategory);
      if (result.error || !result.recommendations) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setRecommendations(result.recommendations);
    } catch {
      setError("The assistant took too long or the connection dropped. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd(rec: Recommendation, index: number) {
    setAddingIndex(index);
    setError(null);
    try {
      const result = await readWithAssistant({
        mode: "title",
        title: rec.title,
        author: rec.author ?? "",
      });
      if (result.error || !result.draft) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      setDraft(result.draft);
    } catch {
      setError("The assistant took too long or the connection dropped. Try again.");
    } finally {
      setAddingIndex(null);
    }
  }

  if (draft) {
    return <DraftEntryReview draft={draft} onDiscard={() => setDraft(null)} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCategory(c);
              setCustomCategory("");
            }}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              category === c
                ? "bg-primary text-white"
                : "border border-border bg-surface text-ink-soft hover:bg-surface-muted"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={customCategory}
          onChange={(e) => {
            setCustomCategory(e.target.value);
            setCategory("");
          }}
          placeholder="Or type your own category…"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-xs"
        />
        <button
          type="button"
          onClick={handleGetRecommendations}
          disabled={loading || !activeCategory}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? "Finding books…" : "Get recommendations"}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {recommendations && (
        <div className="space-y-3">
          {recommendations.length === 0 ? (
            <p className="text-sm text-ink-soft">No recommendations found.</p>
          ) : (
            recommendations.map((rec, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
                      {rec.type}
                    </span>
                    <h3 className="mt-1 font-serif text-base font-semibold text-ink">
                      {rec.title}
                    </h3>
                    {rec.author && (
                      <p className="text-sm text-ink-soft">{rec.author}</p>
                    )}
                    <p className="mt-1 text-sm text-ink-soft">{rec.reason}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAdd(rec, i)}
                    disabled={addingIndex !== null}
                    className="shrink-0 rounded-lg border border-gold/50 bg-gold-soft px-3 py-2 text-xs font-semibold text-gold hover:brightness-95 disabled:opacity-50"
                  >
                    {addingIndex === i ? "Reading…" : "Add & summarize"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
