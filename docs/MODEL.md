# Cluster 1 cost model — Phase 0

Extracted from `Resedential_Rev01.xlsx / Sheet1`. Three files:

| File | What it is |
|---|---|
| `seed.json` | The model. Inputs only — areas, rates, counts, lump sums. No computed totals. |
| `src/engine.ts` | Pure calculation. No I/O, no framework. The single source of every number. |
| `verify.ts` | Regression harness — asserts the engine reproduces the sheet. |

Run: `npx tsx verify.ts`

## Why totals are not stored

Every number the dashboard displays is derived. Change a rate, an area, or an
apartment count and the cluster total moves immediately — nothing to re-key,
nothing to fall out of sync. This is the one design decision the rest depends on.

## Structure

```
clusters[]     id, name
activities[]   id, name, basis, uom, discipline, group
layouts[]      id, name, spaces[], unit_rates{}
  spaces[]     id, name, floor_area, wall_area, rates{ activity_id: rate }
buildings[]    id, code, building_type, cluster_id, units[], lump_sums[]
  units[]      layout_id, count
  lump_sums[]  scope, discipline, item, amount, substantiated, note?
```

`basis` drives the arithmetic and is the only thing the engine branches on:

- `floor_area` → rate × space floor area
- `wall_area` → rate × space wall area
- `per_unit` → flat amount per apartment, from `layout.unit_rates`

A rate absent from a space means the activity does not apply there. That is how
the 650 reception / 350 wet-area porcelain split is represented — as data, not
as a special case in code.

## Extending

**Add an activity.** Append to `activities` with a `basis`, then add its rate to
whichever spaces it applies to. The engine loops activities generically; no code
change. A `per_unit` activity needs a key in each layout's `unit_rates` instead.

**Add a building.** Append to `buildings`, point `units` at existing layouts.
Building 13 reusing the Edge and Middle layouts is four lines — the 17 spaces are
not duplicated.

**Add a layout.** Append to `layouts`. Reference it from any building's `units`.

**Add a cluster.** Append to `clusters`, set `cluster_id` on the new buildings.
Roll-ups group on it already.

**Change a value.** Edit one number.

## Known issue carried from the source

The Apartment Middle "Ceramic & Porcelain Flooring" column in Sheet1 is a copy of
the Apartment Edge column — nine cells priced against Edge's areas instead of
Middle's, including two rooms (Maid WC, Terrace 2) that do not exist in the
Middle layout at all.

`seed.json` holds the corrected figures. The engine therefore returns
**382,465.76** per Middle apartment against the sheet's 383,807.46, and
**147,629,110.42** for the cluster against 147,666,678.02 — a reduction of
37,567.60 across the 28 Middle apartments.

Every other layout reconciles to the cent. `verify.ts` prints the comparison.

## Data quality flags to surface in the UI

- **76.8% of the cluster total is lump sums** with no build-up: elevation paint,
  public areas, all MEP, and the whole basement. Each carries
  `substantiated: false`. The basement alone is 43.8%.
- Sheet1 holds **alternative basement figures** (Arch 15,205,860 / Elec
  39,544,131 / Mech 22,146,906) that are 12.3 M higher than the ones used. Kept
  in the `note` field on each basement lump sum.
- **Unused door/window figures** sit in rows 23 and 52 of the sheet (160,000 /
  105,404 and 120,000 / 72,800). Not carried into the seed — confirm which set is
  current before Phase 1, since doors and windows are 49.4% of apartment cost.
- The **×14 apartment count** is nowhere in the sheet; it was derived by division
  and is now explicit in `buildings[].units[].count`. Worth a sanity check
  against the architectural drawings.
