"use client";

import { useState } from "react";
import { Badge, Button, Card, CardContent, cn, ProgressBar } from "@manabi/ui";
import { QUESTION_KIND_LABEL, scoreMessage, type Question } from "@/lib/quiz";
import { recordQuiz } from "@/lib/store";

interface QuizRunnerProps {
  questions: Question[];
  /** Label untuk disimpan di riwayat quiz, contoh: "Latihan kana" */
  label: string;
  onRestart?: () => void;
  restartLabel?: string;
}

export function QuizRunner({
  questions,
  label,
  onRestart,
  restartLabel = "Buat soal baru",
}: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<Array<number | null>>([]);

  const total = questions.length;
  const current = questions[index];

  if (total === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-ink-500">
          Belum ada soal untuk latihan ini.
        </CardContent>
      </Card>
    );
  }

  function handleCheck() {
    if (selected === null || checked) return;
    setChecked(true);
    setAnswers((prev) => [...prev, selected]);
    if (selected === current.answer) setCorrectCount((count) => count + 1);
  }

  function handleNext() {
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

  if (finished) {
    const percent = Math.round((correctCount / total) * 100);

    return (
      <div className="space-y-4 animate-fade-up">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-sakura-50 to-matcha-50 p-8 text-center">
            <p className="text-sm font-medium text-ink-500">Hasil latihan</p>
            <p className="mt-2 text-5xl font-bold text-ink-900">
              {correctCount}
              <span className="text-2xl text-ink-400"> / {total}</span>
            </p>
            <p className="mt-1 text-sm text-ink-500">{percent}% benar</p>
            <p className="mt-4 text-base font-medium text-sakura-700">
              {scoreMessage(correctCount, total)}
            </p>
          </div>
          <CardContent className="p-5">
            <ProgressBar value={correctCount} max={total} tone={percent >= 70 ? "matcha" : "sakura"} />
            <div className="mt-5 space-y-2">
              {questions.map((question, questionIndex) => {
                const userAnswer = answers[questionIndex];
                const correct = userAnswer === question.answer;
                return (
                  <div
                    key={question.id}
                    className="rounded-xl border border-ink-100 bg-white p-3 text-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="jp truncate font-medium text-ink-800">{question.prompt}</p>
                        <p className="mt-0.5 truncate text-xs text-ink-400">
                          Jawaban: {question.options[question.answer]}
                        </p>
                      </div>
                      <Badge tone={correct ? "matcha" : "sakura"}>
                        {correct ? "Benar" : "Salah"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={handleRestart}>{restartLabel}</Button>
              <Button variant="outline" onClick={() => window.location.assign("/dashboard")}>
                Ke dasbor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-ink-500">
        <span>
          Soal {index + 1} dari {total}
        </span>
        <Badge tone="sakura">{QUESTION_KIND_LABEL[current.kind]}</Badge>
      </div>

      <ProgressBar value={index} max={total} />

      <Card className="animate-fade-up">
        <CardContent className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">
            {current.subPrompt ?? "Pilih jawaban yang benar"}
          </p>
          <p className="jp mt-3 text-3xl font-semibold text-ink-900">{current.prompt}</p>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {current.options.map((option, optionIndex) => {
              const isSelected = selected === optionIndex;
              const isCorrect = optionIndex === current.answer;
              const showCorrect = checked && isCorrect;
              const showWrong = checked && isSelected && !isCorrect;

              return (
                <button
                  key={option}
                  type="button"
                  disabled={checked}
                  onClick={() => setSelected(optionIndex)}
                  className={cn(
                    "jp flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-base transition-colors",
                    "border-ink-200 bg-white text-ink-800 hover:border-sakura-300 hover:bg-sakura-50",
                    isSelected && !checked && "border-sakura-400 bg-sakura-50",
                    showCorrect && "border-matcha-500 bg-matcha-50 text-matcha-600",
                    showWrong && "border-red-400 bg-red-50 text-red-700",
                  )}
                >
                  <span>{option}</span>
                  {showCorrect && <span aria-hidden="true">✓</span>}
                  {showWrong && <span aria-hidden="true">✕</span>}
                </button>
              );
            })}
          </div>

          {checked && (
            <div
              className={cn(
                "mt-5 rounded-xl border p-4 text-sm",
                selected === current.answer
                  ? "border-matcha-200 bg-matcha-50 text-matcha-600"
                  : "border-red-200 bg-red-50 text-red-700",
              )}
            >
              <p className="font-medium">
                {selected === current.answer ? "Benar!" : "Belum tepat."}
              </p>
              <p className="mt-1 text-ink-700">{current.explanation}</p>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            {!checked ? (
              <Button onClick={handleCheck} disabled={selected === null}>
                Periksa jawaban
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {index + 1 >= total ? "Lihat hasil" : "Soal berikutnya"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
