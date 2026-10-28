import * as React from "react";
import { cn } from "./cn";

export interface SegmentedOption<T extends string | number> {
  value: T;
  label: string;
  /** Glyph kana/kanji opsional, mis. "あ" untuk tab Hiragana. */
  glyph?: string;
}

export interface SegmentedControlProps<T extends string | number> {
  options: Array<SegmentedOption<T>>;
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  ariaLabel?: string;
  className?: string;
}

/**
 * Kontrol pilihan bergaya segmented (tab/pil). Dipakai untuk tab kana,
 * kecepatan suara, target harian, dan pemilih tema — satu implementasi
 * supaya gaya & perilakunya konsisten di seluruh aplikasi.
 */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  size = "md",
  ariaLabel,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors",
              size === "sm" ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs",
              active
                ? "bg-accent text-accent-contrast shadow-sm"
                : "text-fg-muted hover:bg-surface-muted hover:text-fg",
            )}
          >
            {option.glyph ? <span className="jp">{option.glyph}</span> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
