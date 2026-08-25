import { Suspense } from "react";
import { getAllActionSteps } from "@/lib/data/entries";
import { ActionsBoard } from "@/components/ActionsBoard";

async function ActionsList() {
  let steps;
  try {
    steps = await getAllActionSteps();
  } catch {
    return (
      <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Couldn't load action steps. Check your connection and retry.
      </p>
    );
  }
  return <ActionsBoard steps={steps} />;
}

function ActionsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-lg border border-neutral-200 bg-neutral-50"
        />
      ))}
    </div>
  );
}

export default function ActionsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Actions</h1>
        <p className="text-sm text-neutral-500">
          Every action step across your entries, grouped by status.
        </p>
      </div>
      <Suspense fallback={<ActionsSkeleton />}>
        <ActionsList />
      </Suspense>
    </div>
  );
}
