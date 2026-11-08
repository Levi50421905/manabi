"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  examListeningN5,
  grammarByLevel,
  kana,
  kanjiByLevel,
  levelHref,
  levelMeta,
  readingByLevel,
  sentenceOrderN5,
  vocabByLevel,
} from "@manabi/content";
import { QuizRunner, type QuizRunnerHandle } from "@/components/quiz-runner";
import { SessionExitDialog } from "@/components/session-exit-dialog";
import {
  ANSWER_TYPE_HINT,
  ANSWER_TYPE_LABEL,
  buildGrammarQuestions,
  buildKanaQuestions,
  buildKanjiQuestions,
  buildListeningQuizQuestions,
  buildReadingQuizQuestions,
  buildSentenceOrderQuestions,
  buildVarietyQuestions,
  buildVocabQuestions,
  shuffle,
  type AnswerType,
  type Question,
} from "@/lib/quiz";
import { useActiveLevel } from "@/lib/level";
import { setSessionActive, useBeforeUnloadGuard } from "@/lib/session-guard";

type QuizMode =
  | "campuran"
  | "variasi"
  | "kosakata"
  | "kana"
  | "kanji"
  | "tata-bahasa"
  | "membaca"
  | "mendengar"
  | "susun";

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
    key: "variasi",
    title: "Variasi",
    japanese: "変化",
    glyph: "変",
    description: "Tujuh jenis soal diacak: kana, kata, kanji, grammar, bacaan, listening, susun.",
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
  {
    key: "membaca",
    title: "Membaca",
    japanese: "読解",
    glyph: "読",
    description: "Baca teks pendek, lalu jawab pertanyaan pemahaman.",
  },
  {
    key: "mendengar",
    title: "Mendengar",
    japanese: "聴解",
    glyph: "聴",
    description: "Dengarkan dialog, lalu jawab pertanyaan. Bisa diputar ulang.",
  },
  {
    key: "susun",
    title: "Susun Kalimat",
    japanese: "組み立て",
    glyph: "組",
    description: "Pilih fragmen yang tepat untuk celah bertanda ★.",
  },
];

const COUNTS = [10, 20, 30];

/** Pilihan bentuk jawaban untuk soal kosakata dan kanji. */
const ANSWER_OPTIONS: Array<{ value: AnswerType; label: string }> = (
  ["meaning", "romaji", "kana"] as const
).map((value) => ({ value, label: ANSWER_TYPE_LABEL[value] }));

export default function QuizPage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);

  const vocabPool = useMemo(() => vocabByLevel(level), [level]);
  const kanjiPool = useMemo(() => kanjiByLevel(level), [level]);
  const grammarPool = useMemo(() => grammarByLevel(level), [level]);
  const readingPool = useMemo(() => readingByLevel(level), [level]);
  const listeningPool = useMemo(
    () => examListeningN5.filter((item) => item.level === level),
    [level],
  );
  const sentencePool = useMemo(
    () => sentenceOrderN5.filter((item) => item.level === level),
    [level],
  );

  const [mode, setMode] = useState<QuizMode>("campuran");
  const [count, setCount] = useState(10);
  const [label, setLabel] = useState("");
  const [questions, setQuestions] = useState<Question[] | null>(null);
  /** Sesi sedang dikerjakan (bukan layar hasil). */
  const [running, setRunning] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const runnerRef = useRef<QuizRunnerHandle>(null);
  /** Bentuk jawaban yang diminta untuk soal kosakata dan kanji. */
  const [answerType, setAnswerType] = useState<AnswerType>("meaning");

  const modeInfo = MODES.find((item) => item.key === mode) ?? MODES[0]!;

  /** Mode yang soalnya bisa memakai bentuk jawaban pilihan. */
  const isTyped =
    mode === "kosakata" || mode === "kanji" || mode === "campuran" || mode === "variasi";

  const preview = useMemo(() => {
    if (!isTyped) return null;
    const samples =
      mode === "kanji"
        ? buildKanjiQuestions(kanjiPool, 1, answerType)
        : buildVocabQuestions(vocabPool, 1, { answerType });
    const sample = samples[0];
    if (!sample) return null;
    return {
      prompt: sample.prompt,
      subPrompt: sample.subPrompt ?? "",
      answer: sample.options[sample.answer] ?? "",
    };
  }, [isTyped, mode, answerType, kanjiPool, vocabPool]);

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
      case "membaca":
        return readingPool.reduce((sum, passage) => sum + passage.questions.length, 0);
      case "mendengar":
        return listeningPool.length;
      case "susun":
        return sentencePool.length;
      case "variasi":
        return (
          vocabPool.length +
          kanjiPool.length +
          grammarPool.length +
          readingPool.reduce((sum, passage) => sum + passage.questions.length, 0) +
          listeningPool.length +
          sentencePool.length
        );
      case "campuran":
        // Kana tidak terikat level; campuran tetap butuh materi level ini.
        return vocabPool.length + kanjiPool.length + grammarPool.length;
      default:
        return 0;
    }
  }

  function buildQuestions(key: QuizMode, amount: number): Question[] {
    switch (key) {
      case "kosakata":
        return buildVocabQuestions(vocabPool, amount, { answerType });
      case "kana":
        return buildKanaQuestions(kana, amount);
      case "kanji":
        return buildKanjiQuestions(kanjiPool, amount, answerType);
      case "tata-bahasa":
        return buildGrammarQuestions(grammarPool, amount);
      case "membaca":
        return buildReadingQuizQuestions(readingPool, amount);
      case "mendengar":
        return buildListeningQuizQuestions(listeningPool, amount);
      case "susun":
        return buildSentenceOrderQuestions(amount, sentencePool);
      case "variasi":
        return buildVarietyQuestions(amount, {
          answerType,
          vocabPool,
          kanjiPool,
          grammarPool,
          readingPool,
          listeningPool,
          sentencePool,
        });
      case "campuran": {
        const kanaCount = Math.min(2, kana.length, amount);
        const rest = Math.max(0, amount - kanaCount);
        const vocabCount = Math.max(1, Math.round(rest * 0.4));
        const kanjiCount = Math.max(1, Math.round(rest * 0.3));
        const grammarCount = Math.max(1, amount - kanaCount - vocabCount - kanjiCount);

        return shuffle([
          ...buildKanaQuestions(kana, kanaCount),
          ...buildVocabQuestions(vocabPool, vocabCount, { answerType }),
          ...buildKanjiQuestions(kanjiPool, kanjiCount, answerType),
          ...buildGrammarQuestions(grammarPool, grammarCount),
        ]);
      }
      default:
        return [];
    }
  }

  function start() {
    const info = MODES.find((item) => item.key === mode) ?? MODES[0]!;
    const answerLabel = ANSWER_TYPE_LABEL[answerType];
    setLabel(
      isTyped
        ? `Latihan ${info.title} · ${answerLabel} · ${level}`
        : `Latihan ${info.title} · ${level}`,
    );
    setQuestions(buildQuestions(mode, count));
    setRunning(true);
    setExitOpen(false);
    window.scrollTo({ top: 0 });
  }

  // Selama sesi berjalan kerangka aplikasi (rail/top bar/bottom nav) dikunci.
  useEffect(() => {
    if (!running) return;
    setSessionActive(true, label ? `Latihan · ${label}` : `Latihan · ${meta.name}`);
    return () => setSessionActive(false);
  }, [running, label, meta.name]);

  useBeforeUnloadGuard(running);

  /* ---------------- sesi latihan ---------------- */
  if (questions) {
    return (
      <div className="space-y-6 pb-8">
        <p role="status" aria-live="polite" className="sr-only">
          {running
            ? "Sesi latihan berjalan. Navigasi ke menu lain dikunci sampai sesi selesai."
            : "Sesi latihan selesai. Navigasi terbuka kembali."}
        </p>

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
          description={label}
          actions={
            running ? (
              <Button variant="outline" onClick={() => setExitOpen(true)}>
                Keluar
              </Button>
            ) : undefined
          }
        />
        <QuizRunner
          ref={runnerRef}
          questions={questions}
          label={label}
          onRestart={start}
          restartLabel="Soal baru"
          onRequestExit={() => setExitOpen(true)}
          onFinished={() => setRunning(false)}
          onDone={() => {
            setQuestions(null);
            setRunning(false);
            window.scrollTo({ top: 0 });
          }}
        />
        <SessionExitDialog
          open={exitOpen}
          title="Selesaikan latihan ini?"
          onCancel={() => setExitOpen(false)}
          onFinish={() => {
            setExitOpen(false);
            runnerRef.current?.finish();
          }}
          onDiscard={() => {
            setExitOpen(false);
            setRunning(false);
            setQuestions(null);
            window.scrollTo({ top: 0 });
          }}
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

      {isTyped ? (
        <Section
          title="Bentuk jawaban"
          glyph="答"
          description={
            mode === "campuran"
              ? "Berlaku untuk soal kosakata dan kanji di sesi ini."
              : "Pilih apa yang ingin kamu jawab dari tiap soal."
          }
        >
          <Card>
            <CardBody className="space-y-5 p-4 sm:p-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-h3 font-semibold text-fg">Jawab dengan</p>
                  <span className="text-caption text-fg-subtle">
                    {ANSWER_TYPE_HINT[answerType]}
                  </span>
                </div>
                <SegmentedControl
                  className="mt-2"
                  block
                  ariaLabel="Bentuk jawaban"
                  value={answerType}
                  onChange={setAnswerType}
                  options={ANSWER_OPTIONS}
                />
              </div>

              <div className="rounded-lg border border-border bg-surface-muted p-3.5">
                <p className="label-micro">Contoh soal</p>
                {preview ? (
                  <>
                    <p
                      lang="ja"
                      className="jp-serif mt-2 text-h1 font-semibold leading-tight text-fg"
                    >
                      {preview.prompt}
                    </p>
                    <p className="mt-1 text-caption text-fg-muted">{preview.subPrompt}</p>
                    <p className="mt-2.5 border-t border-border pt-2.5 text-caption text-fg-subtle">
                      Jawaban benar:{" "}
                      <span className="font-semibold text-fg">{preview.answer}</span>
                    </p>
                  </>
                ) : (
                  <p className="mt-2 text-caption text-fg-muted">
                    Belum ada materi untuk level ini, jadi contoh soal belum bisa dibuat.
                  </p>
                )}
              </div>
            </CardBody>
          </Card>
        </Section>
      ) : null}

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
              {isTyped ? ` · ${ANSWER_TYPE_LABEL[answerType]}` : ""}
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

      <Card variant="muted">
        <CardBody className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="label-micro">Latihan khusus</p>
            <p className="mt-1.5 text-body font-semibold text-fg">Partikel (助詞)</p>
            <p className="mt-0.5 text-caption text-fg-muted">
              Lima bentuk soal khusus partikel: isi celah, ketik, cocokkan fungsi, bedakan pasangan,
              dan lengkapi teks.
            </p>
          </div>
          <Link href={levelHref(level, "partikel/latihan")} className="shrink-0">
            <Button variant="outline">Buka latihan partikel</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
