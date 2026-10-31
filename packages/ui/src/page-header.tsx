import * as React from "react";
import { cn } from "./cn";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Tombol aksi di kanan (biasanya <Button>). */
  actions?: React.ReactNode;
  /** Label kecil di atas judul, mis. "N5 · Kosakata". */
  eyebrow?: React.ReactNode;
  /** Judul Jepang pendamping, ditampilkan samar di samping judul. */
  japanese?: string;
  className?: string;
}

/**
 * Judul halaman standar: satu tempat untuk ukuran, jarak, dan hierarki.
 * Semua halaman modul memakai komponen ini agar ritmenya sama.
 */
export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
  japanese,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2.5">{eyebrow}</div> : null}
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-h1 font-semibold tracking-tight text-fg">{title}</h1>
          {japanese ? (
            <span lang="ja" className="jp-serif text-sm text-fg-subtle" aria-hidden="true">
              {japanese}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-fg-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
