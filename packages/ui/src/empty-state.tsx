import * as React from "react";
import { cn } from "./cn";

export interface EmptyStateProps {
  /** Glyph kanji besar sebagai ornamen, mis. "空". */
  glyph?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Tampilan "belum ada data" yang seragam di semua modul. */
export function EmptyState({ glyph, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-border-strong bg-surface-muted/40 px-6 py-12 text-center",
        className,
      )}
    >
      {glyph ? (
        <span
          lang="ja"
          aria-hidden="true"
          className="jp grid h-16 w-16 place-items-center rounded-2xl bg-surface text-4xl leading-none text-accent-strong shadow-soft"
        >
          {glyph}
        </span>
      ) : null}
      <p className="mt-5 text-h3 font-bold text-fg">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-fg-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
