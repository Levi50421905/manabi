"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  PageHeader,
  Section,
  SegmentedControl,
  cn,
} from "@manabi/ui";
import { levelHref, levelMeta, type ParticleQuizMode } from "@manabi/content";
import { ParticleRunner } from "@/components/particle-runner";
import {
  PARTICLE_MODE_HINT,
  PARTICLE_MODE_LABEL,
  buildParticleQuestions,
  particleQuestionCounts,
  type ParticleQuizItem,
} from "@/lib/partikel";
import { useActiveLevel } from "@/lib/level";

const PARTICLE_MODES: ParticleQuizMode[] = [
  "isi-celah",
  "ketik",
  "fungsi",
  "pasangan",
  "lengkapi-teks",
];

const MODE_GLYPH: Record<ParticleQuizMode, string> = {
  "isi-celah": "は",
  ketik: "書",
  fungsi: "役",
  pasangan: "対",
  "lengkapi-teks": "文",
};

const COUNTS = [10, 20, 30];

export default function ParticlePracticePage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);

  const counts = useMemo(() => particleQuestionCounts(level), [level]);

  const [modes, setModes] = useState<ParticleQuizMode[]>(PARTICLE_MODES);
  const [count, setCount] = useState(10);
  const [label, setLabel] = useState("");
  const [items, setItems] = useState<ParticleQuizItem[] | null>(null);

  const activeModes = modes.filter((mode) => counts[mode] > 0);
  const availableTotal = activeModes.reduce((sum, mode) => sum + counts[mode], 0);
  const effectiveCount = Math.min(count, availableTotal);

  function toggleMode(mode: ParticleQuizMode) {
    if (counts[mode] === 0) return;
    setModes((previous) =>
      previous.includes(mode)
        ? previous.filter((item) => item !== mode)
        : [...previous, mode],
    );
  }

  function start() {
    const selected = modes.filter((mode) => counts[mode] > 0);
    const amount = Math.min(
      count,
      selected.reduce((sum, mode) => sum + counts[mode], 0),
    );
    const modeLabel =
      selected.length === 1 ? ` ${PARTICLE_MODE_LABEL[selected[0]!]}` : "";
    const nextLabel = `Latihan partikel${modeLabel} · ${level}`;

    setLabel(nextLabel);
    setItems(buildParticleQuestions(level, selected, amount));
    window.scrollTo({ top: 0 });
  }

  /* ---------------- sesi latihan ---------------- */
  if (items) {
    return (
      <div className="space-y-6 pb-8">
        <PageHeader
          eyebrow={
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="level" mono>
                {level}
              </Badge>
              <span className="label-micro">{meta.name} · Partikel</span>
            </div>
          }
          title="Latihan Partikel"
          japanese="助詞"
          description={label}
        />
        <ParticleRunner
          items={items}
          label={label}
          onDone={() => {
            setItems(null);
            window.scrollTo({ top: 0 });
          }}
          onRestart={start}
        />
      </div>
    );
  }

  /* ---------------- layar penyiapan ---------------- */
  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">{meta.name} · Partikel</span>
          </div>
        }
        title="Latihan Partikel"
        japanese="助詞"
        description={`Pilih satu atau lebih bentuk soal, lalu kerjakan sesi singkat dari bank soal partikel ${level}.`}
        actions={
          <Link href={levelHref(level, "partikel")}>
            <Button variant="outline">Materi partikel</Button>
          </Link>
        }
      />

      <Section
        title="Pilih mode"
        glyph="助"
        description="Boleh lebih dari satu — soal diacak dari mode yang dipilih."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Mode latihan partikel">
          {PARTICLE_MODES.map((mode) => {
            const selected = modes.includes(mode);
            const available = counts[mode];
            const disabled = available === 0;

            return (
              <button
                key={mode}
                type="button"
                aria-pressed={selected && !disabled}
                disabled={disabled}
                onClick={() => toggleMode(mode)}
                className={cn(
                  "group flex h-full w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  selected && !disabled
                    ? "border-level/45 bg-level-soft"
                    : "border-border bg-surface hover:border-border-strong",
                )}
              >
                <span className="flex w-full items-start justify-between gap-3">
                  <span
                    lang="ja"
                    aria-hidden="true"
                    className={cn(
                      "jp-serif grid h-10 w-10 place-items-center rounded-lg text-base font-semibold transition-colors",
                      selected && !disabled
                        ? "bg-level text-level-contrast"
                        : "bg-surface-muted text-fg-subtle",
                    )}
                  >
                    {MODE_GLYPH[mode]}
                  </span>
                  {disabled ? (
                    <span className="text-caption text-fg-subtle">Belum tersedia</span>
                  ) : selected ? (
                    <Badge tone="level">Dipilih</Badge>
                  ) : (
                    <span className="tnum text-caption text-fg-subtle">{available} soal</span>
                  )}
                </span>
                <span className="text-h3 font-semibold text-fg">{PARTICLE_MODE_LABEL[mode]}</span>
                <span className="text-caption leading-relaxed text-fg-muted">
                  {PARTICLE_MODE_HINT[mode]}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Jumlah soal" glyph="数" description="Dibatasi oleh jumlah soal yang tersedia.">
        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-h3 font-semibold text-fg">Soal per sesi</p>
              <Badge tone="neutral" mono>
                {effectiveCount} soal
              </Badge>
            </div>
            <SegmentedControl
              className="mt-3"
              block
              ariaLabel="Jumlah soal"
              value={count}
              onChange={setCount}
              options={COUNTS.map((value) => ({ value, label: String(value) }))}
            />
            <p className="mt-2.5 text-caption leading-relaxed text-fg-muted">
              {activeModes.length === 0
                ? "Belum ada mode yang dipilih."
                : availableTotal < count
                  ? `Mode terpilih menyediakan ${availableTotal} soal, jadi sesi berisi ${effectiveCount} soal.`
                  : `Sesi berisi ${effectiveCount} soal dari ${activeModes.length} mode terpilih.`}
            </p>
          </CardBody>
        </Card>
      </Section>

      <Card variant="muted">
        <CardBody className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="label-micro">Siap mulai</p>
            <p className="mt-1.5 text-body font-semibold text-fg">
              {activeModes.length} mode · {effectiveCount} soal
            </p>
            <p className="mt-0.5 text-caption leading-relaxed text-fg-muted">
              {activeModes.length === 0
                ? "Pilih minimal satu mode."
                : activeModes.map((mode) => PARTICLE_MODE_LABEL[mode]).join(", ")}
            </p>
          </div>
          <Button
            size="lg"
            onClick={start}
            disabled={activeModes.length === 0 || availableTotal === 0}
            className="w-full sm:w-auto"
          >
            Mulai latihan
          </Button>
        </CardBody>
      </Card>

      <Callout tone="info" title="Cara menjawab">
        <p className="text-caption leading-relaxed text-fg-muted">
          Pilihan ganda: tekan <span className="tnum font-semibold text-fg">1–4</span> lalu{" "}
          <span className="tnum font-semibold text-fg">Enter</span>. Mode ketik: tulis kana atau
          romaji lalu Enter. Mode lengkapi teks: isi semua celah, lalu periksa jawaban.
        </p>
      </Callout>
    </div>
  );
}
