"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ActionStatus, ActionStepWithContext } from "@/lib/types";
import { setActionStatus } from "@/lib/actions/entries";

const STATUS_ORDER: ActionStatus[] = ["todo", "doing", "done"];
const STATUS_STYLE: Record<ActionStatus, string> = {
  todo: "bg-todo-soft text-todo",
  doing: "bg-doing-soft text-doing",
  done: "bg-done-soft text-done",
};
const STATUS_LABEL: Record<ActionStatus, string> = {
  todo: "To do",
  doing: "Doing",
  done: "Done",
};

type SortKey = "newest" | "oldest";
type FilterKey = "all" | ActionStatus;

export function ActionsBoard({ steps }: { steps: ActionStepWithContext[] }) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [pendingId, setPendingId] = useState<string | null>(null);

  const visible = useMemo(() => {
    let list = steps;
    if (filter !== "all") list = list.filter((s) => s.status === filter);
    list = [...list].sort((a, b) =>
      sort === "newest"
        ? b.created_at.localeCompare(a.created_at)
        : a.created_at.localeCompare(b.created_at),
    );
    return list;
  }, [steps, filter, sort]);

  const grouped = useMemo(() => {
    const groups: Record<ActionStatus, ActionStepWithContext[]> = {
      todo: [],
      doing: [],
      done: [],
    };
    for (const step of visible) groups[step.status].push(step);
    return groups;
  }, [visible]);

  async function cycle(step: ActionStepWithContext) {
    const next =
      STATUS_ORDER[(STATUS_ORDER.indexOf(step.status) + 1) % STATUS_ORDER.length];
    setPendingId(step.id);
    try {
      await setActionStatus(step.id, step.entry_id, next);
    } finally {
      setPendingId(null);
    }
  }

  if (steps.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-soft">
        No action steps yet. Add one from an entry's key point.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1 rounded-full border border-border bg-surface p-1 text-sm">
          {(["all", "todo", "doing", "done"] as FilterKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                filter === key
                  ? "bg-primary text-white"
                  : "text-ink-soft hover:bg-surface-muted"
              }`}
            >
              {key === "all" ? "All" : STATUS_LABEL[key]}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-full border border-border bg-surface px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {(filter === "all" ? STATUS_ORDER : [filter]).map((status) => {
        const items = grouped[status];
        if (filter === "all" && items.length === 0) return null;
        return (
          <div key={status} className="space-y-2">
            <h2 className="text-sm font-semibold text-ink-soft">
              {STATUS_LABEL[status]} ({items.length})
            </h2>
            {items.length === 0 ? (
              <p className="text-xs text-ink-faint">Nothing here.</p>
            ) : (
              <div className="space-y-2">
                {items.map((step) => (
                  <div
                    key={step.id}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 shadow-sm sm:flex-row sm:items-start sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {step.action}
                      </p>
                      {step.achievable_result && (
                        <p className="text-xs text-ink-soft">
                          → {step.achievable_result}
                        </p>
                      )}
                      <Link
                        href={`/entries/${step.entry_id}`}
                        className="mt-1 inline-block text-xs text-ink-faint hover:text-primary"
                      >
                        {step.entry_title} · {step.key_point_content}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => cycle(step)}
                      disabled={pendingId === step.id}
                      className={`shrink-0 self-start rounded-full px-3 py-1.5 text-xs font-medium disabled:opacity-50 ${STATUS_STYLE[step.status]}`}
                    >
                      {pendingId === step.id ? "…" : STATUS_LABEL[step.status]}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
