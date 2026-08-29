-- Streaks + reflection-on-completion.

alter table action_steps
  add column if not exists completed_at timestamptz,
  add column if not exists reflection text;

-- Backfill: existing 'done' rows get a completed_at so the streak
-- feature has something to work with immediately instead of showing 0.
update action_steps
set completed_at = created_at
where status = 'done' and completed_at is null;
