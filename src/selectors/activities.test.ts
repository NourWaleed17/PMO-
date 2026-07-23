import { describe, expect, test } from "vitest";
import { model } from "../data";
import { summarise, type Model } from "../engine/engine";
import { activitySummaries, disciplineOptions, groupLinesByRate } from "./activities";

describe("activitySummaries against the real seed", () => {
  test("with no filters, totals match summarise().byActivity", () => {
    const { byActivity } = summarise(model);
    const rows = activitySummaries(model, {});
    expect(rows).toHaveLength(Object.keys(byActivity).length);
    for (const row of rows) {
      expect(row.total).toBeCloseTo(byActivity[row.id], 6);
    }
  });

  test("filtering to one building only counts that building's lines", () => {
    const filtered = activitySummaries(model, { building: "b10" });
    for (const row of filtered) {
      expect(row.lines.every((l) => l.buildingId === "b10")).toBe(true);
    }
    const windows = filtered.find((r) => r.id === "windows")!;
    // b10 has 14 edge + 14 middle apartments, both windows rate 120000
    expect(windows.total).toBe(120000 * 28);
  });

  test("filtering to the basement (no measured activities) returns nothing, not a crash", () => {
    const rows = activitySummaries(model, { building: "basement" });
    expect(rows).toEqual([]);
  });

  test("rate groups reconcile exactly to each activity's total", () => {
    for (const row of activitySummaries(model, {})) {
      const groups = groupLinesByRate(row.lines);
      const sum = groups.reduce((a, g) => a + g.total, 0);
      expect(sum).toBeCloseTo(row.total, 6);
      for (const g of groups) {
        expect(g.rate * g.quantity).toBeCloseTo(g.total, 6);
      }
    }
  });

  test("windows group into the two known rate tiers", () => {
    const windows = activitySummaries(model, {}).find((r) => r.id === "windows")!;
    const groups = groupLinesByRate(windows.lines);
    expect(groups).toHaveLength(2);
    const byRate = Object.fromEntries(groups.map((g) => [g.rate, g]));
    expect(byRate[120000].quantity).toBe(56); // edge + middle, 28 each
    expect(byRate[82881].quantity).toBe(42); // apt_1/2/3, 14 each
  });

  test("discipline options are derived from the data, not hardcoded", () => {
    // Every activity in the seed happens to be architecture — MEP only
    // exists as building-level lump sums, which carry no activity_id and so
    // never appear on this screen. That's a fact about the data, not this
    // function: it must still be driven by model.activities, not a literal list.
    expect(disciplineOptions(model)).toEqual(["architecture"]);
  });
});

describe("extension: a 9th activity appears in activitySummaries with no code change", () => {
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
          lump_sums: [],
        },
      ],
    };
  }

  test("ninth activity shows up unfiltered and under a matching discipline filter", () => {
    const model2 = fixtureModel();
    model2.activities.push({ id: "trim", name: "Trim", basis: "floor_area", uom: "m2", discipline: "structural", group: "g" });
    model2.layouts[0].spaces[0].rates.trim = 50;

    const all = activitySummaries(model2, {});
    expect(all.map((r) => r.id)).toEqual(expect.arrayContaining(["paint", "trim"]));

    const structuralOnly = activitySummaries(model2, { discipline: "structural" });
    expect(structuralOnly.map((r) => r.id)).toEqual(["trim"]);
  });
});
