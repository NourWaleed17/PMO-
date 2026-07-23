import { describe, expect, test } from "vitest";
import { summarise, type Model } from "./engine";
import { byActivity, byBuilding } from "../selectors/overview";

/** Proves docs/BRIEF.md section 3 / section 7 #2 and #3: nothing renders from
 *  a hardcoded list of activities, layouts, or buildings. These fixtures are
 *  intentionally minimal and independent of seed.json. */

function baseModel(): Model {
  return {
    meta: {},
    clusters: [{ id: "c1", name: "Cluster 1" }],
    activities: [
      { id: "paint", name: "Paint", basis: "floor_area", uom: "m2", discipline: "architecture", group: "g" },
    ],
    layouts: [
      {
        id: "l1",
        name: "Layout 1",
        spaces: [{ id: "s1", name: "Space 1", floor_area: 10, wall_area: 20, rates: { paint: 100 } }],
        unit_rates: {},
      },
    ],
    buildings: [
      {
        id: "b1",
        code: "1",
        name: "Building 1",
        building_type: "T",
        cluster_id: "c1",
        units: [{ layout_id: "l1", count: 2 }],
        lump_sums: [],
      },
    ],
  };
}

test("a ninth activity flows through summarise() and the activity selector with no code change", () => {
  const before = baseModel();
  const beforeSummary = summarise(before);
  expect(beforeSummary.total).toBe(2000); // 100 * 10 * 2
  expect(Object.keys(beforeSummary.byActivity)).toEqual(["paint"]);

  const after = baseModel();
  after.activities.push({
    id: "trim",
    name: "Skirting trim",
    basis: "floor_area",
    uom: "m2",
    discipline: "architecture",
    group: "g",
  });
  after.layouts[0].spaces[0].rates.trim = 50;

  const afterSummary = summarise(after);
  expect(afterSummary.total).toBe(3000); // + 50 * 10 * 2
  expect(afterSummary.byActivity.trim).toBe(1000);

  const rows = byActivity(after);
  expect(rows.map((r) => r.id)).toEqual(expect.arrayContaining(["paint", "trim"]));
  expect(rows.find((r) => r.id === "trim")?.total).toBe(1000);
});

test("a fourth building flows through every roll-up with no code change", () => {
  const model = baseModel();
  const before = summarise(model);
  expect(before.total).toBe(2000);
  expect(Object.keys(before.byBuilding)).toEqual(["b1"]);

  model.buildings.push({
    id: "b2",
    code: "2",
    name: "Building 2",
    building_type: "T",
    cluster_id: "c1",
    units: [{ layout_id: "l1", count: 3 }],
    lump_sums: [{ scope: "b2", discipline: "mep", item: "Extra", amount: 500, substantiated: false }],
  });

  const after = summarise(model);
  expect(after.total).toBe(2000 + 100 * 10 * 3 + 500); // 5500
  expect(Object.keys(after.byBuilding)).toEqual(expect.arrayContaining(["b1", "b2"]));
  expect(after.byBuilding.b2).toBe(100 * 10 * 3 + 500);

  const rows = byBuilding(model);
  expect(rows.map((r) => r.id)).toEqual(expect.arrayContaining(["b1", "b2"]));
  const b2 = rows.find((r) => r.id === "b2")!;
  expect(b2.total).toBe(3500);
  expect(b2.measured).toBe(3000);
  expect(b2.lump).toBe(500);
});

describe("basement-shaped building (no units, lump sums only)", () => {
  test("does not break byBuilding or summarise", () => {
    const model = baseModel();
    model.buildings.push({
      id: "basement",
      code: "BSMT",
      name: "Basement",
      building_type: "Basement",
      cluster_id: "c1",
      units: [],
      lump_sums: [{ scope: "basement", discipline: "mep", item: "Electrical", amount: 1000, substantiated: false }],
    });

    const s = summarise(model);
    expect(s.byBuilding.basement).toBe(1000);
    expect(s.apartments).toBe(2); // basement contributes zero units

    const rows = byBuilding(model);
    const basement = rows.find((r) => r.id === "basement")!;
    expect(basement.units).toBe(0);
    expect(basement.total).toBe(1000);
    expect(basement.measured).toBe(0);
    expect(basement.lumpShare).toBe(1);
  });
});
