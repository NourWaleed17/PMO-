import { ScreenNav } from "../components/ScreenNav";
import { useModel } from "../data/ModelContext";
import { Bar, CARD, FLAG, INK, INK_SOFT, MEASURED, PageShell, RULE, SplitMeter, weightStyle } from "../design/direction-c";
import { formatExact, formatHeadline, formatInt, formatLabel, formatPercent } from "../lib/format";
import {
  apartmentCount,
  avgCostPerApartment,
  byActivity,
  byBuilding,
  byDiscipline,
  clusterSplit,
  costPerM2,
} from "../selectors/overview";

export default function Overview() {
  const { model } = useModel();
  const cluster = clusterSplit(model);
  const apartments = apartmentCount(model);
  const avgCost = avgCostPerApartment(model);
  const perM2 = costPerM2(model);
  const buildings = byBuilding(model);
  const disciplines = byDiscipline(model);
  const activities = byActivity(model);

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Cluster 1 — cost overview</h1>
          <p className="text-sm" style={{ color: INK_SOFT }}>
            {model.buildings.length} buildings · {formatInt(apartments)} apartments · {model.meta.revision}
          </p>
        </div>
      </header>

      <div
        className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border px-4 py-3 text-xs"
        style={{ backgroundColor: CARD, borderColor: RULE, color: INK_SOFT }}
      >
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 flex-none rounded-sm" style={{ backgroundColor: MEASURED }} />
          Measured — built up from areas and rates
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 flex-none rounded-sm border-4" style={{ borderColor: FLAG, backgroundColor: CARD }} />
          Lump sum — flagged, no build-up. Border weight scales with lump-sum share.
        </span>
      </div>

      {/* Hero */}
      <div className="mb-6 rounded-xl border p-5 sm:p-6" style={{ backgroundColor: CARD, borderColor: RULE }}>
        <p className="mb-1.5 text-xs uppercase tracking-wide" style={{ color: INK_SOFT }}>
          Cluster total
        </p>
        <p className="text-[clamp(36px,8vw,56px)] font-extrabold leading-none">
          {formatHeadline(cluster.total)}
          <span className="ml-2 text-[0.4em] font-semibold" style={{ color: INK_SOFT }}>
            M EGP
          </span>
        </p>
        <p className="mb-4 mt-1 text-sm" style={{ color: INK_SOFT }}>
          {formatExact(cluster.total)} exact
        </p>
        <SplitMeter split={cluster} />
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs" style={{ color: INK_SOFT }}>
          <span>
            <b style={{ color: INK }}>{formatExact(cluster.measured)}</b> measured ({formatPercent(cluster.measuredShare)})
          </span>
          <span>
            <b style={{ color: INK }}>{formatExact(cluster.lump)}</b> lump sum ({formatPercent(cluster.lumpShare)})
          </span>
        </div>
      </div>

      {/* KPI tiles */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border-2 p-4" style={{ backgroundColor: CARD, borderColor: RULE }}>
          <div className="text-xl font-extrabold sm:text-2xl">{formatInt(apartments)}</div>
          <div className="mt-1 text-xs" style={{ color: INK_SOFT }}>
            Apartments
          </div>
        </div>
        <div className="rounded-lg border-2 p-4" style={{ backgroundColor: CARD, borderColor: RULE }}>
          <div className="text-xl font-extrabold sm:text-2xl">{formatExact(avgCost)}</div>
          <div className="mt-1 text-xs" style={{ color: INK_SOFT }}>
            Average cost / apartment, EGP
          </div>
        </div>
        <div className="rounded-lg border-2 p-4" style={{ backgroundColor: CARD, borderColor: RULE }}>
          <div className="text-xl font-extrabold sm:text-2xl">{formatExact(perM2)}</div>
          <div className="mt-1 text-xs" style={{ color: INK_SOFT }}>
            EGP per m² of apartment floor area
          </div>
        </div>
        <div className="rounded-lg border-2 p-4" style={{ backgroundColor: CARD, borderColor: FLAG }}>
          <div className="text-xl font-extrabold sm:text-2xl">{formatPercent(cluster.lumpShare)}</div>
          <div className="mt-1 text-xs" style={{ color: INK_SOFT }}>
            Of total is lump sum
          </div>
          <div className="mt-1.5 text-xs font-bold" style={{ color: FLAG }}>
            no build-up behind it
          </div>
        </div>
      </div>

      {/* By building */}
      <section className="mb-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-extrabold">Cost by building</h2>
          <span className="text-xs" style={{ color: INK_SOFT }}>
            Border weight = share that is lump sum
          </span>
        </div>
        <div className="grid gap-2.5">
          {buildings.map((b) => (
            <div key={b.id} className="rounded-lg p-3.5" style={{ backgroundColor: CARD, ...weightStyle(b.lumpShare) }}>
              <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
                <span className="font-bold">
                  {b.name}{" "}
                  <span className="text-xs font-normal" style={{ color: INK_SOFT }}>
                    {b.buildingType} · {b.units > 0 ? `${formatInt(b.units)} apartments` : "no units"}
                  </span>
                </span>
                <span className="font-bold">{formatExact(b.total)}</span>
              </div>
              <Bar split={b} />
              <div className="mt-1.5 text-xs" style={{ color: INK_SOFT }}>
                {b.lumpShare >= 1 ? "100% lump sum — no units to measure against" : `${formatPercent(b.lumpShare)} lump sum`}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* By discipline */}
      <section className="mb-6">
        <h2 className="mb-3 text-base font-extrabold">Cost by discipline</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {disciplines.map((d) => (
            <div key={d.id} className="rounded-lg p-3.5" style={{ backgroundColor: CARD, ...weightStyle(d.lumpShare) }}>
              <div className="mb-2 flex items-baseline justify-between gap-2 text-sm">
                <span className="font-bold">{formatLabel(d.id)}</span>
                <span className="font-bold">{formatExact(d.total)}</span>
              </div>
              <Bar split={d} />
              <div className="mt-1.5 text-xs" style={{ color: INK_SOFT }}>
                {formatPercent(d.shareOfCluster)} of cluster total · {formatPercent(d.lumpShare)} lump sum
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* By activity */}
      <section className="mb-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-extrabold">Cost by activity — apartment finishes</h2>
          <span className="text-xs" style={{ color: INK_SOFT }}>
            All measured
          </span>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
          {activities.map((a) => (
            <div
              key={a.id}
              className="rounded-lg border p-3.5"
              style={{ backgroundColor: CARD, borderColor: RULE, borderLeft: `6px solid ${MEASURED}` }}
            >
              <div className="mb-0.5 text-sm font-bold">{a.name}</div>
              <div className="mb-2.5 text-xs" style={{ color: INK_SOFT }}>
                {a.basisLabel}
              </div>
              <div className="text-lg font-extrabold">{formatExact(a.total)}</div>
              <div className="text-xs" style={{ color: INK_SOFT }}>
                {formatPercent(a.shareOfFinishes)} of finishes
              </div>
            </div>
          ))}
        </div>
      </section>

      <ScreenNav />
    </PageShell>
  );
}
