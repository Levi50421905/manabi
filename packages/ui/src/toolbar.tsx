import * as React from "react";
import { cn } from "./cn";

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Menempel di atas saat halaman digulir (mobile). */
  sticky?: boolean;
}

/**
 * Baris alat: pencarian, filter, dan aksi daftar.
 * Di mobile dibuat menempel agar filter tetap terjangkau saat menggulir
 * daftar yang panjang.
 */
export function Toolbar({ sticky, className, children, ...props }: ToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-surface/95 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between",
        sticky && "sticky top-14 z-20 sm:top-3",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Kelompok elemen di dalam Toolbar; di mobile boleh menggeser horizontal. */
export function ToolbarGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex min-w-0 items-center gap-2", className)} {...props} />;
}

export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

/** Kolom pencarian dengan ikon. */
export function SearchField({ className, onClear, value, ...props }: SearchFieldProps) {
  return (
    <div className="relative min-w-0 flex-1">
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle"
      >
        <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="m13.5 13.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        className={cn(
          "h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm text-fg placeholder:text-fg-subtle focus:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
          className,
        )}
        {...props}
      />
      {onClear && value ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Hapus pencarian"
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-fg-subtle hover:bg-surface-muted hover:text-fg"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
