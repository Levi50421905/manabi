import * as React from "react";
import { cn } from "./cn";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  tone?: "sakura" | "matcha" | "ink";
}

const tones = {
  sakura: "bg-sakura-500",
  matcha: "bg-matcha-500",
  ink: "bg-ink-800",
} as const;

export function ProgressBar({
  value,
  max = 100,
  tone = "sakura",
  className,
  ...props
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, max === 0 ? 0 : (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-ink-100", className)}
      {...props}
    >
      <div
        className={cn(
          "progress-fill h-full rounded-full transition-all duration-500",
          tones[tone],
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
