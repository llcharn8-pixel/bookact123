# Intelligence Layer — ReadAct (later)

## Messy input
A reader pastes a long article text or rough notes into the summary field.

## Auto-structure schema (target)
```json
{
  "key_points": [
    {
      "content": "Habits compound over time.",
      "action_steps": [
        {"action": "Track one habit daily", "achievable_result": "Visible streak in 30 days"}
      ]
    }
  ]
}
```

## Events to track
- `entry.created`, `key_point.added`, `action_step.status_changed`, `ai.suggestion_accepted`, `ai.suggestion_rejected`.

## Scoring (rule-based start)
- Action completion rate per entry: `done / (todo+doing+done)`.
- Entry engagement score: count of key points × 2 + count of action steps.
- Streak: consecutive days with at least one status change to 'done'.

## What gets ranked
- Entries list sorted by engagement score desc.
- Action steps sorted: doing first, then todo, then done.

## v1 vs later
- **v1:** no AI; manual scoring only (completion %).
- **Later:** AI key-point extraction, confidence + review_status on suggestions, ranked suggestions feed.