/** The measured/lump-sum split shape every screen's cards and bars render
 *  against (docs/CLAUDE.md rule 3). Defined once here — `design/direction-d`
 *  imports the type for its components, every selector that needs the shape
 *  imports `split()` — rather than each selector re-deriving its own copy. */

export interface SplitFigure {
  total: number;
  measured: number;
  lump: number;
  measuredShare: number;
  lumpShare: number;
}

export function split(rows: { total: number; substantiated: boolean }[]): SplitFigure {
  const total = rows.reduce((a, r) => a + r.total, 0);
  const measured = rows.filter((r) => r.substantiated).reduce((a, r) => a + r.total, 0);
  const lump = total - measured;
  return {
    total,
    measured,
    lump,
    measuredShare: total ? measured / total : 0,
    lumpShare: total ? lump / total : 0,
  };
}
