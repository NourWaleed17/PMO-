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
- [x] Design directions chosen — see item 1 below.
- [x] `src/data/schema.ts` + `src/data/index.ts` — zod schema matching `Model`,
      validates `seed.json` on load, throws a specific error if the shape
      drifts. This is now the only place components import model data from.
- [x] `src/lib/format.ts` — the one formatting utility. `formatHeadline` (the
      `147.6` register, pair with a literal "M EGP" unit), `formatExact` (the
      `147,629,110.42` register), `formatPercent`, `formatInt`, `formatLabel`
      (generic acronym-vs-sentence-case rule, not a hardcoded discipline
      list), and the shared `numClass` for `tabular-nums`.
- [x] `src/engine/engine.extension.test.ts` — proves acceptance criteria #2
      and #3 (9th activity, 4th building) plus a basement-shaped fixture
      (0 units, lump sums only) against fixture models, independent of
      `seed.json`. `npm test` passes.
- [x] `src/selectors/overview.ts` — Overview-only derived shapes
      (`clusterSplit`, `byBuilding`, `byDiscipline`, `byActivity`,
      `costPerM2`, `avgCostPerApartment`), built on `summarise()`/`lineItems()`
      without touching `engine.ts`.
- [x] `src/screens/Overview.tsx` — the first real screen, built to Direction C
      (schedule board). Wired into `App.tsx`, replacing the placeholder.
      Verified in a real browser (Chromium via Playwright) at 1280px and at
      375px — renders correctly at both, basement's 100%-lump-sum bar and
      "no units" label render without special-casing.
- [x] `src/design/direction-c.tsx` — the shared Direction C tokens and
      components (`PageShell`, `Bar`, `SplitMeter`, `weightStyle`, colour
      constants) factored out of `Overview.tsx` so every screen extends the
      same system instead of redefining it. Overview now imports from here.
- [x] `src/routing/router.ts` + `src/components/ScreenNav.tsx` — a small
      hand-rolled path router (no library — two-to-five screens don't
      warrant one, and it's not in the brief's tech stack) and the shared nav
      component every screen renders at the bottom. Flip `built: true` on a
      `NAV_ITEMS` entry in `ScreenNav.tsx` as each screen ships; nothing else
      about navigation changes.
- [x] `src/selectors/layouts.ts` + `layouts.test.ts` — space-by-space
      breakdown per layout. A test asserts the space-level sum always equals
      engine `layoutTotal` (so the displayed breakdown can never silently
      disagree with the header figure), reproduces the five known-good
      per-apartment costs, and covers both null-handling cases: a space
      absent from a layout (both areas null → "not in this layout", not a
      silent zero) vs. a present space with no applicable rates (public
      corridor → present, zero cost, "no activity applies here").
- [x] `src/screens/Layouts.tsx` — second real screen, Direction C. Five
      layout summary cards (click to switch), per-apartment activities
      (doors/windows, not tied to a space), then all 17 named spaces as
      cards — present spaces with their rate × qty breakdown, absent ones
      grouped below with a dashed "not in this layout" treatment. Verified
      in-browser at 1280px and 375px, and a real click-through (Overview →
      Layouts nav link → switch to Apartment Middle) confirmed navigation
      and the absent-space rendering both work.
- [x] `src/routing/router.ts` grew from path-only to path + `URLSearchParams`
      (`{ pathname, search, navigate, setSearch }`). `src/filters/filters.ts`
      converts between that and a typed `Filters` object
      (`building`/`layout`/`discipline` so far — see its header comment for
      why `substantiated`/`activity`/`cluster` aren't wired yet).
      `src/components/FilterBar.tsx` is the shared control, rendering only
      the dimensions a screen passes options for.
- [x] `src/selectors/activities.ts` + `activities.test.ts` — per-activity
      totals narrowed by the active filters, plus `groupLinesByRate`, which
      answers "why are windows 10 million" by grouping an activity's lines
      by rate (e.g. two tiers for windows: 120,000/unit × 56 units in
      Edge/Middle, 82,881/unit × 42 units in Apt 1/2/3) instead of dumping
      a hundred-plus raw building×layout×space rows. A test asserts every
      rate group's `rate × quantity` reconciles exactly to its `total`, and
      that filtering to the basement (zero measured activities) returns an
      empty list rather than crashing.
- [x] `src/screens/Activities.tsx` — third real screen, Direction C. Filter
      bar (building/layout/discipline, reflected in the URL, e.g.
      `/activities?building=b12`), 8 activity cards, and the selected
      activity's rate-group breakdown below. Empty-filter state has real
      next-step copy ("Try clearing it — the basement, for example, has no
      measured activities at all") rather than "no data found." Verified
      in-browser at 1280px and 375px, plus filtering to Building 12 and to
      the basement (empty state) by clicking through in a real browser.
- [x] `src/selectors/split.ts` — pulled the `SplitFigure` type and its
      `split()` helper out of `overview.ts` into one shared module (it had
      drifted into two near-identical copies — one in `overview.ts`, one
      redeclared in `design/direction-c.tsx` while factoring that out
      earlier). Both now import from here; `overview.ts` re-exports the type
      so nothing importing it from there broke.
- [x] `src/selectors/buildings.ts` + `buildings.test.ts` — one building's
      layouts (measured) and `lump_sums[]` (unmeasured) side by side, first
      screen to render individual lump-sum line items rather than a rolled-up
      split. A test asserts total/measured/lump match `byBuilding()` in
      `overview.ts` exactly for every building, reproduces the four
      known-good building totals, and confirms the basement (0 units, 3 lump
      sums) yields `layouts: []` with all three lump sums intact rather than
      breaking.
- [x] `src/screens/Buildings.tsx` — fourth real screen, Direction C. Four
      building cards, then the selected building's split meter, its layouts
      (measured, with count × cost/apartment), and its lump sums as
      individual cards — each carries the `note` field verbatim where the
      seed has one (the basement's three alternative-figure notes). "No
      apartments in this building" replaces an empty layouts list rather
      than rendering nothing. Verified in-browser at 1280px and 375px on
      both a normal building and the basement; one apparent bug (a lump-sum
      split meter showing a partial fill for the 0%-measured basement)
      turned out to be the `motion-safe` width transition still animating at
      screenshot time, not a real defect — confirmed by reading the DOM
      after the transition settled.

Confirm all of the above still holds before doing anything else:

```
npm install
npm run verify
npm test
npm run build && rm -rf dist
```

## What's not done — in order

Items 1–4 and screens 1–4 of item 5 are done (kept below for context). Pick up
at **item 5, screen 5 (Rates)** — the last screen.

### 1. Design directions — done, decision recorded

Produce **2–3 distinct static HTML directions** for the Overview screen only,
using real numbers from `seed.json` (not placeholder data). Follow the
constraints in `docs/BRIEF.md` section 4 — tabular numerals, EGP formatting,
the measured-vs-lump-sum signature treatment, and the "what to avoid" list
(no cream/terracotta AI-dashboard look, no dark-mode-crypto look, no
gradient hero cards).

**Show them and wait for a decision before writing any React component.**

**Decision recorded 2026-07-23: Direction C — "Schedule board" — chosen.**
The three directions live in `design/` (`direction-a-drawing-set.html`,
`direction-b-site-ledger.html`, `direction-c-schedule-board.html`, `index.html`
to compare). Direction C is card-based, chart-forward: KPI tiles, a
border-weight system where border thickness scales with a card's lump-sum
share (thin = mostly measured, thick ochre = all lump sum), and activities
shown as a materials-swatch grid. That's the direction to extend for every
subsequent screen — don't introduce a different visual system for Layouts,
Activities, Buildings, or Rates.

### 2. Data-access layer — done

`src/data/schema.ts` + `src/data/index.ts`, per the plan above. Nothing else
imports `seed.json` directly — keep it that way as new screens are built.

### 3. Currency + number formatting utility — done

`src/lib/format.ts`, per the plan above.

### 4. Extension tests — done

`src/engine/engine.extension.test.ts` covers the 9th-activity and 4th-building
cases (acceptance criteria #2, #3) plus a basement-shaped fixture. As each new
screen's selectors ship, prefer extending these fixture-based tests over
hand-checking against `seed.json`.

### 5. Screens, in this order

Build one screen at a time. Run `npm run verify` after each one; stop and
investigate if totals drift.

1. **Overview — done.** `src/screens/Overview.tsx`. Cluster total with
   substantiation split, apartment count, cost per apartment, cost per m²,
   cost by building, cost by discipline, cost by activity (apartment
   finishes).
2. **Layouts — done.** `src/screens/Layouts.tsx` + `src/selectors/layouts.ts`.
   The five apartment types, space by space. See "What's done" above for
   detail. Real navigation is now wired (`src/routing/router.ts` +
   `ScreenNav`) between Overview and Layouts.
3. **Activities — done.** `src/screens/Activities.tsx` +
   `src/selectors/activities.ts`. See "What's done" above. This is also
   where the global filters (`src/filters/filters.ts`, `FilterBar`) were
   introduced — reuse them here, don't reinvent per screen.
4. **Buildings — done.** `src/screens/Buildings.tsx` +
   `src/selectors/buildings.ts`. See "What's done" above. Buildings does
   *not* use the URL filters (it has its own building-card selector, same
   pattern as Layouts/Activities) — the `ScreenNav.navigate()` query-reset
   note below is still accurate, since Buildings never wrote to `search`.
5. **Rates — next, and last screen.** The editing surface: change any
   rate/area/count, persistent delta-vs-seed banner, reset, export JSON.
   First screen that needs React state for edits — every screen so far is a
   pure derivation of `seed.json` straight from `src/data/index.ts`. This is
   also where acceptance criteria #4, #5, #6 get proven (see the table
   below) — they can't be satisfied by any earlier screen, so don't consider
   Phase 1 close to done until Rates exists and those three are checked.
   Suggested shape: lift the edited model into a React context or a single
   `useState<Model>` near the app root (not per-screen state — every screen
   reads `model` from `src/data/index.ts` today via a plain import; Rates
   editing means that needs to become props/context instead, which touches
   every screen file to swap the import for the passed-down value). Reset =
   replace the edited state with a fresh `loadModel()` call. Export = current
   edited state as an already-valid `Model`, serialized with `JSON.stringify`
   — it re-imports cleanly for free since it's the same shape `schema.ts`
   already validates.

Filters (cluster, building, layout, discipline, activity, substantiated) are
global and reflected in the URL. `building`/`layout`/`discipline` are wired
(`src/filters/filters.ts`, `FilterBar`) and used by Activities today; neither
Buildings nor Rates need them yet (Buildings has its own single-building
selector; Rates is an editing surface, not a filtered view). Add
`substantiated` to `Filters` if a later screen needs "show only
unsubstantiated," and `activity` if Rates should deep-link to editing one
activity's rate. `cluster` still isn't exposed in the UI — there's only
one — but every selector already groups by `cluster_id`.

One thing to note for whoever builds Rates: `ScreenNav`'s `navigate()`
resets the query string on every screen change (see `src/routing/router.ts`
— `navigate` calls `push(pathname, new URLSearchParams())`). That's still
fine — only Activities reads `search`, and nothing links into Activities
with filters pre-set yet. Revisit if that changes.

### 6. Full acceptance criteria (`docs/BRIEF.md` section 7)

Check every one before calling Phase 1 done:

| # | Criterion | Status |
|---|---|---|
| 1 | `npx tsx verify.ts` reproduces documented numbers | done |
| 2 | 9th activity flows through every screen, covered by a test | test done; "every screen" needs screens 2–5 |
| 3 | 4th building flows through every roll-up, covered by a test | test done; needs screens 2–5 for full coverage |
| 4 | Editing window rate updates total/chart/building/per-apartment together | not started — needs Rates screen |
| 5 | Export JSON re-imports and reproduces edited state | not started — needs Rates screen |
| 6 | Reset returns exactly to seed | not started — needs Rates screen |
| 7 | Basement (0 units, 3 lump sums) renders correctly everywhere | done on Overview + Buildings (verified in-browser: empty layouts, all 3 lump sums with notes); N/A on Layouts/Activities |
| 8 | Filtering to one activity doesn't break chart layout | done on Activities (verified in-browser, incl. the basement empty state); recheck once Rates adds charts under filters, if it does |
| 9 | Usable at 375px width | done on Overview + Layouts + Activities + Buildings (verified in-browser); needs Rates |
| 10 | Every figure shows measured vs. lump sum | done on Overview + Layouts + Activities + Buildings; needs Rates |

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
