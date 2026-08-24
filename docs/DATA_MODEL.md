# Data Model — ReadAct

## entries
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable until auth sprint |
| title | text not null | book or article title |
| type | text | 'book' \| 'article' |
| author | text | nullable |
| summary | text | reader-written summary |
| created_at | timestamptz | default now() |

## key_points
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| entry_id | uuid | references entries.id |
| content | text not null | the important point |
| created_at | timestamptz | |

## action_steps
| field | type | notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | nullable |
| key_point_id | uuid | references key_points.id |
| action | text not null | what to do |
| achievable_result | text | expected outcome |
| status | text | 'todo' \| 'doing' \| 'done' (default 'todo') |
| created_at | timestamptz | |

## AI fields (later)
When AI summarisation is added, `entries.summary_ai` will store: `value text`, `source text`, `confidence numeric`, `review_status text default 'unreviewed'`. Not in v1 schema.

## Relationships
- entry 1→N key_points 1→N action_steps.
- Cascade delete: removing an entry deletes its points and their actions.

## RLS
v1: permissive read/write for anonymous demo. Later: `auth.uid() = user_id` on all tables.