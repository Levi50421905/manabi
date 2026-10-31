"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  EmptyState,
  PageHeader,
  ProgressBar,
  Section,
  cn,
} from "@manabi/ui";
import { levelHref, levelMeta } from "@manabi/content";
import {
  allQuestions,
  buildExam,
  formatClock,
  scoreExam,
  type ExamKind,
  type ExamResult,
  type ExamSpec,
} from "@/lib/exam";
import { QUESTION_KIND_LABEL, type Question } from "@/lib/quiz";
import { recordQuiz } from "@/lib/store";
import { createUtterance, speak } from "@/lib/tts";
import { useActiveLevel } from "@/lib/level";

const EXAM_KINDS: ExamKind[] = ["jlpt-n5", "jft-basic"];

const EXAM_GLYPH: Record<ExamKind, string> = {
  "jlpt-n5": "試",
  "jft-basic": "基",
};

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

interface PaperPreview {
  spec: ExamSpec;
  questionCount: number;
  maxTotal: number;
  sections: Array<{ key: string; label: string; count: number; maxPoints: number }>;
}

function previewOf(spec: ExamSpec): PaperPreview {
  return {
    spec,
    questionCount: allQuestions(spec).length,
    maxTotal: spec.sections.reduce((sum, section) => sum + section.maxPoints, 0),
    sections: spec.sections.map((section) => ({
      key: section.key,
      label: section.label,
      count: section.questions.length,
      maxPoints: section.maxPoints,
    })),
  };
}

export default function ExamPage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);
  const router = useRouter();

  const [spec, setSpec] = useState<ExamSpec | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [doubts, setDoubts] = useState<Set<string>>(() => new Set());
  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [result, setResult] = useState<ExamResult | null>(null);

  // Ringkasan kertas ujian untuk layar pemilihan (jumlah soal & seksi asli).
  const papers = useMemo(() => EXAM_KINDS.map((kind) => previewOf(buildExam(kind))), []);

  const questions = useMemo(() => (spec ? allQuestions(spec) : []), [spec]);
  const current = questions[index];

  function start(kind: ExamKind) {
    const built = buildExam(kind);
    setSpec(built);
    setAnswers({});
    setDoubts(new Set());
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
    recordQuiz(examSpec.title, correct, all.length);
    window.scrollTo({ top: 0 });
  }

  function backToPapers() {
    setSpec(null);
    setResult(null);
    setAnswers({});
    setDoubts(new Set());
    window.scrollTo({ top: 0 });
  }

  function toggleDoubt(id: string) {
    setDoubts((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const answeredCount = questions.filter((question) => answers[question.id] !== undefined).length;

  // Timer berjalan selama ujian belum selesai.
  useEffect(() => {
    if (!spec || result) return;
    const timer = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [spec, result]);

  // Waktu habis → kumpulkan otomatis.
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

  function goToQuestion(nextIndex: number) {
    setIndex(Math.max(0, Math.min(questions.length - 1, nextIndex)));
    window.scrollTo({ top: 0 });
  }

  /* ---------------- layar hasil ---------------- */
  if (spec && result) {
    const wrong = questions.filter((question) => answers[question.id] !== question.answer);

    return (
      <div className="space-y-8 pb-8">
        <PageHeader
          eyebrow={
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="level" mono>
                {level}
              </Badge>
              <span className="label-micro">{meta.name} · Hasil ujian</span>
            </div>
          }
          title="Hasil ujian"
          japanese="結果"
          description={spec.title}
        />

        <Card>
          <CardBody className="p-6 text-center sm:p-8">
            <Badge tone={result.passed ? "success" : "danger"}>
              {result.passed ? "Lulus (simulasi)" : "Belum lulus (simulasi)"}
            </Badge>
            <p className="tnum mt-4 flex items-baseline justify-center gap-2 font-display text-display font-semibold leading-none text-fg">
              {result.total}
              <span className="text-h2 font-normal text-fg-muted">/ {result.maxTotal}</span>
            </p>
            <p className="mt-2 text-caption leading-relaxed text-fg-muted">
              Ambang lulus: <span className="tnum font-semibold text-fg">{spec.passTotal} poin</span>
              {spec.minSectionPoints
                ? ` · minimal ${spec.minSectionPoints} poin per seksi`
                : " · tanpa ambang per seksi"}
            </p>
            <ProgressBar
              className="mx-auto mt-5 max-w-sm"
              value={result.total}
              max={result.maxTotal}
              tone={result.passed ? "success" : "accent"}
              aria-label={`Skor total ${result.total} dari ${result.maxTotal}`}
            />
          </CardBody>
        </Card>

        <Section title="Rincian per seksi" glyph="節">
          <ul className="space-y-3">
            {result.sections.map((section) => (
              <li key={section.key}>
                <Card>
                  <CardBody className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-h3 font-semibold",
                            JAPANESE.test(section.label) ? "font-jp-serif" : "font-display",
                          )}
                        >
                          {section.label}
                        </p>
                        <p className="mt-1 text-caption text-fg-muted">
                          <span className="tnum">{section.correct}</span>/
                          <span className="tnum">{section.total}</span> soal benar
                          {spec.minSectionPoints
                            ? ` · ambang ${spec.minSectionPoints} poin`
                            : ""}
                        </p>
                      </div>
                      <Badge tone={section.passedSection ? "success" : "danger"} mono>
                        {section.score} / {section.maxPoints}
                      </Badge>
                    </div>
                    <ProgressBar
                      className="mt-3"
                      value={section.score}
                      max={section.maxPoints}
                      tone={section.passedSection ? "success" : "accent"}
                      aria-label={`Skor ${section.label}`}
                    />
                    <p className="mt-2 text-caption text-fg-subtle">
                      {section.passedSection
                        ? spec.minSectionPoints
                          ? `Memenuhi ambang ${spec.minSectionPoints} poin.`
                          : "Seksi selesai."
                        : `Di bawah ambang ${spec.minSectionPoints ?? 0} poin.`}
                    </p>
                  </CardBody>
                </Card>
              </li>
            ))}
          </ul>
        </Section>

        <Section
          title={`Pembahasan jawaban salah (${wrong.length})`}
          glyph="解"
          description={
            wrong.length === 0
              ? "Tidak ada jawaban salah. 素晴らしい！"
              : "Pelajari lagi soal yang belum tepat sebelum mengulang."
          }
        >
          {wrong.length === 0 ? (
            <Callout tone="success" title="Semua jawaban benar">
              Pertahankan ritme belajarmu, lalu coba ujian lagi untuk mengukur konsistensi.
            </Callout>
          ) : (
            <ul className="space-y-2">
              {wrong.slice(0, 20).map((question) => {
                const picked = answers[question.id];
                return (
                  <li key={question.id}>
                    <Card>
                      <CardBody className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <Badge tone="neutral">{QUESTION_KIND_LABEL[question.kind]}</Badge>
                          {question.sectionLabel ? (
                            <span className="text-caption text-fg-subtle">
                              {question.sectionLabel}
                            </span>
                          ) : null}
                        </div>
                        <p
                          lang={JAPANESE.test(question.prompt) ? "ja" : undefined}
                          className={cn(
                            "mt-2 text-body font-medium leading-snug",
                            japaneseFont(question.prompt),
                          )}
                        >
                          {question.prompt}
                        </p>
                        <p className="mt-2 text-caption leading-relaxed text-danger">
                          Jawabanmu:{" "}
                          {picked === undefined ? "(kosong)" : question.options[picked]}
                        </p>
                        <p className="text-caption leading-relaxed text-success">
                          Kunci: {question.options[question.answer]}
                        </p>
                        <p className="mt-1.5 text-caption leading-relaxed text-fg-muted">
                          {question.explanation}
                        </p>
                      </CardBody>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
          {wrong.length > 20 ? (
            <p className="mt-3 text-caption text-fg-muted">
              Menampilkan 20 dari {wrong.length} jawaban salah.
            </p>
          ) : null}
        </Section>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" className="w-full sm:w-auto" onClick={() => start(spec.kind)}>
            Ulangi ujian
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={backToPapers}
          >
            Pilih kertas lain
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => router.push("/dashboard")}
          >
            Ke dasbor
          </Button>
        </div>
      </div>
    );
  }

  /* ---------------- layar pilih kertas ujian ---------------- */
  if (!spec) {
    return (
      <div className="space-y-8 pb-8">
        <PageHeader
          eyebrow={
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="level" mono>
                {level}
              </Badge>
              <span className="label-micro">{meta.name} · Ujian</span>
            </div>
          }
          title="Ujian"
          japanese="試験"
          description="Simulasi dengan skala penilaian resmi. Hasilnya bukan sertifikat — hanya pengukur kesiapan."
          actions={
            <Link href={levelHref(level, "quiz")}>
              <Button variant="outline">Latihan ringkas</Button>
            </Link>
          }
        />

        <Section
          title="Kertas ujian"
          glyph="試"
          description="Pilih format, lalu kerjakan dalam satu duduk."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {papers.map((paper) => (
              <Card key={paper.spec.kind} className="flex flex-col">
                <CardBody className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span
                      lang="ja"
                      aria-hidden="true"
                      className="jp-serif grid h-11 w-11 place-items-center rounded-lg bg-level-soft text-base font-semibold text-level"
                    >
                      {EXAM_GLYPH[paper.spec.kind]}
                    </span>
                    <Badge tone="neutral">Simulasi</Badge>
                  </div>

                  <h3 className="mt-3 font-display text-h2 font-semibold tracking-tight text-fg">
                    {paper.spec.title}
                  </h3>
                  <p className="mt-1.5 text-caption leading-relaxed text-fg-muted">
                    {paper.spec.description}
                  </p>

                  <dl className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-border bg-surface-muted/60 p-2.5 text-center">
                    <div>
                      <dt className="label-micro">Soal</dt>
                      <dd className="tnum mt-1 font-display text-h2 font-semibold leading-none text-fg">
                        {paper.questionCount}
                      </dd>
                    </div>
                    <div>
                      <dt className="label-micro">Seksi</dt>
                      <dd className="tnum mt-1 font-display text-h2 font-semibold leading-none text-fg">
                        {paper.sections.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="label-micro">Menit</dt>
                      <dd className="tnum mt-1 font-display text-h2 font-semibold leading-none text-fg">
                        {paper.spec.minutes}
                      </dd>
                    </div>
                  </dl>

                  <ul className="mt-3 space-y-1">
                    {paper.sections.map((section) => (
                      <li
                        key={section.key}
                        className="flex items-baseline justify-between gap-3 text-caption text-fg-muted"
                      >
                        <span className="min-w-0">{section.label}</span>
                        <span className="tnum shrink-0 text-fg-subtle">
                          {section.count} soal · {section.maxPoints} poin
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardBody>
                <CardFooter className="justify-between px-5 py-3">
                  <span className="text-caption text-fg-muted">
                    Lulus ≥{" "}
                    <span className="tnum font-semibold text-fg">{paper.spec.passTotal}</span> poin
                    dari <span className="tnum">{paper.maxTotal}</span>
                  </span>
                  <Button
                    variant="level"
                    onClick={() => start(paper.spec.kind)}
                    leading={<span aria-hidden="true">▶</span>}
                  >
                    Mulai
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Section>

        <Callout tone="info" title="Catatan kejujuran">
          Bank soal {level} di aplikasi ini masih terbatas (kosakata, kanji, pola tata bahasa, dialog
          mendengar, dan bacaan). Simulasi mengukur kesiapan pada materi yang tersedia — bukan
          prediksi skor JLPT resmi.
        </Callout>
      </div>
    );
  }

  /* ---------------- layar ujian berjalan ---------------- */
  if (!current) {
    return (
      <EmptyState
        glyph="試"
        title="Tidak ada soal tersedia"
        description="Kertas ujian ini belum memuat soal. Coba pilih kertas lain."
        action={
          <Button variant="outline" onClick={backToPapers}>
            Pilih kertas ujian
          </Button>
        }
      />
    );
  }

  const doubtful = doubts.has(current.id);
  const promptJapanese = JAPANESE.test(current.prompt);
  const timeLow = remaining < 300;

  return (
    <div className="space-y-5 pb-8">
      {/* Header lengket: seksi, timer, progres, tombol selesai */}
      <div className="sticky top-14 z-20 -mx-4 border-b border-border bg-paper/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 md:-mx-8 md:px-8 lg:top-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-h3 font-semibold",
                JAPANESE.test(current.sectionLabel ?? "") ? "font-jp-serif" : "font-display",
              )}
            >
              {current.sectionLabel ?? spec.title}
            </p>
            <p className="tnum text-caption text-fg-muted">
              Soal {index + 1} / {questions.length} · terjawab {answeredCount}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge
              tone={timeLow ? "warning" : "neutral"}
              className="tnum px-2.5 py-1.5"
              aria-label={`Sisa waktu ${formatClock(remaining)}`}
            >
              ⏱ {formatClock(remaining)}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => finish(answers, spec)}>
              Selesai
            </Button>
          </div>
        </div>
        <ProgressBar
          className="mt-2"
          value={answeredCount}
          max={questions.length}
          tone="level"
          aria-label={`Terjawab ${answeredCount} dari ${questions.length}`}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <Card key={current.id} className="animate-fade-up">
          <CardBody className="p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p
                className={promptLabelFont(
                  current.subPrompt ?? QUESTION_KIND_LABEL[current.kind],
                )}
              >
                {current.subPrompt ?? QUESTION_KIND_LABEL[current.kind]}
              </p>
              <div className="flex items-center gap-2">
                <Badge tone="neutral">{QUESTION_KIND_LABEL[current.kind]}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  aria-pressed={doubtful}
                  onClick={() => toggleDoubt(current.id)}
                  leading={<span aria-hidden="true">🚩</span>}
                  className={cn(doubtful && "border-warning/50 bg-warning-soft text-warning")}
                >
                  {doubtful ? "Ditandai ragu" : "Tandai ragu"}
                </Button>
              </div>
            </div>

            <p
              lang={promptJapanese ? "ja" : undefined}
              className={cn(
                "mt-3 whitespace-pre-wrap",
                promptJapanese
                  ? current.prompt.length > 40
                    ? "font-jp-serif text-h2 leading-relaxed"
                    : "font-jp-serif text-h1 leading-snug"
                  : "font-display text-h1 leading-snug",
              )}
            >
              {current.prompt}
            </p>

            {current.audioLines || current.audioText ? (
              <Button
                className="mt-4"
                size="sm"
                variant="outline"
                onClick={playDialogue}
                leading={<span aria-hidden="true">▶</span>}
              >
                {current.audioLabel ?? "Putar audio"}
              </Button>
            ) : null}

            <div className="mt-5 space-y-2" role="group" aria-label="Pilihan jawaban">
              {current.options.map((option, optionIndex) => {
                const selected = answers[current.id] === optionIndex;
                return (
                  <button
                    key={`${option}-${optionIndex}`}
                    type="button"
                    aria-pressed={selected}
                    aria-label={`Pilihan ${optionIndex + 1}: ${option}`}
                    onClick={() =>
                      setAnswers((previous) => ({ ...previous, [current.id]: optionIndex }))
                    }
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-caption transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                      selected
                        ? "border-level bg-level-soft"
                        : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "tnum mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border font-semibold",
                        selected
                          ? "border-level bg-level text-level-contrast"
                          : "border-border bg-surface-muted text-fg-muted",
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
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={() => goToQuestion(index - 1)}
                disabled={index === 0}
              >
                ← Sebelumnya
              </Button>
              {index + 1 < questions.length ? (
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => goToQuestion(index + 1)}
                >
                  Berikutnya →
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={() => finish(answers, spec)}
                >
                  Selesai &amp; lihat hasil
                </Button>
              )}
            </div>
          </CardBody>
        </Card>

        <QuestionNavigator
          questions={questions}
          index={index}
          answers={answers}
          doubts={doubts}
          onJump={goToQuestion}
          className="lg:sticky lg:top-24"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Navigasi soal
 * ------------------------------------------------------------------ */

function QuestionNavigator({
  questions,
  index,
  answers,
  doubts,
  onJump,
  className,
}: {
  questions: Question[];
  index: number;
  answers: Record<string, number>;
  doubts: Set<string>;
  onJump: (index: number) => void;
  className?: string;
}) {
  const answered = questions.filter((question) => answers[question.id] !== undefined).length;

  return (
    <nav aria-label="Navigasi soal" className={className}>
      <Card>
        <CardHeader className="px-4 py-3">
          <div className="min-w-0">
            <CardTitle>Navigasi soal</CardTitle>
            <p className="mt-1 text-caption text-fg-muted">Ketuk nomor untuk pindah.</p>
          </div>
          <Badge tone="neutral" mono>
            {answered}/{questions.length}
          </Badge>
        </CardHeader>
        <CardBody className="p-3.5">
          <ol className="grid grid-cols-6 gap-1.5 text-caption sm:grid-cols-10 lg:grid-cols-6">
            {questions.map((question, questionIndex) => {
              const isAnswered = answers[question.id] !== undefined;
              const isDoubt = doubts.has(question.id);
              const active = questionIndex === index;
              return (
                <li key={question.id}>
                  <button
                    type="button"
                    aria-current={active ? "step" : undefined}
                    aria-label={`Soal ${questionIndex + 1}${
                      isDoubt ? ", ditandai ragu" : ""
                    }${isAnswered ? ", terjawab" : ", belum dijawab"}`}
                    onClick={() => onJump(questionIndex)}
                    className={cn(
                      "tnum relative grid h-11 w-full place-items-center rounded-md border font-semibold transition-colors duration-150",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-paper",
                      active
                        ? "border-level bg-level text-level-contrast"
                        : isAnswered
                          ? "border-success/40 bg-success-soft text-success hover:border-success/60"
                          : "border-border bg-surface text-fg-muted hover:border-border-strong hover:text-fg",
                    )}
                  >
                    {questionIndex + 1}
                    {isDoubt ? (
                      <span
                        aria-hidden="true"
                        className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded border border-paper bg-warning"
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>

          <ul className="mt-3.5 space-y-1.5 text-caption text-fg-muted">
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-sm border border-level bg-level"
              />
              Sedang dikerjakan
            </li>
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-sm border border-success/40 bg-success-soft"
              />
              Sudah dijawab
            </li>
            <li className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-sm border border-border bg-surface"
              />
              Belum dijawab
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded bg-warning" />
              Ditandai ragu-ragu
            </li>
          </ul>
        </CardBody>
      </Card>
    </nav>
  );
}
