import { getDueKeyPoints } from "@/lib/data/review";
import { ReviewSession } from "@/components/ReviewSession";

export default async function ReviewPage() {
  const due = await getDueKeyPoints();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Review
        </h1>
        <p className="text-sm text-ink-soft">
          A quick spaced recall of what you&apos;ve logged, so it actually sticks.
        </p>
      </div>
      <ReviewSession initialDue={due} />
    </div>
  );
}
