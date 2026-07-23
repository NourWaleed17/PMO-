# Handoff — where this stands and what's next

Written for whoever opens this repo next, human or Claude. Read `CLAUDE.md`
and `docs/BRIEF.md` first — this file only says what's already done and what
to do in what order. Update the checklists below as you go so the next
handoff is just as clean.

## What's done

- [x] `docs/BRIEF.md` — full spec, `docs/MODEL.md` — data model contract.
- [x] `src/data/seed.json` — the model, unmodified from source.
- [x] `src/engine/engine.ts` — pure calculation engine, unmodified. **Never
      edit this file to make a component easier to write** — add a selector
      next to the component instead (see `CLAUDE.md` rule 1).
- [x] `verify.ts` — regression harness. `npm run verify` reproduces the
      known-good numbers in `CLAUDE.md` exactly (Δ 0 against the sheet except
      the documented Apartment Middle correction — that Δ is expected, not a
      bug: see `docs/MODEL.md` "Known issue carried from the source").
- [x] Vite + React + TypeScript scaffold, with Tailwind v4, Recharts, zod, and
      Vitest installed and wired in (`vite.config.ts` has the Tailwind plugin,
      `src/index.css` is `@import "tailwindcss";`).
- [x] `npm run build` and `npm run dev` both work. (They didn't as of the last
      commit before this handoff — the Vite template's `App.tsx` imported
      assets that had been deleted, and Tailwind was installed but never
      added to `vite.config.ts`. Both are fixed now.)
- [x] `src/App.tsx` is a **placeholder** — it renders the cluster total
      straight from `summarise()` to prove the data → engine → component
      wiring works. It is not a design and should be deleted/replaced, not
      extended.

Confirm all of the above still holds before doing anything else:

```
npm install
npm run verify
npm run build && rm -rf dist
```

## What's not done — in order

The brief (section 10, "Master prompt") is explicit that design comes before
code. Do not skip ahead to React screens.

### 1. Design directions (blocking — do this first)

Produce **2–3 distinct static HTML directions** for the Overview screen only,
using real numbers from `seed.json` (not placeholder data). Follow the
constraints in `docs/BRIEF.md` section 4 — tabular numerals, EGP formatting,
the measured-vs-lump-sum signature treatment, and the "what to avoid" list
(no cream/terracotta AI-dashboard look, no dark-mode-crypto look, no
gradient hero cards).

**Show them and wait for a decision before writing any React component.**
This repo has no decision recorded yet — if you're picking this up cold and
there's no note from the user about which direction won, ask before building.

### 2. Data-access layer

Create `src/data/index.ts` (or similar) that:
- imports `seed.json`,
- validates it with a `zod` schema matching `Model` in `src/engine/engine.ts`,
  failing loudly with a specific error if the shape is wrong (the brief calls
  this out explicitly, since the file is hand-edited),
- is the **only** place components import model data from.

This is the module that makes Phase 2 (Supabase) a swap instead of a rewrite
— keep it clean per `docs/BRIEF.md` section 6.

Replace the raw `import model from "./data/seed.json"` + `as unknown as
Model` cast currently in `src/App.tsx` with this validated import once it
exists.

### 3. Currency + number formatting utility

One function, used everywhere a number is displayed. Handles the two
registers from the brief: `147.6 M` in headlines vs `147,629,110.42` in
tables — never both in the same view. `font-variant-numeric: tabular-nums`
belongs here or in a shared class, not repeated per component.

### 4. Extension tests (required by acceptance criteria #2 and #3)

Write these before or alongside the first screen, not after:
- Adding a 9th activity to a **test fixture** model makes it appear in
  relevant selectors/roll-ups with no code change.
- Adding a 4th building (e.g. reusing existing layouts) makes it appear in
  every roll-up with no code change.

These are the whole point of the model (`docs/BRIEF.md` section 3). Use
Vitest, colocate with the engine or a selectors module.

### 5. Screens, in this order

Build one screen at a time. Run `npm run verify` after each one; stop and
investigate if totals drift.

1. **Overview** — cluster total with substantiation split, apartment count,
   cost per apartment, cost per m², cost by building, cost by discipline,
   cost by activity (apartment finishes), route into each.
2. **Layouts** — the five apartment types, space by space: floor area, wall
   area, applicable activities, rate, cost. Deepest level; proves the model.
3. **Activities** — all activities across the cluster, filterable by
   building/layout/discipline, showing the rate × count behind each total.
4. **Buildings** — drill into one building: layouts, unit counts, measured
   cost, lump sums. The basement (`b.units = []`, 3 lump sums) must render
   without special-casing — it's the layout-must-not-break-on-this test case.
5. **Rates** — the editing surface: change any rate/area/count, persistent
   delta-vs-seed banner, reset, export JSON.

Filters (cluster, building, layout, discipline, activity, substantiated) are
global and reflected in the URL — wire them once, not per screen.

### 6. Full acceptance criteria (`docs/BRIEF.md` section 7)

Check every one before calling Phase 1 done:

| # | Criterion | Status |
|---|---|---|
| 1 | `npx tsx verify.ts` reproduces documented numbers | done |
| 2 | 9th activity flows through every screen, covered by a test | not started |
| 3 | 4th building flows through every roll-up, covered by a test | not started |
| 4 | Editing window rate updates total/chart/building/per-apartment together | not started |
| 5 | Export JSON re-imports and reproduces edited state | not started |
| 6 | Reset returns exactly to seed | not started |
| 7 | Basement (0 units, 3 lump sums) renders correctly everywhere | not started |
| 8 | Filtering to one activity doesn't break chart layout | not started |
| 9 | Usable at 375px width | not started |
| 10 | Every figure shows measured vs. lump sum | not started (placeholder doesn't yet) |

## Things to not do

Everything in `docs/BRIEF.md` section 8: auth, database, revisions, audit
log, service worker, PWA manifest, deployment config, Excel import. If a task
seems to call for one of these, it's out of scope for Phase 1 — flag it
instead of building it.

## If you're an AI picking this up cold

1. Run the three verify commands above. If any fail, that's the first thing
   to fix — don't build on top of a broken state.
2. Check whether a design direction has already been chosen (look for
   design-direction HTML files, or ask the user — don't guess and don't
   average multiple directions together).
3. Work the "what's not done" list in order. Update the checkboxes/table in
   this file as you complete each item, and commit that update alongside the
   code so the next handoff is accurate.
