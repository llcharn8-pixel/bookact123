# Test Plan — ReadAct (v1)

## Success scenario (manual)
1. Open app (no login) → see seeded entries on the list.
2. Click "+ New Entry" → fill title "Atomic Habits Ch.1", type "article", author "James Clear", summary "Small habits compound." → Save.
3. Entry appears at top of list → click into it.
4. Add key point "Habits compound over time" → appears under Key Points.
5. Add a second key point "Identity-based habits stick."
6. Under first key point, add action step "Track one habit daily" with achievable result "30-day visible streak".
7. Click the status toggle → changes from 'todo' to 'done'; badge shows.
8. Refresh the page → entry, key points, and done status persist.

## Empty state
- Delete all entries → list shows "No entries yet. Add your first book or article."
- Entry with no key points → shows "No key points yet."
- Key point with no actions → shows "No action steps yet."

## Error state
- Disconnect network → submit form → inline error "Couldn't save. Check your connection and retry."
- Invalid form (empty title) → submit disabled + red helper text.

## Loading state
- List page shows skeleton cards while fetching.
- Detail page shows skeleton for key points section.

## Auth (Sprint 3 check)
- User A creates entry → logs out → User B logs in → does NOT see User A's entry.
- Demo public route still renders seeded data for anonymous visitors.