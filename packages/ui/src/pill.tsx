import * as React from "react";
import { cn } from "./cn";

export interface PillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  /** Glyph kana/kanji opsional di depan label. */
  glyph?: string;
}

/**
 * Chip filter yang bisa ditekan. Dipakai untuk kategori kosakata, jenis kanji,
 * tab jangka waktu, dsb. — satu implementasi agar state aktifnya konsisten.
 */
export function Pill({ className, active = false, glyph, children, type = "button", ...props }: PillProps) {
  return (
    <button
      type={type}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-caption font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        active
          ? "border-transparent bg-fg text-paper"
          : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
        className,
      )}
      {...props}
    >
      {glyph ? (
        <span lang="ja" className="jp text-xs leading-none">
          {glyph}
        </span>
      ) : null}
      {children}
    </button>
  );
}

/** Pembungkus baris chip yang bisa digeser horizontal (satu-satunya tempat overflow-x). */
export function PillRow({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "-mx-4 flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:px-0",
        className,
      )}
      {...props}
    />
  );
}
