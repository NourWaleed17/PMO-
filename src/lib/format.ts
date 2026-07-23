/** The one place currency and number formatting happens (see docs/BRIEF.md
 *  section 6). Two registers only: `formatHeadline` for the big number a
 *  board member reads from across the room, `formatExact` for every table,
 *  KPI, and chart figure where the precise EGP amount matters. Never use
 *  both for the same figure in the same view. */

export const CURRENCY = "EGP";

/** Apply wherever a figure is rendered — keeps digits aligned in columns. */
export const numClass = "tabular-nums";

const exactFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const intFormatter = new Intl.NumberFormat("en-US");

const percentFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** "147,629,110.42" — tables, KPIs, anywhere the exact amount is read. */
export function formatExact(n: number): string {
  return exactFormatter.format(n);
}

/** "147.6" — headline figures only. Pair with a "M EGP" unit in markup;
 *  don't append "M" here too. */
export function formatHeadline(n: number): string {
  const millions = n / 1_000_000;
  return millions.toFixed(1);
}

/** "MEP" stays an acronym, "Architecture" gets sentence case — a generic
 *  rule so a future discipline value formats sensibly with no code change. */
export function formatLabel(s: string): string {
  return s.length <= 4 ? s.toUpperCase() : s.charAt(0).toUpperCase() + s.slice(1);
}

/** "98" — plain counts (apartments, units), no decimals. */
export function formatInt(n: number): string {
  return intFormatter.format(Math.round(n));
}

/** "76.8%" — shares. `fraction` is 0..1. */
export function formatPercent(fraction: number): string {
  return `${percentFormatter.format(fraction * 100)}%`;
}
