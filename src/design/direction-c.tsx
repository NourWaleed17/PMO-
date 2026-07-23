import type { CSSProperties, ReactNode } from "react";
import { formatPercent } from "../lib/format";
import type { SplitFigure } from "../selectors/split";

/** Direction C — "schedule board" — chosen 2026-07-23 (see docs/HANDOFF.md
 *  item 1). Every screen extends this same token set and signature system;
 *  don't introduce a second visual language for a later screen. */

export const INK = "#16181a";
export const INK_SOFT = "#5c6268";
export const RULE = "#d3d6d8";
export const FLAG = "#b8860b";
export const FLAG_SOFT = "#f1e2b8";
export const MEASURED = "#3a4650";
export const CARD = "#ffffff";
export const PAGE_BG = "#eceeef";

/** Border weight is the direction's signature cue: thickness and colour
 *  scale continuously with a card's lump-sum share, so "how much of this
 *  figure is measured" reads at a glance without relying on colour alone —
 *  the border width and the printed share label are the two cues. */
export function weightStyle(lumpShare: number): CSSProperties {
  if (lumpShare <= 0) return { border: `1px solid ${RULE}` };
  const width = 1 + Math.round(lumpShare * 3);
  return { border: `${width}px solid ${FLAG}` };
}

export function hatchStyle(color: string): CSSProperties {
  return {
    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 5px, ${color} 5px, ${color} 6px)`,
  };
}

export function SplitMeter({ split, height = 26 }: { split: SplitFigure; height?: number }) {
  return (
    <div
      className="flex overflow-hidden rounded-md border motion-safe:[&>*]:transition-[width] motion-safe:[&>*]:duration-500"
      style={{ height, borderColor: RULE, backgroundColor: CARD }}
      role="img"
      aria-label={`${formatPercent(split.measuredShare)} measured, ${formatPercent(split.lumpShare)} lump sum`}
    >
      <div style={{ width: `${split.measuredShare * 100}%`, backgroundColor: MEASURED }} />
      <div
        style={{
          width: `${split.lumpShare * 100}%`,
          borderLeft: split.measured > 0 ? `3px solid ${FLAG}` : undefined,
          ...hatchStyle(FLAG_SOFT),
        }}
      />
    </div>
  );
}

export function Bar({ split, height = 14 }: { split: SplitFigure; height?: number }) {
  return (
    <div
      className="flex overflow-hidden rounded motion-safe:[&>*]:transition-[width] motion-safe:[&>*]:duration-500"
      style={{ height, backgroundColor: "#eef0f1" }}
      role="img"
      aria-label={`${formatPercent(split.measuredShare)} measured, ${formatPercent(split.lumpShare)} lump sum`}
    >
      <div style={{ width: `${split.measuredShare * 100}%`, backgroundColor: MEASURED }} />
      <div style={{ width: `${split.lumpShare * 100}%`, opacity: 0.55, ...hatchStyle(FLAG) }} />
    </div>
  );
}

/** Full-width page frame every screen renders inside — same background,
 *  max width, and padding rhythm. */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <main className="tabular-nums" style={{ backgroundColor: PAGE_BG, color: INK, minHeight: "100vh" }}>
      <div className="mx-auto max-w-5xl px-4 py-6 pb-16 sm:px-5">{children}</div>
    </main>
  );
}
