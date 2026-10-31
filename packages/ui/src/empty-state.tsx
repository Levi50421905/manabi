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
        "flex flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface/50 px-6 py-12 text-center",
        className,
      )}
    >
      {glyph ? (
        <p
          lang="ja"
          className="jp-serif select-none text-4xl leading-none text-fg-subtle/50"
          aria-hidden="true"
        >
          {glyph}
        </p>
      ) : null}
      <p className="mt-4 text-h3 font-semibold text-fg">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-fg-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
