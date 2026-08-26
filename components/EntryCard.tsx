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
      className="block rounded-lg border border-neutral-200 p-4 transition-colors hover:border-neutral-400"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium uppercase text-neutral-500">
              {entry.type}
            </span>
            {total > 0 && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {pct}% done
              </span>
            )}
          </div>
          <h3 className="mt-1 truncate text-base font-semibold">
            {entry.title}
          </h3>
          {entry.author && (
            <p className="truncate text-sm text-neutral-500">
              {entry.author}
            </p>
          )}
          {entry.summary && (
            <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
              {entry.summary}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
