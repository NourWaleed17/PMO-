-- Phase 2 schema — Cluster 1 board dashboard
--
-- Maps docs/MODEL.md's shape onto Postgres tables, then adds what
-- docs/BRIEF.md section 11 asks for: the editor/viewer role split,
-- revisions with a locked approved figure, and an audit log.
--
-- DRAFT — reviewed against the Phase 1 data model and tested against a
-- local Postgres 16 instance (see docs/HANDOFF.md "Phase 2" for how), but
-- not yet applied to a live Supabase project or signed off by the user.
-- Assumes Supabase's built-in `auth` schema (auth.users, auth.uid()) —
-- do not run this against a plain Postgres database without stubbing that
-- first (see supabase/README.md).

-- ---------------------------------------------------------------------
-- Reference data: activities and layouts are shared catalog data, not
-- scoped to a cluster — matches seed.json, where only buildings carry a
-- cluster_id. Adding a cluster must not require touching these.
-- ---------------------------------------------------------------------

create type activity_basis as enum ('floor_area', 'wall_area', 'per_unit');

create table clusters (
  id text primary key,
  name text not null
);

create table activities (
  id text primary key,
  name text not null,
  basis activity_basis not null,
  uom text not null,
  discipline text not null,
  "group" text not null
);

create table layouts (
  id text primary key,
  name text not null
);

-- Flat rate per apartment, for basis = 'per_unit' activities (windows, doors).
create table layout_unit_rates (
  layout_id text not null references layouts (id) on delete cascade,
  activity_id text not null references activities (id) on delete restrict,
  rate numeric(14, 2) not null,
  primary key (layout_id, activity_id)
);

-- One row per named space per layout, including spaces that don't exist in
-- that layout (floor_area and wall_area both null) — see docs/BRIEF.md
-- section 2: "17 named spaces per layout (not all present in every
-- layout)". Absence is data, not a missing row, so every layout has the
-- same 17 space_key values.
create table spaces (
  id uuid primary key default gen_random_uuid(),
  layout_id text not null references layouts (id) on delete cascade,
  space_key text not null,
  name text not null,
  floor_area numeric(10, 3),
  wall_area numeric(10, 3),
  unique (layout_id, space_key)
);

-- Rate per activity within a space. A missing row means the activity
-- doesn't apply there (docs/BRIEF.md section 3) — never a zero-rate row.
create table space_rates (
  space_id uuid not null references spaces (id) on delete cascade,
  activity_id text not null references activities (id) on delete restrict,
  rate numeric(14, 2) not null,
  primary key (space_id, activity_id)
);

-- ---------------------------------------------------------------------
-- Cluster-scoped data
-- ---------------------------------------------------------------------

create table buildings (
  id text primary key,
  code text not null,
  name text not null,
  building_type text not null,
  cluster_id text not null references clusters (id) on delete cascade
);

create table building_units (
  building_id text not null references buildings (id) on delete cascade,
  layout_id text not null references layouts (id) on delete restrict,
  count integer not null check (count >= 0),
  primary key (building_id, layout_id)
);

create table lump_sums (
  id uuid primary key default gen_random_uuid(),
  building_id text not null references buildings (id) on delete cascade,
  scope text not null,
  discipline text not null,
  item text not null,
  amount numeric(14, 2) not null,
  substantiated boolean not null default false,
  note text
);

-- ---------------------------------------------------------------------
-- Roles — editor/viewer split (docs/BRIEF.md section 11)
-- ---------------------------------------------------------------------

create type user_role as enum ('viewer', 'editor');

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role user_role not null default 'viewer',
  created_at timestamptz not null default now()
);

-- New Supabase auth users default to 'viewer' — an editor has to be
-- promoted explicitly (by an admin, out of band; no self-service editor
-- signup path here since this app has no "New Request"-style workflow yet).
create function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- Revisions — a locked, approved figure (docs/BRIEF.md section 11)
--
-- The Phase 1 Rates screen edits one in-memory Model (see
-- src/data/ModelContext.tsx); a revision is that same shape — the whole
-- edited model, not a per-field diff — captured as a point-in-time
-- snapshot. Keeping it as one jsonb blob (validated by the same zod
-- modelSchema.ts on the way in) means Phase 1's edit/reset/export logic
-- barely changes shape when it starts writing to Supabase instead of
-- React state; a normalized per-field revision history is more churn than
-- this product needs yet.
-- ---------------------------------------------------------------------

create type revision_status as enum ('draft', 'approved');

create table revisions (
  id uuid primary key default gen_random_uuid(),
  cluster_id text not null references clusters (id) on delete cascade,
  label text not null,
  status revision_status not null default 'draft',
  snapshot jsonb not null,
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  approved_by uuid references profiles (id),
  approved_at timestamptz,
  constraint approved_fields_together check (
    (status = 'approved' and approved_by is not null and approved_at is not null)
    or (status = 'draft' and approved_by is null and approved_at is null)
  )
);

-- A locked revision stays locked — no further edits, only a new draft
-- revision superseding it. Enforced in the database, not just the UI.
create function forbid_editing_approved_revision()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'approved' then
    raise exception 'revision % is approved and locked', old.id;
  end if;
  return new;
end;
$$;

create trigger revisions_lock_when_approved
  before update on revisions
  for each row execute function forbid_editing_approved_revision();

-- ---------------------------------------------------------------------
-- Audit log — every edit, who made it (docs/BRIEF.md section 11)
-- ---------------------------------------------------------------------

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  revision_id uuid references revisions (id) on delete set null,
  actor uuid not null references profiles (id),
  action text not null,
  entity text not null,
  field text,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- Row-level security
--
-- Everyone authenticated can read everything (this is a board dashboard,
-- not a multi-tenant app — no per-row ownership to enforce on reads).
-- Only editors can write, and only to drafts; audit_log is append-only.
-- ---------------------------------------------------------------------

alter table clusters enable row level security;
alter table activities enable row level security;
alter table layouts enable row level security;
alter table layout_unit_rates enable row level security;
alter table spaces enable row level security;
alter table space_rates enable row level security;
alter table buildings enable row level security;
alter table building_units enable row level security;
alter table lump_sums enable row level security;
alter table profiles enable row level security;
alter table revisions enable row level security;
alter table audit_log enable row level security;

create function is_editor()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'editor'
  );
$$;

create policy "authenticated users can read reference and cluster data"
  on clusters for select to authenticated using (true);
create policy "authenticated users can read activities"
  on activities for select to authenticated using (true);
create policy "authenticated users can read layouts"
  on layouts for select to authenticated using (true);
create policy "authenticated users can read layout unit rates"
  on layout_unit_rates for select to authenticated using (true);
create policy "authenticated users can read spaces"
  on spaces for select to authenticated using (true);
create policy "authenticated users can read space rates"
  on space_rates for select to authenticated using (true);
create policy "authenticated users can read buildings"
  on buildings for select to authenticated using (true);
create policy "authenticated users can read building units"
  on building_units for select to authenticated using (true);
create policy "authenticated users can read lump sums"
  on lump_sums for select to authenticated using (true);
create policy "authenticated users can read their own profile and others'"
  on profiles for select to authenticated using (true);

create policy "authenticated users can read revisions"
  on revisions for select to authenticated using (true);
create policy "editors can create revisions"
  on revisions for insert to authenticated with check (is_editor() and created_by = auth.uid());
-- USING gates which existing rows an editor can touch (must currently be a
-- draft — an approved row is untouchable here, the trigger above is the
-- backstop). WITH CHECK gates what the row is allowed to become; it must be
-- omitted/true rather than repeating "status = 'draft'", or Postgres reuses
-- USING as the implicit WITH CHECK and rejects the row it just approved,
-- since the post-update row's status is 'approved', not 'draft'. Caught by
-- testing the actual draft-to-approved transition end to end (see
-- docs/HANDOFF.md "Phase 2") — this is exactly the kind of RLS bug that
-- only shows up when you exercise the state transition, not when you read
-- the policy.
create policy "editors can update draft revisions"
  on revisions for update to authenticated
  using (is_editor() and status = 'draft')
  with check (is_editor());

create policy "authenticated users can read the audit log"
  on audit_log for select to authenticated using (true);
create policy "editors can append to the audit log"
  on audit_log for insert to authenticated with check (is_editor() and actor = auth.uid());

-- RLS policies only gate rows an operation is already permitted to touch —
-- Postgres still requires the base table-level grant first. Supabase's own
-- projects reportedly wire this up via schema-level default privileges, but
-- that's platform configuration this migration can't see or depend on;
-- granting explicitly here is what made RLS actually take effect when
-- tested against a bare Postgres 16 instance (see docs/HANDOFF.md "Phase
-- 2") and is harmless if the platform already grants it. No delete policy
-- exists anywhere above, so granting delete at the table level doesn't
-- open one up — RLS still denies every row for an operation with no
-- matching policy.
grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
