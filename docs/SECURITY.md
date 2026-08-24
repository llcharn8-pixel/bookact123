# Security — ReadAct

## Secret handling
- Supabase URL + anon key: public-safe, in `NEXT_PUBLIC_` env vars.
- Supabase service-role key: server-only, never prefixed `NEXT_PUBLIC_`, never imported in client components.
- All AI provider keys: server-side only.

## Permission model
- v1 (demo): permissive RLS — anonymous read/write so the app renders without login.
- Lock-down sprint: replace permissive policies with `auth.uid() = user_id` on every table. Owner-scoped; no cross-user access.
- Agent (later) inherits the logged-in user's permissions; never runs with the service-role key for user-facing actions.

## Approved-tools rule
- Agent may only call named tools (see Agentic Layer doc). No raw SQL, no `run_any`, no arbitrary shell.

## Audit principle
- Every agent-initiated write is logged in `audit_logs` with risk level, target, and payload.
- v1 has no agent, so only human actions exist — deletion of an entry cascades and is a deliberate UI action.