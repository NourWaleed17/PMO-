# Board Dashboard — Phase 1 Build Brief

Cluster 1 residential cost dashboard. Frontend-only prototype.

---

## 1. Context

A three-building residential cluster plus a basement, 98 apartments, total cost
147,629,110.42 EGP. The audience is a board of directors, not a quantity
surveyor. They will open this on an iPhone home screen or a laptop, look at it
for four minutes, and ask one or two questions.

The estimate was previously a spreadsheet where totals were typed into cells.
That spreadsheet contained a copy-paste error that overstated cost by 37,567.60
and went unnoticed. The whole point of this build is that **totals are never
stored — they are derived from inputs by one shared function.**

### Phase 1 is a frontend product

No backend. No database. No authentication. No deployment pipeline.

`seed.json` is imported directly. Edits live in React state. There is a "reset to
seed" control and an "export JSON" control so nothing is trapped and nothing is
lost. The goal is to answer three questions before any infrastructure is built:

1. Does the data model hold up when you actually put it on a screen?
2. Does editing a rate and watching the cluster total move feel right?
3. Which visual direction do we want?

Phases 2–4 (Supabase, auth, revisions, real scenarios) come later and are out of
scope. Do not build toward them speculatively, but do not make them harder either
— keep all data access behind a thin module so it can be swapped for a real
client without touching components.

---

## 2. The data

Four files are provided:

| File | Role |
|---|---|
| `seed.json` | The model. Inputs only — areas, rates, counts, lump sums. |
| `src/engine.ts` | Pure calculation. Copy this in unchanged. |
| `verify.ts` | Regression harness. Keep it running. |
| `README.md` | Model contract and extension rules. |

### Shape

```
clusters[]     id, name
activities[]   id, name, basis, uom, discipline, group
layouts[]      id, name, spaces[], unit_rates{}
  spaces[]     id, name, floor_area, wall_area, rates{ activity_id: rate }
buildings[]    id, code, building_type, cluster_id, units[], lump_sums[]
  units[]      layout_id, count
  lump_sums[]  scope, discipline, item, amount, substantiated, note?
```

### The numbers

- 3 buildings + 1 basement, 1 cluster
- 5 apartment layouts: Edge, Middle, Apt 1, Apt 2, Apt 3
- 98 apartments — 14 of each layout
- 17 named spaces per layout (not all present in every layout)
- 8 activities, 6 measured and 2 per-unit
- Cluster total 147,629,110.42 EGP
- Apartment finishes 34,197,828.42 — the remaining **76.8% is lump sums with no
  build-up behind them**

### Cost per apartment

| Layout | Count | Cost |
|---|---:|---:|
| Apartment Edge | 28 | 393,303.17 |
| Apartment Middle | 28 | 382,465.76 |
| Apartment 1 | 14 | 301,537.10 |
| Apartment 2 | 14 | 294,250.20 |
| Apartment 3 | 14 | 295,376.87 |

### Cost by activity, whole cluster

| Activity | Total | Share |
|---|---:|---:|
| Windows | 10,201,002 | 29.8% |
| Doors | 6,720,000 | 19.7% |
| Gypsum board | 4,143,949.60 | 12.1% |
| Painting — walls | 3,828,262.20 | 11.2% |
| Ceramic & porcelain flooring | 3,631,899.60 | 10.6% |
| HDF flooring | 2,547,099.10 | 7.4% |
| Ceramic & porcelain walls | 2,011,695 | 5.9% |
| Painting — ceiling | 1,113,920.92 | 3.3% |

### Cost by building

| Building | Total |
|---|---:|
| Building 10 | 26,120,050.02 |
| Building 11 | 26,120,050.02 |
| Building 12 | 30,744,908.38 |
| Basement | 64,644,102 |

---

## 3. The calculation contract

`engine.ts` is the only place arithmetic happens. Components read from it; they
never compute a total inline. It branches on exactly one field — `basis`:

- `floor_area` → rate × the space's floor area
- `wall_area` → rate × the space's wall area
- `per_unit` → flat amount per apartment from `layout.unit_rates`

A rate absent from a space means the activity does not apply there. That is how
the 650 reception / 350 wet-area porcelain split is expressed — as data, not as
a branch in code.

**Do not modify `engine.ts` to make a component easier to write.** If a component
needs a shape the engine doesn't expose, add a selector function alongside it.

### Extension rules the UI must respect

The UI must not hardcode the eight activities, the five layouts, or the four
buildings. Everything renders from arrays. Concretely:

- Adding a ninth activity to `seed.json` must make it appear in every chart,
  table, and filter with no code change.
- Adding Building 13 with `units: [{layout_id: "edge", count: 12}]` must appear
  in every roll-up with no code change.
- Adding a new cluster must work — group by `cluster_id`, never assume one.

Write a test for the first two. They are the whole point of the model.

---

## 4. Design brief

Produce **two or three distinct directions** before building. Show them, take a
decision, then build the chosen one properly. Do not average them.

### Non-negotiable constraints

- **Tabular numerals everywhere numbers appear.** Misaligned digits in a cost
  column is the single fastest way to lose a board's confidence. Set
  `font-variant-numeric: tabular-nums` on every figure.
- **Legible at arm's length on a phone, and on a projector.** A board member will
  hold this at 60cm and someone will mirror it to a screen. No 11px labels.
- **Never encode meaning in colour alone.** Some board members will be
  colour-blind and some will print it in greyscale. Every colour distinction
  needs a second cue — a pattern, a label, a position.
- **EGP, thousands-separated, two decimals only where they matter.**
  147.6 M in headlines, 147,629,110.42 in tables. Never both in one view.
- Responsive to 375px. Visible keyboard focus. `prefers-reduced-motion` respected.

### The signature element

Every figure in this dashboard is one of two things: **built up from measured
quantities**, or **a lump sum somebody typed in**. 76.8% of the total is the
second kind. That distinction is the most important truth in the dataset and no
existing tool shows it.

Make it the visual signature. A consistent treatment — hatching, a rule, a
weight difference, whatever the chosen direction calls for — that runs through
every chart, every table row, every KPI, so that a board member can tell at a
glance which numbers have work behind them and which are placeholders. The
basement's 64,644,102 should look different from the windows' 10,201,002,
because it is different.

Spend the boldness here. Keep everything else quiet.

### What to avoid

The default AI dashboard look: cream background, high-contrast serif display,
terracotta accent near #D97757. Also avoid the dark-mode-with-one-acid-accent
crypto dashboard, and avoid big-number-plus-gradient hero cards. If the direction
you produce would suit a SaaS analytics product equally well, it is not specific
enough to this brief.

Ground it in the subject instead: this is construction cost for a residential
development. Concrete, marble, gypsum, paint, drawing conventions, schedules of
rates. There is a real material vernacular to draw from.

### Copy

Write from the board member's side of the screen. "Cost per apartment," not
"unit cost aggregate." "No detail behind this figure," not "unsubstantiated
lump sum record." Sentence case. Active voice. An empty filter result says what
to do next, not "no data found."

---

## 5. Screens

### Overview

The landing screen and the one most board members will only ever see.

- Cluster total, prominent, with the substantiation split visible
- Apartment count, cost per apartment, cost per m²
- Cost by building
- Cost by discipline (architecture / MEP)
- Cost by activity for the apartment finishes
- A clear route into each of the above

### Buildings

Drill into one building. Its layouts, apartment counts, measured cost, lump sums.
Basement is a building with no units and three lump sums — the layout must not
break on it.

### Activities

The eight activities across the cluster. Filterable by building, layout, and
discipline. This is where a board member asks "why are windows 10 million" and
should be able to see the rate and the count that produce it.

### Layouts

The five apartment types, space by space. Floor area, wall area, which activities
apply, at what rate, for what cost. This is the deepest level and the one that
proves the model.

### Rates

The editing surface. Change any rate, area, or apartment count. A persistent
banner shows the live delta against the seed — "147,629,110.42 → 146,180,220.10,
down 1,448,890.32 (−1.0%)". Reset and export controls live here.

### Filters

Global, persistent across screens, reflected in the URL so a view can be shared:
cluster, building, layout, discipline, activity, and substantiated / not.

---

## 6. Tech stack

- Vite + React + TypeScript
- Tailwind
- Recharts
- `zod` to validate `seed.json` on load — fail loudly and specifically if the
  shape is wrong, because this file will be hand-edited
- Vitest for the engine tests
- No state library. React state and context are sufficient at this size.
- No backend, no API routes, no auth

### Conventions

- All data access behind `src/data/` so it can be swapped for a Supabase client
  in Phase 2 without touching a component
- Components never compute totals — they call engine selectors
- Currency formatting in one utility, used everywhere, never inline
- File names kebab-case, components PascalCase

---

## 7. Acceptance criteria

The build is done when all of these pass:

1. `npx tsx verify.ts` reproduces the five per-apartment costs and the cluster
   total exactly as documented above.
2. Adding a ninth activity to `seed.json` makes it appear across every screen
   with no code change. Covered by a test.
3. Adding a fourth building makes it appear in every roll-up with no code change.
   Covered by a test.
4. Editing the window rate in the Rates screen updates the cluster total, the
   activity chart, the building breakdown, and the per-apartment figures
   simultaneously.
5. Export JSON produces a file that re-imports and reproduces the edited state.
6. Reset returns exactly to the seed.
7. The basement — a building with zero units and three lump sums — renders
   correctly on every screen.
8. Filtering to a single activity does not break any chart layout.
9. Usable at 375px width.
10. Every displayed figure indicates whether it is measured or a lump sum.

---

## 8. Out of scope

Do not build: authentication, a database, revisions or version history, an audit
log, real multi-user scenarios, a service worker, PWA manifest, deployment
config, or Excel import. All of these are Phases 2–4. Building them now will make
them worse, because the data model is not yet confirmed against the drawings.

---

## 9. Known data issues to surface, not fix

These are real and the dashboard should make them visible rather than hide them:

- **76.8% of the total has no build-up.** Elevation paint, public areas, all MEP,
  and the entire basement are lump sums. The basement alone is 43.8% of the
  cluster.
- **Alternative basement figures exist** in the source (Arch 15,205,860 / Elec
  39,544,131 / Mech 22,146,906) — 12.3 M higher than the ones used. Carried in
  the `note` field. Worth showing as a toggle or an annotation.
- **Door and window figures are unconfirmed.** They are 49.4% of apartment cost
  and the source spreadsheet held a second, unused set. Flag them.
- **The ×14 apartment count was derived**, not stated in the source. Flag it as
  requiring confirmation against the architectural drawings.
- **The Middle ceramic-flooring correction** is already applied in the seed. The
  model reads 37,567.60 lower than the original spreadsheet. If the board has
  seen the old figure, this needs to be presented as a correction.

---

## 10. Master prompt

Copy this into Claude Code as the opening message, with the four files in the
repo.

---

> You are building Phase 1 of a board-level construction cost dashboard. Read
> `BRIEF.md` in full before writing any code — it is the spec, and its acceptance
> criteria are the definition of done.
>
> Context: a residential cluster of three buildings plus a basement, 98
> apartments, 147,629,110.42 EGP. The audience is a board of directors viewing it
> on an iPhone home screen or a laptop for a few minutes at a time.
>
> This phase is frontend only. Vite + React + TypeScript + Tailwind + Recharts.
> `seed.json` is imported directly, edits live in React state, and there is
> reset and export. No backend, no auth, no database — those are later phases and
> building toward them now is out of scope.
>
> Three rules that override convenience:
>
> 1. `src/engine.ts` is the only place arithmetic happens. Copy it in unchanged.
>    Components call selectors; they never compute a total inline. If a component
>    needs a shape the engine doesn't expose, add a selector next to it rather
>    than editing the engine.
> 2. Nothing is hardcoded. Not the eight activities, not the five layouts, not
>    the four buildings. Everything renders from arrays in `seed.json`. Adding a
>    ninth activity or a fourth building must flow through every screen with no
>    code change, and there must be a test proving it.
> 3. Every figure on screen must show whether it is a measured build-up or a
>    lump sum. 76.8% of this total is lump sums, and that is the most important
>    fact in the dataset.
>
> Start with design, not code. Read the design brief in section 4, then produce
> two or three genuinely distinct visual directions as static HTML — real data
> from `seed.json`, the Overview screen only. Show me all of them and wait for me
> to choose. Do not begin the React build until I have picked one.
>
> When you do build, work screen by screen in this order: Overview, Layouts,
> Activities, Buildings, Rates. Run `npx tsx verify.ts` after each one and stop if
> the totals drift.

---

## 11. After Phase 1

Once the design is chosen and the data model has survived contact with a real
screen, Phase 2 adds Supabase for Postgres and Google SSO, the editor/viewer role
split, revisions with a locked approved figure, and an audit log. Phase 3 adds
board-side what-if scenarios and Excel export. Phase 4 adds the PWA manifest,
service worker, and iOS home-screen install.

The data-access boundary in `src/data/` is what makes Phase 2 a swap rather than
a rewrite. Keep it clean.
