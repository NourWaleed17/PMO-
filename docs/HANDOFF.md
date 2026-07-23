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

Confirm all of the above still holds before doing anything else:

```
npm install
npm run verify
npm test
npm run build && rm -rf dist
```

## What's not done — in order

Items 1–4 below are done (kept for context — see "What's done" above and the
decision note in item 1). Pick up at **item 5, screen 2 (Layouts)**.

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
   finishes). The route-out nav to the other four screens is present but
   inert (`aria-disabled`, "Not built yet" tooltip) — there's nothing to
   route to until they exist. Wire real navigation once at least Layouts
   exists; don't add a router for a single working link.
2. **Layouts — next.** The five apartment types, space by space: floor area,
   wall area, applicable activities, rate, cost. Deepest level; proves the
   model. Build to Direction C (see item 1) — card-based, same border-weight
   signature for measured vs. lump sum, same `src/lib/format.ts` and
   `numClass`. Add a `src/selectors/layouts.ts` alongside it rather than
   growing `overview.ts` or touching `engine.ts`.
3. **Activities** — all activities across the cluster, filterable by
   building/layout/discipline, showing the rate × count behind each total.
4. **Buildings** — drill into one building: layouts, unit counts, measured
   cost, lump sums. The basement (`b.units = []`, 3 lump sums) must render
   without special-casing — `byBuilding()` in `src/selectors/overview.ts`
   already handles this shape correctly (see the extension test); reuse the
   pattern rather than re-deriving it.
5. **Rates** — the editing surface: change any rate/area/count, persistent
   delta-vs-seed banner, reset, export JSON.

Filters (cluster, building, layout, discipline, activity, substantiated) are
global and reflected in the URL — wire them once, not per screen. Worth
introducing when Layouts or Activities lands (whichever needs filtering
first), not before.

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
| 7 | Basement (0 units, 3 lump sums) renders correctly everywhere | done on Overview; needs screens 2–5 |
| 8 | Filtering to one activity doesn't break chart layout | not started — needs filters |
| 9 | Usable at 375px width | done on Overview (verified in-browser); needs screens 2–5 |
| 10 | Every figure shows measured vs. lump sum | done on Overview; needs screens 2–5 |

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
