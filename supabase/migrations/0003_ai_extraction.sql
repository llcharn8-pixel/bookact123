-- Sprint 4: AI key-point extraction — mark AI-originated rows, audit log.

alter table key_points
  add column if not exists source text not null default 'human',
  add column if not exists ai_confidence numeric;
alter table key_points drop constraint if exists key_points_source_check;
alter table key_points
  add constraint key_points_source_check check (source in ('human', 'ai'));

alter table action_steps
  add column if not exists source text not null default 'human',
  add column if not exists ai_confidence numeric;
alter table action_steps drop constraint if exists action_steps_source_check;
alter table action_steps
  add constraint action_steps_source_check check (source in ('human', 'ai'));

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  target_table text not null,
  target_id uuid,
  risk_level text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
alter table audit_logs enable row level security;
drop policy if exists "audit_logs_select" on audit_logs;
create policy "audit_logs_select" on audit_logs
  for select using (auth.uid() = user_id);
drop policy if exists "audit_logs_insert" on audit_logs;
create policy "audit_logs_insert" on audit_logs
  for insert with check (auth.uid() = user_id);
