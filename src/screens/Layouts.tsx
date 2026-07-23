import { useState } from "react";
import { useModel } from "../data/ModelContext";
import { Card, PageContent, StatusIcon } from "../design/direction-d";
import { formatExact, formatInt, formatPercent } from "../lib/format";
import { layoutRows, type LayoutRow, type SpaceRow } from "../selectors/layouts";

function SpaceCard({ space }: { space: SpaceRow }) {
  if (!space.present) {
    return (
      <div className="rounded border border-dashed border-outline-variant bg-surface-container-low p-3.5 text-on-surface-variant">
        <div className="text-body-md font-bold">{space.name}</div>
        <div className="mt-1 text-label-sm italic">Not in this layout</div>
      </div>
    );
  }

  return (
    <div className="built-up-pattern border border-outline-variant p-3.5">
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <span className="text-body-md font-bold">{space.name}</span>
        <span className="font-mono text-body-md font-bold tabular-nums">{formatExact(space.total)}</span>
      </div>
      <div className="mb-2.5 text-label-sm text-on-surface-variant">
        {space.floorArea != null && <>{formatExact(space.floorArea)} m² floor</>}
        {space.floorArea != null && space.wallArea != null && " · "}
        {space.wallArea != null && <>{formatExact(space.wallArea)} m² wall</>}
      </div>
      {space.activities.length === 0 ? (
        <p className="text-label-sm italic text-on-surface-variant">No activity applies here</p>
      ) : (
        <ul className="grid gap-1 text-label-sm">
          {space.activities.map((a) => (
            <li key={a.activityId} className="flex justify-between gap-2 text-on-surface-variant">
              <span>
                {a.name} · {formatExact(a.rate)}/{a.uom} × {formatExact(a.quantity)}
              </span>
              <span className="font-mono text-on-surface tabular-nums">{formatExact(a.cost)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function LayoutSummaryCard({ row, selected, onSelect }: { row: LayoutRow; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`border-2 p-4 text-left ${selected ? "bg-primary border-primary text-on-primary" : "bg-surface-container-lowest border-outline-variant text-on-surface"}`}
    >
      <div className="text-body-md font-bold">{row.name}</div>
      <div className="mt-2 font-mono text-headline-sm tabular-nums">{formatExact(row.costPerApartment)}</div>
      <div className={`mt-1 text-label-sm ${selected ? "text-inverse-primary" : "text-on-surface-variant"}`}>
        per apartment · {formatInt(row.apartmentCount)} in cluster
      </div>
    </button>
  );
}

export default function Layouts() {
  const { model } = useModel();
  const rows = layoutRows(model);
  const [selectedId, setSelectedId] = useState(rows[0]?.id);
  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];

  const presentSpaces = selected.spaces.filter((s) => s.present);
  const absentSpaces = selected.spaces.filter((s) => !s.present);

  return (
    <PageContent>
      <header className="mb-8">
        <h1 className="text-headline-lg text-primary mb-2">Layouts — Cluster 1</h1>
        <p className="text-body-md text-on-surface-variant">
          {formatInt(rows.length)} apartment types · space by space, all built-up — no lump sums at this level
        </p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {rows.map((row) => (
          <LayoutSummaryCard key={row.id} row={row} selected={row.id === selected.id} onSelect={() => setSelectedId(row.id)} />
        ))}
      </div>

      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2 bg-surface-container-lowest border border-outline-variant px-4 py-3 text-body-md">
        <span>
          <b>{selected.name}</b>: <span className="font-mono tabular-nums">{formatExact(selected.costPerApartment)}</span> per
          apartment
        </span>
        <span className="text-on-surface-variant">
          × {formatInt(selected.apartmentCount)} apartments in this cluster ={" "}
          <span className="font-mono tabular-nums">{formatExact(selected.clusterTotal)}</span>
        </span>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-headline-sm font-semibold text-primary">Per apartment — not tied to a space</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {selected.perApartmentActivities.map((a) => (
            <div key={a.activityId} className="built-up-pattern border border-outline-variant p-3.5">
              <div className="mb-0.5 flex items-baseline justify-between gap-2">
                <span className="text-body-md font-bold">{a.name}</span>
                <span className="font-mono text-body-md font-bold tabular-nums">{formatExact(a.rate)}</span>
              </div>
              <StatusIcon substantiated label={`Flat rate per apartment, ${a.uom}`} />
            </div>
          ))}
        </div>
      </section>

      <Card
        title={`Spaces — ${presentSpaces.length} of ${selected.spaces.length} present`}
        action={<StatusIcon substantiated label="All built-up" />}
      >
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {presentSpaces.map((s) => (
            <SpaceCard key={s.id} space={s} />
          ))}
        </div>
        {absentSpaces.length > 0 && (
          <>
            <p className="mb-2 mt-6 text-label-sm text-on-surface-variant">
              {formatPercent(absentSpaces.length / selected.spaces.length)} of named spaces don't exist in this layout:
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {absentSpaces.map((s) => (
                <SpaceCard key={s.id} space={s} />
              ))}
            </div>
          </>
        )}
      </Card>
    </PageContent>
  );
}
