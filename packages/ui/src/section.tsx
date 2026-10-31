import * as React from "react";
import { cn } from "./cn";

export interface SectionProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Judul seksi. */
  title?: React.ReactNode;
  /** Keterangan singkat di bawah judul. */
  description?: React.ReactNode;
  /** Aksi di kanan judul (link "lihat semua", tombol). */
  action?: React.ReactNode;
  /** Glyph kanji kecil di depan judul. */
  glyph?: string;
  children?: React.ReactNode;
}

/**
 * Blok konten bertajuk. Memakai jarak dan hierarki judul yang sama di seluruh
 * aplikasi supaya halaman terasa satu produk.
 */
export function Section({
  title,
  description,
  action,
  glyph,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section className={cn("min-w-0", className)} {...props}>
      {title || action ? (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="flex items-baseline gap-2 font-display text-h2 font-semibold tracking-tight text-fg">
              {glyph ? (
                <span lang="ja" className="jp text-sm font-normal text-fg-subtle" aria-hidden="true">
                  {glyph}
                </span>
              ) : null}
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">{description}</p>
            ) : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
