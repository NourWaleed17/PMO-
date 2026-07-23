import { describe, expect, test } from "vitest";
import { model } from "../data";
import type { Model } from "../engine/engine";
import { buildingDetails } from "./buildings";
import { byBuilding } from "./overview";

describe("buildingDetails against the real seed", () => {
  const details = buildingDetails(model);
  const overview = Object.fromEntries(byBuilding(model).map((b) => [b.id, b]));

  test("total, measured, and lump for every building match src/selectors/overview.ts exactly", () => {
    for (const d of details) {
      expect(d.total).toBeCloseTo(overview[d.id].total, 6);
      expect(d.measured).toBeCloseTo(overview[d.id].measured, 6);
      expect(d.lump).toBeCloseTo(overview[d.id].lump, 6);
    }
  });

  test("reproduces the known-good building totals", () => {
    const byId = Object.fromEntries(details.map((d) => [d.id, d.total]));
    expect(byId.b10).toBeCloseTo(26120050.02, 2);
    expect(byId.b11).toBeCloseTo(26120050.02, 2);
    expect(byId.b12).toBeCloseTo(30744908.38, 2);
    expect(byId.basement).toBeCloseTo(64644102, 2);
  });

  test("the basement has no layouts but its three lump sums render, and total is lump-only", () => {
    const basement = details.find((d) => d.id === "basement")!;
    expect(basement.layouts).toEqual([]);
    expect(basement.apartmentCount).toBe(0);
    expect(basement.lumpSums).toHaveLength(3);
    expect(basement.measured).toBe(0);
    expect(basement.lumpShare).toBe(1);
    expect(basement.lumpSums.every((ls) => !ls.substantiated)).toBe(true);
  });

  test("a building's lump sums carry the alternative-figure note where the seed has one", () => {
    const basement = details.find((d) => d.id === "basement")!;
    const arch = basement.lumpSums.find((ls) => ls.item === "Architecture & structure")!;
    expect(arch.note).toBe("Alt in sheet: 15,205,860");
  });
});

describe("extension: a fourth building's lump sums and layouts both flow through with no code change", () => {
  function fixtureModel(): Model {
    return {
      meta: {},
      clusters: [{ id: "c1", name: "Cluster 1" }],
      activities: [{ id: "paint", name: "Paint", basis: "floor_area", uom: "m2", discipline: "architecture", group: "g" }],
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
          lump_sums: [{ scope: "b1", discipline: "mep", item: "Electrical", amount: 500, substantiated: false }],
        },
      ],
    };
  }

  test("a fourth, basement-shaped building appears with empty layouts and its own lump sums", () => {
    const m = fixtureModel();
    m.buildings.push({
      id: "b2",
      code: "2",
      name: "Building 2",
      building_type: "Basement",
      cluster_id: "c1",
      units: [],
      lump_sums: [{ scope: "b2", discipline: "architecture", item: "Structure", amount: 900, substantiated: false }],
    });

    const details = buildingDetails(m);
    expect(details).toHaveLength(2);
    const b2 = details.find((d) => d.id === "b2")!;
    expect(b2.layouts).toEqual([]);
    expect(b2.lumpSums).toEqual([{ item: "Structure", discipline: "architecture", amount: 900, substantiated: false, note: undefined }]);
    expect(b2.total).toBe(900);
  });
});
