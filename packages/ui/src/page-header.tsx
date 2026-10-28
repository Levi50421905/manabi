import * as React from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  /** Tombol aksi di kanan (biasanya <Button>). */
  actions?: React.ReactNode;
  /** Badge/label kecil di atas judul. */
  eyebrow?: React.ReactNode;
  className?: string;
}

/** Judul halaman standar: satu tempat untuk ukuran, jarak, dan hierarki. */
export function PageHeader({ title, description, actions, eyebrow, className }: PageHeaderProps) {
  return (
    <header className={`flex flex-wrap items-end justify-between gap-3 ${className ?? ""}`}>
      <div className="min-w-0">
        {eyebrow ? <div className="mb-2">{eyebrow}</div> : null}
        <h1 className="text-2xl font-bold tracking-tight text-fg">{title}</h1>
        {description ? <p className="mt-1 text-sm text-fg-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
