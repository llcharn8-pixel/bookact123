import Link from "next/link";
import { Suspense } from "react";
import { getDemoEntries } from "@/lib/data/entries";
import { EntryCard } from "@/components/EntryCard";

function EntrySkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 animate-pulse rounded-lg border border-neutral-200 bg-neutral-50"
        />
      ))}
    </div>
  );
}

async function DemoEntryList() {
  let entries;
  try {
    entries = await getDemoEntries();
  } catch {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Couldn't load the demo. Check your connection and retry.
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
        No demo entries yet.
      </p>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} basePath="/demo/entries" />
      ))}
    </div>
  );
}

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Public demo</h1>
        <p className="text-sm text-neutral-500">
          A read-only look at ReadAct with sample data.{" "}
          <Link href="/signup" className="font-medium text-neutral-900 underline">
            Sign up
          </Link>{" "}
          to create your own.
        </p>
      </div>
      <Suspense fallback={<EntrySkeleton />}>
        <DemoEntryList />
      </Suspense>
    </div>
  );
}
