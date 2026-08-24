# Agentic Layer — ReadAct (later)

## Risk levels
| Level | Action |
|---|---|
| Low (auto) | Summarise entry, extract key points, draft action steps |
| Medium (light approval) | Auto-add drafted key points / action steps after user confirms |
| High (approval) | Update action step status in bulk |
| Critical (human-only) | Delete an entry and all children |

## Draftable actions (later)
- From raw summary text → draft key_points + action_steps JSON.
- Drafts land in a `review_status='pending'` state; user accepts/rejects.

## Named tools
- `extract_key_points(entry_id)` — low.
- `draft_action_steps(key_point_id)` — low.
- `apply_drafts(entry_id)` — medium.
- `bulk_update_status(ids, status)` — high.
- `delete_entry(entry_id)` — critical, human-only (UI button, no agent).

## Audit log fields
`id, user_id, action, target_table, target_id, risk_level, payload jsonb, created_at`.

## v1 vs later
- **v1:** no agentic actions; all writes are manual human actions.
- **Later:** AI drafting + approval flow + audit logging for agent-initiated changes.