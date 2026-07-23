import { useState } from "react";
import { ScreenNav } from "../components/ScreenNav";
import { useModel } from "../data/ModelContext";
import { CARD, INK, INK_SOFT, MEASURED, PageShell, RULE } from "../design/direction-c";
import { formatExact, formatInt, formatPercent } from "../lib/format";
import { layoutRows, type LayoutRow, type SpaceRow } from "../selectors/layouts";

function SpaceCard({ space }: { space: SpaceRow }) {
  if (!space.present) {
    return (
      <div
        className="rounded-lg border border-dashed p-3.5"
        style={{ backgroundColor: "#f3f4f4", borderColor: RULE, color: INK_SOFT }}
      >
        <div className="text-sm font-bold">{space.name}</div>
        <div className="mt-1 text-xs italic">Not in this layout</div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg border p-3.5"
      style={{ backgroundColor: CARD, borderColor: RULE, borderLeft: `6px solid ${MEASURED}` }}
    >
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold">{space.name}</span>
        <span className="text-sm font-bold">{formatExact(space.total)}</span>
      </div>
      <div className="mb-2.5 text-xs" style={{ color: INK_SOFT }}>
        {space.floorArea != null && <>{formatExact(space.floorArea)} m² floor</>}
        {space.floorArea != null && space.wallArea != null && " · "}
        {space.wallArea != null && <>{formatExact(space.wallArea)} m² wall</>}
      </div>
      {space.activities.length === 0 ? (
        <p className="text-xs italic" style={{ color: INK_SOFT }}>
          No activity applies here
        </p>
      ) : (
        <ul className="grid gap-1 text-xs">
          {space.activities.map((a) => (
            <li key={a.activityId} className="flex justify-between gap-2" style={{ color: INK_SOFT }}>
              <span>
                {a.name} · {formatExact(a.rate)}/{a.uom} × {formatExact(a.quantity)}
              </span>
              <span style={{ color: INK }}>{formatExact(a.cost)}</span>
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
      className="rounded-lg border-2 p-4 text-left"
      style={{
        backgroundColor: selected ? INK : CARD,
        borderColor: selected ? INK : RULE,
        color: selected ? CARD : INK,
      }}
    >
      <div className="text-sm font-bold">{row.name}</div>
      <div className="mt-2 text-xl font-extrabold">{formatExact(row.costPerApartment)}</div>
      <div className="mt-1 text-xs" style={{ color: selected ? "#c9cdd2" : INK_SOFT }}>
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
    <PageShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Layouts — Cluster 1</h1>
          <p className="text-sm" style={{ color: INK_SOFT }}>
            {formatInt(rows.length)} apartment types · space by space, all measured — no lump sums at this level
          </p>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {rows.map((row) => (
          <LayoutSummaryCard key={row.id} row={row} selected={row.id === selected.id} onSelect={() => setSelectedId(row.id)} />
        ))}
      </div>

      <div
        className="mb-6 flex flex-wrap items-baseline justify-between gap-2 rounded-lg border px-4 py-3 text-sm"
        style={{ backgroundColor: CARD, borderColor: RULE }}
      >
        <span>
          <b>{selected.name}</b>: {formatExact(selected.costPerApartment)} per apartment
        </span>
        <span style={{ color: INK_SOFT }}>
          × {formatInt(selected.apartmentCount)} apartments in this cluster = {formatExact(selected.clusterTotal)}
        </span>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-base font-extrabold">Per apartment — not tied to a space</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {selected.perApartmentActivities.map((a) => (
            <div
              key={a.activityId}
              className="rounded-lg border p-3.5"
              style={{ backgroundColor: CARD, borderColor: RULE, borderLeft: `6px solid ${MEASURED}` }}
            >
              <div className="mb-0.5 flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold">{a.name}</span>
                <span className="text-sm font-bold">{formatExact(a.rate)}</span>
              </div>
              <div className="text-xs" style={{ color: INK_SOFT }}>
                Flat rate per apartment, {a.uom}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-extrabold">Spaces — {presentSpaces.length} of {selected.spaces.length} present</h2>
          <span className="text-xs" style={{ color: INK_SOFT }}>
            All measured
          </span>
        </div>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {presentSpaces.map((s) => (
            <SpaceCard key={s.id} space={s} />
          ))}
        </div>
        {absentSpaces.length > 0 && (
          <>
            <p className="mb-2 mt-5 text-xs" style={{ color: INK_SOFT }}>
              {formatPercent(absentSpaces.length / selected.spaces.length)} of named spaces don't exist in this layout:
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
              {absentSpaces.map((s) => (
                <SpaceCard key={s.id} space={s} />
              ))}
            </div>
          </>
        )}
      </section>

      <ScreenNav />
    </PageShell>
  );
}
