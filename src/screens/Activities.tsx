import { useEffect, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { useModel } from "../data/ModelContext";
import { PageContent, StatusIcon } from "../design/direction-d";
import { filtersFromSearch, searchFromFilters } from "../filters/filters";
import { formatExact, formatInt, formatLabel, formatPercent } from "../lib/format";
import { useRoute } from "../routing/router";
import { activitySummaries, buildingOptions, disciplineOptions, groupLinesByRate, layoutOptions } from "../selectors/activities";

export default function Activities() {
  const { model } = useModel();
  const { search, setSearch } = useRoute();
  const filters = filtersFromSearch(search);

  const rows = activitySummaries(model, filters);
  const [selectedId, setSelectedId] = useState(rows[0]?.id);

  useEffect(() => {
    if (!rows.some((r) => r.id === selectedId)) setSelectedId(rows[0]?.id);
  }, [rows, selectedId]);

  const selected = rows.find((r) => r.id === selectedId);
  const clusterTotal = rows.reduce((a, r) => a + r.total, 0);

  return (
    <PageContent>
      <header className="mb-8">
        <h1 className="text-headline-lg text-primary mb-2">Activities — Cluster 1</h1>
        <p className="text-body-md text-on-surface-variant">
          {formatInt(model.activities.length)} activities · all built-up — see the rate and count behind each total
        </p>
      </header>

      <FilterBar
        filters={filters}
        onChange={(next) => setSearch((prev) => searchFromFilters(next, prev))}
        buildings={buildingOptions(model)}
        layouts={layoutOptions(model)}
        disciplines={disciplineOptions(model)}
      />

      {rows.length === 0 ? (
        <div className="bg-surface-container-lowest border border-outline-variant p-5 text-body-md text-on-surface-variant">
          No activity matches this filter. Try clearing it — the basement, for example, has no built-up activities at all.
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedId(row.id)}
                aria-pressed={row.id === selected?.id}
                className={`border-2 p-4 text-left ${
                  row.id === selected?.id
                    ? "bg-primary border-primary text-on-primary"
                    : "bg-surface-container-lowest border-outline-variant text-on-surface"
                }`}
              >
                <div className="text-body-md font-bold">{row.name}</div>
                <div className="mt-2 font-mono text-body-lg font-bold tabular-nums">{formatExact(row.total)}</div>
                <div className={`mt-1 text-label-sm ${row.id === selected?.id ? "text-inverse-primary" : "text-on-surface-variant"}`}>
                  {formatPercent(clusterTotal ? row.total / clusterTotal : 0)} of filtered total
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <section>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-headline-sm font-semibold text-primary">
                  {selected.name} — <span className="font-mono tabular-nums">{formatExact(selected.total)}</span>
                </h2>
                <span className="text-label-sm text-on-surface-variant">
                  {formatLabel(selected.discipline)} · {selected.basisLabel}
                </span>
              </div>
              <div className="grid gap-2.5">
                {groupLinesByRate(selected.lines).map((g) => (
                  <div key={g.rate} className="built-up-pattern border border-outline-variant p-3.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-body-md">
                      <span className="font-mono tabular-nums">
                        <b>{formatExact(g.rate)}</b> / {selected.uom} × <b>{formatExact(g.quantity)}</b> {selected.uom}
                      </span>
                      <span className="font-mono font-bold tabular-nums">{formatExact(g.total)}</span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2 text-label-sm text-on-surface-variant">
                      <span>
                        {g.buildings.join(", ")}
                        {g.layouts.length > 0 && ` · ${g.layouts.join(", ")}`}
                      </span>
                      <StatusIcon substantiated />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </PageContent>
  );
}
