import * as React from "react";
import { cn } from "./cn";

export type ProgressTone = "accent" | "level" | "success" | "ink" | "sakura" | "matcha";

const tones: Record<ProgressTone, string> = {
  accent: "bg-accent",
  level: "bg-level",
  success: "bg-success",
  ink: "bg-fg",
  sakura: "bg-accent",
  matcha: "bg-success",
};

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  tone?: ProgressTone;
  /** Tampilkan persentase di kanan atas. */
  showValue?: boolean;
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  tone = "accent",
  showValue,
  label,
  className,
  ...props
}: ProgressBarProps) {
  const percent = Math.max(0, Math.min(100, max === 0 ? 0 : (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {showValue || label ? (
        <div className="mb-1.5 flex items-center justify-between gap-2 text-caption text-fg-muted">
          <span>{label}</span>
          {showValue ? (
            <span className="tnum font-semibold text-fg">{Math.round(percent)}%</span>
          ) : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className="h-1.5 w-full overflow-hidden rounded-full bg-fg/10"
        {...props}
      >
        <div
          className={cn(
            "progress-fill h-full rounded-full transition-[width] duration-500 ease-emphasized",
            tones[tone],
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export interface ProgressRingProps {
  value: number;
  max?: number;
  /** Diameter dalam px. */
  size?: number;
  stroke?: number;
  tone?: "accent" | "level" | "success";
  className?: string;
  children?: React.ReactNode;
}

const ringTones = {
  accent: "stroke-accent",
  level: "stroke-level",
  success: "stroke-success",
} as const;

/** Progres melingkar untuk statistik ringkas (target harian, streak). */
export function ProgressRing({
  value,
  max = 100,
  size = 56,
  stroke = 5,
  tone = "accent",
  className,
  children,
}: ProgressRingProps) {
  const percent = Math.max(0, Math.min(100, max === 0 ? 0 : (value / max) * 100));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className={cn("relative grid shrink-0 place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Math.round(percent)}%`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-fg/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (percent / 100) * circumference}
          className={cn(
            "transition-[stroke-dashoffset] duration-700 ease-emphasized",
            ringTones[tone],
          )}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
