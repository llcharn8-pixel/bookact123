export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div className="h-24 animate-pulse rounded-lg bg-neutral-100" />
      <div className="space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-lg bg-neutral-100"
          />
        ))}
      </div>
    </div>
  );
}
