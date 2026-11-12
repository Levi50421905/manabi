"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  availableLevels,
  levelHref,
  levelMeta,
  particleComparisonsByLevel,
  particlePitfallsN5,
  particlesByLevel,
  type Particle,
  type ParticleComparison,
  type ParticlePitfall,
  type ParticleTier,
} from "@manabi/content";
import {
  Badge,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  EmptyState,
  PageHeader,
  Pill,
  Section,
  cn,
} from "@manabi/ui";
import { SpeakButton } from "@/components/speak-button";
import { useActiveLevel } from "@/lib/level";
import { useProgress } from "@/lib/store";

/* ------------------------------------------------------------------ *
 * Konstanta tampilan
 * ------------------------------------------------------------------ */

interface TierMeta {
  key: ParticleTier;
  /** Label pendek untuk chip filter. */
  label: string;
  /** Warna kotak karakter — dasar matcha, inti kuning, menengah biru. */
  swatch: string;
}

const TIERS: TierMeta[] = [
  { key: "dasar", label: "Dasar", swatch: "bg-accent-soft" },
  { key: "inti", label: "Inti", swatch: "bg-sun-soft" },
  { key: "menengah", label: "Menengah", swatch: "bg-sky-soft" },
];

const TIER_BY_KEY = Object.fromEntries(TIERS.map((tier) => [tier.key, tier])) as Record<
  ParticleTier,
  TierMeta
>;

type TierFilter = "semua" | ParticleTier;

const FILTERS: Array<{ key: TierFilter; label: string }> = [
  { key: "semua", label: "Semua" },
  ...TIERS.map((tier) => ({ key: tier.key as TierFilter, label: tier.label })),
];

/** Tautan bergaya tombol primary (satu-satunya aksi utama di halaman ini). */
const PRIMARY_LINK =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-contrast shadow-soft transition-colors duration-150 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const SECONDARY_LINK =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface px-5 text-sm font-semibold text-fg transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

/* ------------------------------------------------------------------ *
 * Chip ringkasan header
 * ------------------------------------------------------------------ */

function SummaryChip({ value, label }: { value: string; label: string }) {
  return (
    <Badge
      tone="outline"
      className="rounded-full border-border bg-surface px-3 py-1.5 text-caption font-semibold text-fg-muted shadow-soft"
    >
      <span className="tnum font-extrabold text-fg">{value}</span>
      {label}
    </Badge>
  );
}

/* ------------------------------------------------------------------ *
 * Kartu partikel
 * ------------------------------------------------------------------ */

function ParticleCard({ particle }: { particle: Particle }) {
  const tier = TIER_BY_KEY[particle.tier];
  const examples = particle.examples.slice(0, 2);

  return (
    <Card className="flex min-w-0 flex-col rounded-2xl">
      <CardBody className="flex flex-1 flex-col gap-3.5 p-4 sm:p-5">
        <div className="flex items-center gap-3.5">
          <span
            lang="ja"
            aria-hidden="true"
            className={cn(
              "jp-serif grid h-20 w-20 shrink-0 place-items-center rounded-[1.35rem] font-bold leading-none text-fg",
              particle.char.length > 1 ? "text-[32px]" : "text-[52px]",
              tier.swatch,
            )}
          >
            {particle.char}
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-base font-extrabold tracking-wide text-fg">
              {particle.romaji}
              <Badge tone="neutral" className="rounded-full px-2 py-0.5 text-caption font-semibold">
                {tier.label}
              </Badge>
            </p>
            <p className="mt-1 text-sm leading-snug text-fg-muted">{particle.role}</p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-fg">{particle.explanation}</p>

        <div className="space-y-2">
          <p className="label-micro">Contoh</p>
          {examples.map((example, index) => (
            <div
              key={`${particle.id}-contoh-${index}`}
              className="flex items-start justify-between gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2.5"
            >
              <div className="min-w-0">
                <p lang="ja" className="jp text-base font-medium leading-relaxed text-fg">
                  {example.jp}
                </p>
                <p className="mt-0.5 text-caption leading-relaxed text-fg-muted">{example.id}</p>
                {example.note ? (
                  <p className="mt-1 border-t border-dashed border-border pt-1 text-caption leading-relaxed text-fg-subtle">
                    {example.note}
                  </p>
                ) : null}
              </div>
              <SpeakButton
                text={example.jp}
                className="min-h-11 min-w-11 shrink-0"
              />
            </div>
          ))}
        </div>

        {particle.cautions && particle.cautions.length > 0 ? (
          <Callout tone="warning" title="Perhatikan" className="mt-auto rounded-xl">
            <ul className="space-y-1">
              {particle.cautions.map((caution, index) => (
                <li key={`${particle.id}-caution-${index}`}>{caution}</li>
              ))}
            </ul>
          </Callout>
        ) : null}
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Pasangan yang sering tertukar
 * ------------------------------------------------------------------ */

function ComparisonSide({ side }: { side: ParticleComparison["left"] }) {
  return (
    <div className="flex h-full min-w-0 flex-col rounded-xl border border-border bg-surface-muted px-3.5 py-3">
      <p lang="ja" className="jp-serif text-3xl font-bold leading-none text-fg">
        {side.char}
      </p>
      <p className="mt-2 text-caption leading-relaxed text-fg-muted">{side.summary}</p>
      <ul className="mt-3 space-y-2.5">
        {side.examples.slice(0, 2).map((example, index) => (
          <li
            key={`${side.particleId}-contoh-${index}`}
            className="flex items-start justify-between gap-2"
          >
            <div className="min-w-0">
              <p lang="ja" className="jp text-sm font-medium leading-relaxed text-fg">
                {example.jp}
              </p>
              <p className="mt-0.5 text-caption leading-relaxed text-fg-muted">{example.id}</p>
            </div>
            <SpeakButton
              text={example.jp}
              className="min-h-11 min-w-11 shrink-0"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function ComparisonCard({ pair }: { pair: ParticleComparison }) {
  // Judul data berbentuk "は vs が" — pisahkan agar tiap partikel memakai font Jepang.
  const [leftTitle, rightTitle] = pair.title.split(" vs ");

  return (
    <Card className="flex h-full flex-col rounded-2xl">
      <CardBody className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div>
          <h3 className="text-h3 font-bold tracking-tight text-fg">
            {rightTitle ? (
              <>
                <span lang="ja" className="jp-serif">
                  {leftTitle}
                </span>
                <span className="mx-2 align-middle text-caption font-normal text-fg-subtle">vs</span>
                <span lang="ja" className="jp-serif">
                  {rightTitle}
                </span>
              </>
            ) : (
              pair.title
            )}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">{pair.question}</p>
        </div>

        <div className="grid flex-1 gap-3 sm:grid-cols-2">
          <ComparisonSide side={pair.left} />
          <ComparisonSide side={pair.right} />
        </div>
      </CardBody>
      <CardFooter className="rounded-b-2xl bg-accent-soft/60">
        <div className="flex min-w-0 gap-2">
          <span lang="ja" aria-hidden="true" className="jp shrink-0 text-sm text-accent">
            要
          </span>
          <div>
            <p className="label-micro text-accent">Pegangan</p>
            <p className="mt-1 text-sm leading-relaxed text-fg">{pair.takeaway}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Jebakan khusus
 * ------------------------------------------------------------------ */

function PitfallCard({ pitfall }: { pitfall: ParticlePitfall }) {
  return (
    <Card className="h-full rounded-2xl">
      <CardBody className="flex h-full flex-col gap-3.5 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle>{pitfall.title}</CardTitle>
            <p className="mt-1 text-sm leading-relaxed text-fg-muted">{pitfall.summary}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            {pitfall.particles.map((char) => (
              <Badge key={char} tone="outline" mono lang="ja" className="rounded-full">
                {char}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-2.5">
          <div className="rounded-xl border border-danger/30 bg-danger-soft px-3 py-2.5">
            <p className="label-micro flex items-center gap-1.5 text-danger">
              <span aria-hidden="true">✕</span> Salah
            </p>
            <p lang="ja" className="jp mt-1.5 text-sm font-medium leading-relaxed text-danger">
              {pitfall.wrong.jp}
            </p>
            <p className="mt-1 text-caption leading-relaxed text-fg-muted">{pitfall.wrong.id}</p>
          </div>
          <div className="rounded-xl border border-success/30 bg-success-soft px-3 py-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="label-micro flex items-center gap-1.5 text-success">
                  <span aria-hidden="true">✓</span> Benar
                </p>
                <p lang="ja" className="jp mt-1.5 text-sm font-medium leading-relaxed text-success">
                  {pitfall.right.jp}
                </p>
                <p className="mt-1 text-caption leading-relaxed text-fg-muted">
                  {pitfall.right.id}
                </p>
              </div>
              <SpeakButton
                text={pitfall.right.jp}
                className="min-h-11 min-w-11 shrink-0"
              />
            </div>
          </div>
        </div>

        <p className="mt-auto border-t border-dashed border-border pt-2.5 text-caption leading-relaxed text-fg-subtle">
          <span className="font-semibold text-fg-muted">Catatan: </span>
          {pitfall.note}
        </p>
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Halaman
 * ------------------------------------------------------------------ */

export default function PartikelPage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);
  const progress = useProgress();

  const [filter, setFilter] = useState<TierFilter>("semua");

  const pool = useMemo(() => particlesByLevel(level), [level]);
  const comparisons = useMemo(() => particleComparisonsByLevel(level), [level]);
  const levelChars = useMemo(() => new Set(pool.map((item) => item.char)), [pool]);
  const pitfalls = useMemo(
    () =>
      particlePitfallsN5.filter((pitfall) => pitfall.particles.some((char) => levelChars.has(char))),
    [levelChars],
  );

  const tierCounts = useMemo(() => {
    const counts: Record<ParticleTier, number> = { dasar: 0, inti: 0, menengah: 0 };
    for (const particle of pool) counts[particle.tier] += 1;
    return counts;
  }, [pool]);

  /** Partikel yang sudah pernah diulas lewat kartu konteks (SRS). */
  const reviewedCount = useMemo(
    () =>
      pool.filter((particle) => Boolean(progress.cards[`ctx:partikel:${particle.id}`])).length,
    [pool, progress.cards],
  );

  const visible = useMemo(
    () => (filter === "semua" ? pool : pool.filter((particle) => particle.tier === filter)),
    [pool, filter],
  );

  const fallbackLevel = availableLevels[0] ?? level;
  const hasParticles = pool.length > 0;

  const filterHint =
    filter === "semua"
      ? `Menampilkan ${pool.length} partikel.`
      : `Menampilkan ${tierCounts[filter]} partikel ${TIER_BY_KEY[filter].label.toLowerCase()}.`;

  const header = (
    <PageHeader
      eyebrow={
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="level" mono>
            {meta.label}
          </Badge>
          <span className="label-micro">{meta.name} · Partikel</span>
          <span lang="ja" className="jp text-caption font-normal text-fg-subtle">
            助詞
          </span>
        </div>
      }
      title="Partikel"
      japanese="助"
      description={
        hasParticles
          ? `${pool.length} partikel inti ${meta.label}. Mulai dari yang paling sering muncul, kenali pasangannya, lalu perhatikan jebakannya.`
          : `Materi partikel ${meta.label} sedang disusun.`
      }
    />
  );

  /* ---------- Keadaan kosong ---------- */
  if (!hasParticles) {
    return (
      <div className="space-y-8 pb-8 md:space-y-10">
        {header}
        <EmptyState
          glyph="助"
          title={`Partikel ${meta.label} belum tersedia`}
          description={`Materi ${meta.name} sedang disusun. Sementara ini kamu bisa mempelajari partikel dasar di level ${levelMeta(fallbackLevel).label}.`}
          action={
            <Link href={levelHref(fallbackLevel, "partikel")} className={SECONDARY_LINK}>
              Ke Partikel {levelMeta(fallbackLevel).label}
              <span aria-hidden="true">→</span>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 md:space-y-10">
      {header}

      {/* ---------- Chip ringkasan ---------- */}
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Ringkasan partikel">
        <SummaryChip value={String(pool.length)} label="partikel" />
        <SummaryChip value={String(comparisons.length)} label="pasangan" />
        <SummaryChip value={String(pitfalls.length)} label="jebakan" />
        <SummaryChip value={`${reviewedCount}/${pool.length}`} label="diulas" />
      </div>

      {/* ---------- Filter tingkat ---------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter tingkat partikel"
        >
          {FILTERS.map((item) => {
            const active = filter === item.key;
            const count = item.key === "semua" ? pool.length : tierCounts[item.key];
            return (
              <Pill
                key={item.key}
                active={active}
                onClick={() => setFilter(item.key)}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm font-semibold",
                  active
                    ? "bg-accent text-accent-contrast hover:bg-accent-strong"
                    : "bg-surface hover:border-border-strong",
                )}
              >
                {item.label}
                <span
                  className={cn(
                    "tnum rounded-full px-1.5 py-0.5 text-caption font-bold leading-none",
                    active
                      ? "bg-accent-contrast/20 text-accent-contrast"
                      : "bg-surface-muted text-fg-muted",
                  )}
                >
                  {count}
                </span>
              </Pill>
            );
          })}
        </div>
        <p className="text-caption font-semibold text-fg-muted" aria-live="polite">
          {filterHint}
        </p>
      </div>

      {/* ---------- Grid kartu partikel ---------- */}
      {visible.length === 0 ? (
        <EmptyState
          glyph="助"
          title="Tidak ada partikel di tingkat ini"
          description="Coba pilih tingkat lain atau kembali ke daftar lengkap."
          action={
            <button type="button" onClick={() => setFilter("semua")} className={SECONDARY_LINK}>
              Lihat semua partikel
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((particle) => (
            <ParticleCard key={particle.id} particle={particle} />
          ))}
        </div>
      )}

      {/* ---------- Sering tertukar ---------- */}
      {comparisons.length > 0 ? (
        <Section
          glyph="混"
          title="Sering tertukar"
          description={`${comparisons.length} pasangan yang paling sering bikin ragu — lengkap dengan pertanyaan pembeda, contoh, dan pegangan singkat.`}
          action={<SummaryChip value={String(comparisons.length)} label="pasangan" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {comparisons.map((pair) => (
              <ComparisonCard key={pair.id} pair={pair} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ---------- Jebakan khusus ---------- */}
      {pitfalls.length > 0 ? (
        <Section
          glyph="注"
          title="Jebakan yang perlu diingat"
          description={`Sumber kesalahan paling umum di ${meta.label}, ditampilkan berdampingan antara bentuk salah dan bentuk benar.`}
          action={<SummaryChip value={String(pitfalls.length)} label="jebakan" />}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {pitfalls.map((pitfall) => (
              <PitfallCard key={pitfall.id} pitfall={pitfall} />
            ))}
          </div>
        </Section>
      ) : null}

      {/* ---------- Ajakan latihan ---------- */}
      <Card className="overflow-hidden rounded-2xl border-border bg-gradient-to-br from-accent-soft to-sun-soft">
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0">
            <h2 className="font-display text-h2 font-semibold tracking-tight text-fg">
              Sudah membaca {pool.length} partikel?
            </h2>
            <p className="mt-1 max-w-[46ch] text-sm leading-relaxed text-fg-muted">
              Kerjakan soal partikel, atau sepuluh soal campuran dari Bank Soal.
            </p>
          </div>
          <Link href={levelHref(level, "partikel/latihan")} className={PRIMARY_LINK}>
            Mulai latihan partikel
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </Card>
    </div>
  );
}
