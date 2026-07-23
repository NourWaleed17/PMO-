import { layoutTotal, type Activity, type Model, type Space } from "../engine/engine";

/** Shapes the Layouts screen needs beyond what `engine.ts` exposes — the
 *  space-by-space breakdown behind each layout's total. `layoutTotal` (the
 *  engine) remains the source of truth for the per-apartment figure; these
 *  functions only re-derive the same rate × quantity math at space grain so
 *  it can be displayed, and their sum is asserted equal to `layoutTotal` in
 *  `layouts.test.ts`. Never edit engine.ts to expose this directly (see
 *  docs/CLAUDE.md rule 1). */

export interface SpaceActivityRow {
  activityId: string;
  name: string;
  rate: number;
  quantity: number;
  uom: string;
  cost: number;
}

export interface SpaceRow {
  id: string;
  name: string;
  /** false when neither area is recorded — the space doesn't exist in this layout. */
  present: boolean;
  floorArea: number | null;
  wallArea: number | null;
  activities: SpaceActivityRow[];
  total: number;
}

export interface PerApartmentActivityRow {
  activityId: string;
  name: string;
  rate: number;
  uom: string;
}

export interface LayoutRow {
  id: string;
  name: string;
  apartmentCount: number;
  costPerApartment: number;
  clusterTotal: number;
  spaces: SpaceRow[];
  perApartmentActivities: PerApartmentActivityRow[];
}

function quantityFor(space: Space, basis: Activity["basis"]): number {
  return basis === "floor_area" ? (space.floor_area ?? 0) : basis === "wall_area" ? (space.wall_area ?? 0) : 0;
}

/** Apartment count per layout, summed across every building that uses it. */
export function layoutApartmentCounts(model: Model): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const b of model.buildings) {
    for (const u of b.units) {
      counts[u.layout_id] = (counts[u.layout_id] ?? 0) + u.count;
    }
  }
  return counts;
}

function spaceRow(space: Space, activities: Activity[]): SpaceRow {
  const rows: SpaceActivityRow[] = [];
  for (const a of activities) {
    if (a.basis === "per_unit") continue;
    const rate = space.rates[a.id];
    if (!rate) continue;
    const quantity = quantityFor(space, a.basis);
    if (!quantity) continue;
    rows.push({ activityId: a.id, name: a.name, rate, quantity, uom: a.uom, cost: rate * quantity });
  }
  return {
    id: space.id,
    name: space.name,
    present: space.floor_area !== null || space.wall_area !== null,
    floorArea: space.floor_area,
    wallArea: space.wall_area,
    activities: rows,
    total: rows.reduce((a, r) => a + r.cost, 0),
  };
}

export function layoutRows(model: Model): LayoutRow[] {
  const counts = layoutApartmentCounts(model);
  return model.layouts.map((l) => {
    const costPerApartment = layoutTotal(l, model.activities);
    const apartmentCount = counts[l.id] ?? 0;
    return {
      id: l.id,
      name: l.name,
      apartmentCount,
      costPerApartment,
      clusterTotal: costPerApartment * apartmentCount,
      spaces: l.spaces.map((s) => spaceRow(s, model.activities)),
      perApartmentActivities: model.activities
        .filter((a) => a.basis === "per_unit" && l.unit_rates[a.id])
        .map((a) => ({ activityId: a.id, name: a.name, rate: l.unit_rates[a.id], uom: a.uom })),
    };
  });
}
