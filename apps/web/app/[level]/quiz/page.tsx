"use client";

import { useState } from "react";
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
import { grammarByLevel, kana, kanjiByLevel, levelHref, levelMeta, vocabByLevel } from "@manabi/content";
import { QuizRunner } from "@/components/quiz-runner";
import {
  buildGrammarQuestions,
  buildKanaQuestions,
  buildKanjiQuestions,
  buildVocabQuestions,
  shuffle,
  type Question,
} from "@/lib/quiz";
import { useActiveLevel } from "@/lib/level";

type QuizMode = "campuran" | "kosakata" | "kana" | "kanji" | "tata-bahasa";

interface ModeOption {
  key: QuizMode;
  title: string;
  japanese: string;
  glyph: string;
  description: string;
}

const MODES: ModeOption[] = [
  {
    key: "campuran",
    title: "Campuran",
    japanese: "混合",
    glyph: "問",
    description: "Kana, kosakata, kanji, dan tata bahasa dalam satu sesi.",
  },
  {
    key: "kosakata",
    title: "Kosakata",
    japanese: "語彙",
    glyph: "語",
    description: "Tentukan arti kata dari kanji atau kana yang muncul.",
  },
  {
    key: "kana",
    title: "Kana",
    japanese: "かな",
    glyph: "あ",
    description: "Baca hiragana & katakana dua arah: huruf ke romaji dan sebaliknya.",
  },
  {
    key: "kanji",
    title: "Kanji",
    japanese: "漢字",
    glyph: "漢",
    description: "Kenali arti kanji dari bentuk, goresan, dan radikalnya.",
  },
  {
    key: "tata-bahasa",
    title: "Tata Bahasa",
    japanese: "文法",
    glyph: "文",
    description: "Pilih pola yang dipakai pada kalimat contoh.",
  },
];

const COUNTS = [10, 20, 30];

export default function QuizPage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);

  const vocabPool = vocabByLevel(level);
  const kanjiPool = kanjiByLevel(level);
  const grammarPool = grammarByLevel(level);

  const [mode, setMode] = useState<QuizMode>("campuran");
  const [count, setCount] = useState(10);
  const [label, setLabel] = useState("");
  const [questions, setQuestions] = useState<Question[] | null>(null);

  const modeInfo = MODES.find((item) => item.key === mode) ?? MODES[0]!;

  /** Jumlah materi yang bisa dijadikan soal untuk sebuah mode. */
  function materialCount(key: QuizMode): number {
    switch (key) {
      case "kosakata":
        return vocabPool.length;
      case "kana":
        return kana.length;
      case "kanji":
        return kanjiPool.length;
      case "tata-bahasa":
        return grammarPool.length;
      case "campuran":
        // Kana tidak terikat level; campuran tetap butuh materi level ini.
        return vocabPool.length + kanjiPool.length + grammarPool.length;
    }
  }

  function buildQuestions(key: QuizMode, amount: number): Question[] {
    switch (key) {
      case "kosakata":
        return buildVocabQuestions(vocabPool, amount);
      case "kana":
        return buildKanaQuestions(kana, amount);
      case "kanji":
        return buildKanjiQuestions(kanjiPool, amount);
      case "tata-bahasa":
        return buildGrammarQuestions(grammarPool, amount);
      case "campuran": {
        const kanaCount = Math.min(2, kana.length, amount);
        const rest = Math.max(0, amount - kanaCount);
        const vocabCount = Math.max(1, Math.round(rest * 0.4));
        const kanjiCount = Math.max(1, Math.round(rest * 0.3));
        const grammarCount = Math.max(1, amount - kanaCount - vocabCount - kanjiCount);

        return shuffle([
          ...buildKanaQuestions(kana, kanaCount),
          ...buildVocabQuestions(vocabPool, vocabCount),
          ...buildKanjiQuestions(kanjiPool, kanjiCount),
          ...buildGrammarQuestions(grammarPool, grammarCount),
        ]);
      }
    }
  }

  function start() {
    const info = MODES.find((item) => item.key === mode) ?? MODES[0]!;
    setLabel(`Latihan ${info.title} · ${level}`);
    setQuestions(buildQuestions(mode, count));
    window.scrollTo({ top: 0 });
  }

  /* ---------------- sesi latihan ---------------- */
  if (questions) {
    return (
      <div className="space-y-6 pb-8">
        <PageHeader
          eyebrow={
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="level" mono>
                {level}
              </Badge>
              <span className="label-micro">{meta.name} · Latihan</span>
            </div>
          }
          title="Latihan"
          japanese="練習"
          description={`${questions.length} soal · mode ${modeInfo.title.toLowerCase()}`}
          actions={
            <Button variant="ghost" onClick={() => setQuestions(null)}>
              Ubah pilihan
            </Button>
          }
        />
        <QuizRunner
          questions={questions}
          label={label}
          onRestart={start}
          restartLabel="Soal baru"
        />
      </div>
    );
  }

  /* ---------------- layar penyiapan ---------------- */
  const available = materialCount(mode) > 0;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">{meta.name} · Latihan</span>
          </div>
        }
        title="Latihan"
        japanese="練習"
        description={`Susun sesi singkat dari materi ${level}: pilih mode, jumlah soal, lalu mulai.`}
        actions={
          <Link href={levelHref(level, "ujian")}>
            <Button variant="outline">Simulasi ujian</Button>
          </Link>
        }
      />

      <Section
        title="Pilih mode"
        glyph="問"
        description="Satu mode per sesi agar fokus latihanmu jelas."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" role="group" aria-label="Mode latihan">
          {MODES.map((item) => {
            const active = item.key === mode;
            const material = materialCount(item.key);
            const disabled = material === 0;

            return (
              <button
                key={item.key}
                type="button"
                aria-pressed={active}
                disabled={disabled}
                onClick={() => setMode(item.key)}
                className={cn(
                  "group flex h-full w-full flex-col gap-2 rounded-xl border p-4 text-left transition-colors duration-150",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  active
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
                      active ? "bg-level text-level-contrast" : "bg-surface-muted text-fg-subtle",
                    )}
                  >
                    {item.glyph}
                  </span>
                  {active ? (
                    <Badge tone="level">Dipilih</Badge>
                  ) : (
                    <span className="tnum text-caption text-fg-subtle">
                      {disabled ? "Belum tersedia" : `${material} materi`}
                    </span>
                  )}
                </span>
                <span className="text-h3 font-semibold text-fg">
                  {item.title}
                  <span lang="ja" className="jp ml-1.5 text-caption font-normal text-fg-subtle">
                    {item.japanese}
                  </span>
                </span>
                <span className="text-caption leading-relaxed text-fg-muted">
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Jumlah soal" glyph="数" description="Sesuaikan dengan waktu yang kamu punya.">
        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-h3 font-semibold text-fg">Soal per sesi</p>
              <Badge tone="neutral" mono>
                {count} soal
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
          </CardBody>
        </Card>
      </Section>

      <Card variant="muted">
        <CardBody className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="label-micro">Siap mulai</p>
            <p className="mt-1.5 text-body font-semibold text-fg">
              {modeInfo.title} · {count} soal
            </p>
            <p className="mt-0.5 text-caption text-fg-muted">{modeInfo.description}</p>
          </div>
          <Button size="lg" onClick={start} disabled={!available} className="w-full sm:w-auto">
            Mulai latihan
          </Button>
        </CardBody>
      </Card>

      <Callout tone="info" title="Cara menjawab">
        Tekan <span className="tnum font-semibold text-fg">1–4</span> untuk memilih jawaban, lalu{" "}
        <span className="tnum font-semibold text-fg">Enter</span> untuk memeriksa dan lanjut. Umpan
        balik dan pembahasan muncul langsung setelah jawaban diperiksa.
      </Callout>
    </div>
  );
}
