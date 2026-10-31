"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  hiragana,
  kana,
  kanaRowLabels,
  kanaRows,
  katakana,
  levelHref,
  levelMeta,
  type Kana,
  type KanaType,
} from "@manabi/content";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  cn,
  PageHeader,
  ProgressBar,
  ProgressRing,
  Section,
  SegmentedControl,
  Toolbar,
  ToolbarGroup,
} from "@manabi/ui";
import { useActiveLevel } from "@/lib/level";
import { usePrefs } from "@/lib/prefs";
import { scoreMessage, shuffle } from "@/lib/quiz";
import { recordQuiz } from "@/lib/store";
import { speak } from "@/lib/tts";

/* ------------------------------------------------------------------ *
 * Konstanta
 * ------------------------------------------------------------------ */

type Mode = "belajar" | "kuis";
type QuizDirection = "char-to-romaji" | "romaji-to-char";
type FamilyKey = "dasar" | "dakuten" | "yoon";

const SCRIPT_OPTIONS: Array<{ value: KanaType; label: string; glyph: string }> = [
  { value: "hiragana", label: "Hiragana", glyph: "あ" },
  { value: "katakana", label: "Katakana", glyph: "ア" },
];

const MODE_OPTIONS: Array<{ value: Mode; label: string }> = [
  { value: "belajar", label: "Tabel" },
  { value: "kuis", label: "Kuis" },
];

const QUIZ_DIRECTIONS: Array<{ value: QuizDirection; label: string }> = [
  { value: "char-to-romaji", label: "Huruf → Romaji" },
  { value: "romaji-to-char", label: "Romaji → Huruf" },
];

const QUIZ_LENGTH = 10;

/** Baris gojūon dikelompokkan supaya tabel panjang tetap mudah dibaca. */
const FAMILIES: Array<{ key: FamilyKey; title: string; description: string }> = [
  {
    key: "dasar",
    title: "Huruf dasar",
    description: "Gojūon: lima vokal dan baris konsonan inti yang dipakai setiap hari.",
  },
  {
    key: "dakuten",
    title: "Dakuten & handakuten",
    description: "Huruf bersuara (dakuten) dan semi-bersuara (handakuten) — bunyi yang lebih tebal.",
  },
  {
    key: "yoon",
    title: "Yōon",
    description: "Kana kecil ゃ ゅ ょ yang menyatu dengan huruf dasar menjadi satu bunyi.",
  },
];

function familyOf(row: string): FamilyKey {
  const label = kanaRowLabels[row] ?? "";
  if (label.includes("yōon")) return "yoon";
  if (label.includes("dakuten") || label.includes("handakuten")) return "dakuten";
  return "dasar";
}

/* ------------------------------------------------------------------ *
 * Kuis dua arah
 * ------------------------------------------------------------------ */

interface KanaQuestion {
  id: string;
  /** Yang ditampilkan besar di kartu soal. */
  prompt: string;
  promptJapanese: boolean;
  hint: string;
  options: string[];
  optionsJapanese: boolean;
  answer: number;
  item: Kana;
}

function buildQuiz(pool: Kana[], direction: QuizDirection, count: number): KanaQuestion[] {
  const picks = shuffle(pool).slice(0, Math.min(count, pool.length));
  const optionPool = direction === "char-to-romaji" ? pool.map((item) => item.romaji) : pool.map((item) => item.char);

  return picks.map((item, index) => {
    const correct = direction === "char-to-romaji" ? item.romaji : item.char;
    const distractors = shuffle(optionPool.filter((option) => option !== correct)).slice(0, 3);
    const options = shuffle([correct, ...distractors]);

    return {
      id: `${item.id}:${direction}:${index}`,
      prompt: direction === "char-to-romaji" ? item.char : item.romaji,
      promptJapanese: direction === "char-to-romaji",
      hint: direction === "char-to-romaji" ? "Apa bacaan huruf ini?" : "Huruf mana untuk bunyi ini?",
      options,
      optionsJapanese: direction === "romaji-to-char",
      answer: options.indexOf(correct),
      item,
    };
  });
}

function KanaQuiz({ pool, scriptLabel }: { pool: Kana[]; scriptLabel: string }) {
  const [direction, setDirection] = useState<QuizDirection>("char-to-romaji");
  const [questions, setQuestions] = useState<KanaQuestion[] | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = questions?.length ?? QUIZ_LENGTH;
  const answered = index + (checked ? 1 : 0);

  function start(nextDirection: QuizDirection = direction) {
    setDirection(nextDirection);
    setQuestions(buildQuiz(pool, nextDirection, QUIZ_LENGTH));
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setCorrectCount(0);
    setFinished(false);
  }

  function choose(optionIndex: number) {
    if (checked || !questions) return;
    const question = questions[index];
    setSelected(optionIndex);
    setChecked(true);
    if (optionIndex === question.answer) setCorrectCount((value) => value + 1);
  }

  function next() {
    if (!questions) return;
    if (index + 1 >= questions.length) {
      setFinished(true);
      recordQuiz(
        `Latihan kana ${scriptLabel.toLowerCase()} · ${
          direction === "char-to-romaji" ? "huruf → romaji" : "romaji → huruf"
        }`,
        correctCount,
        questions.length,
      );
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setChecked(false);
  }

  /* ---- Layar persiapan ---- */
  if (!questions) {
    return (
      <Card>
        <CardBody className="space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span
              lang="ja"
              aria-hidden="true"
              className="font-jp-serif select-none text-5xl font-semibold leading-none text-fg-subtle/40"
            >
              {scriptLabel === "Hiragana" ? "あ" : "ア"}
            </span>
            <div>
              <p className="font-display text-h2 font-semibold tracking-tight text-fg">
                Uji hafalan {scriptLabel.toLowerCase()}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                {QUIZ_LENGTH} soal acak dari {pool.length} huruf, dua arah: mengenali bacaan dan
                memilih huruf. Skor sesi dicatat ke riwayat latihan.
              </p>
            </div>
          </div>

          <div>
            <p className="label-micro mb-2">Arah latihan</p>
            <SegmentedControl
              block
              ariaLabel="Arah latihan kana"
              value={direction}
              onChange={(value) => setDirection(value)}
              options={QUIZ_DIRECTIONS}
            />
          </div>

          <Button block className="sm:w-auto" onClick={() => start()}>
            Mulai {QUIZ_LENGTH} soal
          </Button>
        </CardBody>
      </Card>
    );
  }

  /* ---- Layar hasil ---- */
  if (finished) {
    const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);

    return (
      <Card>
        <CardBody className="space-y-6">
          <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
            <ProgressRing value={correctCount} max={total} size={96} stroke={7} tone="level">
              <span className="tnum font-display text-2xl font-semibold text-fg">{percent}%</span>
            </ProgressRing>
            <div className="min-w-0">
              <p className="label-micro">Hasil sesi</p>
              <p className="mt-1.5 font-display text-h2 font-semibold tracking-tight text-fg">
                {correctCount} dari {total} benar
              </p>
              <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                {scoreMessage(correctCount, total)}
              </p>
            </div>
          </div>

          <ProgressBar value={correctCount} max={total} tone={percent >= 70 ? "success" : "level"} />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button block onClick={() => start()}>
              Ulangi arah ini
            </Button>
            <Button block variant="outline" onClick={() => setQuestions(null)}>
              Ganti arah
            </Button>
          </div>

          <p className="text-center text-caption text-fg-subtle">
            Skor tersimpan di riwayat latihan dan menambah XP.
          </p>
        </CardBody>
      </Card>
    );
  }

  /* ---- Layar soal ---- */
  const current = questions[index];
  const isCorrect = selected === current.answer;

  return (
    <Card>
      <CardBody className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="level" mono>
              {index + 1}/{total}
            </Badge>
            <span className="text-caption text-fg-muted">
              {direction === "char-to-romaji" ? "Huruf → Romaji" : "Romaji → Huruf"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-caption text-fg-muted">
            <span className="tnum">
              Benar <span className="font-semibold text-fg">{correctCount}</span>
            </span>
            <span aria-hidden="true" className="text-fg-subtle">
              ·
            </span>
            <span className="tnum">Terjawab {answered}</span>
          </div>
        </div>

        <ProgressBar
          value={index}
          max={total}
          tone="level"
          aria-label={`Progres kuis soal ${index + 1} dari ${total}`}
        />

        <div className="rounded-xl border border-border bg-surface-muted px-4 py-8 text-center">
          {current.promptJapanese ? (
            <p lang="ja" className="font-jp-serif text-5xl font-semibold leading-none text-fg">
              {current.prompt}
            </p>
          ) : (
            <p className="tnum font-display text-4xl font-semibold leading-none tracking-tight text-fg">
              {current.prompt}
            </p>
          )}
          <p className="mt-3 text-sm text-fg-muted">{current.hint}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2" role="group" aria-label="Pilihan jawaban">
          {current.options.map((option, optionIndex) => {
            const isSelected = selected === optionIndex;
            const isAnswer = optionIndex === current.answer;
            const tone = !checked
              ? isSelected
                ? "selected"
                : "idle"
              : isAnswer
                ? "correct"
                : isSelected
                  ? "wrong"
                  : "dim";

            return (
              <button
                key={option}
                type="button"
                disabled={checked}
                onClick={() => choose(optionIndex)}
                className={cn(
                  "flex min-h-11 items-center justify-between gap-3 rounded-lg border px-4 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                  tone === "idle" && "border-border bg-surface text-fg hover:border-level/40 hover:bg-level-soft/60",
                  tone === "selected" && "border-level bg-level-soft text-level",
                  tone === "correct" && "border-success bg-success-soft text-success",
                  tone === "wrong" && "border-danger bg-danger-soft text-danger",
                  tone === "dim" && "border-border bg-surface text-fg-subtle opacity-60",
                )}
              >
                <span
                  className={cn(
                    current.optionsJapanese ? "font-jp-serif text-2xl leading-none" : "tnum text-base font-medium",
                  )}
                >
                  {option}
                </span>
                {checked && isAnswer ? (
                  <span aria-hidden="true" className="text-caption font-semibold">
                    ✓
                  </span>
                ) : null}
                {checked && isSelected && !isAnswer ? (
                  <span aria-hidden="true" className="text-caption font-semibold">
                    ✕
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        {/* Umpan balik dibacakan pembaca layar saat jawaban diperiksa. */}
        <div aria-live="polite" role="status">
          {checked ? (
            <Callout
              tone={isCorrect ? "success" : "danger"}
              title={isCorrect ? "Benar." : "Belum tepat."}
            >
              <span lang="ja" className="font-jp-serif">
                {current.item.char}
              </span>{" "}
              dibaca <span className="font-medium text-fg">{current.item.romaji}</span>.
            </Callout>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-caption text-fg-subtle">
            {checked ? "Jawaban sudah diperiksa." : "Pilih satu jawaban — langsung diperiksa."}
          </p>
          {checked ? (
            <Button onClick={next}>
              {index + 1 >= total ? "Lihat hasil" : "Soal berikutnya"}
            </Button>
          ) : null}
        </div>
      </CardBody>
    </Card>
  );
}

/* ------------------------------------------------------------------ *
 * Halaman
 * ------------------------------------------------------------------ */

export default function KanaPage() {
  // Kana tidak difilter per level — `level` hanya dipakai untuk konteks navigasi.
  const { level } = useActiveLevel();
  const [prefs] = usePrefs();
  const [type, setType] = useState<KanaType>("hiragana");
  const [mode, setMode] = useState<Mode>("belajar");
  const [showRomaji, setShowRomaji] = useState(true);

  const pool = type === "hiragana" ? hiragana : katakana;
  const scriptLabel = type === "hiragana" ? "Hiragana" : "Katakana";
  const meta = levelMeta(level);

  const families = useMemo(
    () =>
      FAMILIES.map((family) => {
        const rows = kanaRows
          .filter((row) => familyOf(row) === family.key)
          .map((row) => ({
            row,
            label: kanaRowLabels[row] ?? row,
            items: pool.filter((item) => item.row === row),
          }))
          .filter((group) => group.items.length > 0);

        return {
          ...family,
          rows,
          count: rows.reduce((sum, group) => sum + group.items.length, 0),
          glyph: rows[0]?.items[0]?.char ?? "あ",
        };
      }).filter((family) => family.rows.length > 0),
    [pool],
  );

  return (
    <div className="space-y-8 pb-10 md:space-y-10">
      <PageHeader
        title="Kana"
        japanese="かな"
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">Kana</span>
            <span lang="ja" className="font-jp text-caption text-fg-subtle">
              もじ
            </span>
          </div>
        }
        description="Hiragana dan katakana: dasar bunyi bahasa Jepang. Klik sel untuk mendengar pelafalannya, lalu uji dengan kuis dua arah."
      />

      <Toolbar>
        <ToolbarGroup className="w-full sm:w-auto">
          <SegmentedControl
            block
            ariaLabel="Pilih aksara"
            value={type}
            onChange={(value) => setType(value)}
            options={SCRIPT_OPTIONS}
            className="w-full sm:w-auto"
          />
        </ToolbarGroup>
        <ToolbarGroup className="w-full flex-wrap justify-between gap-y-2 sm:w-auto sm:justify-end">
          <SegmentedControl
            ariaLabel="Mode tampilan"
            value={mode}
            onChange={(value) => setMode(value)}
            options={MODE_OPTIONS}
          />
          {mode === "belajar" ? (
            <Button variant="ghost" size="sm" onClick={() => setShowRomaji((value) => !value)}>
              {showRomaji ? "Sembunyikan romaji" : "Tampilkan romaji"}
            </Button>
          ) : null}
        </ToolbarGroup>
      </Toolbar>

      {mode === "belajar" ? (
        <div className="space-y-8 md:space-y-10">
          {families.map((family) => (
            <Section
              key={family.key}
              glyph={family.glyph}
              title={family.title}
              description={family.description}
              action={<span className="label-micro">{family.count} huruf</span>}
            >
              <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2 xl:grid-cols-3">
                {family.rows.map((group) => (
                  <div key={group.row}>
                    <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-2">
                      <span className="flex items-baseline gap-2">
                        <span className="inline-flex items-center rounded-md bg-level-soft px-2 py-1 text-caption font-semibold leading-none text-level">
                          {group.label}
                        </span>
                        <span className="text-caption text-fg-subtle">{group.row}</span>
                      </span>
                      <span className="label-micro">{group.items.length} huruf</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                      {group.items.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => speak(item.char, { rate: prefs.ttsRate })}
                          title={`${item.char} · ${item.romaji} — klik untuk mendengar`}
                          aria-label={`${item.char}, dibaca ${item.romaji}. Putar pelafalan.`}
                          className="group flex min-h-16 flex-col items-center justify-center gap-1 rounded-lg border border-border bg-surface px-1 py-2 text-center transition-colors duration-150 hover:border-level/40 hover:bg-level-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper active:translate-y-px"
                        >
                          <span
                            lang="ja"
                            className={cn(
                              "font-jp-serif whitespace-nowrap font-semibold leading-none text-fg",
                              item.char.length > 1 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl",
                            )}
                          >
                            {item.char}
                          </span>
                          <span
                            aria-hidden="true"
                            className={cn(
                              "text-caption leading-none text-fg-muted transition-opacity duration-150",
                              showRomaji
                                ? "opacity-100"
                                : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                            )}
                          >
                            {item.romaji}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          ))}

          <Card className="border-level/30 bg-level-soft/50">
            <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-h3 font-semibold tracking-tight text-fg">Sudah hafal hurufnya?</p>
                <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                  Uji dengan {QUIZ_LENGTH} soal acak — arah huruf → romaji atau romaji → huruf.
                </p>
              </div>
              <Button className="sm:shrink-0" onClick={() => setMode("kuis")}>
                Mulai kuis
              </Button>
            </CardBody>
          </Card>

          <Callout tone="info" title="Kana sama di semua level">
            Kana adalah fondasi yang tidak berubah dari N5 sampai N1. Halaman ini menampilkan{" "}
            {pool.length} {scriptLabel.toLowerCase()} (total {kana.length} entri hiragana &amp;
            katakana) dan tidak difilter per level — Anda sedang berada di {level} · {meta.name}.
          </Callout>
        </div>
      ) : (
        <KanaQuiz key={type} pool={pool} scriptLabel={scriptLabel} />
      )}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <Link
          href={levelHref(level)}
          className="text-caption font-medium text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
        >
          ← Ringkasan {level} · {meta.name}
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-fg-subtle">
          <Link href="/dashboard" className="transition-colors hover:text-fg">
            Dasbor
          </Link>
          <Link href={levelHref(level, "vocab")} className="transition-colors hover:text-fg">
            Kosakata
          </Link>
          <span lang="ja" className="font-jp-serif text-sm text-fg-subtle">
            続けよう
          </span>
        </div>
      </footer>
    </div>
  );
}
