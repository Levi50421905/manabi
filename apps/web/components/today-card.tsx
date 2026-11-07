"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge, cn } from "@manabi/ui";
import { levelClassName } from "@manabi/content";
import type { DailyCard } from "@/lib/daily-card";

/**
 * Kartu hari ini di beranda.
 *
 * Pemilihan item dilakukan di server (`lib/daily-card.ts`) dari tanggal lokal,
 * lalu hasilnya dikirim ke komponen klien ini. Dengan begitu HTML pertama sudah
 * memuat kartu yang benar (tidak berkedip saat hidrasi) dan tombol "Acak"
 * cukup memutar indeks kandidat hari itu — bukan memilih acak dari seluruh
 * katalog.
 */
export function TodayCard({ cards }: { cards: DailyCard[] }) {
  const [index, setIndex] = useState(0);

  if (cards.length === 0) return null;

  const card = cards[index] ?? cards[0];
  const next = () => setIndex((current) => (current + 1) % cards.length);

  const glyphClass =
    card.kind === "tata-bahasa"
      ? "jp text-2xl font-semibold leading-snug text-fg sm:text-3xl"
      : card.kind === "kosakata"
        ? "jp-serif text-6xl font-semibold leading-none text-fg"
        : "jp-serif text-7xl font-semibold leading-none text-fg";

  return (
    <div className={cn(levelClassName(card.level), "rounded-2xl border border-border bg-surface p-1 shadow-lifted")}>
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <span className="text-caption font-semibold uppercase tracking-[0.12em] text-fg-muted">
          Kartu hari ini
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={next}
            aria-label="Tampilkan kartu lain dari hari ini"
            className="inline-flex h-11 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-caption font-semibold text-fg-muted transition-colors hover:border-border-strong hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            <span aria-hidden="true" className="text-sm leading-none">
              ↻
            </span>
            Acak
          </button>
          <Badge tone="level" mono>
            {card.level}
          </Badge>
        </div>
      </div>

      <div className="mx-1 grid min-h-[164px] place-items-center rounded-xl border border-border bg-surface-muted px-4 py-8">
        <div className="text-center">
          <span lang="ja" className={glyphClass}>
            {card.glyph}
          </span>
          <span className="mt-3 block text-caption text-fg-muted">{card.moduleLabel}</span>
        </div>
      </div>

      <div className="px-4 py-4">
        <p className="sr-only" aria-live="polite">
          {`Kartu ${index + 1} dari ${cards.length}: ${card.moduleLabel} — ${card.title}`}
        </p>

        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            {card.reading || card.romaji ? (
              <>
                <p
                  lang={card.reading ? "ja" : undefined}
                  className={cn("text-sm font-medium text-fg", card.reading && "jp")}
                >
                  {card.reading}
                  {card.romaji ? (
                    <span className={cn("ml-2 text-fg-muted", card.reading && "jp")} lang="id">
                      {card.romaji}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-caption text-fg-muted">{card.title}</p>
              </>
            ) : (
              <p className="text-sm font-semibold leading-snug text-fg">{card.title}</p>
            )}
          </div>
          <span className="max-w-[45%] shrink-0 text-right text-caption leading-snug text-fg-muted">
            {card.meta}
          </span>
        </div>

        <p className="mt-3 border-t border-border pt-3 text-caption leading-relaxed text-fg-muted">
          {card.note}
        </p>

        <Link
          href={card.href}
          className="mt-3 inline-flex min-h-11 items-center gap-1 rounded-lg text-caption font-semibold text-level underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
        >
          Buka modul {card.moduleLabel}
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  );
}
