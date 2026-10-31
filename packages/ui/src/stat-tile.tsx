import * as React from "react";
import { cn } from "./cn";

export interface StatTileProps {
  label: string;
  value: React.ReactNode;
  /** Satuan kecil setelah angka, mis. "hari" atau "%". */
  unit?: string;
  /** Keterangan tambahan di bawah angka. */
  hint?: React.ReactNode;
  /** Glyph kanji sebagai ornamen kanan. */
  glyph?: string;
  /** Elemen kanan (mis. ProgressRing). */
  aside?: React.ReactNode;
  tone?: "default" | "level";
  className?: string;
}

/**
 * Kartu angka ringkas. Angka memakai serif + tabular-nums supaya kolom
 * statistik tetap rata saat nilainya berubah.
 */
export function StatTile({
  label,
  value,
  unit,
  hint,
  glyph,
  aside,
  tone = "default",
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 items-start justify-between gap-3 overflow-hidden rounded-xl border p-4",
        tone === "level" ? "border-level/25 bg-level-soft" : "border-border bg-surface",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="label-micro">{label}</p>
        <p className="mt-2 flex items-baseline gap-1">
          <span className="tnum font-display text-2xl font-semibold leading-none text-fg">
            {value}
          </span>
          {unit ? <span className="text-xs font-medium text-fg-muted">{unit}</span> : null}
        </p>
        {hint ? <p className="mt-1.5 text-caption leading-snug text-fg-subtle">{hint}</p> : null}
      </div>
      {aside}
      {glyph ? (
        <span
          lang="ja"
          aria-hidden="true"
          className="jp-serif pointer-events-none absolute -bottom-3 -right-1 select-none text-5xl leading-none text-fg/[0.04]"
        >
          {glyph}
        </span>
      ) : null}
    </div>
  );
}
