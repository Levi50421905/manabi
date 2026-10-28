"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge, Button, Card, CardContent, PageHeader, ProgressBar, cn } from "@manabi/ui";
import {
  allQuestions,
  buildExam,
  formatClock,
  scoreExam,
  type ExamKind,
  type ExamResult,
  type ExamSpec,
} from "@/lib/exam";
import { QUESTION_KIND_LABEL } from "@/lib/quiz";
import { recordQuiz } from "@/lib/store";
import { createUtterance, speak } from "@/lib/tts";

const MODES: Array<{ kind: ExamKind; title: string; detail: string }> = [
  {
    kind: "jlpt-n5",
    title: "JLPT N5",
    detail: "180 poin · 2 seksi · 45 menit · lulus ≥ 80 total dan ≥ 19 per seksi",
  },
  {
    kind: "jft-basic",
    title: "JFT-Basic",
    detail: "250 poin · 4 seksi · lulus ≥ 200 (80%)",
  },
];

export default function ExamPage() {
  const [spec, setSpec] = useState<ExamSpec | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);

  const questions = useMemo(() => (spec ? allQuestions(spec) : []), [spec]);
  const current = questions[index];

  function start(kind: ExamKind) {
    const built = buildExam(kind);
    setSpec(built);
    setAnswers({});
    setIndex(0);
    setRemaining(built.minutes * 60);
    setResult(null);
    window.scrollTo({ top: 0 });
  }

  function finish(currentAnswers: Record<string, number>, examSpec: ExamSpec) {
    const scored = scoreExam(examSpec, currentAnswers);
    const all = allQuestions(examSpec);
    const correct = all.filter((question) => currentAnswers[question.id] === question.answer).length;
    setResult(scored);
    recordQuiz(`${examSpec.title}`, correct, all.length);
  }

  // Timer
  useEffect(() => {
    if (!spec || result) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [spec, result]);

  // Waktu habis → kumpulkan otomatis
  useEffect(() => {
    if (spec && !result && remaining === 0) {
      finish(answers, spec);
    }
  }, [remaining, spec, result, answers]);

  /** Putar dialog berurutan dengan suara berbeda per pembicara. */
  function playDialogue() {
    const lines = current?.audioLines;
    if (!lines || lines.length === 0) {
      if (current?.audioText) speak(current.audioText);
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    let cursor = 0;
    const next = () => {
      if (cursor >= lines.length) return;
      const line = lines[cursor];
      cursor += 1;
      if (!line) return;
      const utterance = createUtterance(line.jp, undefined, line.speakerIndex);
      if (!utterance) return;
      utterance.onend = next;
      synth.speak(utterance);
    };

    next();
  }

  /* ---------- layar hasil ---------- */
  if (spec && result) {
    return (
      <div className="space-y-5 pb-6">
        <PageHeader title={`Hasil ${spec.title}`} description={spec.description} />

        <Card className="overflow-hidden">
          <div
            className={cn(
              "p-8 text-center",
              result.passed
                ? "bg-success-soft"
                : "bg-danger-soft",
            )}
          >
            <p className="text-sm font-medium text-fg-muted">
              {result.passed ? "LULUS (simulasi)" : "BELUM LULUS (simulasi)"}
            </p>
            <p className="mt-2 text-5xl font-bold text-fg">
              {result.total}
              <span className="text-2xl text-fg-muted"> / {result.maxTotal}</span>
            </p>
            <p className="mt-2 text-sm text-fg-muted">
              Ambang lulus: <strong className="text-fg">{spec.passTotal} poin</strong>
              {spec.minSectionPoints
                ? ` · minimal ${spec.minSectionPoints} poin per seksi`
                : " · tanpa ambang per seksi"}
            </p>
          </div>

          <CardContent className="p-5">
            <h2 className="text-sm font-semibold text-fg">Rincian per seksi</h2>
            <ul className="mt-3 divide-y divide-border">
              {result.sections.map((section) => (
                <li key={section.key} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-fg">{section.label}</span>
                    <span className="text-sm font-semibold text-fg">
                      {section.score}
                      <span className="text-xs font-normal text-fg-muted"> / {section.maxPoints}</span>
                    </span>
                  </div>
                  <ProgressBar
                    className="mt-2"
                    value={section.score}
                    max={section.maxPoints}
                    tone={section.passedSection ? "matcha" : "sakura"}
                  />
                  <p className="mt-1 text-[11px] text-fg-muted">
                    {section.correct}/{section.total} soal benar
                    {spec.minSectionPoints
                      ? section.passedSection
                        ? ` · memenuhi ambang ${spec.minSectionPoints}`
                        : ` · di bawah ambang ${spec.minSectionPoints}`
                      : ""}
                  </p>
                </li>
              ))}
            </ul>

            {(() => {
              const wrong = questions.filter((question) => answers[question.id] !== question.answer);
              if (wrong.length === 0) {
                return (
                  <p className="mt-5 rounded-xl border border-success/40 bg-success-soft p-3 text-xs text-success">
                    Semua jawaban benar. 素晴らしい！
                  </p>
                );
              }
              return (
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-fg">
                    Pembahasan jawaban salah ({wrong.length})
                  </h3>
                  <ul className="mt-2 space-y-2">
                    {wrong.slice(0, 20).map((question) => {
                      const picked = answers[question.id];
                      return (
                        <li key={question.id} className="rounded-lg border border-border p-2.5">
                          <p lang="ja" className="jp text-sm font-medium text-fg">{question.prompt}</p>
                          <p className="mt-1 text-xs text-danger">
                            Jawabanmu:{" "}
                            {picked === undefined ? "(kosong)" : question.options[picked]}
                          </p>
                          <p className="text-xs text-success">
                            Kunci: {question.options[question.answer]}
                          </p>
                          <p className="mt-1 text-[11px] text-fg-muted">{question.explanation}</p>
                        </li>
                      );
                    })}
                  </ul>
                  {wrong.length > 20 && (
                    <p className="mt-2 text-[11px] text-fg-muted">
                      Menampilkan 20 dari {wrong.length} jawaban salah.
                    </p>
                  )}
                </div>
              );
            })()}

            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={() => start(spec.kind)}>Ulangi ujian</Button>
              <Button variant="outline" onClick={() => setSpec(null)}>
                Pilih mode lain
              </Button>
              <Link href="/dashboard">
                <Button variant="ghost">Ke dasbor</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------- layar pilih mode ---------- */
  if (!spec) {
    return (
      <div className="space-y-5 pb-6">
        <PageHeader
          title="Ujian (Simulasi)"
          description="Latihan dengan skala penilaian resmi. Hasilnya bukan sertifikat — hanya untuk mengukur kesiapan."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map((mode) => (
            <Card key={mode.kind}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <h2 className="text-base font-semibold text-fg">{mode.title}</h2>
                  <Badge tone="sakura">simulasi</Badge>
                </div>
                <p className="mt-1 text-xs text-fg-muted">{mode.detail}</p>
                <p className="mt-3 text-[11px] text-fg-muted">
                  {mode.kind === "jlpt-n5" ? "45 menit" : "40 menit"} · tanpa umpan balik di tengah
                  ujian
                </p>
                <Button className="mt-4 w-full" onClick={() => start(mode.kind)}>
                  Mulai {mode.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs leading-relaxed text-fg-muted">
              Catatan kejujuran: bank soal N5 di aplikasi ini masih terbatas (708 kosakata, 111
              kanji, 48 pola, 12 dialog, 12 soal 文の組み立て, dan 24 soal 聴解). Simulasi ini
              mengukur kesiapan pada materi yang tersedia, bukan prediksi skor JLPT resmi.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------- layar ujian ---------- */
  if (!current) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-fg-muted">
          Tidak ada soal tersedia.
        </CardContent>
      </Card>
    );
  }

  const answeredCount = questions.filter((question) => answers[question.id] !== undefined).length;

  return (
    <div className="space-y-4 pb-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-bold text-fg">{spec.title}</h1>
          <p className="text-xs text-fg-muted">
            Soal {index + 1} dari {questions.length} · terjawab {answeredCount}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={remaining < 300 ? "amber" : "neutral"}>⏱ {formatClock(remaining)}</Badge>
          <Button size="sm" variant="outline" onClick={() => finish(answers, spec)}>
            Selesai
          </Button>
        </div>
      </div>

      <ProgressBar value={answeredCount} max={questions.length} />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-fg-muted">
              {current.sectionLabel ? `${current.sectionLabel} · ` : ""}
              {current.subPrompt ?? QUESTION_KIND_LABEL[current.kind]}
            </p>
            <Badge tone="neutral">{QUESTION_KIND_LABEL[current.kind]}</Badge>
          </div>

          <p lang="ja" className="jp mt-3 whitespace-pre-wrap text-xl font-semibold text-fg">
            {current.prompt}
          </p>

          {(current.audioLines || current.audioText) && (
            <Button className="mt-3" size="sm" variant="outline" onClick={playDialogue}>
              ▶ {current.audioLabel ?? "Putar audio"}
            </Button>
          )}

          <div className="mt-5 space-y-2">
            {current.options.map((option, optionIndex) => {
              const selected = answers[current.id] === optionIndex;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))
                  }
                  className={cn(
                    "jp flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-base transition-colors",
                    selected
                      ? "border-accent bg-accent-soft text-fg"
                      : "border-border bg-surface text-fg hover:border-accent/40",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs",
                      selected ? "border-accent bg-accent text-accent-contrast" : "border-border text-fg-muted",
                    )}
                  >
                    {optionIndex + 1}
                  </span>
                  {option}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setIndex((value) => Math.max(0, value - 1))}
              disabled={index === 0}
            >
              ← Sebelumnya
            </Button>
            {index + 1 < questions.length ? (
              <Button onClick={() => setIndex((value) => value + 1)}>Berikutnya →</Button>
            ) : (
              <Button onClick={() => finish(answers, spec)}>Selesai & lihat hasil</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
