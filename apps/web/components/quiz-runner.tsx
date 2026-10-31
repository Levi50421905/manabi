"use client";

import { useEffect, useState } from "react";
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
  cn,
} from "@manabi/ui";
import { QUESTION_KIND_LABEL, scoreMessage, type Question } from "@/lib/quiz";
import { recordQuiz } from "@/lib/store";

interface QuizRunnerProps {
  questions: Question[];
  /** Label untuk disimpan di riwayat quiz, contoh: "Latihan kana" */
  label: string;
  onRestart?: () => void;
  restartLabel?: string;
}

/** Apakah teks memuat huruf Jepang (kana/kanji)? */
const JAPANESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff66-\uff9f]/;

function japaneseFont(text: string): string {
  return JAPANESE.test(text) ? "font-jp" : "";
}

/** Label kecil di atas soal — teks Jepang tidak dirender sebagai mikro-label mono. */
function promptLabelFont(text: string): string {
  return JAPANESE.test(text)
    ? "font-jp text-body font-medium leading-relaxed text-fg-muted"
    : "label-micro";
}

/** Ukuran teks soal mengikuti panjangnya — soal pendek tampil paling besar. */
function promptFont(prompt: string): string {
  const family = JAPANESE.test(prompt) ? "font-jp-serif" : "font-display";
  if (prompt.length > 40) return cn(family, "text-h2 leading-relaxed");
  if (prompt.length > 18) return cn(family, "text-h1 leading-snug");
  return cn(family, "text-display leading-tight");
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className="tnum rounded border border-border bg-surface-muted px-1.5 py-0.5 font-sans text-caption font-semibold text-fg-muted">
      {children}
    </kbd>
  );
}

/**
 * Mesin latihan: satu kartu soal fokus, empat opsi lebar, umpan balik seketika,
 * lalu ringkasan skor di akhir. Shortcut 1–4 dan Enter dipertahankan.
 */
export function QuizRunner({
  questions,
  label,
  onRestart,
  restartLabel = "Buat soal baru",
}: QuizRunnerProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Array<number | null>>([]);

  const total = questions.length;
  const current = questions[index];

  function handleCheck() {
    if (!current || selected === null || checked) return;
    setChecked(true);
    setAnswers((prev) => [...prev, selected]);
    if (selected === current.answer) setCorrectCount((count) => count + 1);
  }

  function handleNext() {
    if (!current) return;
    if (index + 1 >= total) {
      setFinished(true);
      recordQuiz(label, correctCount, total);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    setChecked(false);
  }

  function handleRestart() {
    setIndex(0);
    setSelected(null);
    setChecked(false);
    setCorrectCount(0);
    setAnswers([]);
    setFinished(false);
    onRestart?.();
  }

  // Shortcut keyboard: tombol 1–4 memilih jawaban, Enter untuk periksa/lanjut.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      if (finished || !current) return;

      if (event.key >= "1" && event.key <= "4") {
        const optionIndex = Number(event.key) - 1;
        if (!checked && optionIndex < current.options.length) {
          event.preventDefault();
          setSelected(optionIndex);
        }
        return;
      }

      if (event.key === "Enter") {
        if (checked) {
          event.preventDefault();
          handleNext();
        } else if (selected !== null) {
          event.preventDefault();
          handleCheck();
        }
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  if (total === 0 || !current) {
    return (
      <EmptyState
        glyph="問"
        title="Belum ada soal untuk latihan ini"
        description="Materi pada level ini belum cukup untuk menyusun soal. Coba mode lain atau level yang sudah tersedia."
        action={
          onRestart ? (
            <Button variant="outline" onClick={handleRestart}>
              Kembali ke pilihan
            </Button>
          ) : undefined
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
            <p className="label-micro">Hasil latihan</p>
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
              {questions.map((question, questionIndex) => {
                const picked = answers[questionIndex];
                const correct = picked === question.answer;
                return (
                  <li
                    key={question.id}
                    className="flex items-start gap-3 px-4 py-3.5 sm:px-5"
                  >
                    <span className="tnum mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-muted text-caption font-semibold text-fg-muted">
                      {questionIndex + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-body font-medium leading-snug",
                          japaneseFont(question.prompt),
                        )}
                      >
                        {question.prompt}
                      </p>
                      <p className="mt-1 text-caption leading-relaxed text-fg-muted">
                        Jawabanmu:{" "}
                        <span className={correct ? "text-success" : "text-danger"}>
                          {picked === undefined || picked === null
                            ? "(kosong)"
                            : question.options[picked]}
                        </span>
                        {correct ? null : (
                          <>
                            {" · "}Kunci:{" "}
                            <span className="text-success">
                              {question.options[question.answer]}
                            </span>
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

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" className="w-full sm:w-auto" onClick={handleRestart}>
            {restartLabel}
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
  const isCorrect = checked && selected === current.answer;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="label-micro tnum">
          Soal {index + 1} / {total}
        </p>
        <Badge tone="level">{QUESTION_KIND_LABEL[current.kind]}</Badge>
      </div>

      <ProgressBar
        value={checked ? index + 1 : index}
        max={total}
        tone="level"
        aria-label={`Progres soal ${index + 1} dari ${total}`}
      />

      <Card key={current.id} className="animate-fade-up">
        <CardBody className="p-5 sm:p-7">
          <p className={promptLabelFont(current.subPrompt ?? "Pilih jawaban yang benar")}>
            {current.subPrompt ?? "Pilih jawaban yang benar"}
          </p>

          <p
            lang={JAPANESE.test(current.prompt) ? "ja" : undefined}
            className={cn("mt-3 whitespace-pre-wrap", promptFont(current.prompt))}
          >
            {current.prompt}
          </p>

          <div className="mt-6 space-y-2" role="group" aria-label="Pilihan jawaban">
            {current.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              const showCorrect = checked && optionIndex === current.answer;
              const showWrong = checked && isSelected && optionIndex !== current.answer;

              return (
                <button
                  key={`${option}-${optionIndex}`}
                  type="button"
                  disabled={checked}
                  aria-pressed={isSelected}
                  aria-label={`Pilihan ${optionIndex + 1}: ${option}`}
                  onClick={() => setSelected(optionIndex)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-caption transition-colors duration-150",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                    "disabled:cursor-default",
                    !checked && "border-border bg-surface hover:border-border-strong hover:bg-surface-muted",
                    !checked && isSelected && "border-level bg-level-soft hover:border-level",
                    showCorrect && "border-success bg-success-soft",
                    showWrong && "border-danger bg-danger-soft",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "tnum mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border font-semibold",
                      !checked && "border-border bg-surface-muted text-fg-muted",
                      !checked && isSelected && "border-level bg-level text-level-contrast",
                      showCorrect && "border-success bg-success text-accent-contrast",
                      showWrong && "border-danger bg-danger text-accent-contrast",
                    )}
                  >
                    {optionIndex + 1}
                  </span>
                  <span
                    lang={JAPANESE.test(option) ? "ja" : undefined}
                    className={cn("min-w-0 flex-1 text-body leading-relaxed", japaneseFont(option))}
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

          <div aria-live="polite" aria-atomic="true" className="mt-5">
            {checked ? (
              <Callout tone={isCorrect ? "success" : "danger"} title={isCorrect ? "Benar!" : "Belum tepat."}>
                <p className="text-sm leading-relaxed text-fg">{current.explanation}</p>
                {isCorrect ? null : (
                  <p className="mt-1.5 text-caption text-fg-muted">
                    Jawaban benar:{" "}
                    <span className="font-semibold text-success">
                      {current.options[current.answer]}
                    </span>
                  </p>
                )}
              </Callout>
            ) : null}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex flex-wrap items-center gap-1.5 text-caption text-fg-subtle">
              <Key>1</Key>–<Key>4</Key> pilih · <Key>Enter</Key>{" "}
              {checked ? "lanjut" : "periksa"}
            </p>
            {checked ? (
              <Button size="lg" className="w-full sm:w-auto" onClick={handleNext}>
                {index + 1 >= total ? "Lihat hasil" : "Soal berikutnya"}
              </Button>
            ) : (
              <Button
                size="lg"
                className="w-full sm:w-auto"
                onClick={handleCheck}
                disabled={selected === null}
              >
                Periksa jawaban
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
