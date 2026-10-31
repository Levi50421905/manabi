import * as React from "react";
import { cn } from "./cn";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "level"
  | "success"
  | "warning"
  | "danger"
  | "outline"
  /* alias lama */
  | "sakura"
  | "matcha"
  | "amber"
  | "sky";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-fg-muted",
  accent: "bg-accent-soft text-accent",
  level: "bg-level-soft text-level",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  outline: "border border-border text-fg-muted",
  /* alias lama → token baru */
  sakura: "bg-accent-soft text-accent",
  matcha: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  sky: "bg-surface-muted text-fg",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  /** Level JLPT, mis. "N5" → dirender dengan huruf rata kolom. */
  mono?: boolean;
}

export function Badge({ className, tone = "neutral", mono, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-caption font-semibold leading-none",
        mono && "tnum tracking-wider",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
