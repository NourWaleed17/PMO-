import { lineItems, type Model } from "../engine/engine";
import type { Filters } from "../filters/filters";

/** Shapes the Activities screen needs: every activity's total narrowed by
 *  the active filters, and the rate/quantity/count lines behind it — "why
 *  are windows 10 million" (docs/BRIEF.md section 5). Lump sums never carry
 *  an `activity_id` from `model.activities` (engine.ts tags them
 *  `lump:<item>`), so this list is inherently measured-only; no
 *  substantiation split to show here. */

export interface ActivityLine {
  buildingId: string;
  buildingName: string;
  layoutId: string | null;
  layoutName: string | null;
  rate: number;
  quantity: number;
  uom: string;
  count: number;
  total: number;
}

export interface ActivitySummary {
  id: string;
  name: string;
  discipline: string;
  basisLabel: string;
  uom: string;
  total: number;
  lines: ActivityLine[];
}

const basisLabels: Record<string, string> = {
  floor_area: "Rate × floor area",
  wall_area: "Rate × wall area",
  per_unit: "Per unit",
};

export function activitySummaries(model: Model, filters: Filters): ActivitySummary[] {
  const buildings = new Map(model.buildings.map((b) => [b.id, b]));
  const layouts = new Map(model.layouts.map((l) => [l.id, l]));
  const rows = lineItems(model).filter((r) => {
    if (r.activity_id.startsWith("lump:")) return false;
    if (filters.building && r.building_id !== filters.building) return false;
    if (filters.layout && r.layout_id !== filters.layout) return false;
    if (filters.discipline && r.discipline !== filters.discipline) return false;
    return true;
  });

  return model.activities
    .map((a) => {
      const activityRows = rows.filter((r) => r.activity_id === a.id);
      const lines: ActivityLine[] = activityRows.map((r) => ({
        buildingId: r.building_id,
        buildingName: buildings.get(r.building_id)?.name ?? r.building_id,
        layoutId: r.layout_id,
        layoutName: r.layout_id ? (layouts.get(r.layout_id)?.name ?? r.layout_id) : null,
        rate: r.rate,
        quantity: r.quantity,
        uom: r.uom,
        count: r.count,
        total: r.total,
      }));
      return {
        id: a.id,
        name: a.name,
        discipline: a.discipline,
        basisLabel: basisLabels[a.basis] ?? a.basis,
        uom: a.uom,
        total: lines.reduce((sum, l) => sum + l.total, 0),
        lines,
      };
    })
    .filter((a) => a.lines.length > 0)
    .sort((a, b) => b.total - a.total);
}

export interface RateGroup {
  rate: number;
  uom: string;
  quantity: number;
  total: number;
  buildings: string[];
  layouts: string[];
}

/** Groups an activity's lines by rate — "at 650/m², across 181.34 m² in
 *  these apartments, 117,871". A raw building x layout x space table would
 *  run to hundreds of rows for an area-based activity; grouping by rate
 *  answers "why is this activity worth what it is" without that noise, and
 *  `rate * quantity` reproduces `total` exactly since every line in a group
 *  shares the same rate. */
export function groupLinesByRate(lines: ActivityLine[]): RateGroup[] {
  const byRate = new Map<number, RateGroup>();
  for (const l of lines) {
    const g = byRate.get(l.rate) ?? { rate: l.rate, uom: l.uom, quantity: 0, total: 0, buildings: [], layouts: [] };
    g.quantity += l.quantity * l.count;
    g.total += l.total;
    if (!g.buildings.includes(l.buildingName)) g.buildings.push(l.buildingName);
    if (l.layoutName && !g.layouts.includes(l.layoutName)) g.layouts.push(l.layoutName);
    byRate.set(l.rate, g);
  }
  return [...byRate.values()].sort((a, b) => b.total - a.total);
}

export function buildingOptions(model: Model): { id: string; name: string }[] {
  return model.buildings.map((b) => ({ id: b.id, name: b.name }));
}

export function layoutOptions(model: Model): { id: string; name: string }[] {
  return model.layouts.map((l) => ({ id: l.id, name: l.name }));
}

export function disciplineOptions(model: Model): string[] {
  return [...new Set(model.activities.map((a) => a.discipline))];
}
