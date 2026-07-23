import { describe, expect, test } from "vitest";
import { model } from "../data";
import type { Model } from "../engine/engine";
import { deltaSummary } from "./rates";

describe("deltaSummary", () => {
  test("identical models: zero delta, not dirty", () => {
    const current = structuredClone(model);
    const d = deltaSummary(model, current);
    expect(d.delta).toBe(0);
    expect(d.deltaPercent).toBe(0);
    expect(d.isDirty).toBe(false);
    expect(d.seedTotal).toBeCloseTo(147629110.42, 2);
  });

  test("raising the edge layout's window rate raises the total by exactly the apartment count", () => {
    const current: Model = structuredClone(model);
    const edge = current.layouts.find((l) => l.id === "edge")!;
    edge.unit_rates.windows += 1000; // +1000 per Edge apartment, 28 Edge apartments in the cluster

    const d = deltaSummary(model, current);
    expect(d.delta).toBeCloseTo(1000 * 28, 2);
    expect(d.currentTotal).toBeCloseTo(d.seedTotal + 1000 * 28, 2);
    expect(d.isDirty).toBe(true);
    expect(d.deltaPercent).toBeCloseTo((1000 * 28) / d.seedTotal, 8);
  });

  test("an edit that changes the model but not the total is still dirty", () => {
    const current: Model = structuredClone(model);
    // Swap two identical-rate spaces' floor areas — total unchanged, model isn't.
    const edge = current.layouts.find((l) => l.id === "edge")!;
    const terrace = edge.spaces.find((s) => s.id === "terrace")!;
    const terrace2 = edge.spaces.find((s) => s.id === "terrace_2")!;
    const originalArea = terrace.floor_area;
    terrace.floor_area = terrace2.floor_area;
    terrace2.floor_area = originalArea;

    const d = deltaSummary(model, current);
    expect(d.isDirty).toBe(true);
  });
});
