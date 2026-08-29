import Link from "next/link";
import { getUserStats } from "@/lib/data/stats";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <p className="font-serif text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">
        {label}
      </p>
    </div>
  );
}

function DayLabel(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.toLocaleDateString(undefined, { weekday: "narrow", timeZone: "UTC" });
}

export default async function StatsPage() {
  const stats = await getUserStats();
  const maxDaily = Math.max(1, ...stats.dailyCompletions.map((d) => d.count));

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Your Progress
        </h1>
        <p className="text-sm text-ink-soft">
          A look at what you've actually done, not just what you've logged.
        </p>
      </div>

      {stats.totalActionSteps === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-soft">
          Nothing tracked yet — add an entry and mark an action step done to
          see your progress here.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatTile label="Current streak" value={`🔥 ${stats.currentStreak}`} />
            <StatTile
              label="Longest streak"
              value={`${stats.longestStreak} day${stats.longestStreak === 1 ? "" : "s"}`}
            />
            <StatTile label="Completion rate" value={`${stats.completionRate}%`} />
            <StatTile label="Entries logged" value={stats.totalEntries} />
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h2 className="mb-3 font-serif text-base font-semibold text-ink">
              Last 14 days
            </h2>
            <div className="flex items-end gap-1.5" style={{ height: 96 }}>
              {stats.dailyCompletions.map((d) => (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t ${d.count > 0 ? "bg-primary" : "bg-surface-muted"}`}
                    style={{
                      height: d.count > 0 ? `${(d.count / maxDaily) * 72}px` : "4px",
                    }}
                    title={`${d.date}: ${d.count} completed`}
                  />
                  <span className="text-[10px] text-ink-faint">
                    {DayLabel(d.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <h2 className="mb-3 font-serif text-base font-semibold text-ink">
                Action steps by status
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-todo">To do</span>
                  <span className="font-medium text-ink">{stats.todoCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-doing">Doing</span>
                  <span className="font-medium text-ink">{stats.doingCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-done">Done</span>
                  <span className="font-medium text-ink">{stats.doneCount}</span>
                </div>
                <div className="flex items-center justify-between border-t border-border-soft pt-2 text-sm font-semibold">
                  <span className="text-ink-soft">Total</span>
                  <span className="text-ink">{stats.totalActionSteps}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
              <h2 className="mb-3 font-serif text-base font-semibold text-ink">
                Your library
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Entries</span>
                  <span className="font-medium text-ink">{stats.totalEntries}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-ink-soft">Key points</span>
                  <span className="font-medium text-ink">{stats.totalKeyPoints}</span>
                </div>
                {stats.mostActiveEntry && (
                  <div className="border-t border-border-soft pt-2">
                    <p className="text-xs text-ink-soft">Most active book</p>
                    <Link
                      href={`/entries/${stats.mostActiveEntry.id}`}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {stats.mostActiveEntry.title}
                    </Link>
                    <p className="text-xs text-ink-faint">
                      {stats.mostActiveEntry.count} action step
                      {stats.mostActiveEntry.count === 1 ? "" : "s"} done
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
