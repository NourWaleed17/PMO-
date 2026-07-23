import { describe, expect, test } from "vitest";
import { model } from "../data";
import { layoutTotal, type Model } from "../engine/engine";
import { layoutApartmentCounts, layoutRows } from "./layouts";

describe("layoutRows against the real seed", () => {
  const rows = layoutRows(model);

  test("every layout's space + per-apartment breakdown sums to engine layoutTotal", () => {
    for (const row of rows) {
      const layout = model.layouts.find((l) => l.id === row.id)!;
      const spacesSum = row.spaces.reduce((a, s) => a + s.total, 0);
      const perApartmentSum = row.perApartmentActivities.reduce((a, r) => a + r.rate, 0);
      expect(spacesSum + perApartmentSum).toBeCloseTo(layoutTotal(layout, model.activities), 6);
      expect(row.costPerApartment).toBeCloseTo(layoutTotal(layout, model.activities), 6);
    }
  });

  test("reproduces the known-good cost per apartment", () => {
    const byId = Object.fromEntries(rows.map((r) => [r.id, r.costPerApartment]));
    expect(byId.edge).toBeCloseTo(393303.17, 2);
    expect(byId.middle).toBeCloseTo(382465.76, 2);
    expect(byId.apt_1).toBeCloseTo(301537.1, 2);
    expect(byId.apt_2).toBeCloseTo(294250.2, 2);
    expect(byId.apt_3).toBeCloseTo(295376.87, 2);
  });

  test("a space absent from a layout (both areas null) is marked not present, not zero-cost", () => {
    const middle = rows.find((r) => r.id === "middle")!;
    const maidRoom = middle.spaces.find((s) => s.id === "maid_room")!;
    expect(maidRoom.present).toBe(false);
    expect(maidRoom.total).toBe(0);

    const edge = rows.find((r) => r.id === "edge")!;
    expect(edge.spaces.every((s) => s.present)).toBe(true);
  });

  test("a present space with no applicable rates (public corridor) is present with a zero total", () => {
    const edge = rows.find((r) => r.id === "edge")!;
    const corridor = edge.spaces.find((s) => s.id === "public_corridor")!;
    expect(corridor.present).toBe(true);
    expect(corridor.activities).toEqual([]);
    expect(corridor.total).toBe(0);
  });
});

describe("extension: a 9th activity and a novel layout flow through with no code change", () => {
  function fixtureModel(): Model {
    return {
      meta: {},
      clusters: [{ id: "c1", name: "Cluster 1" }],
      activities: [
        { id: "paint", name: "Paint", basis: "floor_area", uom: "m2", discipline: "architecture", group: "g" },
        { id: "door", name: "Door", basis: "per_unit", uom: "unit", discipline: "architecture", group: "g" },
      ],
      layouts: [
        {
          id: "l1",
          name: "Layout 1",
          spaces: [
            { id: "s1", name: "Space 1", floor_area: 10, wall_area: 20, rates: { paint: 100 } },
            { id: "s2", name: "Space 2 (absent)", floor_area: null, wall_area: null, rates: { paint: 100 } },
          ],
          unit_rates: { door: 5000 },
        },
      ],
      buildings: [
        {
          id: "b1",
          code: "1",
          name: "Building 1",
          building_type: "T",
          cluster_id: "c1",
          units: [{ layout_id: "l1", count: 4 }],
          lump_sums: [],
        },
      ],
    };
  }

  test("adding a 9th activity's rate to a space flows into the space row and the layout total", () => {
    const before = fixtureModel();
    const beforeRow = layoutRows(before).find((r) => r.id === "l1")!;
    expect(beforeRow.costPerApartment).toBe(1000 + 5000); // paint 100*10 + door 5000

    const after = fixtureModel();
    after.activities.push({ id: "trim", name: "Trim", basis: "floor_area", uom: "m2", discipline: "architecture", group: "g" });
    after.layouts[0].spaces[0].rates.trim = 30;

    const afterRow = layoutRows(after).find((r) => r.id === "l1")!;
    expect(afterRow.costPerApartment).toBe(1000 + 300 + 5000);
    const s1 = afterRow.spaces.find((s) => s.id === "s1")!;
    expect(s1.activities.map((a) => a.activityId)).toEqual(expect.arrayContaining(["paint", "trim"]));
  });

  test("layoutApartmentCounts sums across every building referencing a layout, with no hardcoded ids", () => {
    const m = fixtureModel();
    m.buildings.push({
      id: "b2",
      code: "2",
      name: "Building 2",
      building_type: "T",
      cluster_id: "c1",
      units: [{ layout_id: "l1", count: 6 }],
      lump_sums: [],
    });
    expect(layoutApartmentCounts(m).l1).toBe(10);
  });
});
