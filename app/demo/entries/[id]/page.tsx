import { notFound } from "next/navigation";
import { getEntryWithDetails } from "@/lib/data/entries";

const STATUS_LABEL: Record<string, string> = {
  todo: "To do",
  doing: "Doing",
  done: "Done",
};
const STATUS_STYLE: Record<string, string> = {
  todo: "bg-todo-soft text-todo",
  doing: "bg-doing-soft text-doing",
  done: "bg-done-soft text-done",
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
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Couldn't load this entry. Check your connection and retry.
        </p>
      </div>
    );
  }

  if (!entry || entry.user_id !== null) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-8">
      <div>
        <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
          {entry.type}
        </span>
        <h1 className="mt-1 font-serif text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {entry.title}
        </h1>
        {entry.author && <p className="text-sm text-ink-soft">{entry.author}</p>}
        {entry.summary && (
          <p className="mt-2 max-w-2xl text-sm text-ink-soft">
            {entry.summary}
          </p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="font-serif text-lg font-semibold text-ink">
          Key Points
        </h2>
        {entry.key_points.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-ink-soft">
            No key points yet.
          </p>
        ) : (
          <div className="space-y-3">
            {entry.key_points.map((kp) => (
              <div
                key={kp.id}
                className="rounded-xl border border-border bg-surface p-4 shadow-sm"
              >
                <p className="text-sm font-medium text-ink">{kp.content}</p>
                <div className="mt-3 space-y-2 border-t border-border-soft pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                    Action steps
                  </p>
                  {kp.action_steps.length === 0 ? (
                    <p className="text-xs text-ink-faint">
                      No action steps yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {kp.action_steps.map((step) => (
                        <div
                          key={step.id}
                          className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-start sm:justify-between"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink">
                              {step.action}
                            </p>
                            {step.achievable_result && (
                              <p className="mt-0.5 text-xs text-ink-soft">
                                → {step.achievable_result}
                              </p>
                            )}
                          </div>
                          <span
                            className={`shrink-0 self-start rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLE[step.status]}`}
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
