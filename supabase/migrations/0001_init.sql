create extension if not exists pgcrypto;

create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text not null,
  type text default 'article',
  author text,
  summary text,
  created_at timestamptz not null default now()
);
alter table entries enable row level security;
drop policy if exists "entries_v1_read" on entries;
create policy "entries_v1_read" on entries for select using (true);
drop policy if exists "entries_v1_write" on entries;
create policy "entries_v1_write" on entries for all using (true) with check (true);

create table if not exists key_points (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  entry_id uuid references entries(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
alter table key_points enable row level security;
drop policy if exists "key_points_v1_read" on key_points;
create policy "key_points_v1_read" on key_points for select using (true);
drop policy if exists "key_points_v1_write" on key_points;
create policy "key_points_v1_write" on key_points for all using (true) with check (true);

create table if not exists action_steps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  key_point_id uuid references key_points(id) on delete cascade,
  action text not null,
  achievable_result text,
  status text default 'todo',
  created_at timestamptz not null default now()
);
alter table action_steps enable row level security;
drop policy if exists "action_steps_v1_read" on action_steps;
create policy "action_steps_v1_read" on action_steps for select using (true);
drop policy if exists "action_steps_v1_write" on action_steps;
create policy "action_steps_v1_write" on action_steps for all using (true) with check (true);

insert into entries (id, title, type, author, summary) values
  ('a0000000-0000-0000-0000-000000000001', 'Atomic Habits', 'book', 'James Clear', 'Small habits compound into remarkable results over time.'),
  ('a0000000-0000-0000-0000-000000000002', 'Deep Work', 'book', 'Cal Newport', 'Focused, distraction-free work is the key to producing rare and valuable results.'),
  ('a0000000-0000-0000-0000-000000000003', 'The Power of Habit', 'book', 'Charles Duhigg', 'Habits operate through a cue-routine-reward loop that can be reshaped.'),
  ('a0000000-0000-0000-0000-000000000004', 'Why Sleep Matters', 'article', 'Maria Popova', 'Quality sleep underpins memory, mood, and decision-making.')
on conflict (id) do nothing;

insert into key_points (id, entry_id, content) values
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Habits compound over time — 1% better daily equals 37x yearly.'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'Identity-based habits stick: focus on who you want to become.'),
  ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'Deep work is increasingly rare and increasingly valuable.'),
  ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000004', 'Consistent sleep schedule improves cognitive performance.')
on conflict (id) do nothing;

insert into action_steps (id, key_point_id, action, achievable_result, status) values
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Read 10 pages every morning', 'Finish 12 books in a year', 'doing'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Track one habit daily on a calendar', 'Maintain a 30-day visible streak', 'todo'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'Replace "I want to read more" with "I am a reader"', 'Identity shift felt within 2 weeks', 'done'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 'Block 90 minutes of phone-free focus daily', 'Ship one side project in 30 days', 'todo'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000004', 'Go to bed and wake at the same time daily', 'Notice clearer thinking within 2 weeks', 'todo')
on conflict (id) do nothing;