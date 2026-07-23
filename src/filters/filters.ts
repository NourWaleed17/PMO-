/** Global filters (docs/BRIEF.md section 5), read from and written to the
 *  URL query string via `src/routing/router.ts`. Only `building`, `layout`,
 *  and `discipline` are wired so far — Activities is the first screen that
 *  needs them. Add `substantiated` and `activity` here when a screen
 *  actually needs them (Buildings, Rates) rather than pre-building unused
 *  controls; `cluster` isn't exposed in the UI while the model has exactly
 *  one, but every selector already groups by `cluster_id` so it costs
 *  nothing to add once a second cluster exists. */

export interface Filters {
  building?: string;
  layout?: string;
  discipline?: string;
}

const KEYS = ["building", "layout", "discipline"] as const;

export function filtersFromSearch(search: URLSearchParams): Filters {
  const filters: Filters = {};
  for (const key of KEYS) {
    const value = search.get(key);
    if (value) filters[key] = value;
  }
  return filters;
}

export function searchFromFilters(filters: Filters, base: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(base);
  for (const key of KEYS) {
    const value = filters[key];
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next;
}

export function isEmpty(filters: Filters): boolean {
  return KEYS.every((key) => !filters[key]);
}
