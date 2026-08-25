"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ActionStatus, ActionStepWithContext } from "@/lib/types";
import { setActionStatus } from "@/lib/actions/entries";

const STATUS_ORDER: ActionStatus[] = ["todo", "doing", "done"];
const STATUS_STYLE: Record<ActionStatus, string> = {
  todo: "bg-neutral-100 text-neutral-600",
  doing: "bg-amber-50 text-amber-700",
  done: "bg-emerald-50 text-emerald-700",
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
      <p className="rounded-md border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500">
        No action steps yet. Add one from an entry's key point.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-md border border-neutral-200 p-1 text-sm">
          {(["all", "todo", "doing", "done"] as FilterKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded px-2.5 py-1 font-medium ${
                filter === key
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              {key === "all" ? "All" : STATUS_LABEL[key]}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
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
            <h2 className="text-sm font-semibold text-neutral-500">
              {STATUS_LABEL[status]} ({items.length})
            </h2>
            {items.length === 0 ? (
              <p className="text-xs text-neutral-400">Nothing here.</p>
            ) : (
              <div className="space-y-2">
                {items.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-neutral-200 p-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{step.action}</p>
                      {step.achievable_result && (
                        <p className="text-xs text-neutral-500">
                          → {step.achievable_result}
                        </p>
                      )}
                      <Link
                        href={`/entries/${step.entry_id}`}
                        className="mt-1 inline-block text-xs text-neutral-400 hover:text-neutral-700"
                      >
                        {step.entry_title} · {step.key_point_content}
                      </Link>
                    </div>
                    <button
                      type="button"
                      onClick={() => cycle(step)}
                      disabled={pendingId === step.id}
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 ${STATUS_STYLE[step.status]}`}
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
