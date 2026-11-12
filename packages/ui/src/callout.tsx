import * as React from "react";
import { cn } from "./cn";

export type CalloutTone = "info" | "warning" | "success" | "danger";

const tones: Record<CalloutTone, { wrap: string; glyph: string; glyphTone: string }> = {
  info: { wrap: "border-border bg-surface-muted text-fg", glyph: "注", glyphTone: "text-fg-muted" },
  warning: {
    wrap: "border-warning/30 bg-warning-soft text-fg",
    glyph: "注",
    glyphTone: "text-warning",
  },
  success: {
    wrap: "border-success/30 bg-success-soft text-fg",
    glyph: "覚",
    glyphTone: "text-success",
  },
  danger: { wrap: "border-danger/30 bg-danger-soft text-fg", glyph: "危", glyphTone: "text-danger" },
};

export interface CalloutProps {
  tone?: CalloutTone;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Catatan / keterangan penting di dalam alur konten. */
export function Callout({ tone = "info", title, children, className }: CalloutProps) {
  return (
    <div className={cn("flex gap-3 rounded-2xl border p-4", tones[tone].wrap, className)}>
      <span
        lang="ja"
        aria-hidden="true"
        className={cn(
          "jp mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface/80 text-caption font-bold",
          tones[tone].glyphTone,
        )}
      >
        {tones[tone].glyph}
      </span>
      <div className="min-w-0 text-sm leading-relaxed">
        {title ? <p className="mb-1 font-bold text-fg">{title}</p> : null}
        <div className="text-fg-muted">{children}</div>
      </div>
    </div>
  );
}
