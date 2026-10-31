import * as React from "react";
import { cn } from "./cn";

export type CardVariant = "default" | "muted" | "interactive" | "outline";

const variants: Record<CardVariant, string> = {
  default: "border-border bg-surface",
  muted: "border-border bg-surface-muted",
  outline: "border-border bg-transparent",
  interactive:
    "border-border bg-surface transition-[border-color,box-shadow,transform] duration-200 ease-emphasized hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lifted",
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

/**
 * Permukaan dasar aplikasi. Garis rambut + tanpa bayangan secara default —
 * bayangan hanya untuk elemen yang benar-benar mengambang.
 */
export function Card({ className, variant = "default", ...props }: CardProps) {
  return <div className={cn("rounded-xl border", variants[variant], className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-3.5",
        className,
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-h3 font-semibold tracking-tight text-fg", className)} {...props} />;
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs leading-relaxed text-fg-muted", className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

/** Nama lama — dipertahankan agar halaman yang belum dimigrasi tetap jalan. */
export const CardContent = CardBody;

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-wrap items-center gap-2 border-t border-border px-5 py-3", className)}
      {...props}
    />
  );
}
