import { lineItems, summarise, type LineItem, type Model } from "../engine/engine";

/** Shapes the Overview screen needs beyond what `engine.ts` exposes directly.
 *  Never edit the engine to produce these — derive them from its output
 *  instead (see docs/CLAUDE.md rule 1). */

export interface SplitFigure {
  total: number;
  measured: number;
  lump: number;
  measuredShare: number;
  lumpShare: number;
}

function split(rows: LineItem[]): SplitFigure {
  const total = rows.reduce((a, r) => a + r.total, 0);
  const measured = rows.filter((r) => r.substantiated).reduce((a, r) => a + r.total, 0);
  const lump = total - measured;
  return {
    total,
    measured,
    lump,
    measuredShare: total ? measured / total : 0,
    lumpShare: total ? lump / total : 0,
  };
}

export function clusterSplit(model: Model): SplitFigure {
  return split(lineItems(model));
}

export function apartmentCount(model: Model): number {
  return model.buildings.reduce((n, b) => n + b.units.reduce((m, u) => m + u.count, 0), 0);
}

export function avgCostPerApartment(model: Model): number {
  const { total } = summarise(model);
  const apartments = apartmentCount(model);
  return apartments ? total / apartments : 0;
}

/** Total floor area across every apartment, used as the cost-per-m² denominator. */
export function apartmentFloorArea(model: Model): number {
  const byLayout = new Map(model.layouts.map((l) => [l.id, l]));
  let area = 0;
  for (const b of model.buildings) {
    for (const u of b.units) {
      const layout = byLayout.get(u.layout_id);
      if (!layout) continue;
      const layoutArea = layout.spaces.reduce((a, s) => a + (s.floor_area ?? 0), 0);
      area += layoutArea * u.count;
    }
  }
  return area;
}

export function costPerM2(model: Model): number {
  const { total } = summarise(model);
  const area = apartmentFloorArea(model);
  return area ? total / area : 0;
}

export interface BuildingRow extends SplitFigure {
  id: string;
  name: string;
  code: string;
  buildingType: string;
  units: number;
}

export function byBuilding(model: Model): BuildingRow[] {
  const rows = lineItems(model);
  return model.buildings.map((b) => {
    const buildingRows = rows.filter((r) => r.building_id === b.id);
    const units = b.units.reduce((n, u) => n + u.count, 0);
    return {
      id: b.id,
      name: b.name,
      code: b.code,
      buildingType: b.building_type,
      units,
      ...split(buildingRows),
    };
  });
}

export interface DisciplineRow extends SplitFigure {
  id: string;
  shareOfCluster: number;
}

export function byDiscipline(model: Model): DisciplineRow[] {
  const rows = lineItems(model);
  const clusterTotal = rows.reduce((a, r) => a + r.total, 0);
  const disciplines = [...new Set(rows.map((r) => r.discipline))];
  return disciplines
    .map((d) => {
      const s = split(rows.filter((r) => r.discipline === d));
      return { id: d, shareOfCluster: clusterTotal ? s.total / clusterTotal : 0, ...s };
    })
    .sort((a, b) => b.total - a.total);
}

export interface ActivityRow {
  id: string;
  name: string;
  basisLabel: string;
  total: number;
  shareOfFinishes: number;
}

const basisLabels: Record<string, string> = {
  floor_area: "Rate × floor area",
  wall_area: "Rate × wall area",
  per_unit: "Per unit",
};

/** Measured activities only, ranked by cost — the "apartment finishes" list. */
export function byActivity(model: Model): ActivityRow[] {
  const { byActivity: totals } = summarise(model);
  const finishesTotal = Object.values(totals).reduce((a, v) => a + v, 0);
  return model.activities
    .filter((a) => totals[a.id])
    .map((a) => ({
      id: a.id,
      name: a.name,
      basisLabel: basisLabels[a.basis] ?? a.basis,
      total: totals[a.id],
      shareOfFinishes: finishesTotal ? totals[a.id] / finishesTotal : 0,
    }))
    .sort((a, b) => b.total - a.total);
}
