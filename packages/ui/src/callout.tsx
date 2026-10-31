import * as React from "react";
import { cn } from "./cn";

export type CalloutTone = "info" | "warning" | "success" | "danger";

const tones: Record<CalloutTone, { wrap: string; glyph: string }> = {
  info: { wrap: "border-border bg-surface-muted text-fg", glyph: "注" },
  warning: { wrap: "border-warning/30 bg-warning-soft text-fg", glyph: "注" },
  success: { wrap: "border-success/30 bg-success-soft text-fg", glyph: "覚" },
  danger: { wrap: "border-danger/30 bg-danger-soft text-fg", glyph: "危" },
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
    <div className={cn("flex gap-3 rounded-lg border p-3.5", tones[tone].wrap, className)}>
      <span
        lang="ja"
        aria-hidden="true"
        className="jp mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface/70 text-caption font-semibold text-fg-muted"
      >
        {tones[tone].glyph}
      </span>
      <div className="min-w-0 text-sm leading-relaxed">
        {title ? <p className="mb-0.5 font-semibold text-fg">{title}</p> : null}
        <div className="text-fg-muted">{children}</div>
      </div>
    </div>
  );
}
