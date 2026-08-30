import { Suspense } from "react";
import { getEntries } from "@/lib/data/entries";
import { EntryCard } from "@/components/EntryCard";
import { NewEntryForm } from "@/components/NewEntryForm";
import { SmartAssistant } from "@/components/SmartAssistant";
import { FileUpload } from "@/components/FileUpload";

export const maxDuration = 60;

function EntrySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-xl border border-border-soft bg-surface-muted"
        />
      ))}
    </div>
  );
}

async function EntryList() {
  let entries;
  try {
    entries = await getEntries();
  } catch {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Couldn't load entries. Check your connection and retry.
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-soft">
        No entries yet. Add your first book or article.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}

export default function EntriesPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Entries
          </h1>
          <p className="text-sm text-ink-soft">
            Log what you read, extract the key points, act on them.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <NewEntryForm />
        <FileUpload />
        <SmartAssistant />
      </div>
      <Suspense fallback={<EntrySkeleton />}>
        <EntryList />
      </Suspense>
    </div>
  );
}
