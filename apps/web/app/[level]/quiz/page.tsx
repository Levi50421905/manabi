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
import { bankDecks, type BankDeck } from "@/lib/bank";
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
  drawBankQuestions,
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

/**
 * Sumber butir latihan. `materi` memakai generator runtime dari paket konten,
 * dua sisanya mengambil deck terkurasi dari Bank Soal — yang kini menjadi
 * lapisan data, bukan halaman/menu sendiri.
 */
type QuizSource = "materi" | "bank-n5" | "bank-jft";

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

interface SourceOption {
  key: QuizSource;
  label: string;
  hint: string;
  deck: BankDeck | null;
}

/** Gaya dasar chip Arah 3: membulat, target sentuh 44px, aksen matcha. */
function chipClass(active: boolean, disabled = false): string {
  return cn(
    "inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-body font-medium transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
    active
      ? "border-accent bg-accent-soft text-accent-strong"
      : "border-border bg-surface text-fg hover:border-border-strong hover:bg-surface-muted",
    disabled && "cursor-not-allowed border-dashed opacity-50",
  );
}

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

  const [source, setSource] = useState<QuizSource>("materi");
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
  /**
   * Contoh soal dibuat dari pengacakan runtime, jadi baru dirender setelah
   * mount. Tanpa ini HTML server dan klien berbeda dan hidrasi gagal.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const modeInfo = MODES.find((item) => item.key === mode) ?? MODES[0]!;

  /** Bank Soal sebagai lapisan data: deck terkurasi yang bisa dipilih. */
  const sourceOptions = useMemo<SourceOption[]>(
    () => [
      {
        key: "materi",
        label: `Materi ${level}`,
        hint: "generator",
        deck: null,
      },
      ...bankDecks.map((deck) => ({
        key: `bank-${deck.id}` as QuizSource,
        label: `Bank ${deck.label}`,
        hint: `${deck.questions.length} butir`,
        deck,
      })),
    ],
    [level],
  );
  const activeSource =
    sourceOptions.find((option) => option.key === source) ?? sourceOptions[0]!;
  const activeDeck = activeSource.deck;

  /**
   * Jumlah soal: 10/20/30 untuk sumber materi. Deck bank biasanya lebih
   * pendek, jadi pilihan menyesuaikan isi paket (dan tetap bisa memakai semua
   * butir lewat pilihan terakhir).
   */
  const countOptions = useMemo<Array<{ value: number; label: string }>>(() => {
    if (!activeDeck) {
      return COUNTS.map((value) => ({ value, label: String(value) }));
    }

    const deckSize = activeDeck.questions.length;
    const available = COUNTS.filter((value) => value <= deckSize).map((value) => ({
      value,
      label: String(value),
    }));
    if (available.length === 0 || available[available.length - 1]!.value !== deckSize) {
      available.push({ value: deckSize, label: `Semua (${deckSize})` });
    }
    return available;
  }, [activeDeck]);

  const effectiveCount = activeDeck
    ? Math.min(count, activeDeck.questions.length)
    : count;

  /** Mode yang soalnya bisa memakai bentuk jawaban pilihan. */
  const isTyped =
    !activeDeck &&
    (mode === "kosakata" || mode === "kanji" || mode === "campuran" || mode === "variasi");

  const preview = useMemo(() => {
    if (!isTyped || !mounted) return null;
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
  }, [isTyped, mounted, mode, answerType, kanjiPool, vocabPool]);

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

  /** Pilih sumber; jumlah soal disesuaikan agar tidak melebihi isi deck bank. */
  function selectSource(next: QuizSource) {
    setSource(next);
    const nextDeck = sourceOptions.find((option) => option.key === next)?.deck ?? null;

    if (!nextDeck) {
      // Kembali ke generator: pastikan jumlah soal ada di pilihan 10/20/30.
      setCount((current) => (COUNTS.includes(current) ? current : 10));
      return;
    }

    const deckSize = nextDeck.questions.length;
    setCount((current) => {
      if (current <= deckSize) return current;
      const fits = COUNTS.filter((value) => value <= deckSize);
      return fits[fits.length - 1] ?? 10;
    });
  }

  function start() {
    const info = MODES.find((item) => item.key === mode) ?? MODES[0]!;
    const answerLabel = ANSWER_TYPE_LABEL[answerType];
    const nextQuestions = activeDeck
      ? drawBankQuestions(activeDeck.questions, effectiveCount)
      : buildQuestions(mode, count);

    setLabel(
      activeDeck
        ? `Bank ${activeDeck.label} · ${nextQuestions.length} butir acak`
        : isTyped
          ? `Latihan ${info.title} · ${answerLabel} · ${level}`
          : `Latihan ${info.title} · ${level}`,
    );
    setQuestions(nextQuestions);
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
              <span className="label-micro">{meta.name} · Latihan Soal</span>
            </div>
          }
          title="Latihan Soal"
          japanese="練習"
          description={label}
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
  const available = activeDeck
    ? activeDeck.questions.length > 0
    : materialCount(mode) > 0;

  const summaryTitle = activeDeck
    ? `${activeDeck.label} · ${effectiveCount} butir acak`
    : `${modeInfo.title} · ${count} soal${isTyped ? ` · ${ANSWER_TYPE_LABEL[answerType]}` : ""}`;
  const summaryDescription = activeDeck
    ? "Bank terkurasi diacak tanpa pengulangan; pembahasan berlapis tampil setelah menjawab."
    : modeInfo.description;

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">{meta.name} · Latihan Soal</span>
          </div>
        }
        title="Latihan Soal"
        japanese="練習"
        description="Pilih sumber soal, atur sesi, lalu mulai. Soal diacak tanpa pengulangan dalam satu sesi."
        actions={
          <Link href={levelHref(level, "ujian")}>
            <Button variant="outline">Simulasi ujian</Button>
          </Link>
        }
      />

      <div className="rounded-3xl border border-border bg-surface p-4 shadow-soft sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-micro">Atur sesi</p>
            <h2 className="mt-1 font-display text-h2 font-semibold tracking-tight text-fg">
              Sumber, mode, dan jumlah soal
            </h2>
            <p className="mt-1 max-w-[54ch] text-caption leading-relaxed text-fg-muted">
              Bank Soal bukan menu — ia lapisan data yang menyuplai butir untuk sesi ini.
            </p>
          </div>
          <Badge tone="accent">Bank Soal · sumber data</Badge>
        </div>

        <div className="mt-5 space-y-5">
          {/* Sumber soal: materi level atau deck bank terkurasi. */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="label-micro">Sumber soal</p>
              <span className="text-caption text-fg-subtle">
                {activeDeck
                  ? `${activeDeck.questions.length} butir terkurasi`
                  : "Generator dari materi level ini"}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Sumber soal">
              {sourceOptions.map((option) => {
                const active = option.key === source;
                return (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => selectSource(option.key)}
                    className={chipClass(active)}
                  >
                    <span>{option.label}</span>
                    <span className="tnum text-caption font-normal text-fg-muted">
                      {option.hint}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeDeck ? (
            <div className="rounded-2xl border border-border bg-surface-muted p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="label-micro">Paket bank terpilih</p>
                  <p className="mt-1 text-body font-semibold text-fg">
                    {activeDeck.label}
                    <span lang="ja" className="jp ml-1.5 text-caption font-normal text-fg-subtle">
                      {activeDeck.japanese}
                    </span>
                  </p>
                  <p className="mt-0.5 text-caption leading-relaxed text-fg-muted">
                    {activeDeck.description}
                  </p>
                </div>
                <Badge tone="success">Tanpa pengulangan</Badge>
              </div>

              <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
                {activeDeck.sectionCounts.map((section) => (
                  <li
                    key={section.label}
                    className="flex items-baseline justify-between gap-2 rounded-lg bg-surface px-2.5 py-1.5 text-caption"
                  >
                    <span className="min-w-0 text-fg-muted">{section.label}</span>
                    <span className="tnum shrink-0 font-semibold text-fg">{section.count}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-3 text-caption leading-relaxed text-fg-muted">
                Butir bank punya kunci tetap dan pembahasan empat lapis yang tetap tampil setelah
                menjawab. Bentuk jawaban mengikuti butir aslinya (pilihan ganda).
              </p>
            </div>
          ) : (
            <>
              {/* Mode latihan: sembilan mode lama, kini berupa chip. */}
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="label-micro">Mode latihan</p>
                  <span className="text-caption text-fg-subtle">
                    Satu mode per sesi agar fokus latihanmu jelas.
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Mode latihan">
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
                        title={item.description}
                        onClick={() => setMode(item.key)}
                        className={chipClass(active, disabled)}
                      >
                        <span
                          lang="ja"
                          aria-hidden="true"
                          className={cn(
                            "jp grid h-6 w-6 place-items-center rounded-md text-caption font-semibold",
                            active
                              ? "bg-accent text-accent-contrast"
                              : "bg-surface-muted text-fg-subtle",
                          )}
                        >
                          {item.glyph}
                        </span>
                        <span>{item.title}</span>
                        <span className="tnum text-caption font-normal text-fg-muted">
                          {disabled ? "—" : material}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-caption leading-relaxed text-fg-subtle">
                  {modeInfo.description}
                </p>
              </div>

              {/* Bentuk jawaban — permintaan eksplisit pemilik produk. */}
              <div className="rounded-2xl border border-accent/30 bg-accent-soft/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="label-micro">Bentuk jawaban</p>
                    <p className="mt-1 text-body font-semibold text-fg">Pilih bentuk jawaban</p>
                  </div>
                  <Badge tone="level">
                    {isTyped ? ANSWER_TYPE_LABEL[answerType] : "Tidak aktif"}
                  </Badge>
                </div>
                <p className="mt-1 text-caption leading-relaxed text-fg-muted">
                  {isTyped
                    ? `Berlaku untuk soal kosakata dan kanji di sesi ini — ${ANSWER_TYPE_HINT[answerType]}.`
                    : "Aktif untuk mode Kosakata, Kanji, Campuran, atau Variasi."}
                </p>

                <div
                  className="mt-3 grid gap-2 sm:grid-cols-3"
                  role="group"
                  aria-label="Bentuk jawaban"
                >
                  {ANSWER_OPTIONS.map((option) => {
                    const active = isTyped && answerType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={active}
                        disabled={!isTyped}
                        onClick={() => setAnswerType(option.value)}
                        className={cn(
                          "flex min-h-12 flex-col items-start justify-center rounded-xl border px-3.5 py-2.5 text-left transition-colors duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                          "disabled:cursor-not-allowed disabled:opacity-50",
                          active
                            ? "border-accent bg-accent-soft text-accent-strong"
                            : "border-border bg-surface text-fg hover:border-border-strong hover:bg-surface-muted",
                        )}
                      >
                        <span className="text-body font-semibold">{option.label}</span>
                        <span className="mt-0.5 text-caption font-normal text-fg-muted">
                          {ANSWER_TYPE_HINT[option.value]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 rounded-xl border border-border bg-surface p-3.5">
                  <p className="label-micro">Contoh soal</p>
                  {isTyped && preview ? (
                    <>
                      <p
                        lang="ja"
                        className="jp-serif mt-2 break-words text-h1 font-semibold leading-tight text-fg"
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
                    <p className="mt-2 text-caption leading-relaxed text-fg-muted">
                      {isTyped
                        ? mounted
                          ? "Belum ada materi untuk level ini, jadi contoh soal belum bisa dibuat."
                          : "Menyiapkan contoh soal…"
                        : "Pilih mode Kosakata, Kanji, Campuran, atau Variasi untuk melihat contoh dan mengaktifkan pilihan ini."}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Jumlah soal. */}
          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="label-micro">Jumlah soal</p>
              <span className="text-caption text-fg-subtle">
                {activeDeck
                  ? `Paket ini berisi ${activeDeck.questions.length} butir`
                  : "Sesuaikan dengan waktu yang tersedia."}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Jumlah soal">
              {countOptions.map((option) => {
                const active = option.value === count;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setCount(option.value)}
                    className={cn(chipClass(active), "tnum justify-center")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            {activeDeck ? (
              <p className="mt-1.5 text-caption leading-relaxed text-fg-subtle">
                Pilihan jumlah menyesuaikan isi paket bank; pilihan terakhir memakai semua butir
                yang tersedia.
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 border-t border-border pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="label-micro">Siap mulai</p>
              <p className="mt-1 text-body font-semibold text-fg">{summaryTitle}</p>
              <p className="mt-0.5 text-caption leading-relaxed text-fg-muted">
                {summaryDescription}
              </p>
            </div>
            <Button
              size="lg"
              onClick={start}
              disabled={!available}
              className="w-full shrink-0 sm:w-auto"
            >
              Mulai latihan
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Callout tone="info" title="Cara menjawab">
          Tekan <span className="tnum font-semibold text-fg">1–4</span> untuk memilih jawaban, lalu{" "}
          <span className="tnum font-semibold text-fg">Enter</span> untuk memeriksa dan lanjut.
          Umpan balik dan pembahasan muncul langsung setelah jawaban diperiksa.
        </Callout>

        <Card variant="muted" className="rounded-2xl">
          <CardBody className="p-4">
            <details>
              <summary className="flex min-h-11 cursor-pointer items-center text-body font-semibold text-fg">
                Kenapa Bank Soal tidak ada di menu?
              </summary>
              <p className="mt-2 text-caption leading-relaxed text-fg-muted">
                Bank Soal adalah lapisan data, bukan halaman. Latihan Soal dan Simulasi Ujian
                mengambil butir acak tanpa pengulangan dari sana. Menampilkannya sebagai menu hanya
                menambah satu klik tanpa menambah materi.
              </p>
            </details>
          </CardBody>
        </Card>
      </div>

      <Card variant="muted" className="rounded-2xl">
        <CardBody className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="label-micro">Latihan khusus</p>
            <p className="mt-1.5 text-body font-semibold text-fg">Partikel (助詞)</p>
            <p className="mt-0.5 text-caption leading-relaxed text-fg-muted">
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
