import * as React from "react";

export interface EmptyStateProps {
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
      className={`rounded-2xl border border-dashed border-border bg-surface/60 p-8 text-center ${className ?? ""}`}
    >
      {glyph ? (
        <p className="jp text-3xl text-fg-muted opacity-50" aria-hidden="true">
          {glyph}
        </p>
      ) : null}
      <p className="mt-2 text-sm font-medium text-fg">{title}</p>
      {description ? <p className="mt-1 text-xs text-fg-muted">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
