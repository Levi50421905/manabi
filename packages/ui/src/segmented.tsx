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
  /** Pakai tinggi penuh dan bagi rata — cocok untuk mobile. */
  block?: boolean;
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
  block,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex gap-1 rounded-lg border border-border bg-surface-muted p-1",
        block ? "flex w-full" : "flex-wrap",
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
              "flex items-center justify-center gap-1.5 rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
              block && "flex-1",
              size === "sm" ? "px-2.5 py-1 text-caption" : "px-3 py-1.5 text-xs",
              active
                ? "bg-surface text-fg shadow-soft"
                : "text-fg-muted hover:text-fg",
            )}
          >
            {option.glyph ? (
              <span lang="ja" className="jp text-xs leading-none">
                {option.glyph}
              </span>
            ) : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
