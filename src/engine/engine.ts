export type Basis = "floor_area" | "wall_area" | "per_unit";

export interface Activity {
  id: string;
  name: string;
  basis: Basis;
  uom: string;
  discipline: string;
  group: string;
}

export interface Space {
  id: string;
  name: string;
  floor_area: number | null;
  wall_area: number | null;
  rates: Record<string, number>;
}

export interface Layout {
  id: string;
  name: string;
  spaces: Space[];
  unit_rates: Record<string, number>;
}

export interface LumpSum {
  scope: string;
  discipline: string;
  item: string;
  amount: number;
  substantiated: boolean;
  note?: string;
}

export interface Building {
  id: string;
  code: string;
  name: string;
  building_type: string;
  cluster_id: string;
  units: { layout_id: string; count: number }[];
  lump_sums: LumpSum[];
}

export interface Model {
  meta: Record<string, string>;
  clusters: { id: string; name: string }[];
  activities: Activity[];
  layouts: Layout[];
  buildings: Building[];
}

export interface LineItem {
  building_id: string;
  layout_id: string | null;
  space_id: string | null;
  activity_id: string;
  discipline: string;
  quantity: number;
  uom: string;
  rate: number;
  unit_cost: number;
  count: number;
  total: number;
  substantiated: boolean;
}

const q = (space: Space, basis: Basis): number =>
  basis === "floor_area" ? space.floor_area ?? 0
  : basis === "wall_area" ? space.wall_area ?? 0
  : 0;

/** Cost of one apartment of this layout, per activity. Activity-agnostic: add a
 *  row to `activities` and a rate key to a space and it flows through. */
export function layoutCost(
  layout: Layout,
  activities: Activity[]
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of activities) {
    if (a.basis === "per_unit") {
      out[a.id] = layout.unit_rates[a.id] ?? 0;
      continue;
    }
    let sum = 0;
    for (const s of layout.spaces) {
      const rate = s.rates[a.id];
      if (!rate) continue;
      sum += rate * q(s, a.basis);
    }
    out[a.id] = sum;
  }
  return out;
}

export function layoutTotal(layout: Layout, activities: Activity[]): number {
  return Object.values(layoutCost(layout, activities)).reduce((a, b) => a + b, 0);
}

/** Every measured and lump-sum line in the model, flattened. */
export function lineItems(model: Model): LineItem[] {
  const byId = new Map(model.layouts.map((l) => [l.id, l]));
  const acts = new Map(model.activities.map((a) => [a.id, a]));
  const rows: LineItem[] = [];

  for (const b of model.buildings) {
    for (const { layout_id, count } of b.units) {
      const layout = byId.get(layout_id);
      if (!layout) throw new Error(`unknown layout ${layout_id} on ${b.id}`);

      for (const a of model.activities) {
        if (a.basis === "per_unit") {
          const rate = layout.unit_rates[a.id] ?? 0;
          if (!rate) continue;
          rows.push({
            building_id: b.id, layout_id, space_id: null, activity_id: a.id,
            discipline: a.discipline, quantity: 1, uom: a.uom, rate,
            unit_cost: rate, count, total: rate * count, substantiated: true,
          });
          continue;
        }
        for (const s of layout.spaces) {
          const rate = s.rates[a.id];
          const qty = q(s, a.basis);
          if (!rate || !qty) continue;
          rows.push({
            building_id: b.id, layout_id, space_id: s.id, activity_id: a.id,
            discipline: a.discipline, quantity: qty, uom: a.uom, rate,
            unit_cost: rate * qty, count, total: rate * qty * count,
            substantiated: true,
          });
        }
      }
    }

    for (const ls of b.lump_sums) {
      rows.push({
        building_id: b.id, layout_id: null, space_id: null,
        activity_id: `lump:${ls.item}`, discipline: ls.discipline,
        quantity: 1, uom: "sum", rate: ls.amount, unit_cost: ls.amount,
        count: 1, total: ls.amount, substantiated: ls.substantiated,
      });
    }
  }
  if (acts.size === 0) throw new Error("no activities defined");
  return rows;
}

const roll = <K extends keyof LineItem>(rows: LineItem[], key: K) =>
  rows.reduce<Record<string, number>>((acc, r) => {
    const k = String(r[key]);
    acc[k] = (acc[k] ?? 0) + r.total;
    return acc;
  }, {});

export function summarise(model: Model) {
  const rows = lineItems(model);
  const apartments = model.buildings.reduce(
    (n, b) => n + b.units.reduce((m, u) => m + u.count, 0), 0);
  const measured = rows.filter((r) => !r.activity_id.startsWith("lump:"));
  return {
    total: rows.reduce((a, r) => a + r.total, 0),
    apartments,
    byBuilding: roll(rows, "building_id"),
    byDiscipline: roll(rows, "discipline"),
    byActivity: roll(measured, "activity_id"),
    unsubstantiated: rows.filter((r) => !r.substantiated)
                         .reduce((a, r) => a + r.total, 0),
  };
}
