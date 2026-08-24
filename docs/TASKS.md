# Tasks — ReadAct

## Sprint 1 — Core Engine (DB + CRUD)
**Goal:** A reader can add an entry, key points, and action steps, and see them — no login.
- [ ] Create Supabase tables (entries, key_points, action_steps) + permissive RLS + seed data.
- [ ] Data-access layer `lib/data/` for all three tables.
- [ ] Server actions: create/update/delete entry, key point, action step; toggle action status.
- [ ] Entries list page (sidebar nav, desktop + mobile hamburger).
- [ ] Entry detail page: key points + nested action steps with inline add forms.
- [ ] Loading / empty / error states on list + detail.
- [ ] Edit + delete for all three objects.

**Definition of Done:** Reader adds the article "Atomic Habits Ch.1", two key points, one action step each with achievable result, marks one action done, refreshes → state persists. No login wall.

> **v1 functional milestone** — app works end-to-end after this sprint.

## Sprint 2 — Polish + All-Actions View
**Goal:** Make it usable day-to-day.
- [ ] All-Actions page: every action step across entries, grouped by status.
- [ ] Completion % badge per entry.
- [ ] Sort + filter on action steps.
- [ ] Empty/error polish across all pages.

**Definition of Done:** Reader opens All-Actions, sees all action steps sorted by status, can jump to an entry.

## Sprint 3 — Lock It Down (Auth + RLS)
**Goal:** Per-user isolation before real use.
- [ ] Supabase Auth: signup + login pages.
- [ ] Replace permissive RLS with `auth.uid() = user_id` policies.
- [ ] Assign `user_id` on every insert via server actions.
- [ ] Redirect unauthenticated users to login (keep demo route public).

**Definition of Done:** Two different users see only their own entries; switching accounts shows different data; seed demo route still public.

## Sprint 4 — Intelligence (AI extraction)
**Goal:** Optional AI accelerates keying in.
- [ ] `lib/ai/extract_key_points` from summary text.
- [ ] Drafts land pending review; accept/reject UI.
- [ ] Store value+source+confidence+review_status on AI fields.
- [ ] Audit log for AI-initiated inserts.

**Definition of Done:** Reader pastes a summary, clicks "Suggest key points", reviews drafts, accepts two → they persist as real key points.

## Text Gantt
```
S1: ████████ Core CRUD + detail
S2: ██     All-actions + polish
S3: ██     Auth + RLS lock-down
S4: ██     AI extraction (optional)
```