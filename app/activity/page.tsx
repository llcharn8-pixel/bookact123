import { getActivityLog } from "@/lib/data/activity";
import { ActivityFeed } from "@/components/ActivityFeed";

export default async function ActivityPage() {
  const logs = await getActivityLog();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Activity
        </h1>
        <p className="text-sm text-ink-soft">
          Every AI-initiated action on your account, most recent first.
        </p>
      </div>
      <ActivityFeed logs={logs} />
    </div>
  );
}
