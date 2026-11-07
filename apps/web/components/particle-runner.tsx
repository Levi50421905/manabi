"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  EmptyState,
  ProgressBar,
} from "@manabi/ui";
import { particlesByLevel, type ParticleQuizMode } from "@manabi/content";
import {
  PARTICLE_MODE_HINT,
  PARTICLE_MODE_LABEL,
  isTypedAnswerCorrect,
  type ParticleQuizItem,
} from "@/lib/partikel";
import { scoreMessage } from "@/lib/quiz";
import { recordQuiz } from "@/lib/store";
import { useActiveLevel } from "@/lib/level";

interface ParticleRunnerProps {
  items: ParticleQuizItem[];
  /** Label untuk disimpan di riwayat latihan, mis. "Latihan partikel Isi celah · N5". */
  label: string;
  /** Dipanggil dari tombol "Selesai" di layar hasil (kembali ke penyiapan). */
  onDone: () => void;
  /** Dipanggil dari tombol "Ulangi" — induk menyusun sesi baru. */
  onRestart: () => void;
  /** Bila diisi, tombol "Keluar" tampil di header runner (dipakai kunci sesi). */
  onExit?: () => void;
}

interface EvaluatedBlank {
  given: string;
  answer: string;
  correct: boolean;
}

interface Evaluation {
  correct: boolean;
  given: string;
  blanks?: EvaluatedBlank[];
}

interface ItemResult {
  correct: boolean;
  given: string;
  expected: string;
}

const JAPANESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff66-\uff9f]/;

function isChoiceMode(mode: ParticleQuizMode): boolean {
  return mode === "isi-celah" || mode === "fungsi" || mode === "pasangan";
}

function japaneseFont(text: string): string {
  return JAPANESE.test(text) ? "font-jp" : "";
}

/** Ukuran kalimat soal mengikuti panjangnya. */
function promptFont(prompt: string): string {
  if (prompt.length > 40) return "font-jp-serif text-h2 leading-relaxed";
  if (prompt.length > 18) return "font-jp-serif text-h1 leading-snug";
  return "font-jp-serif text-display leading-tight";
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="tnum rounded border border-border bg-surface-muted px-1.5 py-0.5 font-sans text-caption font-semibold text-fg-muted">
      {children}
    </kbd>
  );
}

/**
 * Mesin latihan partikel: satu soal fokus per layar dengan tiga bentuk jawaban
 * (pilihan ganda, ketik, lengkapi teks), lalu ringkasan skor di akhir.
 *
 * Komponen ini sengaja terpisah dari `quiz-runner` karena bentuk soal partikel
 * berbeda (bisa multi-celah dan jawaban diketik).
 */
export function ParticleRunner({
  items,
  label,
  onDone,
  onRestart,
  onExit,
}: ParticleRunnerProps) {
  const router = useRouter();
  const { level } = useActiveLevel();
  const pool = useMemo(() => particlesByLevel(level), [level]);

  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<number | null>(null);
  const [typed, setTyped] = useState("");
  const [blankPicks, setBlankPicks] = useState<Array<number | null>>([]);
  const [checked, setChecked] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [results, setResults] = useState<Array<ItemResult>>([]);
  const [finished, setFinished] = useState(false);
  /** Penjaga agar `recordQuiz` hanya terpanggil sekali saat masuk layar hasil. */
  const finishedRef = useRef(false);

  const total = items.length;
  const current = items[index];
  const blanks = current?.blanks ?? [];

  const blanksFilled =
    blanks.length > 0 &&
    blanks.every((_, blankIndex) => {
      const picked = blankPicks[blankIndex];
      return picked !== null && picked !== undefined;
    });

  const canCheck = (() => {
    if (!current) return false;
    if (current.mode === "lengkapi-teks") return blanksFilled;
    if (current.mode === "ketik") return typed.trim().length > 0;
    return choice !== null;
  })();

  function resetQuestionState() {
    setChoice(null);
    setTyped("");
    setBlankPicks([]);
    setChecked(false);
    setEvaluation(null);
  }

  function finishSession() {
    if (finishedRef.current || total === 0) return;
    finishedRef.current = true;
    setFinished(true);
    recordQuiz(label, correctCount, total);
  }

  function handleCheck() {
    if (!current || checked || !canCheck) return;

    let correct = false;
    let given = "";
    let expected = current.answer;
    let evaluatedBlanks: EvaluatedBlank[] | undefined;

    if (current.mode === "lengkapi-teks") {
      const items = current.blanks ?? [];
      evaluatedBlanks = items.map((blank, blankIndex) => {
        const picked = blankPicks[blankIndex];
        const value = picked === null || picked === undefined ? "" : blank.options[picked] ?? "";
        return { given: value, answer: blank.answer, correct: value === blank.answer };
      });
      correct = evaluatedBlanks.every((blank) => blank.correct);
      given = evaluatedBlanks.map((blank) => blank.given || "—").join(" · ");
      expected = items.map((blank) => blank.answer).join(" · ");
    } else if (current.mode === "ketik") {
      correct = isTypedAnswerCorrect(current, typed, pool);
      given = typed.trim();
    } else {
      const picked = choice === null ? "" : current.options[choice] ?? "";
      correct = picked === current.answer;
      given = picked;
    }

    setChecked(true);
    setEvaluation({ correct, given, blanks: evaluatedBlanks });
    setResults((previous) => {
      const next = [...previous];
      next[index] = { correct, given, expected };
      return next;
    });
    if (correct) setCorrectCount((count) => count + 1);
  }

  function handleNext() {
    if (!current) return;
    if (index + 1 >= total) {
      finishSession();
      return;
    }
    setIndex((value) => value + 1);
    resetQuestionState();
    window.scrollTo({ top: 0 });
  }

  function handleRestart() {
    setIndex(0);
    resetQuestionState();
    setCorrectCount(0);
    setResults([]);
    setFinished(false);
    finishedRef.current = false;
    onRestart();
  }

  // Shortcut: 1–4 memilih opsi (mode pilihan ganda) dan Enter memeriksa/lanjut.
  // Mode ketik & lengkapi teks memakai submit form, jadi Enter di dalam input
  // tidak direbut di sini.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (finished || !current) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (checked) {
        if (event.key === "Enter") {
          event.preventDefault();
          handleNext();
        }
        return;
      }

      if (!isChoiceMode(current.mode)) return;

      if (event.key >= "1" && event.key <= "4") {
        const optionIndex = Number(event.key) - 1;
        if (optionIndex < current.options.length) {
          event.preventDefault();
          setChoice(optionIndex);
        }
        return;
      }

      if (event.key === "Enter" && choice !== null) {
        event.preventDefault();
        handleCheck();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (total === 0 || !current) {
    return (
      <EmptyState
        glyph="助"
        title="Belum ada soal partikel"
        description="Bank soal untuk pilihan mode ini kosong. Pilih mode lain atau level yang sudah tersedia."
        action={
          <Button variant="outline" onClick={handleRestart}>
            Kembali ke pilihan
          </Button>
        }
      />
    );
  }

  /* ---------------- ringkasan skor ---------------- */
  if (finished) {
    const percent = total === 0 ? 0 : Math.round((correctCount / total) * 100);

    return (
      <div className="animate-fade-up space-y-5">
        <Card>
          <CardBody className="p-6 text-center sm:p-8">
            <p className="label-micro">Hasil latihan partikel</p>
            <p className="tnum mt-3 flex items-baseline justify-center gap-2 font-display text-display font-semibold leading-none text-fg">
              {correctCount}
              <span className="text-h2 font-normal text-fg-muted">/ {total}</span>
            </p>
            <p className="tnum mt-2 text-caption text-fg-muted">
              {percent}% benar · {total - correctCount} salah
            </p>
            <p className="mt-4 text-body font-medium leading-relaxed text-fg">
              {scoreMessage(correctCount, total)}
            </p>
            <ProgressBar
              className="mx-auto mt-5 max-w-sm"
              value={correctCount}
              max={total}
              tone={percent >= 70 ? "success" : "level"}
              aria-label={`Skor ${correctCount} dari ${total}`}
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div className="min-w-0">
              <CardTitle>Rincian jawaban</CardTitle>
              <p className="mt-1 text-caption text-fg-muted">
                Periksa lagi soal yang belum tepat.
              </p>
            </div>
            <Badge tone="neutral" mono>
              {correctCount}/{total}
            </Badge>
          </CardHeader>
          <CardBody className="p-0">
            <ul className="divide-y divide-border">
              {items.map((item, itemIndex) => {
                const result = results[itemIndex];
                const correct = result?.correct ?? false;
                const given = result?.given ?? "(kosong)";
                const expected =
                  result?.expected ??
                  (item.mode === "lengkapi-teks"
                    ? (item.blanks ?? []).map((blank) => blank.answer).join(" · ")
                    : item.answer);

                return (
                  <li key={item.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
                    <span className="tnum mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-muted text-caption font-semibold text-fg-muted">
                      {itemIndex + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        lang="ja"
                        className={`text-body font-medium leading-snug ${japaneseFont(item.prompt)}`}
                      >
                        {item.prompt}
                      </p>
                      <p className="mt-1 text-caption leading-relaxed text-fg-muted">
                        {PARTICLE_MODE_LABEL[item.mode]} · Jawabanmu:{" "}
                        <span className={correct ? "text-success" : "text-danger"}>{given}</span>
                        {correct ? null : (
                          <>
                            {" · "}Kunci: <span className="text-success">{expected}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <Badge tone={correct ? "success" : "danger"} className="shrink-0">
                      {correct ? "Benar" : "Salah"}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button size="lg" className="w-full sm:w-auto" onClick={onDone}>
            Selesai
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleRestart}
          >
            Ulangi
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.push("/dashboard")}
          >
            Ke dasbor
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------- soal berjalan ---------------- */
  const explanationText = current.explanation;
  const explanationFont = JAPANESE.test(explanationText) ? "font-jp" : "";
  const correctRomaji =
    current.mode === "ketik"
      ? pool.find((particle) => particle.char === current.answer)?.romaji
      : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="label-micro tnum">
          Soal {index + 1} / {total}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="tnum hidden text-caption text-fg-subtle sm:inline">
            benar {correctCount}
          </span>
          <Badge tone="level">{PARTICLE_MODE_LABEL[current.mode]}</Badge>
          {onExit ? (
            <Button
              size="sm"
              variant="outline"
              className="h-11 px-3"
              aria-label="Keluar dari latihan partikel"
              onClick={onExit}
            >
              Keluar
            </Button>
          ) : null}
        </div>
      </div>

      <ProgressBar
        value={checked ? index + 1 : index}
        max={total}
        tone="level"
        aria-label={`Progres soal ${index + 1} dari ${total}`}
      />

      <Card key={current.id} className="animate-fade-up">
        <CardBody className="p-5 sm:p-7">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (checked) handleNext();
              else handleCheck();
            }}
          >
            <p className="text-caption font-medium leading-relaxed text-fg">
              {current.ask}
            </p>

            {current.mode === "lengkapi-teks" ? (
              <p
                lang="ja"
                className={`mt-3 whitespace-pre-wrap text-fg ${promptFont(current.prompt)}`}
              >
                {current.prompt.split("___").map((part, partIndex) => {
                  const blank = blanks[partIndex];
                  if (!blank) {
                    return <span key={`part-${partIndex}`}>{part}</span>;
                  }

                  const picked = blankPicks[partIndex];
                  const value =
                    picked === null || picked === undefined
                      ? ""
                      : blank.options[picked] ?? "";
                  const blankCorrect = checked && value === blank.answer;
                  const blankWrong = checked && !blankCorrect;

                  return (
                    <span key={`part-${partIndex}`}>
                      {part}
                      <select
                        aria-label={`Celah ${partIndex + 1}`}
                        value={picked === null || picked === undefined ? "" : String(picked)}
                        disabled={checked}
                        onChange={(event) => {
                          const raw = event.target.value;
                          setBlankPicks((previous) => {
                            const next = [...previous];
                            next[partIndex] = raw === "" ? null : Number(raw);
                            return next;
                          });
                        }}
                        className={[
                          "mx-1 inline-block h-11 min-w-[4.5rem] cursor-pointer rounded-lg border px-2 align-middle font-jp text-body font-semibold transition-colors duration-150",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-default",
                          blankCorrect
                            ? "border-success bg-success-soft text-success"
                            : blankWrong
                              ? "border-danger bg-danger-soft text-danger"
                              : "border-border bg-surface text-fg",
                        ].join(" ")}
                      >
                        <option value="">—</option>
                        {blank.options.map((option, optionIndex) => (
                          <option key={`${option}-${optionIndex}`} value={optionIndex}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </span>
                  );
                })}
              </p>
            ) : (
              <p
                lang={JAPANESE.test(current.prompt) ? "ja" : undefined}
                className={`mt-3 whitespace-pre-wrap text-fg ${promptFont(current.prompt)}`}
              >
                {current.prompt}
              </p>
            )}

            {current.promptId ? (
              <p className="mt-2 text-caption leading-relaxed text-fg-muted">
                Artinya: {current.promptId}
              </p>
            ) : null}

            {isChoiceMode(current.mode) ? (
              <div className="mt-6 space-y-2" role="group" aria-label="Pilihan jawaban">
                {current.options.map((option, optionIndex) => {
                  const isSelected = choice === optionIndex;
                  const isAnswer = option === current.answer;
                  const showCorrect = checked && isAnswer;
                  const showWrong = checked && isSelected && !isAnswer;

                  const stateClass = checked
                    ? showCorrect
                      ? "border-success bg-success-soft"
                      : showWrong
                        ? "border-danger bg-danger-soft"
                        : "border-border bg-surface opacity-70"
                    : isSelected
                      ? "border-level bg-level-soft"
                      : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted";

                  const chipClass = checked
                    ? showCorrect
                      ? "border-success bg-success text-accent-contrast"
                      : showWrong
                        ? "border-danger bg-danger text-accent-contrast"
                        : "border-border bg-surface-muted text-fg-muted"
                    : isSelected
                      ? "border-level bg-level text-level-contrast"
                      : "border-border bg-surface-muted text-fg-muted";

                  return (
                    <button
                      key={`${option}-${optionIndex}`}
                      type="button"
                      disabled={checked}
                      aria-pressed={isSelected}
                      aria-label={`Pilihan ${optionIndex + 1}: ${option}`}
                      onClick={() => setChoice(optionIndex)}
                      className={`flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-caption transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:cursor-default ${stateClass}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`tnum mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border font-semibold ${chipClass}`}
                      >
                        {optionIndex + 1}
                      </span>
                      <span
                        lang={JAPANESE.test(option) ? "ja" : undefined}
                        className={`min-w-0 flex-1 text-body leading-relaxed ${japaneseFont(option)}`}
                      >
                        {option}
                      </span>
                      {showCorrect ? (
                        <span aria-hidden="true" className="text-sm font-semibold text-success">
                          ✓
                        </span>
                      ) : null}
                      {showWrong ? (
                        <span aria-hidden="true" className="text-sm font-semibold text-danger">
                          ✕
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {current.mode === "ketik" ? (
              <div className="mt-6">
                <label htmlFor={`particle-answer-${current.id}`} className="label-micro">
                  Jawabanmu
                </label>
                <input
                  key={current.id}
                  id={`particle-answer-${current.id}`}
                  type="text"
                  value={typed}
                  disabled={checked}
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  enterKeyHint="done"
                  aria-label="Tulis partikel jawaban"
                  placeholder="Tulis partikel, kana atau romaji…"
                  onChange={(event) => setTyped(event.target.value)}
                  className="mt-2 h-12 w-full rounded-lg border border-border bg-surface px-3 font-jp text-h3 text-fg placeholder:text-fg-subtle focus:border-border-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:opacity-70"
                />
                <p className="mt-1.5 text-caption text-fg-subtle">
                  Kana maupun romaji diterima, mis. は atau wa.
                </p>
              </div>
            ) : null}

            {current.mode === "lengkapi-teks" && !checked ? (
              <p className="mt-3 text-caption leading-relaxed text-fg-muted">
                Isi semua celah, lalu periksa jawaban.
              </p>
            ) : null}

            <div aria-live="polite" aria-atomic="true" className="mt-5">
              {checked && evaluation ? (
                <Callout
                  tone={evaluation.correct ? "success" : "danger"}
                  title={evaluation.correct ? "Benar!" : "Belum tepat."}
                >
                  <p className={`text-body leading-relaxed text-fg ${explanationFont}`}>
                    {explanationText}
                  </p>

                  {evaluation.correct ? null : current.mode === "lengkapi-teks" ? (
                    <ul className="mt-2 space-y-1">
                      {(evaluation.blanks ?? []).map((blank, blankIndex) => (
                        <li
                          key={`blank-${blankIndex}`}
                          className="text-caption leading-relaxed text-fg-muted"
                        >
                          Celah {blankIndex + 1}:{" "}
                          <span className="font-semibold text-danger">
                            {blank.given || "—"}
                          </span>{" "}
                          · kunci <span className="font-semibold text-success">{blank.answer}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1.5 text-caption text-fg-muted">
                      Jawaban benar:{" "}
                      <span className="font-semibold text-success">
                        {current.answer}
                        {correctRomaji ? ` (${correctRomaji})` : ""}
                      </span>
                    </p>
                  )}

                  {evaluation.correct
                    ? null
                    : evaluation.given && current.wrongNotes?.[evaluation.given]
                      ? (
                          <p className="mt-1.5 text-caption leading-relaxed text-fg-muted">
                            {current.wrongNotes[evaluation.given]}
                          </p>
                        )
                      : null}
                </Callout>
              ) : null}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex flex-wrap items-center gap-1.5 text-caption text-fg-subtle">
                {isChoiceMode(current.mode) ? (
                  <>
                    <Key>1</Key>–<Key>4</Key> pilih · <Key>Enter</Key>{" "}
                    {checked ? "lanjut" : "periksa"}
                  </>
                ) : (
                  <>
                    <Key>Enter</Key>{" "}
                    {checked ? "lanjut" : current.mode === "ketik" ? "kirim" : "periksa"}
                  </>
                )}
              </p>
              <Button
                size="lg"
                type={checked ? "button" : "submit"}
                className="w-full sm:w-auto"
                onClick={checked ? handleNext : undefined}
                disabled={!checked && !canCheck}
              >
                {checked
                  ? index + 1 >= total
                    ? "Lihat hasil"
                    : "Soal berikutnya"
                  : "Periksa jawaban"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
