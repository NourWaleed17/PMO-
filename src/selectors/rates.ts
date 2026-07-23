import { summarise, type Model } from "../engine/engine";

/** Pure delta math for the Rates screen's persistent banner — kept separate
 *  from the React state wiring in `src/data/ModelContext.tsx` so it's
 *  testable without rendering anything. */

export interface DeltaSummary {
  seedTotal: number;
  currentTotal: number;
  delta: number;
  deltaPercent: number;
  isDirty: boolean;
}

export function deltaSummary(seed: Model, current: Model): DeltaSummary {
  const seedTotal = summarise(seed).total;
  const currentTotal = summarise(current).total;
  const delta = currentTotal - seedTotal;
  return {
    seedTotal,
    currentTotal,
    delta,
    deltaPercent: seedTotal ? delta / seedTotal : 0,
    // Deep-compare rather than delta !== 0: two edits could cancel out in
    // total while the model is still genuinely different from the seed.
    isDirty: JSON.stringify(seed) !== JSON.stringify(current),
  };
}
