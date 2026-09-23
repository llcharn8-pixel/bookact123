# Test Plan — ReadAct

Manual regression checklist covering every feature currently shipped. Run
through this after any significant change, or periodically to catch
regressions. Check items off as you go.

## Setup
- [ ] Log in with a real (or test) account.
- [ ] Note the AI usage badges in the sidebar before starting (general and
      Gemini pools) so you can confirm they decrement correctly.

## Core CRUD — Entries
- [ ] `+ New Entry` → fill title/type/author/summary → Save → appears in list.
- [ ] Click into the entry → detail page renders correctly.
- [ ] Edit → change title → Save → change persists.
- [ ] Delete → confirm dialog → entry removed from list.
- [ ] Empty state: brand-new account shows "No entries yet."

## Core CRUD — Key points & action steps
- [ ] `+ Add key point` → manual key point saves and appears.
- [ ] `+ Add action step` under a key point → saves with action + achievable
      result.
- [ ] Click the status pill → cycles todo → doing → done.
- [ ] Marking an action **done** shows a reflection prompt ("What actually
      happened?") → save a reflection → persists.
- [ ] Entry card shows correct "% done" badge on the list page.
- [ ] Empty states: key point with no actions shows "No action steps yet";
      entry with no key points shows "No key points yet."

## Free uploads (no AI cost)
- [ ] **Text/markdown upload**: select a `.txt` or `.md` file → title
      auto-fills from filename, content fills the summary field → Save.
- [ ] File too large (>2MB) → clear error, no crash.
- [ ] **PDF upload**: select a real PDF (<4MB) → text extracts correctly →
      Save.
- [ ] PDF too large (>4MB) → clear "too large" error, not a silent failure.
- [ ] Scanned/image-only PDF → "Couldn't extract readable text" error, not a
      bad/empty entry.

## AI: "Suggest key points" (Gemini)
- [ ] On an entry with a summary → click "Suggest key points" → drafts
      appear with confidence-based AI badges.
- [ ] Accept some/all drafts → they save as real key points/action steps,
      tagged with the AI badge.
- [ ] Entry with no summary text → clear error, no AI call made.
- [ ] Gemini-pool usage badge in sidebar decrements by 1 on success, **not**
      on failure.
- [ ] At 0 remaining → clear "daily limit reached" message, not a raw error.

## AI: Smart Assistant (DeepSeek/OpenRouter)
- [ ] **Paste a URL** mode: real article URL → grounded summary + key points
      → "Read from the page you linked" label shown.
- [ ] **Give me a title** mode: a known book title → summary + key points →
      "Generated from the assistant's own knowledge — verify before trusting
      it" label shown; low-confidence badges on uncertain items.
- [ ] **Audio/video** mode: short clip (<4MB) → transcribes → draft entry
      with AI-badged key points.
- [ ] Audio/video: file >4MB or wrong type → clear client-side error before
      any upload attempt.
- [ ] Accept a draft → entry created, redirects to its detail page.
- [ ] General-pool usage badge decrements correctly; YouTube mode is **not**
      shown (disabled — confirmed unreliable from this host).

## Discover
- [ ] By category: pick a chip (or type your own) → "Get recommendations" →
      real book/article results with title/author/reason.
- [ ] By author: switch mode → same flow with an author name.
- [ ] Language dropdown and count dropdown (5/10/20) change the request.
- [ ] "Add & summarize" on a result → creates a full entry via the
      title-mode flow.
- [ ] Recommendations exclude books already in your library.

## Review (spaced repetition)
- [ ] New key point → does **not** appear in Review until the next day
      (day-1 interval).
- [ ] A key point due today → shows in Review, "Reveal it" → shows content +
      action steps.
- [ ] "I remembered it" → advances the schedule (won't resurface for 7 days
      next, then 30, then retired).
- [ ] "I forgot it" → resets the schedule, due again tomorrow.
- [ ] Sidebar "Review" link shows a due-count badge when items are due, no
      badge when empty.
- [ ] Empty state when nothing is due.

## Progress / Stats
- [ ] Current streak, longest streak, completion rate, entries-logged tiles
      are accurate.
- [ ] 14-day bar chart reflects actual completions.
- [ ] Action-steps-by-status breakdown matches reality.
- [ ] Most-active book links to the right entry.
- [ ] Empty state before any action step is ever completed.

## Activity feed
- [ ] Every successful AI action appears with a human-readable description,
      risk-level badge, and timestamp.
- [ ] Failed AI attempts do **not** create an activity entry.
- [ ] Empty state on a fresh account.

## All Actions
- [ ] Aggregates every action step across all entries.
- [ ] Filter tabs (All/To do/Doing/Done) work correctly.
- [ ] Sort dropdown (newest first, etc.) works.

## Public Demo
- [ ] `/demo` loads without login, shows seeded entries.
- [ ] Demo entry detail page is fully read-only — no Edit/Delete/Suggest/Add
      buttons, no clickable status pill.

## Auth & access control
- [ ] Logged out → every protected route (`/`, `/actions`, `/review`,
      `/stats`, `/discover`, `/activity`, `/entries/*`) redirects to
      `/login`.
- [ ] `/legal`, `/demo`, `/login`, `/signup`, `/forgot-password` are
      reachable without login.
- [ ] User A cannot see User B's entries, key points, or action steps
      (RLS).
- [ ] Signup → login → logout flow works end to end.

## Cost controls
- [ ] Sidebar shows two independent usage badges: general (10/day) and
      Gemini (3/day).
- [ ] Each pool decrements only for its own actions (general: Smart
      Assistant URL/title + Discover; Gemini: Suggest key points +
      audio/video).
- [ ] Hitting either limit shows a clear, specific error — never a raw
      status code.

## Legal / disclaimer
- [ ] `/legal` loads without login and lists AI-content, IP-responsibility,
      third-party-provider, no-professional-advice, liability, and Known
      Limits sections.
- [ ] Signup page links to it; upload/Smart Assistant panels link to it near
      the upload controls.

## Known, accepted non-bugs (don't re-report these)
- Smart Assistant title-mode and Discover "Add & summarize" can take up to
  ~50s — a known DeepSeek reasoning-model latency issue, not a hang.
- YouTube reading is intentionally disabled (hidden from the UI) — YouTube
  blocks caption downloads from this host's network.
- Gemini's free-tier API key caps at 20 requests/day, **project-wide** —
  if you see "AI service is busy" repeatedly during heavy testing, this is
  almost certainly why; it resets at midnight UTC-adjacent (Google's
  reset is midnight Pacific time).
