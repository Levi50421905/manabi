"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  availableLevels,
  levelHref,
  levelMeta,
  readingByLevel,
} from "@manabi/content";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  EmptyState,
  PageHeader,
  Pill,
  ProgressBar,
  cn,
} from "@manabi/ui";
import { SpeakButton } from "@/components/speak-button";
import { useActiveLevel } from "@/lib/level";
import { usePrefs } from "@/lib/prefs";
import { markPassageRead, recordStudy, useProgress } from "@/lib/store";

const OUTLINE_LINK =
  "inline-flex h-11 items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export default function ReadingPage() {
  const { level } = useActiveLevel();
  const [prefs] = usePrefs();
  const progress = useProgress();

  const items = useMemo(() => readingByLevel(level), [level]);
  const meta = levelMeta(level);

  const [activeId, setActiveId] = useState("");
  const [showFurigana, setShowFurigana] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const readerRef = useRef<HTMLDivElement | null>(null);

  // Furigana mengikuti preferensi pengguna, tetapi tetap bisa diubah di sini.
  useEffect(() => {
    setShowFurigana(prefs.furigana);
  }, [prefs.furigana]);

  const readCount = useMemo(
    () => items.filter((item) => progress.readPassages.includes(item.id)).length,
    [items, progress.readPassages],
  );
  const firstUnread = items.find((item) => !progress.readPassages.includes(item.id));
  const passage = items.find((item) => item.id === activeId) ?? firstUnread ?? items[0];

  const ordered = useMemo(() => {
    const read = new Set(progress.readPassages);
    return [...items.filter((item) => !read.has(item.id)), ...items.filter((item) => read.has(item.id))];
  }, [items, progress.readPassages]);

  const plainText = useMemo(
    () => passage?.segments.map((segment) => segment.text).join("") ?? "",
    [passage],
  );

  const fallbackLevel = availableLevels[0] ?? level;

  /** Di mobile pembaca ada di bawah daftar — gulirkan ke sana setelah memilih. */
  function selectPassage(id: string) {
    setActiveId(id);
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    readerRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }

  function markDone() {
    if (!passage) return;
    markPassageRead(passage.id);
    recordStudy("reading");
    const next = ordered.find(
      (item) => !progress.readPassages.includes(item.id) && item.id !== passage.id,
    );
    if (next) selectPassage(next.id);
  }

  const header = (
    <PageHeader
      eyebrow={
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="level" mono>
            {meta.label}
          </Badge>
          <span className="label-micro">Membaca</span>
        </div>
      }
      title="Membaca"
      japanese="読解"
      description={`${items.length} bacaan pendek ${meta.label} berfurigana, lengkap dengan pertanyaan pemahaman.`}
      actions={
        <Link href={levelHref(level, "listening")} className={OUTLINE_LINK}>
          <span aria-hidden="true">←</span>
          Mendengar
        </Link>
      }
    />
  );

  if (items.length === 0 || !passage) {
    return (
      <div className="space-y-8 md:space-y-10">
        {header}
        <EmptyState
          glyph="読"
          title={`Bacaan ${meta.label} belum tersedia`}
          description={`Materi membaca level ${meta.name} sedang disusun. Sementara ini kamu bisa membaca teks pendek di level ${levelMeta(fallbackLevel).label}.`}
          action={
            <Link href={levelHref(fallbackLevel, "reading")} className={OUTLINE_LINK}>
              Ke Membaca {levelMeta(fallbackLevel).label}
            </Link>
          }
        />
      </div>
    );
  }

  const isRead = progress.readPassages.includes(passage.id);

  return (
    <div className="space-y-8 md:space-y-10">
      {header}

      {/* ---------- daftar bacaan ---------- */}
      <section aria-label="Daftar bacaan">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-h2 font-semibold tracking-tight text-fg">
              Pilihan bacaan
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-fg-muted">
              {readCount} dari {items.length} bacaan selesai — bacaan pertama yang belum dibaca
              dipilih otomatis.
            </p>
          </div>
          <div className="w-full max-w-[220px]">
            <ProgressBar
              value={readCount}
              max={items.length}
              tone="level"
              label="Progres bacaan"
              showValue
            />
          </div>
        </div>

        <ul className="grid gap-2.5 sm:grid-cols-2">
          {items.map((item) => {
            const active = item.id === passage.id;
            const itemRead = progress.readPassages.includes(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => selectPassage(item.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "w-full rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                    active
                      ? "border-level/40 bg-level-soft"
                      : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted/60",
                  )}
                >
                  <span className="flex items-start justify-between gap-2">
                    <span
                      lang="ja"
                      className="jp-serif min-w-0 text-base font-semibold leading-snug text-fg"
                    >
                      {item.title}
                    </span>
                    <Badge tone={active ? "level" : "neutral"} mono>
                      {item.level}
                    </Badge>
                  </span>
                  <span className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-caption text-fg-muted">
                    <span className="tnum">{item.questions.length} pertanyaan</span>
                    <span aria-hidden="true">·</span>
                    {itemRead ? (
                      <span className="inline-flex items-center gap-1 font-medium text-success">
                        <span aria-hidden="true">✓</span> Sudah dibaca
                      </span>
                    ) : (
                      <span>Belum dibaca</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------- pembaca + pertanyaan ---------- */}
      <div
        ref={readerRef}
        className="grid scroll-mt-20 gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start"
      >
        <Card className="overflow-hidden">
          <CardHeader className="p-4 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="level" mono>
                  {passage.level}
                </Badge>
                {isRead ? (
                  <Badge tone="success">
                    <span aria-hidden="true">✓</span> Sudah selesai
                  </Badge>
                ) : (
                  <Badge tone="neutral">Belum dibaca</Badge>
                )}
              </div>
              <h2
                lang="ja"
                className="mt-2 font-jp-serif text-h2 font-semibold leading-tight text-fg"
              >
                {passage.title}
              </h2>
              <p className="tnum mt-1 text-caption text-fg-muted">
                {passage.questions.length} pertanyaan pemahaman
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <SpeakButton text={plainText} label="Dengar" size="lg" />
            </div>
          </CardHeader>

          <CardBody className="p-4 sm:p-6">
            <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
              <Pill
                active={showFurigana}
                onClick={() => setShowFurigana((value) => !value)}
                glyph="ふ"
              >
                Furigana
              </Pill>
              <Pill
                active={showTranslation}
                onClick={() => setShowTranslation((value) => !value)}
                glyph="訳"
              >
                Terjemahan
              </Pill>
            </div>

            <div className="mx-auto mt-5 max-w-[62ch]">
              <p lang="ja" className="font-jp-serif text-2xl leading-loose text-fg">
                {passage.segments.map((segment, index) =>
                  segment.reading ? (
                    <ruby key={`${passage.id}-seg-${index}`}>
                      {segment.text}
                      <rt
                        className={cn(
                          "transition-opacity duration-150",
                          showFurigana ? "opacity-100" : "opacity-0",
                        )}
                      >
                        {segment.reading}
                      </rt>
                    </ruby>
                  ) : (
                    <span key={`${passage.id}-seg-${index}`}>{segment.text}</span>
                  ),
                )}
              </p>
            </div>

            {showTranslation ? (
              <div className="mx-auto mt-6 max-w-[68ch] rounded-lg border border-border bg-surface-muted px-4 py-3">
                <p className="label-micro mb-1.5">Terjemahan</p>
                <p className="text-body leading-relaxed text-fg-muted">{passage.translation}</p>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <div className="space-y-3">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 sm:px-5">
              <div className="min-w-0">
                <p className="label-micro mb-1">Pemahaman</p>
                <h3 className="text-h3 font-semibold text-fg">Pertanyaan</h3>
              </div>
              <Badge tone="neutral" mono>
                {passage.questions.length} soal
              </Badge>
            </CardHeader>

            <CardBody className="p-4 sm:p-5">
              {passage.questions.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border-strong bg-surface-muted/50 px-4 py-6 text-center text-sm leading-relaxed text-fg-muted">
                  Belum ada pertanyaan untuk bacaan ini.
                </p>
              ) : (
                <div className="space-y-5">
                  {passage.questions.map((question, questionIndex) => {
                    const key = `${passage.id}:${questionIndex}`;
                    const selected = answers[key];
                    const isChecked = checked[key] === true;
                    const isCorrect = selected === question.answer;

                    return (
                      <div
                        key={key}
                        className="border-b border-border pb-5 last:border-b-0 last:pb-0"
                      >
                        <p className="label-micro mb-1">Soal {questionIndex + 1}</p>
                        <p
                          lang="ja"
                          className="jp text-base font-medium leading-relaxed text-fg"
                        >
                          {question.question}
                        </p>

                        <div
                          role="group"
                          aria-label={`Soal ${questionIndex + 1}`}
                          className="mt-2.5 space-y-2"
                        >
                          {question.options.map((option, optionIndex) => {
                            const picked = selected === optionIndex;
                            const showCorrect = isChecked && optionIndex === question.answer;
                            const showWrong =
                              isChecked && picked && optionIndex !== question.answer;

                            return (
                              <button
                                key={`${key}-${optionIndex}`}
                                type="button"
                                lang="ja"
                                disabled={isChecked}
                                aria-pressed={picked}
                                onClick={() =>
                                  setAnswers((prev) => ({ ...prev, [key]: optionIndex }))
                                }
                                className={cn(
                                  "jp flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-base leading-relaxed transition-colors disabled:cursor-default",
                                  "border-border bg-surface text-fg hover:border-accent/40",
                                  picked && !isChecked && "border-accent bg-accent-soft",
                                  showCorrect && "border-success bg-success-soft text-success",
                                  showWrong && "border-danger bg-danger-soft text-danger",
                                )}
                              >
                                <span>{option}</span>
                                {showCorrect ? <span aria-hidden="true">✓</span> : null}
                                {showWrong ? <span aria-hidden="true">✕</span> : null}
                              </button>
                            );
                          })}
                        </div>

                        {!isChecked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2.5"
                            disabled={selected === undefined}
                            onClick={() => setChecked((prev) => ({ ...prev, [key]: true }))}
                          >
                            Periksa jawaban
                          </Button>
                        ) : null}

                        <div aria-live="polite" className="mt-2 text-sm leading-relaxed">
                          {isChecked ? (
                            <>
                              <p
                                className={cn(
                                  "font-medium",
                                  isCorrect ? "text-success" : "text-danger",
                                )}
                              >
                                {isCorrect ? "Benar! " : "Belum tepat — baca ulang kalimatnya. "}
                                <span className="font-normal text-fg-muted">
                                  Jawaban: {question.options[question.answer]}
                                </span>
                              </p>
                              {!isCorrect && !showTranslation ? (
                                <button
                                  type="button"
                                  onClick={() => setShowTranslation(true)}
                                  className="mt-1 text-caption font-medium text-level underline decoration-level/40 underline-offset-4 transition-colors hover:decoration-level"
                                >
                                  Buka terjemahan untuk memeriksa
                                </button>
                              ) : null}
                            </>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardBody>

            <CardFooter className="flex-col items-stretch gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="max-w-[36ch] text-caption leading-relaxed text-fg-subtle">
                Menyelesaikan bacaan memberi +5 XP sekali per teks.
              </p>
              <Button
                variant="level"
                size="lg"
                onClick={markDone}
                className="w-full shrink-0 sm:w-auto"
              >
                {isRead ? "Bacaan berikutnya" : "Tandai selesai & lanjut (+5 XP)"}
              </Button>
            </CardFooter>
          </Card>

          <Callout tone="info" title="Tips membaca">
            Baca kalimat Jepang dulu tanpa furigana, tebak artinya, baru nyalakan furigana dan
            terjemahan untuk memeriksa.
          </Callout>
        </div>
      </div>
    </div>
  );
}
