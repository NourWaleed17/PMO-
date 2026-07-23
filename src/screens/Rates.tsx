import { useEffect, useState } from "react";
import { useModel } from "../data/ModelContext";
import { PageContent } from "../design/direction-d";
import { downloadModelJson } from "../lib/export";
import { formatExact, formatInt, formatPercent } from "../lib/format";
import type { Space } from "../engine/engine";
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
      style={{ width }}
      className="font-mono tabular-nums text-body-md border border-outline-variant bg-surface-container-lowest text-on-surface px-2 py-1 rounded-sm focus:border-2 focus:border-primary focus:outline-none"
    />
  );
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
    <PageContent>
      <header className="mb-8">
        <h1 className="text-headline-lg text-primary mb-2">Rates — Cluster 1</h1>
        <p className="text-body-md text-on-surface-variant">
          Edit any rate, area, or apartment count. Nothing is saved until you export.
        </p>
      </header>

      <div
        className={`mb-8 bg-surface-container-lowest border p-6 ${delta.isDirty ? "border-error" : "border-outline-variant"}`}
      >
        {delta.isDirty ? (
          <>
            <p className="text-label-sm text-on-surface-variant tracking-wide">Live delta vs. the seed</p>
            <p className="mt-1 font-mono text-body-lg font-bold tabular-nums">
              {formatExact(delta.seedTotal)} → {formatExact(delta.currentTotal)}
            </p>
            <p className={`mt-1 font-mono text-body-md tabular-nums ${delta.delta < 0 ? "text-primary" : "text-on-error-container"}`}>
              {delta.delta > 0 ? "up" : delta.delta < 0 ? "down" : "unchanged by"} {formatExact(Math.abs(delta.delta))} (
              {delta.delta >= 0 ? "+" : "−"}
              {formatPercent(Math.abs(delta.deltaPercent))})
            </p>
          </>
        ) : (
          <p className="text-body-md text-on-surface-variant">
            Matches the seed exactly — <span className="font-mono tabular-nums">{formatExact(delta.seedTotal)}</span>. No edits yet.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => downloadModelJson(model)}
            className="bg-primary text-on-primary px-4 py-2 rounded text-body-md font-medium hover:opacity-80 transition-opacity"
          >
            Export JSON
          </button>
          <button
            type="button"
            disabled={!delta.isDirty}
            onClick={() => {
              if (window.confirm("Discard all edits and return to the seed figures?")) reset();
            }}
            className="border border-outline-variant text-on-surface px-4 py-2 rounded text-body-md font-medium disabled:opacity-40"
          >
            Reset to seed
          </button>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-headline-sm font-semibold text-primary">Apartment counts</h2>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {model.buildings
            .filter((b) => b.units.length > 0)
            .map((b) => (
              <div key={b.id} className="bg-surface-container-lowest border border-outline-variant p-3.5">
                <div className="mb-2 text-body-md font-bold">{b.name}</div>
                <div className="grid gap-2">
                  {b.units.map((u) => {
                    const layout = model.layouts.find((l) => l.id === u.layout_id);
                    return (
                      <div key={u.layout_id} className="flex items-center justify-between gap-2 text-body-md">
                        <span className="text-on-surface-variant">{layout?.name ?? u.layout_id}</span>
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

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-headline-sm font-semibold text-primary">Rates &amp; areas by layout</h2>
          <span className="text-label-sm text-on-surface-variant">{formatInt(presentSpaces.length)} spaces present</span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {model.layouts.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelectedLayoutId(l.id)}
              aria-pressed={l.id === selectedLayout?.id}
              className={`border-2 p-3 text-left text-body-md font-bold ${
                l.id === selectedLayout?.id
                  ? "bg-primary border-primary text-on-primary"
                  : "bg-surface-container-lowest border-outline-variant text-on-surface"
              }`}
            >
              {l.name}
            </button>
          ))}
        </div>

        {selectedLayout && (
          <>
            <div className="mb-3 grid gap-2.5 sm:grid-cols-2">
              {perUnitActivities.map((a) => (
                <div key={a.id} className="built-up-pattern border border-outline-variant flex items-center justify-between gap-2 p-3.5">
                  <span className="text-body-md font-bold">{a.name} — flat rate per apartment</span>
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
                <div key={s.id} className="built-up-pattern border border-outline-variant p-3.5">
                  <div className="mb-2 text-body-md font-bold">{s.name}</div>
                  <div className="mb-2.5 flex flex-wrap gap-3 text-label-sm text-on-surface-variant">
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
                    <p className="text-label-sm italic text-on-surface-variant">No activity applies here</p>
                  ) : (
                    <div className="grid gap-1.5">
                      {Object.entries(s.rates).map(([activityId, rate]) => (
                        <div key={activityId} className="flex items-center justify-between gap-2 text-label-sm">
                          <span className="text-on-surface-variant">{activityName(activityId)}</span>
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
    </PageContent>
  );
}
