import { describe, expect, test } from "vitest";
import { filtersFromSearch, isEmpty, searchFromFilters } from "./filters";

describe("filters <-> URLSearchParams round-trip", () => {
  test("empty search yields empty filters", () => {
    expect(filtersFromSearch(new URLSearchParams())).toEqual({});
    expect(isEmpty({})).toBe(true);
  });

  test("filters written to search are read back identically", () => {
    const filters = { building: "b10", layout: "edge", discipline: "architecture" };
    const search = searchFromFilters(filters, new URLSearchParams());
    expect(filtersFromSearch(search)).toEqual(filters);
    expect(isEmpty(filters)).toBe(false);
  });

  test("clearing a filter removes its query param instead of writing an empty value", () => {
    const search = searchFromFilters({ building: "b10" }, new URLSearchParams());
    const cleared = searchFromFilters({ building: undefined }, search);
    expect(cleared.has("building")).toBe(false);
    expect(filtersFromSearch(cleared)).toEqual({});
  });

  test("unrelated query params survive a filter update", () => {
    const base = new URLSearchParams("foo=bar");
    const search = searchFromFilters({ discipline: "mep" }, base);
    expect(search.get("foo")).toBe("bar");
    expect(search.get("discipline")).toBe("mep");
  });
});
