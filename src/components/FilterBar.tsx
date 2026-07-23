import type { Filters } from "../filters/filters";

export interface FilterOption {
  id: string;
  name: string;
}

/** Shared global-filter control (docs/BRIEF.md section 5). Renders whichever
 *  of building/layout/discipline the screen passes options for — a screen
 *  with nothing to filter by a given dimension simply omits it. */
export function FilterBar({
  filters,
  onChange,
  buildings,
  layouts,
  disciplines,
}: {
  filters: Filters;
  onChange: (next: Filters) => void;
  buildings?: FilterOption[];
  layouts?: FilterOption[];
  disciplines?: string[];
}) {
  const selectClass =
    "border border-outline-variant bg-surface-container-lowest text-on-surface text-body-md px-3 py-1.5 rounded-sm focus:border-primary focus:outline-none";
  const hasFilters = Boolean(filters.building || filters.layout || filters.discipline);

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 bg-surface-container-lowest border border-outline-variant px-4 py-3">
      <span className="text-label-sm font-semibold text-on-surface-variant">Filter</span>

      {buildings && (
        <select
          aria-label="Filter by building"
          className={selectClass}
          value={filters.building ?? ""}
          onChange={(e) => onChange({ ...filters, building: e.target.value || undefined })}
        >
          <option value="">All buildings</option>
          {buildings.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      )}

      {layouts && (
        <select
          aria-label="Filter by layout"
          className={selectClass}
          value={filters.layout ?? ""}
          onChange={(e) => onChange({ ...filters, layout: e.target.value || undefined })}
        >
          <option value="">All layouts</option>
          {layouts.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      )}

      {disciplines && (
        <select
          aria-label="Filter by discipline"
          className={selectClass}
          value={filters.discipline ?? ""}
          onChange={(e) => onChange({ ...filters, discipline: e.target.value || undefined })}
        >
          <option value="">All disciplines</option>
          {disciplines.map((d) => (
            <option key={d} value={d}>
              {d.charAt(0).toUpperCase() + d.slice(1)}
            </option>
          ))}
        </select>
      )}

      {hasFilters && (
        <button type="button" onClick={() => onChange({})} className="text-body-md font-semibold text-primary hover:underline">
          Clear filters
        </button>
      )}
    </div>
  );
}
