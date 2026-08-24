# Product Requirements — ReadAct

## Problem
Readers re-read books/articles yet struggle to extract the important points and turn them into concrete, trackable actions for self-improvement.

## Target user
Solo article/book reader who wants a structured, lightweight log of summaries → key points → actionable steps → achievable results.

## Core objects
- **Entry** — a book or article title + type (book/article) + author + summary.
- **KeyPoint** — one important takeaway linked to an Entry.
- **ActionStep** — a concrete action linked to a KeyPoint, with status (todo / doing / done) and achievable result text.

## MVP (v1) checklist
- [ ] Add an Entry (title, type, author, summary) via form → persists to DB.
- [ ] Add KeyPoints to an Entry.
- [ ] Add ActionSteps to a KeyPoint with a written achievable result.
- [ ] List all Entries; drill into one to see points + actions.
- [ ] Mark an ActionStep done; UI updates instantly.
- [ ] Edit/delete Entry, KeyPoint, ActionStep.
- [ ] Seed demo data so the app looks alive on first load (no login wall).
- [ ] Loading / empty / error states on every screen.

## Non-goals (v1)
- Login / signup / per-user isolation (later sprint).
- AI auto-summarisation (later — core works manually first).
- Progress charts, reminders, social sharing, exports.

## Success criteria (one concrete scenario)
A reader adds the article "Atomic Habits, Chapter 1", types two key points and one action step each with an achievable result, marks an action done, and sees the updated status persisted after a full refresh — all without logging in.