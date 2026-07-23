import { useState } from "react";
import { useModel } from "../data/ModelContext";
import { Card, CompositionBar, PageContent, StatusIcon } from "../design/direction-d";
import { formatExact, formatInt, formatLabel, formatPercent } from "../lib/format";
import { buildingDetails, type BuildingLumpSum } from "../selectors/buildings";

function LumpSumCard({ lumpSum }: { lumpSum: BuildingLumpSum }) {
  return (
    <div className="lump-sum-dashed bg-surface-container-low p-3.5">
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <span className="text-body-md font-bold">{lumpSum.item}</span>
        <span className="font-mono text-body-md font-bold tabular-nums">{formatExact(lumpSum.amount)}</span>
      </div>
      <StatusIcon substantiated={false} label={`${formatLabel(lumpSum.discipline)} · no build-up behind this figure`} />
      {lumpSum.note && (
        <div className="mt-2 bg-surface-container-high px-2 py-1.5 text-label-sm text-on-surface">{lumpSum.note}</div>
      )}
    </div>
  );
}

export default function Buildings() {
  const { model } = useModel();
  const details = buildingDetails(model);
  const [selectedId, setSelectedId] = useState(details[0]?.id);
  const selected = details.find((d) => d.id === selectedId) ?? details[0];

  return (
    <PageContent>
      <header className="mb-8">
        <h1 className="text-headline-lg text-primary mb-2">Buildings — Cluster 1</h1>
        <p className="text-body-md text-on-surface-variant">
          {formatInt(details.length)} buildings · layouts and lump sums, one building at a time
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {details.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setSelectedId(d.id)}
            aria-pressed={d.id === selected.id}
            className={`p-4 text-left border ${
              d.id === selected.id
                ? "bg-primary border-primary text-on-primary"
                : d.lumpShare >= 1
                  ? "lump-sum-dashed bg-surface-container-low text-on-surface"
                  : "built-up-pattern border-outline-variant text-on-surface"
            }`}
          >
            <div className="text-body-md font-bold">{d.name}</div>
            <div className="mt-2 font-mono text-body-lg font-bold tabular-nums">{formatExact(d.total)}</div>
            <div className={`mt-1 text-label-sm ${d.id === selected.id ? "text-inverse-primary" : "text-on-surface-variant"}`}>
              {d.buildingType} · {d.apartmentCount > 0 ? `${formatInt(d.apartmentCount)} apartments` : "no units"}
            </div>
          </button>
        ))}
      </div>

      <div className="mb-8 bg-surface-container-lowest border border-outline-variant p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-headline-sm font-semibold text-primary">{selected.name}</h2>
          <span className="text-body-md text-on-surface-variant">
            {selected.buildingType} · <span className="font-mono tabular-nums">{formatExact(selected.total)}</span>
          </span>
        </div>
        <CompositionBar split={selected} height="h-10" />
        <div className="mt-3 flex flex-wrap justify-between gap-2 font-mono text-body-md">
          <span className="flex items-center gap-2 italic text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">edit</span>
            {formatExact(selected.lump)} EGP ({formatPercent(selected.lumpShare)})
          </span>
          <span className="flex items-center gap-2 font-bold">
            {formatExact(selected.measured)} EGP ({formatPercent(selected.measuredShare)})
            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              link
            </span>
          </span>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-headline-sm font-semibold text-primary">Layouts in this building</h2>
        {selected.layouts.length === 0 ? (
          <div className="bg-surface-container-lowest border border-outline-variant p-4 text-body-md text-on-surface-variant">
            No apartments in this building — {selected.name.toLowerCase()} is lump sums only.
          </div>
        ) : (
          <div className="grid gap-2.5">
            {selected.layouts.map((l) => (
              <div key={l.layoutId} className="built-up-pattern border border-outline-variant p-3.5">
                <div className="flex flex-wrap items-baseline justify-between gap-2 text-body-md">
                  <span className="font-bold">
                    {l.layoutName}{" "}
                    <span className="text-label-sm font-normal text-on-surface-variant">
                      {formatInt(l.count)} apartments · {formatExact(l.costPerApartment)} each
                    </span>
                  </span>
                  <span className="font-mono font-bold tabular-nums">{formatExact(l.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Card
        title="Lump sums in this building"
        action={
          <span className="text-label-sm text-on-surface-variant">{formatInt(selected.lumpSums.length)} items, none substantiated</span>
        }
      >
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {selected.lumpSums.map((ls) => (
            <LumpSumCard key={ls.item} lumpSum={ls} />
          ))}
        </div>
      </Card>
    </PageContent>
  );
}
