import { useState } from "react";
import { ScreenNav } from "../components/ScreenNav";
import { model } from "../data";
import { Bar, CARD, FLAG, FLAG_SOFT, INK, INK_SOFT, MEASURED, PageShell, RULE, SplitMeter, weightStyle } from "../design/direction-c";
import { formatExact, formatInt, formatLabel, formatPercent } from "../lib/format";
import { buildingDetails, type BuildingLumpSum } from "../selectors/buildings";

function LumpSumCard({ lumpSum }: { lumpSum: BuildingLumpSum }) {
  return (
    <div className="rounded-lg p-3.5" style={{ backgroundColor: CARD, border: `2px solid ${FLAG}` }}>
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold">{lumpSum.item}</span>
        <span className="text-sm font-bold">{formatExact(lumpSum.amount)}</span>
      </div>
      <div className="text-xs" style={{ color: INK_SOFT }}>
        {formatLabel(lumpSum.discipline)} · no build-up behind this figure
      </div>
      {lumpSum.note && (
        <div className="mt-2 rounded px-2 py-1.5 text-xs" style={{ backgroundColor: FLAG_SOFT, color: INK }}>
          {lumpSum.note}
        </div>
      )}
    </div>
  );
}

export default function Buildings() {
  const details = buildingDetails(model);
  const [selectedId, setSelectedId] = useState(details[0]?.id);
  const selected = details.find((d) => d.id === selectedId) ?? details[0];

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Buildings — Cluster 1</h1>
          <p className="text-sm" style={{ color: INK_SOFT }}>
            {formatInt(details.length)} buildings · layouts and lump sums, one building at a time
          </p>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {details.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelectedId(d.id)}
            aria-pressed={d.id === selected.id}
            className="rounded-lg p-4 text-left"
            style={
              d.id === selected.id
                ? { backgroundColor: INK, border: `2px solid ${INK}`, color: CARD }
                : { backgroundColor: CARD, color: INK, ...weightStyle(d.lumpShare) }
            }
          >
            <div className="text-sm font-bold">{d.name}</div>
            <div className="mt-2 text-lg font-extrabold">{formatExact(d.total)}</div>
            <div className="mt-1 text-xs" style={{ color: d.id === selected.id ? "#c9cdd2" : INK_SOFT }}>
              {d.buildingType} · {d.apartmentCount > 0 ? `${formatInt(d.apartmentCount)} apartments` : "no units"}
            </div>
          </button>
        ))}
      </div>

      <div className="mb-6 rounded-xl border p-5 sm:p-6" style={{ backgroundColor: CARD, borderColor: RULE }}>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-extrabold">{selected.name}</h2>
          <span className="text-sm" style={{ color: INK_SOFT }}>
            {selected.buildingType} · {formatExact(selected.total)}
          </span>
        </div>
        <SplitMeter split={selected} />
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs" style={{ color: INK_SOFT }}>
          <span>
            <b style={{ color: INK }}>{formatExact(selected.measured)}</b> measured ({formatPercent(selected.measuredShare)})
          </span>
          <span>
            <b style={{ color: INK }}>{formatExact(selected.lump)}</b> lump sum ({formatPercent(selected.lumpShare)})
          </span>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-base font-extrabold">Layouts in this building</h2>
        {selected.layouts.length === 0 ? (
          <div className="rounded-lg border p-4 text-sm" style={{ backgroundColor: CARD, borderColor: RULE, color: INK_SOFT }}>
            No apartments in this building — {selected.name.toLowerCase()} is lump sums only.
          </div>
        ) : (
          <div className="grid gap-2.5">
            {selected.layouts.map((l) => (
              <div
                key={l.layoutId}
                className="rounded-lg border p-3.5"
                style={{ backgroundColor: CARD, borderColor: RULE, borderLeft: `6px solid ${MEASURED}` }}
              >
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-bold">
                    {l.layoutName}{" "}
                    <span className="text-xs font-normal" style={{ color: INK_SOFT }}>
                      {formatInt(l.count)} apartments · {formatExact(l.costPerApartment)} each
                    </span>
                  </span>
                  <span className="font-bold">{formatExact(l.total)}</span>
                </div>
                <Bar split={{ total: l.total, measured: l.total, lump: 0, measuredShare: 1, lumpShare: 0 }} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-extrabold">Lump sums in this building</h2>
          <span className="text-xs" style={{ color: INK_SOFT }}>
            {formatInt(selected.lumpSums.length)} items, none substantiated
          </span>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {selected.lumpSums.map((ls) => (
            <LumpSumCard key={ls.item} lumpSum={ls} />
          ))}
        </div>
      </section>

      <ScreenNav />
    </PageShell>
  );
}
