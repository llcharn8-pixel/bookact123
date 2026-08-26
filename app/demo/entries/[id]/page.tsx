import { notFound } from "next/navigation";
import { getEntryWithDetails } from "@/lib/data/entries";

const STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  doing: "Doing",
  done: "Done",
};
const STATUS_STYLE: Record<string, string> = {
  todo: "bg-neutral-100 text-neutral-600",
  doing: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
};

export default async function DemoEntryDetailPage({
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

  if (!entry || entry.user_id !== null) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium uppercase text-neutral-500">
          {entry.type}
        </span>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">
          {entry.title}
        </h1>
        {entry.author && (
          <p className="text-sm text-neutral-500">{entry.author}</p>
        )}
        {entry.summary && (
          <p className="mt-2 max-w-2xl text-sm text-neutral-600">
            {entry.summary}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Key Points</h2>
        {entry.key_points.length === 0 ? (
          <p className="rounded-md border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500">
            No key points yet.
          </p>
        ) : (
          <div className="space-y-3">
            {entry.key_points.map((kp) => (
              <div key={kp.id} className="rounded-lg border border-neutral-200 p-4">
                <p className="text-sm font-medium">{kp.content}</p>
                <div className="mt-3 space-y-2 border-t border-neutral-100 pt-3">
                  <p className="text-xs font-semibold uppercase text-neutral-400">
                    Action steps
                  </p>
                  {kp.action_steps.length === 0 ? (
                    <p className="text-xs text-neutral-400">
                      No action steps yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {kp.action_steps.map((step) => (
                        <div
                          key={step.id}
                          className="flex items-start justify-between gap-3 rounded-md border border-neutral-200 p-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium">
                              {step.action}
                            </p>
                            {step.achievable_result && (
                              <p className="mt-0.5 text-xs text-neutral-500">
                                → {step.achievable_result}
                              </p>
                            )}
                          </div>
                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[step.status]}`}
                          >
                            {STATUS_LABEL[step.status]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
