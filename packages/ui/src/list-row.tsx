import * as React from "react";
import { cn } from "./cn";

export interface ListRowProps {
  /** Glyph kanji/kana di kiri, mis. "学". */
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  /** Jika diisi, baris dirender sebagai <a> melalui `renderLink`. */
  href?: string;
  className?: string;
  onClick?: () => void;
}

/** Kerangka baris daftar standar: leading · judul/subjudul · trailing. */
export function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  href,
  className,
  onClick,
}: ListRowProps) {
  const content = (
    <>
      {leading ? (
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-muted text-sm font-semibold text-fg-muted transition-colors group-hover:bg-level-soft group-hover:text-level">
          {leading}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-fg">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-caption text-fg-muted">{subtitle}</span>
        ) : null}
      </span>
      {trailing ? <span className="shrink-0">{trailing}</span> : null}
    </>
  );

  const shared =
    "group flex w-full items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5 text-left transition-colors duration-150 hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1";

  if (href) {
    return (
      <a href={href} className={cn(shared, className)}>
        {content}
      </a>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(shared, className)}>
        {content}
      </button>
    );
  }

  return <div className={cn(shared, className)}>{content}</div>;
}
