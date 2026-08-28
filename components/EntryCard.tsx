import Link from "next/link";
import type { Entry } from "@/lib/types";
import { getEntryCompletionStats } from "@/lib/data/entries";

export async function EntryCard({
  entry,
  basePath = "/entries",
}: {
  entry: Entry;
  basePath?: string;
}) {
  const { total, done } = await getEntryCompletionStats(entry.id);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <Link
      href={`${basePath}/${entry.id}`}
      className="block rounded-xl border border-border bg-surface p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
              {entry.type}
            </span>
            {total > 0 && (
              <span className="rounded-full bg-done-soft px-2 py-0.5 text-xs font-medium text-done">
                {pct}% done
              </span>
            )}
          </div>
          <h3 className="mt-1.5 truncate font-serif text-base font-semibold text-ink">
            {entry.title}
          </h3>
          {entry.author && (
            <p className="truncate text-sm text-ink-soft">{entry.author}</p>
          )}
          {entry.summary && (
            <p className="mt-1 line-clamp-2 text-sm text-ink-soft">
              {entry.summary}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
