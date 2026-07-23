import { CARD, INK, INK_SOFT, RULE } from "../design/direction-c";
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
  const selectClass = "rounded-md border px-3 py-1.5 text-sm";
  const selectStyle = { backgroundColor: CARD, borderColor: RULE, color: INK };
  const hasFilters = Boolean(filters.building || filters.layout || filters.discipline);

  return (
    <div
      className="mb-6 flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3"
      style={{ backgroundColor: CARD, borderColor: RULE }}
    >
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: INK_SOFT }}>
        Filter
      </span>

      {buildings && (
        <select
          aria-label="Filter by building"
          className={selectClass}
          style={selectStyle}
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
          style={selectStyle}
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
          style={selectStyle}
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
        <button
          type="button"
          onClick={() => onChange({})}
          className="text-sm font-semibold underline"
          style={{ color: INK_SOFT }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
