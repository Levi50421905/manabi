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
 * Kartu angka ringkas. Angka besar dan tebal + tabular-nums supaya kolom
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
        "relative flex min-w-0 items-start justify-between gap-3 overflow-hidden rounded-2xl border p-4 shadow-soft sm:p-5",
        tone === "level" ? "border-level/25 bg-level-soft" : "border-border bg-surface",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="label-micro">{label}</p>
        <p className="mt-2 flex items-baseline gap-1">
          <span className="tnum font-display text-3xl font-extrabold leading-none text-fg">
            {value}
          </span>
          {unit ? <span className="text-sm font-semibold text-fg-muted">{unit}</span> : null}
        </p>
        {hint ? <p className="mt-2 text-caption leading-snug text-fg-subtle">{hint}</p> : null}
      </div>
      {aside}
      {glyph ? (
        <span
          lang="ja"
          aria-hidden="true"
          className="jp-serif pointer-events-none absolute -bottom-4 -right-1 select-none text-6xl leading-none text-fg/[0.05]"
        >
          {glyph}
        </span>
      ) : null}
    </div>
  );
}
