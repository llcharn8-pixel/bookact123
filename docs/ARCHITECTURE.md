# Architecture — ReadAct

## Stack
Next.js (App Router) + Supabase (Postgres) + Vercel.

## Build now vs later
- **Now:** manual Entry/KeyPoint/ActionStep CRUD, list+detail views, seed data, responsive sidebar shell.
- **Later:** login + per-user RLS, AI key-point extraction, action reminders, progress dashboard.

## Key user action flow (add a key point)
1. User opens Entry detail page.
2. Types the key point text in the inline form → submits.
3. Next.js Server Action writes a row to `key_points` via `lib/data/entries.ts`.
4. UI re-fetches and renders the new row.
5. Same flow for adding an ActionStep to that key point.

## Responsive nav shell
Left sidebar on desktop (Entries, All Actions). Collapses to hamburger on mobile. Current section highlighted.

## Layer plan
1. **Data layer** (`lib/data/`) — all DB reads/writes, no inline SQL in UI.
2. **Server actions** (`lib/actions/`) — mutations called from components.
3. **UI** (`components/`, `app/`) — pages and components.
4. **Intelligence** (`lib/ai/`) — later; manual core works without it.

## Why the core runs without AI
The happy path is pure CRUD: the reader types text and saves it. AI summarisation is an optional accelerator layered on top, not a dependency.

## Repo structure
```
lib/data/        # data-access layer (Supabase queries)
lib/actions/     # server actions (mutations)
lib/ai/          # AI helpers (later)
components/      # shared UI
app/entries/     # list + detail
app/actions/     # all-action-steps view
__tests__/       # beside code they test
```

## Module map
| Module | Responsibility | Owns data | Build order |
|---|---|---|---|
| entries | Entry CRUD + detail | entries table | 1 |
| keypoints | KeyPoint CRUD under an entry | key_points table | 2 |
| actionsteps | ActionStep CRUD under a key point | action_steps table | 3 |
| nav | Responsive sidebar shell | — | 1 |
| ai-extract | (later) auto key points from summary | — | later |
| auth | (later) login + RLS | — | later |