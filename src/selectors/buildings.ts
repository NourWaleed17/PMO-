import { layoutTotal, type Model } from "../engine/engine";
import { split, type SplitFigure } from "./split";

/** Shapes the Buildings screen needs: one building's layouts (measured) and
 *  lump sums (unmeasured) side by side. First screen to render individual
 *  lump-sum line items rather than a rolled-up split — see docs/CLAUDE.md
 *  rule 3, every one still needs to read as a lump sum, not a plain figure. */

export interface BuildingLayoutUsage {
  layoutId: string;
  layoutName: string;
  count: number;
  costPerApartment: number;
  total: number;
}

export interface BuildingLumpSum {
  item: string;
  discipline: string;
  amount: number;
  substantiated: boolean;
  note?: string;
}

export interface BuildingDetail extends SplitFigure {
  id: string;
  name: string;
  code: string;
  buildingType: string;
  apartmentCount: number;
  layouts: BuildingLayoutUsage[];
  lumpSums: BuildingLumpSum[];
}

export function buildingDetails(model: Model): BuildingDetail[] {
  return model.buildings.map((b) => {
    const layouts: BuildingLayoutUsage[] = b.units.map((u) => {
      const layout = model.layouts.find((l) => l.id === u.layout_id);
      const costPerApartment = layout ? layoutTotal(layout, model.activities) : 0;
      return {
        layoutId: u.layout_id,
        layoutName: layout?.name ?? u.layout_id,
        count: u.count,
        costPerApartment,
        total: costPerApartment * u.count,
      };
    });

    const rows = [
      ...layouts.map((l) => ({ total: l.total, substantiated: true })),
      ...b.lump_sums.map((ls) => ({ total: ls.amount, substantiated: ls.substantiated })),
    ];

    return {
      id: b.id,
      name: b.name,
      code: b.code,
      buildingType: b.building_type,
      apartmentCount: b.units.reduce((n, u) => n + u.count, 0),
      layouts,
      lumpSums: b.lump_sums.map((ls) => ({
        item: ls.item,
        discipline: ls.discipline,
        amount: ls.amount,
        substantiated: ls.substantiated,
        note: ls.note,
      })),
      ...split(rows),
    };
  });
}
