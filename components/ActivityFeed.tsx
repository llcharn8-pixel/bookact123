import type { ActivityLog } from "@/lib/data/activity";

const RISK_STYLE: Record<string, string> = {
  low: "bg-surface-muted text-ink-soft",
  medium: "bg-doing-soft text-doing",
  high: "bg-red-50 text-red-600",
  critical: "bg-red-100 text-red-700",
};

function describe(log: ActivityLog): string {
  const p = log.payload ?? {};
  const entry = log.entry_title ? ` for "${log.entry_title}"` : "";

  switch (log.action) {
    case "extract_key_points":
      return `Asked AI to suggest key points${entry} — ${Number(p.draft_count ?? 0)} drafted`;
    case "apply_drafts":
      return `Accepted ${Number(p.accepted_count ?? 0)} AI-suggested key point(s)${entry}`;
    case "assistant_read": {
      const mode = p.mode === "url" ? "a URL" : "a title";
      return `Smart Assistant read ${mode} — ${Number(p.key_point_count ?? 0)} key points found`;
    }
    case "assistant_apply_drafts":
      return `Created "${log.entry_title ?? "an entry"}" via Smart Assistant — ${Number(p.accepted_count ?? 0)} key points`;
    case "get_recommendations": {
      const query = p.query as { mode?: string; category?: string; author?: string } | undefined;
      const subject =
        (query?.mode === "author" ? query.author : query?.category) ??
        // older log entries stored the search term at the top level
        (p.category as string | undefined) ??
        (p.author as string | undefined);
      return `Got ${Number(p.count ?? 0)} recommendations for "${subject ?? "something"}" in ${p.language ?? "English"}`;
    }
    default:
      return log.action;
  }
}

export function ActivityFeed({ logs }: { logs: ActivityLog[] }) {
  if (logs.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-ink-soft">
        No AI activity yet — use Smart Assistant, Discover, or "Suggest key
        points" and it'll show up here.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface p-3"
        >
          <p className="text-sm text-ink">{describe(log)}</p>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${RISK_STYLE[log.risk_level] ?? RISK_STYLE.low}`}
            >
              {log.risk_level}
            </span>
            <span className="text-[10px] text-ink-faint">
              {new Date(log.created_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
