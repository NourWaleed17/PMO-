# PMO — Cluster 1 board dashboard

Board-level construction cost dashboard for a residential cluster: 3 buildings
plus a basement, 98 apartments, 147,629,110.42 EGP.

Read `docs/BRIEF.md` before starting any task. It is the spec and its acceptance
criteria are the definition of done.

**Read `docs/HANDOFF.md` next.** It tracks exactly what's built, what isn't,
and the required order of work. Keep it up to date — it's what the next
session (human or AI) reads to pick this up cold.

## Three rules that override convenience

1. **`src/engine/engine.ts` is the only place arithmetic happens.** Components
   call selectors; they never compute a total inline. If a component needs a
   shape the engine doesn't expose, add a selector beside it — do not edit the
   engine to make a component easier to write.

2. **Nothing is hardcoded.** Not the 8 activities, not the 5 layouts, not the 4
   buildings. Everything renders from arrays in `seed.json`. Adding a 9th
   activity or a 4th building must flow through every screen with no code change,
   and there is a test proving it.

3. **Every figure on screen shows whether it is measured or a lump sum.**
   76.8% of this total is lump sums with no build-up. That is the most important
   fact in the dataset and it is the visual signature of the product.

## Layout

```
docs/BRIEF.md          full spec — read this first
docs/HANDOFF.md         current status and required next steps, in order
docs/MODEL.md          data model contract and extension rules
src/engine/engine.ts   pure calculation, no I/O
src/data/seed.json     the model — inputs only, no stored totals
src/data/              all data access lives here, swappable in Phase 2
verify.ts              regression harness
```

## Commands

```
npm run dev            local dev server
npm run verify         npx tsx verify.ts — must pass before any commit
npm test               vitest
```

## Known-good numbers

`npm run verify` must reproduce these exactly. If they drift, stop and find out
why before continuing.

| | |
|---|---:|
| Cluster total | 147,629,110.42 |
| Apartment finishes | 34,197,828.42 |
| Apartments | 98 |
| Apartment Edge | 393,303.17 |
| Apartment Middle | 382,465.76 |
| Apartment 1 | 301,537.10 |
| Apartment 2 | 294,250.20 |
| Apartment 3 | 295,376.87 |

## Phase 1 scope

Frontend only. Vite + React + TypeScript + Tailwind + Recharts + zod + vitest.
`seed.json` imported directly, edits held in React state, with reset and export.

**Do not build:** auth, database, revisions, audit log, service worker, PWA
manifest, deployment config, Excel import. Those are Phases 2–4 and building
them now makes them worse, because the data model is not yet confirmed against
the architectural drawings.

## Style

Sentence case. Tabular numerals on every figure. Never encode meaning in colour
alone. EGP, thousands-separated. Responsive to 375px. Visible keyboard focus.
`prefers-reduced-motion` respected.
