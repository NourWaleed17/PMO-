# Phase 2 — Supabase schema

`migrations/20260723120000_phase2_schema.sql` is the first-draft schema for
Phase 2 (see `docs/BRIEF.md` section 11 and `docs/HANDOFF.md` "Phase 2 —
authorized, not yet started"). **Not yet applied to a live Supabase
project** — this repo has no Supabase CLI link and no credentials. It has
been tested against a real (non-Supabase) local Postgres 16 instance; see
below for exactly what that did and didn't prove.

## What the schema does

Maps `docs/MODEL.md`'s shape onto tables — `clusters`, `activities`,
`layouts` (+ `layout_unit_rates`, `spaces`, `space_rates`), `buildings` (+
`building_units`, `lump_sums`) — matching `seed.json` field for field. Adds
what Phase 2 needs on top:

- **`profiles`** — one row per Supabase auth user (`role`: `viewer` or
  `editor`), auto-created on signup via a trigger on `auth.users`, defaulting
  to `viewer`. Promoting someone to `editor` is an out-of-band admin action
  (`update profiles set role = 'editor' where ...`) — there's no self-service
  editor signup, matching the fact that this app has no signup/invite flow
  yet.
- **`revisions`** — a `draft`/`approved` snapshot of the whole edited model
  as `jsonb`, not a normalized per-field history. This mirrors what
  `src/data/ModelContext.tsx` already does in memory (one edited `Model`,
  validated by the same `modelSchema`) — when this becomes real, the
  Rates screen's edit/reset/export logic barely changes shape, it just
  writes to a row instead of `useState`. An `approved` revision is locked by
  a trigger (`revisions_lock_when_approved`) that rejects any `UPDATE` on a
  row whose `status` is already `approved` — enforced in the database, not
  just the UI, so it holds even against a client that skips the app
  entirely.
- **`audit_log`** — append-only, one row per edit action.
- **Row-level security** on every table: any authenticated user can read
  everything (this is a board dashboard, not multi-tenant — no per-row
  ownership to enforce on reads); only `editor`s can write, and only to
  `draft` revisions.

## What was actually tested, and how

No Supabase CLI, no Docker (checked: `/var/run/docker.sock` doesn't exist in
this sandbox), so the full Supabase stack (GoTrue, PostgREST, Realtime)
couldn't be run. What's real Postgres 16 (installed in this environment) was
used instead:

1. Stubbed the two things a bare Postgres doesn't have that this migration
   assumes — an `auth.users` table and an `auth.uid()` function reading a
   session variable — in a **local-testing-only** script, never committed,
   never run against anything but a scratch database.
2. Applied the migration verbatim. It ran clean top to bottom.
3. Wrote a one-off import script that read the actual `model` export from
   `src/data/index.ts` and inserted it row by row — every table, every
   nullable space, every lump sum.
4. Queried it all back out, reassembled it into the `Model` shape, validated
   it with `modelSchema` (pass), and ran it through `summarise()` — the
   **same `engine.ts`** the frontend uses. Cluster total:
   **147,629,110.42**, exact match against the known-good figure. This is
   the strongest evidence available without a live project: the schema can
   hold the real data losslessly and the same calculation logic reproduces
   the same number reading it back.
5. Exercised the actual role/revision state machine end to end: a fresh
   signup defaults to `viewer`; promoted one user to `editor`; as that
   editor, created a draft, edited it, approved it, then tried to edit the
   now-approved row (rejected); as the `viewer`, confirmed reads work but
   creating a revision and writing the audit log are both rejected.

Two real bugs surfaced only by running this, not by reading the SQL:

- The migration only granted `usage on schema public`, not table-level
  privileges — Postgres requires the base grant before RLS policies are
  even evaluated, so every write was rejected regardless of policy. Fixed
  with an explicit `grant ... on all tables in schema public`.
- The `editors can update draft revisions` policy had no `with check`, so
  Postgres reused the `using` clause (`status = 'draft'`) as the implicit
  check on the *post-update* row — which rejected the approve transition
  itself, since the row's status is `approved` after that update. Fixed by
  giving `with check` its own, looser condition.

Both are now fixed in the committed migration and re-verified against a
fresh database.

## What isn't tested, and won't be until a real project exists

- Google SSO (needs a real OAuth client from Google Cloud Console).
- Whether Supabase's platform already grants base table privileges to
  `authenticated`/`anon` by default (the explicit `grant` above is written
  to not depend on that either way, but it's untested against the real
  platform).
- Realtime/PostgREST-specific behavior (foreign key introspection for
  nested selects, generated API shape) — this was tested against raw SQL
  via `pg`, not through PostgREST.

## To actually apply this

Once there's a Supabase project: `supabase link` then `supabase db push`,
or paste the migration into the Supabase Studio SQL editor. No client code
exists yet in `src/` to point at it — `src/data/index.ts` still reads
`seed.json` directly, deliberately, until there's something real to swap it
for. See `docs/HANDOFF.md` "Phase 2" for what's still needed before that
swap makes sense (project credentials, an OAuth client, sign-off on this
schema).
