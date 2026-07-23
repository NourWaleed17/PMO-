import { useEffect, useState } from "react";
import { FilterBar } from "../components/FilterBar";
import { ScreenNav } from "../components/ScreenNav";
import { model } from "../data";
import { CARD, INK, INK_SOFT, MEASURED, PageShell, RULE } from "../design/direction-c";
import { filtersFromSearch, searchFromFilters } from "../filters/filters";
import { formatExact, formatInt, formatLabel, formatPercent } from "../lib/format";
import { useRoute } from "../routing/router";
import {
  activitySummaries,
  buildingOptions,
  disciplineOptions,
  groupLinesByRate,
  layoutOptions,
} from "../selectors/activities";

export default function Activities() {
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
    <PageShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Activities — Cluster 1</h1>
          <p className="text-sm" style={{ color: INK_SOFT }}>
            {formatInt(model.activities.length)} activities · all measured — see the rate and count behind each total
          </p>
        </div>
      </header>

      <FilterBar
        filters={filters}
        onChange={(next) => setSearch((prev) => searchFromFilters(next, prev))}
        buildings={buildingOptions(model)}
        layouts={layoutOptions(model)}
        disciplines={disciplineOptions(model)}
      />

      {rows.length === 0 ? (
        <div className="rounded-lg border p-5 text-sm" style={{ backgroundColor: CARD, borderColor: RULE, color: INK_SOFT }}>
          No activity matches this filter. Try clearing it — the basement, for example, has no measured activities at all.
        </div>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {rows.map((row) => (
              <button
                key={row.id}
                type="button"
                onClick={() => setSelectedId(row.id)}
                aria-pressed={row.id === selected?.id}
                className="rounded-lg border-2 p-4 text-left"
                style={{
                  backgroundColor: row.id === selected?.id ? INK : CARD,
                  borderColor: row.id === selected?.id ? INK : RULE,
                  color: row.id === selected?.id ? CARD : INK,
                }}
              >
                <div className="text-sm font-bold">{row.name}</div>
                <div className="mt-2 text-lg font-extrabold">{formatExact(row.total)}</div>
                <div className="mt-1 text-xs" style={{ color: row.id === selected?.id ? "#c9cdd2" : INK_SOFT }}>
                  {formatPercent(clusterTotal ? row.total / clusterTotal : 0)} of filtered total
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <section>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-extrabold">
                  {selected.name} — {formatExact(selected.total)}
                </h2>
                <span className="text-xs" style={{ color: INK_SOFT }}>
                  {formatLabel(selected.discipline)} · {selected.basisLabel}
                </span>
              </div>
              <div className="grid gap-2.5">
                {groupLinesByRate(selected.lines).map((g) => (
                  <div
                    key={g.rate}
                    className="rounded-lg border p-3.5"
                    style={{ backgroundColor: CARD, borderColor: RULE, borderLeft: `6px solid ${MEASURED}` }}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                      <span>
                        <b>{formatExact(g.rate)}</b> / {selected.uom} × <b>{formatExact(g.quantity)}</b> {selected.uom}
                      </span>
                      <span className="font-bold">{formatExact(g.total)}</span>
                    </div>
                    <div className="mt-1.5 text-xs" style={{ color: INK_SOFT }}>
                      {g.buildings.join(", ")}
                      {g.layouts.length > 0 && ` · ${g.layouts.join(", ")}`}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <div className="mt-6">
        <ScreenNav />
      </div>
    </PageShell>
  );
}
