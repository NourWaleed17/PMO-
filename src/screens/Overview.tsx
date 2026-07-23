import { useModel } from "../data/ModelContext";
import { Card, CompositionBar, PageContent, StatTile, StatusIcon } from "../design/direction-d";
import { formatExact, formatInt, formatPercent } from "../lib/format";
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
  const clusterName = model.clusters[0]?.name ?? "Cluster";

  return (
    <PageContent>
      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6">
          <div>
            <h1 className="text-headline-lg text-primary mb-2">Residential development board overview</h1>
            <div className="flex flex-wrap gap-4 text-on-surface-variant items-center">
              <span className="bg-surface-container px-3 py-1 rounded-full text-label-sm">{clusterName}</span>
              <span className="border-l border-outline-variant pl-4 text-body-md">
                {formatInt(apartments)} apartments across {model.buildings.filter((b) => b.units.length > 0).length}{" "}
                buildings plus a basement
              </span>
            </div>
          </div>
          <div className="md:text-right">
            <div className="text-label-sm text-on-surface-variant tracking-wide mb-1">Total project cost</div>
            <div className="font-mono text-[clamp(24px,6vw,40px)] leading-tight text-primary font-bold tabular-nums">
              {formatExact(cluster.total)} EGP
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 bg-surface-container-lowest border border-outline-variant p-6 flex flex-col justify-center">
            <div className="text-label-sm text-on-surface-variant mb-4">Cost per apartment</div>
            <div className="font-mono text-headline-md text-primary tabular-nums">{formatExact(avgCost)} EGP</div>
            <div className="mt-6 pt-6 border-t border-outline-variant">
              <div className="text-label-sm text-on-surface-variant mb-1">EGP per m² of apartment floor area</div>
              <div className="font-mono text-body-lg text-primary tabular-nums">{formatExact(perM2)}</div>
            </div>
          </div>

          <div className="col-span-2 bg-surface-container-lowest border border-outline-variant p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="text-headline-sm font-semibold">Cost composition split</div>
              <div className="flex gap-4">
                <StatusIcon substantiated={false} label="Lump-sum" />
                <StatusIcon substantiated label="Built-up" />
              </div>
            </div>
            <CompositionBar split={cluster} />
            <div className="flex justify-between font-mono text-body-md mt-4">
              <span className="flex items-center gap-2 italic text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">edit</span>
                {formatExact(cluster.lump)} EGP
              </span>
              <span className="flex items-center gap-2 font-bold">
                {formatExact(cluster.measured)} EGP
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  link
                </span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card title="Cost by building unit" padded={false}>
            <div className="p-6 space-y-4">
              {buildings.map((b) => (
                <div
                  key={b.id}
                  className={`flex justify-between items-center p-3 border ${
                    b.lumpShare >= 1 ? "lump-sum-dashed bg-surface-container-low" : "built-up-pattern border-outline-variant"
                  }`}
                >
                  <div>
                    <div className={b.lumpShare >= 1 ? "italic" : "font-bold"}>{b.name}</div>
                    <StatusIcon
                      substantiated={b.lumpShare < 1}
                      label={b.lumpShare >= 1 ? `Lump-sum (${formatPercent(b.lumpShare)})` : "Built-up"}
                    />
                  </div>
                  <div className={`font-mono text-headline-sm tabular-nums ${b.lumpShare >= 1 ? "italic" : "font-bold"}`}>
                    {formatExact(b.total)}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Data quality notes">
            <ul className="space-y-3 text-body-md text-on-surface-variant">
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0">edit</span>
                <span>
                  <b className="text-on-surface">{formatPercent(cluster.lumpShare)}</b> of the total has no build-up —
                  elevation paint, public areas, all MEP, and the whole basement.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0">edit</span>
                <span>Alternative basement figures exist in the source, 12.3 M higher — see Buildings for the notes.</span>
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0">edit</span>
                <span>Door and window figures are unconfirmed — 49.4% of apartment cost. See Activities.</span>
              </li>
            </ul>
          </Card>
        </div>

        <Card
          title="Apartment finishes breakdown"
          action={<div className="text-label-sm text-on-surface-variant italic">All figures in EGP</div>}
          padded={false}
          className="lg:col-span-7"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="px-6 py-4 text-label-sm font-semibold tracking-wide text-on-surface-variant">Activity type</th>
                  <th className="px-6 py-4 text-label-sm font-semibold tracking-wide text-on-surface-variant text-right">
                    Cost (EGP)
                  </th>
                  <th className="px-6 py-4 text-label-sm font-semibold tracking-wide text-on-surface-variant text-right">
                    Weight (%)
                  </th>
                  <th className="px-6 py-4 text-label-sm font-semibold tracking-wide text-on-surface-variant text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {activities.map((a, i) => (
                  <tr key={a.id} className={`hover:bg-surface-container transition-colors ${i % 2 ? "bg-surface-container-low" : ""}`}>
                    <td className="px-6 py-4 font-bold">{a.name}</td>
                    <td className="px-6 py-4 font-mono text-right font-bold tabular-nums">{formatExact(a.total)}</td>
                    <td className="px-6 py-4 font-mono text-right tabular-nums">{formatPercent(a.shareOfFinishes)}</td>
                    <td className="px-6 py-4 text-center">
                      <StatusIcon substantiated />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-surface-container-low border-t border-outline-variant flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <StatusIcon substantiated label="Built-up cost" />
              <StatusIcon substantiated={false} label="Lump-sum estimation" />
            </div>
            <div className="flex flex-wrap gap-3 text-label-sm text-on-surface-variant">
              {disciplines.map((d) => (
                <span key={d.id}>
                  {d.id === "mep" ? "MEP" : d.id.charAt(0).toUpperCase() + d.id.slice(1)}: {formatExact(d.total)}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatTile label="Total apartments" value={`${formatInt(apartments)} units`} />
        <StatTile label="Buildings in cluster" value={formatInt(model.buildings.length)} />
        <StatTile label="Cost per m²" value={`${formatExact(perM2)} EGP`} />
        <StatTile label="Lump-sum share" value={formatPercent(cluster.lumpShare)} valueClassName="text-on-error-container" />
      </section>
    </PageContent>
  );
}
