import * as React from "react";
import { cn } from "./cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** "text" (satu baris), "block" (kotak), "circle". */
  shape?: "text" | "block" | "circle";
}

/** Placeholder saat data belum siap. */
export function Skeleton({ className, shape = "block", ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-surface-inset",
        shape === "text" && "h-3 rounded",
        shape === "block" && "rounded-lg",
        shape === "circle" && "rounded-full",
        className,
      )}
      {...props}
    />
  );
}
