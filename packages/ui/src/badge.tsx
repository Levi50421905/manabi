import * as React from "react";
import { cn } from "./cn";

export type BadgeTone = "neutral" | "sakura" | "matcha" | "amber" | "sky";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-surface-muted text-fg-muted",
  sakura: "bg-accent-soft text-accent",
  matcha: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  sky: "bg-surface-muted text-fg",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
