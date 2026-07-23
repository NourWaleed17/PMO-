import type { CSSProperties, ReactNode } from "react";
import { formatPercent } from "../lib/format";
import type { SplitFigure } from "../selectors/split";

/** Direction D — "Capital Executive Dashboard". Replaced Direction C across
 *  every screen (see docs/HANDOFF.md and design/direction-d-capital-executive.md
 *  for the source tokens/mockup). Colours, fonts, and radii live in
 *  src/index.css's @theme block; this file holds the shared layout shell and
 *  the components every screen composes instead of hand-rolling. */

/** "link" (filled) = built-up/measured, "edit" = lump-sum. Per the mockup —
 *  a second cue alongside the hatch/dash pattern, never colour alone. */
export function StatusIcon({ substantiated, label }: { substantiated: boolean; label?: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`material-symbols-outlined text-[16px] ${substantiated ? "text-primary" : "text-on-surface-variant"}`}
        style={substantiated ? ({ fontVariationSettings: "'FILL' 1" } as CSSProperties) : undefined}
      >
        {substantiated ? "link" : "edit"}
      </span>
      {label && (
        <span className={`text-label-sm ${substantiated ? "font-bold" : "italic text-on-surface-variant"}`}>{label}</span>
      )}
    </span>
  );
}

/** The full-width composition bar — built-up (hatch) vs. lump-sum (dashed),
 *  used for the cluster/building/discipline splits. */
export function CompositionBar({ split, height = "h-12" }: { split: SplitFigure; height?: string }) {
  return (
    <div
      className={`${height} w-full flex bg-surface-container rounded-sm overflow-hidden`}
      role="img"
      aria-label={`${formatPercent(split.measuredShare)} built-up, ${formatPercent(split.lumpShare)} lump-sum`}
    >
      {split.lumpShare > 0 && (
        <div
          className="h-full flex items-center justify-center text-on-surface-variant text-[12px] lump-sum-dashed border-none bg-surface-container-high"
          style={{ width: `${split.lumpShare * 100}%` }}
        >
          {split.lumpShare >= 0.12 && `${formatPercent(split.lumpShare)} lump-sum`}
        </div>
      )}
      {split.measuredShare > 0 && (
        <div
          className="h-full flex items-center justify-center text-primary font-bold built-up-pattern text-[12px]"
          style={{ width: `${split.measuredShare * 100}%` }}
        >
          {split.measuredShare >= 0.12 && formatPercent(split.measuredShare)}
        </div>
      )}
    </div>
  );
}

/** A card whose whole surface takes the hatch (built-up) or dashed
 *  (lump-sum) treatment — used for single-figure rows like "cost by
 *  building." lumpShare selects which treatment dominates. */
export function DataPatternRow({
  lumpShare,
  children,
}: {
  lumpShare: number;
  children: ReactNode;
}) {
  const isLumpSum = lumpShare >= 1;
  return (
    <div
      className={`flex justify-between items-center p-3 border ${
        isLumpSum ? "lump-sum-dashed bg-surface-container-low" : "built-up-pattern border-outline-variant"
      }`}
    >
      {children}
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className = "",
  padded = true,
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div className={`bg-surface-container-lowest border border-outline-variant flex flex-col ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center gap-4">
          <h2 className="text-headline-sm font-semibold text-primary">{title}</h2>
          {action}
        </div>
      )}
      <div className={padded ? "p-6" : ""}>{children}</div>
    </div>
  );
}

export function StatTile({ label, value, valueClassName = "text-primary" }: { label: string; value: ReactNode; valueClassName?: string }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant p-6">
      <div className="text-label-sm text-on-surface-variant mb-2">{label}</div>
      <div className={`font-mono text-headline-sm ${valueClassName}`}>{value}</div>
    </div>
  );
}

/** Page content wrapper — sits inside AppShell's <main>, which already
 *  accounts for the fixed top bar and sidebar. */
export function PageContent({ children }: { children: ReactNode }) {
  return <div className="max-w-[1440px] mx-auto px-4 py-6 md:px-10 md:py-10">{children}</div>;
}
