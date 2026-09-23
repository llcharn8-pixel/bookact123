-- Sprint: spaced review of key points, to turn logged insights into
-- retained ones instead of being forgotten after the first read.

alter table key_points
  add column if not exists review_count integer not null default 0,
  add column if not exists last_reviewed_at timestamptz;
