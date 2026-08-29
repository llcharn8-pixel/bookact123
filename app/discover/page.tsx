import { Discover } from "@/components/Discover";

export const maxDuration = 60;

export default function DiscoverPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Discover
        </h1>
        <p className="text-sm text-ink-soft">
          Pick a category and get real book/article recommendations, then turn
          any of them into a full entry in one click.
        </p>
      </div>
      <Discover />
    </div>
  );
}
