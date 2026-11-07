"use client";

import { useMemo } from "react";
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
  Card,
  CardBody,
  CardFooter,
  CardTitle,
  EmptyState,
  PageHeader,
  ProgressBar,
  Section,
  StatTile,
} from "@manabi/ui";
import { SpeakButton } from "@/components/speak-button";
import { useActiveLevel } from "@/lib/level";

/* ------------------------------------------------------------------ *
 * Konstanta tampilan
 * ------------------------------------------------------------------ */

interface TierMeta {
  key: ParticleTier;
  title: string;
  japanese: string;
  glyph: string;
  /** Ringkasan sebaran untuk kartu statistik. */
  hint: string;
  /** Keterangan seksi. */
  description: string;
}

const TIERS: TierMeta[] = [
  {
    key: "dasar",
    title: "Tingkat dasar",
    japanese: "基本",
    glyph: "基",
    hint: "Topik, subjek, objek, waktu, tempat, dan alat.",
    description:
      "Partikel yang muncul di hampir setiap kalimat: penanda topik, subjek, objek langsung, waktu, tempat, dan alat.",
  },
  {
    key: "inti",
    title: "Tingkat inti",
    japanese: "中心",
    glyph: "心",
    hint: "Arah, kepemilikan, daftar, pertanyaan, dan penegasan.",
    description:
      "Penghubung inti kalimat: arah tujuan, kepemilikan, daftar, “juga”, pertanyaan, dan penegasan di akhir kalimat.",
  },
  {
    key: "menengah",
    title: "Tingkat menengah",
    japanese: "中級",
    glyph: "中",
    hint: "Rentang, perbandingan, batas, dan nuansa akhir kalimat.",
    description:
      "Nuansa yang membuat kalimat terasa alami: rentang waktu, perbandingan, batas, dan partikel akhir kalimat.",
  },
];

/** Tautan bergaya tombol primary (satu-satunya aksi utama di halaman ini). */
const PRIMARY_LINK =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-accent-contrast shadow-soft transition-colors duration-150 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const SECONDARY_LINK =
  "inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-5 text-sm font-medium text-fg transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

/* ------------------------------------------------------------------ *
 * Kartu partikel
 * ------------------------------------------------------------------ */

function ParticleCard({ particle, position }: { particle: Particle; position: number }) {
  return (
    <Card className="flex flex-col">
      <CardBody className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <span
            lang="ja"
            className="font-jp-serif shrink-0 text-[40px] font-semibold leading-none text-fg sm:text-[56px]"
          >
            {particle.char}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="label-micro normal-case">{particle.romaji}</p>
            <CardTitle className="mt-1">{particle.role}</CardTitle>
          </div>
          <span className="label-micro tnum shrink-0" aria-hidden="true">
            {String(position).padStart(2, "0")}
          </span>
        </div>

        <p className="text-body leading-relaxed text-fg">{particle.explanation}</p>

        <div>
          <p className="label-micro mb-2">Contoh</p>
          <ul className="space-y-2">
            {particle.examples.map((example, index) => (
              <li
                key={`${particle.id}-contoh-${index}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p lang="ja" className="font-jp text-base leading-relaxed text-fg">
                    {example.jp}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">{example.id}</p>
                  {example.note ? (
                    <p className="mt-1 text-caption leading-relaxed text-fg-subtle">
                      {example.note}
                    </p>
                  ) : null}
                </div>
                <SpeakButton
                  text={example.jp}
                  className="min-h-11 min-w-11 shrink-0 sm:min-h-0 sm:min-w-0"
                />
              </li>
            ))}
          </ul>
        </div>

        {particle.cautions && particle.cautions.length > 0 ? (
          <div className="mt-auto rounded-lg border border-warning/30 bg-warning-soft px-3 py-2.5">
            <p className="label-micro mb-1 text-warning">Perhatikan</p>
            <ul className="space-y-1 text-caption leading-relaxed text-fg">
              {particle.cautions.map((caution, index) => (
                <li key={`${particle.id}-caution-${index}`}>{caution}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Kartu perbandingan
 * ------------------------------------------------------------------ */

function ComparisonSide({ side }: { side: ParticleComparison["left"] }) {
  return (
    <div className="rounded-lg border border-border px-3.5 py-3">
      <p lang="ja" className="font-jp-serif text-3xl font-semibold leading-none text-fg">
        {side.char}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-fg-muted">{side.summary}</p>
      <ul className="mt-3 space-y-2.5">
        {side.examples.map((example, index) => (
          <li
            key={`${side.particleId}-contoh-${index}`}
            className="flex items-start justify-between gap-2"
          >
            <div className="min-w-0">
              <p lang="ja" className="font-jp text-base leading-relaxed text-fg">
                {example.jp}
              </p>
              <p className="mt-0.5 text-caption leading-relaxed text-fg-muted">{example.id}</p>
            </div>
            <SpeakButton
              text={example.jp}
              className="min-h-11 min-w-11 shrink-0 sm:min-h-0 sm:min-w-0"
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
    <Card className="overflow-hidden">
      <CardBody className="space-y-4 p-4 sm:p-5">
        <div>
          <h3 className="text-h3 font-semibold tracking-tight text-fg">
            {rightTitle ? (
              <>
                <span lang="ja" className="font-jp-serif">
                  {leftTitle}
                </span>
                <span className="mx-2 align-middle text-caption font-normal text-fg-subtle">
                  vs
                </span>
                <span lang="ja" className="font-jp-serif">
                  {rightTitle}
                </span>
              </>
            ) : (
              pair.title
            )}
          </h3>
          <p className="mt-1 text-sm leading-relaxed text-fg-muted">{pair.question}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ComparisonSide side={pair.left} />
          <ComparisonSide side={pair.right} />
        </div>
      </CardBody>
      <CardFooter className="bg-surface-muted/60">
        <div className="min-w-0">
          <p className="label-micro">Pegangan</p>
          <p className="mt-1 text-sm leading-relaxed text-fg">{pair.takeaway}</p>
        </div>
      </CardFooter>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Kartu jebakan
 * ------------------------------------------------------------------ */

function PitfallCard({ pitfall }: { pitfall: ParticlePitfall }) {
  return (
    <Card>
      <CardBody className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle>{pitfall.title}</CardTitle>
            <p className="mt-1 text-sm leading-relaxed text-fg-muted">{pitfall.summary}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-1.5">
            {pitfall.particles.map((char) => (
              <Badge key={char} tone="outline" mono lang="ja">
                {char}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-danger/30 bg-danger-soft px-3.5 py-3">
            <p className="label-micro text-danger">Salah</p>
            <p lang="ja" className="mt-1.5 font-jp text-base leading-relaxed text-danger">
              {pitfall.wrong.jp}
            </p>
            <p className="mt-1 text-caption leading-relaxed text-fg-muted">{pitfall.wrong.id}</p>
          </div>
          <div className="rounded-lg border border-success/30 bg-success-soft px-3.5 py-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="label-micro text-success">Benar</p>
                <p lang="ja" className="mt-1.5 font-jp text-base leading-relaxed text-success">
                  {pitfall.right.jp}
                </p>
                <p className="mt-1 text-caption leading-relaxed text-fg-muted">
                  {pitfall.right.id}
                </p>
              </div>
              <SpeakButton
                text={pitfall.right.jp}
                className="min-h-11 min-w-11 shrink-0 sm:min-h-0 sm:min-w-0"
              />
            </div>
          </div>
        </div>

        <p className="text-caption leading-relaxed text-fg-subtle">
          <span className="font-medium text-fg-muted">Catatan: </span>
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

  const pool = useMemo(() => particlesByLevel(level), [level]);
  const comparisons = useMemo(() => particleComparisonsByLevel(level), [level]);
  const levelChars = useMemo(() => new Set(pool.map((item) => item.char)), [pool]);
  const pitfalls = useMemo(
    () => particlePitfallsN5.filter((pitfall) => pitfall.particles.some((char) => levelChars.has(char))),
    [levelChars],
  );

  const tierCounts = useMemo(() => {
    const counts: Record<ParticleTier, number> = { dasar: 0, inti: 0, menengah: 0 };
    for (const particle of pool) counts[particle.tier] += 1;
    return counts;
  }, [pool]);

  const fallbackLevel = availableLevels[0] ?? level;
  const hasParticles = pool.length > 0;

  const header = (
    <PageHeader
      eyebrow={
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="level" mono>
            {meta.label}
          </Badge>
          <span className="label-micro">{meta.name} · Partikel</span>
        </div>
      }
      title="Partikel"
      japanese="助詞"
      description={
        hasParticles
          ? `${pool.length} partikel ${meta.label} — dari penanda topik sampai nuansa akhir kalimat, lengkap dengan contoh, pasangan pembanding, dan jebakan yang sering terjadi.`
          : `Materi partikel ${meta.label} sedang disusun.`
      }
      actions={
        hasParticles ? (
          <Link href={levelHref(level, "partikel/latihan")} className={PRIMARY_LINK}>
            Latihan partikel
            <span aria-hidden="true">→</span>
          </Link>
        ) : undefined
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
    <div className="space-y-8 pb-8 md:space-y-10">
      {header}

      {/* ---------- Ringkasan ---------- */}
      <Section
        title="Ringkasan"
        glyph="助"
        description="Jumlah partikel dan sebarannya menurut tingkat pemakaian."
      >
        <div className="grid gap-3 lg:grid-cols-3">
          <StatTile
            tone="level"
            label={`Partikel ${meta.label}`}
            value={pool.length}
            unit="partikel"
            glyph="助"
            hint={`${comparisons.length} pasangan tertukar · ${pitfalls.length} jebakan khusus`}
          />
          <Card className="lg:col-span-2">
            <CardBody className="space-y-3.5">
              {TIERS.map((tier) => (
                <div key={tier.key}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-caption font-medium text-fg">
                      {tier.title}
                      <span lang="ja" className="font-jp ml-1.5 font-normal text-fg-subtle">
                        {tier.japanese}
                      </span>
                    </p>
                    <p className="tnum text-caption text-fg-muted">
                      {tierCounts[tier.key]} dari {pool.length}
                    </p>
                  </div>
                  <ProgressBar
                    className="mt-1.5"
                    value={tierCounts[tier.key]}
                    max={pool.length}
                    tone="level"
                    aria-label={`${tier.title}: ${tierCounts[tier.key]} dari ${pool.length} partikel`}
                  />
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </Section>

      {/* ---------- Daftar per tingkat ---------- */}
      {TIERS.map((tier) => {
        const items = pool.filter((particle) => particle.tier === tier.key);
        if (items.length === 0) return null;

        return (
          <Section
            key={tier.key}
            glyph={tier.glyph}
            title={
              <span className="flex items-baseline gap-2">
                {tier.title}
                <span lang="ja" className="font-jp text-caption font-normal text-fg-subtle">
                  {tier.japanese}
                </span>
              </span>
            }
            description={tier.description}
            action={<span className="label-micro">{items.length} partikel</span>}
          >
            <div className="grid gap-4 xl:grid-cols-2">
              {items.map((particle, index) => (
                <ParticleCard key={particle.id} particle={particle} position={index + 1} />
              ))}
            </div>
          </Section>
        );
      })}

      {/* ---------- Sering tertukar ---------- */}
      {comparisons.length > 0 ? (
        <Section
          glyph="混"
          title="Sering tertukar"
          description={`${comparisons.length} pasangan yang paling sering membingungkan, lengkap dengan pertanyaan pembeda dan contoh.`}
        >
          <div className="space-y-4">
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
          title="Jebakan khusus"
          description="Kesalahan yang paling sering muncul, ditampilkan berdampingan antara bentuk salah dan bentuk benar."
        >
          <div className="space-y-4">
            {pitfalls.map((pitfall) => (
              <PitfallCard key={pitfall.id} pitfall={pitfall} />
            ))}
          </div>
        </Section>
      ) : null}
    </div>
  );
}
