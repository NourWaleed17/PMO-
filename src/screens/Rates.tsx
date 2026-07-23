import { useEffect, useState } from "react";
import { ScreenNav } from "../components/ScreenNav";
import { useModel } from "../data/ModelContext";
import { CARD, FLAG, INK, INK_SOFT, MEASURED, PageShell, RULE } from "../design/direction-c";
import { formatExact, formatInt, formatPercent } from "../lib/format";
import type { Model, Space } from "../engine/engine";
import { deltaSummary } from "../selectors/rates";

function NumberField({
  value,
  onCommit,
  ariaLabel,
  width = "6.5rem",
}: {
  value: number;
  onCommit: (next: number) => void;
  ariaLabel: string;
  width?: string;
}) {
  const [text, setText] = useState(() => String(value));
  useEffect(() => setText(String(value)), [value]);

  return (
    <input
      type="number"
      step="0.01"
      inputMode="decimal"
      aria-label={ariaLabel}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const parsed = Number.parseFloat(text);
        if (Number.isFinite(parsed) && parsed !== value) onCommit(parsed);
        else setText(String(value));
      }}
      className="rounded-md border px-2 py-1 text-sm tabular-nums"
      style={{ borderColor: RULE, backgroundColor: CARD, color: INK, width }}
    />
  );
}

function downloadJson(model: Model) {
  const blob = new Blob([JSON.stringify(model, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cluster-1-edited.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Rates() {
  const { model, seedModel, update, reset } = useModel();
  const [selectedLayoutId, setSelectedLayoutId] = useState(model.layouts[0]?.id);
  const selectedLayout = model.layouts.find((l) => l.id === selectedLayoutId) ?? model.layouts[0];

  const delta = deltaSummary(seedModel, model);
  const activityName = (id: string) => model.activities.find((a) => a.id === id)?.name ?? id;

  const setSpaceField = (layoutId: string, spaceId: string, field: keyof Pick<Space, "floor_area" | "wall_area">, next: number) => {
    update((m) => {
      const layout = m.layouts.find((l) => l.id === layoutId)!;
      const space = layout.spaces.find((s) => s.id === spaceId)!;
      space[field] = next;
    });
  };

  const setSpaceRate = (layoutId: string, spaceId: string, activityId: string, next: number) => {
    update((m) => {
      const layout = m.layouts.find((l) => l.id === layoutId)!;
      const space = layout.spaces.find((s) => s.id === spaceId)!;
      space.rates[activityId] = next;
    });
  };

  const setUnitRate = (layoutId: string, activityId: string, next: number) => {
    update((m) => {
      const layout = m.layouts.find((l) => l.id === layoutId)!;
      layout.unit_rates[activityId] = next;
    });
  };

  const setUnitCount = (buildingId: string, layoutId: string, next: number) => {
    update((m) => {
      const building = m.buildings.find((b) => b.id === buildingId)!;
      const unit = building.units.find((u) => u.layout_id === layoutId)!;
      unit.count = Math.max(0, Math.round(next));
    });
  };

  const perUnitActivities = model.activities.filter((a) => a.basis === "per_unit");
  const presentSpaces = selectedLayout?.spaces.filter((s) => s.floor_area !== null || s.wall_area !== null) ?? [];

  return (
    <PageShell>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Rates — Cluster 1</h1>
          <p className="text-sm" style={{ color: INK_SOFT }}>
            Edit any rate, area, or apartment count. Nothing is saved until you export.
          </p>
        </div>
      </header>

      <div className="mb-6 rounded-xl border p-5 sm:p-6" style={{ backgroundColor: CARD, borderColor: delta.isDirty ? FLAG : RULE }}>
        {delta.isDirty ? (
          <>
            <p className="text-xs uppercase tracking-wide" style={{ color: INK_SOFT }}>
              Live delta vs. the seed
            </p>
            <p className="mt-1 text-lg font-extrabold sm:text-xl">
              {formatExact(delta.seedTotal)} → {formatExact(delta.currentTotal)}
            </p>
            <p className="mt-1 text-sm" style={{ color: delta.delta < 0 ? MEASURED : FLAG }}>
              {delta.delta > 0 ? "up" : delta.delta < 0 ? "down" : "unchanged by"} {formatExact(Math.abs(delta.delta))} (
              {delta.delta >= 0 ? "+" : "−"}
              {formatPercent(Math.abs(delta.deltaPercent))})
            </p>
          </>
        ) : (
          <p className="text-sm" style={{ color: INK_SOFT }}>
            Matches the seed exactly — {formatExact(delta.seedTotal)}. No edits yet.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadJson(model)}
            className="rounded-md px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: INK, color: CARD }}
          >
            Export JSON
          </button>
          <button
            type="button"
            disabled={!delta.isDirty}
            onClick={() => {
              if (window.confirm("Discard all edits and return to the seed figures?")) reset();
            }}
            className="rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-40"
            style={{ borderColor: RULE, color: INK, backgroundColor: CARD }}
          >
            Reset to seed
          </button>
        </div>
      </div>

      <section className="mb-6">
        <h2 className="mb-3 text-base font-extrabold">Apartment counts</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {model.buildings
            .filter((b) => b.units.length > 0)
            .map((b) => (
              <div key={b.id} className="rounded-lg border p-3.5" style={{ backgroundColor: CARD, borderColor: RULE }}>
                <div className="mb-2 text-sm font-bold">{b.name}</div>
                <div className="grid gap-2">
                  {b.units.map((u) => {
                    const layout = model.layouts.find((l) => l.id === u.layout_id);
                    return (
                      <div key={u.layout_id} className="flex items-center justify-between gap-2 text-sm">
                        <span style={{ color: INK_SOFT }}>{layout?.name ?? u.layout_id}</span>
                        <NumberField
                          value={u.count}
                          onCommit={(next) => setUnitCount(b.id, u.layout_id, next)}
                          ariaLabel={`Apartment count, ${layout?.name ?? u.layout_id}, ${b.name}`}
                          width="5rem"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </section>

      <section className="mb-6">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-base font-extrabold">Rates &amp; areas by layout</h2>
          <span className="text-xs" style={{ color: INK_SOFT }}>
            {formatInt(presentSpaces.length)} spaces present
          </span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {model.layouts.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelectedLayoutId(l.id)}
              aria-pressed={l.id === selectedLayout?.id}
              className="rounded-lg border-2 p-3 text-left text-sm font-bold"
              style={
                l.id === selectedLayout?.id
                  ? { backgroundColor: INK, borderColor: INK, color: CARD }
                  : { backgroundColor: CARD, borderColor: RULE, color: INK }
              }
            >
              {l.name}
            </button>
          ))}
        </div>

        {selectedLayout && (
          <>
            <div className="mb-3 grid gap-2.5 sm:grid-cols-2">
              {perUnitActivities.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3.5"
                  style={{ backgroundColor: CARD, borderColor: RULE, borderLeft: `6px solid ${MEASURED}` }}
                >
                  <span className="text-sm font-bold">{a.name} — flat rate per apartment</span>
                  <NumberField
                    value={selectedLayout.unit_rates[a.id] ?? 0}
                    onCommit={(next) => setUnitRate(selectedLayout.id, a.id, next)}
                    ariaLabel={`${a.name} rate, ${selectedLayout.name}`}
                  />
                </div>
              ))}
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
              {presentSpaces.map((s) => (
                <div
                  key={s.id}
                  className="rounded-lg border p-3.5"
                  style={{ backgroundColor: CARD, borderColor: RULE, borderLeft: `6px solid ${MEASURED}` }}
                >
                  <div className="mb-2 text-sm font-bold">{s.name}</div>
                  <div className="mb-2.5 flex flex-wrap gap-3 text-xs" style={{ color: INK_SOFT }}>
                    <label className="flex items-center gap-1.5">
                      Floor m²
                      <NumberField
                        value={s.floor_area ?? 0}
                        onCommit={(next) => setSpaceField(selectedLayout.id, s.id, "floor_area", next)}
                        ariaLabel={`Floor area, ${s.name}, ${selectedLayout.name}`}
                        width="5rem"
                      />
                    </label>
                    <label className="flex items-center gap-1.5">
                      Wall m²
                      <NumberField
                        value={s.wall_area ?? 0}
                        onCommit={(next) => setSpaceField(selectedLayout.id, s.id, "wall_area", next)}
                        ariaLabel={`Wall area, ${s.name}, ${selectedLayout.name}`}
                        width="5rem"
                      />
                    </label>
                  </div>
                  {Object.keys(s.rates).length === 0 ? (
                    <p className="text-xs italic" style={{ color: INK_SOFT }}>
                      No activity applies here
                    </p>
                  ) : (
                    <div className="grid gap-1.5">
                      {Object.entries(s.rates).map(([activityId, rate]) => (
                        <div key={activityId} className="flex items-center justify-between gap-2 text-xs">
                          <span style={{ color: INK_SOFT }}>{activityName(activityId)}</span>
                          <NumberField
                            value={rate}
                            onCommit={(next) => setSpaceRate(selectedLayout.id, s.id, activityId, next)}
                            ariaLabel={`${activityName(activityId)} rate, ${s.name}, ${selectedLayout.name}`}
                            width="5.5rem"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <ScreenNav />
    </PageShell>
  );
}
