import { notFound } from "next/navigation";
import { getEntryWithDetails } from "@/lib/data/entries";
import { EntryHeader } from "@/components/EntryHeader";
import { KeyPointItem } from "@/components/KeyPointItem";
import { NewKeyPointForm } from "@/components/NewKeyPointForm";

export default async function EntryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let entry;
  try {
    entry = await getEntryWithDetails(id);
  } catch {
    return (
      <div className="mx-auto max-w-3xl p-4 md:p-8">
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn't load this entry. Check your connection and retry.
        </p>
      </div>
    );
  }

  if (!entry) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <EntryHeader entry={entry} />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Key Points</h2>
        </div>

        {entry.key_points.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            No key points yet.
          </p>
        ) : (
          <div className="space-y-3">
            {entry.key_points.map((kp) => (
              <KeyPointItem key={kp.id} keyPoint={kp} entryId={entry.id} />
            ))}
          </div>
        )}

        <NewKeyPointForm entryId={entry.id} />
      </div>
    </div>
  );
}
