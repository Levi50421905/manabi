import * as React from "react";
import { cn } from "./cn";

export interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  className?: string;
}

function windowPages(page: number, pageCount: number, span = 5): number[] {
  const half = Math.floor(span / 2);
  let start = Math.max(1, page - half);
  const end = Math.min(pageCount, start + span - 1);
  start = Math.max(1, end - span + 1);

  const pages: number[] = [];
  for (let index = start; index <= end; index += 1) pages.push(index);
  return pages;
}

/** Navigasi halaman untuk daftar panjang (mis. 700+ kosakata). */
export function Pagination({ page, pageCount, onChange, className }: PaginationProps) {
  if (pageCount <= 1) return null;

  const button =
    "grid h-8 min-w-8 place-items-center rounded-lg border border-border px-2 text-xs font-medium transition-colors";

  return (
    <nav
      className={cn("flex flex-wrap items-center justify-center gap-1", className)}
      aria-label="Navigasi halaman"
    >
      <button
        type="button"
        className={cn(button, "text-fg-muted hover:bg-surface-muted disabled:opacity-40")}
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Halaman sebelumnya"
      >
        ‹
      </button>

      {windowPages(page, pageCount).map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(item)}
          aria-current={item === page ? "page" : undefined}
          className={cn(
            button,
            item === page
              ? "border-accent bg-accent text-white"
              : "bg-surface text-fg-muted hover:bg-surface-muted hover:text-fg",
          )}
        >
          {item}
        </button>
      ))}

      <button
        type="button"
        className={cn(button, "text-fg-muted hover:bg-surface-muted disabled:opacity-40")}
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        aria-label="Halaman berikutnya"
      >
        ›
      </button>
    </nav>
  );
}
