import * as React from "react";
import { cn } from "./cn";

export type BadgeTone = "neutral" | "sakura" | "matcha" | "amber" | "sky";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-ink-100 text-ink-600",
  sakura: "bg-sakura-100 text-sakura-700",
  matcha: "bg-matcha-100 text-matcha-600",
  amber: "bg-amber-100 text-amber-700",
  sky: "bg-sky-100 text-sky-700",
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
