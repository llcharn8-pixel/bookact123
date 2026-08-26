-- Sprint 3: Lock it down — per-user RLS, demo rows stay public read-only.
-- Ownership: auth.uid() = user_id. Demo/seed rows (user_id is null) are
-- readable by anyone but not writable by anyone through the API.

-- entries
drop policy if exists "entries_v1_read" on entries;
drop policy if exists "entries_v1_write" on entries;

create policy "entries_select" on entries
  for select using (user_id is null or auth.uid() = user_id);
create policy "entries_insert" on entries
  for insert with check (auth.uid() = user_id);
create policy "entries_update" on entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "entries_delete" on entries
  for delete using (auth.uid() = user_id);

-- key_points
drop policy if exists "key_points_v1_read" on key_points;
drop policy if exists "key_points_v1_write" on key_points;

create policy "key_points_select" on key_points
  for select using (user_id is null or auth.uid() = user_id);
create policy "key_points_insert" on key_points
  for insert with check (auth.uid() = user_id);
create policy "key_points_update" on key_points
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "key_points_delete" on key_points
  for delete using (auth.uid() = user_id);

-- action_steps
drop policy if exists "action_steps_v1_read" on action_steps;
drop policy if exists "action_steps_v1_write" on action_steps;

create policy "action_steps_select" on action_steps
  for select using (user_id is null or auth.uid() = user_id);
create policy "action_steps_insert" on action_steps
  for insert with check (auth.uid() = user_id);
create policy "action_steps_update" on action_steps
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "action_steps_delete" on action_steps
  for delete using (auth.uid() = user_id);
