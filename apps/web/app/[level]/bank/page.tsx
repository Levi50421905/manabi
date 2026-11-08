"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardFooter,
  PageHeader,
  Section,
  cn,
} from "@manabi/ui";
import { levelHref, levelMeta } from "@manabi/content";
import { QuizRunner, type QuizRunnerHandle } from "@/components/quiz-runner";
import { SessionExitDialog } from "@/components/session-exit-dialog";
import { bankDecks, type BankDeck } from "@/lib/bank";
import { shuffle, type Question } from "@/lib/quiz";
import { useActiveLevel } from "@/lib/level";
import { setSessionActive, useBeforeUnloadGuard } from "@/lib/session-guard";

/** Acak urutan soal dan posisi opsi agar sesi berikutnya terasa berbeda. */
function randomizeQuestions(questions: Question[]): Question[] {
  return shuffle(questions).map((question) => {
    const correct = question.options[question.answer];
    if (correct === undefined) return question;
    const options = shuffle(question.options);
    return { ...question, options, answer: options.indexOf(correct) };
  });
}

/**
 * Latihan dari bank butir terkurasi. Berbeda dari generator latihan biasa,
 * setiap butir di sini punya kunci tetap, pembahasan empat lapis, dan
 * metadata level.
 */
export default function BankPage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);

  const [deck, setDeck] = useState<BankDeck | null>(null);
  const [running, setRunning] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const runnerRef = useRef<QuizRunnerHandle>(null);

  useEffect(() => {
    if (!running) return;
    setSessionActive(true, deck ? `Bank soal · ${deck.label}` : "Bank soal");
    return () => setSessionActive(false);
  }, [running, deck]);

  useBeforeUnloadGuard(running);

  function start(nextDeck: BankDeck) {
    setDeck({ ...nextDeck, questions: randomizeQuestions(nextDeck.questions) });
    setRunning(true);
    setExitOpen(false);
    window.scrollTo({ top: 0 });
  }

  function backToDecks() {
    setExitOpen(false);
    setRunning(false);
    setDeck(null);
    window.scrollTo({ top: 0 });
  }

  /* ---------------- sesi bank soal ---------------- */
  if (deck) {
    return (
      <div className="space-y-6 pb-8">
        <PageHeader
          eyebrow={
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="level" mono>
                {level}
              </Badge>
              <span className="label-micro">Bank soal · {deck.label}</span>
            </div>
          }
          title="Bank soal"
          japanese="問題集"
          description={deck.description}
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
          questions={deck.questions}
          label={`Bank soal · ${deck.label}`}
          onFinished={() => setRunning(false)}
          onDone={backToDecks}
          doneLabel="Pilih paket lain"
          onRequestExit={() => setExitOpen(true)}
        />

        <SessionExitDialog
          open={exitOpen}
          title="Selesaikan sesi bank soal ini?"
          onCancel={() => setExitOpen(false)}
          onFinish={() => {
            setExitOpen(false);
            runnerRef.current?.finish();
          }}
          onDiscard={backToDecks}
        />
      </div>
    );
  }

  /* ---------------- layar pilih paket ---------------- */
  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">{meta.name} · Bank soal</span>
          </div>
        }
        title="Bank soal"
        japanese="問題集"
        description="Latihan dari butir terkurasi dengan pembahasan berlapis. Ini cikal bakal bank soal penuh, bukan kuis acak."
        actions={
          <Link href={levelHref(level, "ujian")}>
            <Button variant="outline">Simulasi ujian</Button>
          </Link>
        }
      />

      <Callout tone="info" title="Beta terkurasi">
        Saat ini tersedia 23 butir contoh: 12 N5 dan 11 JFT-Basic. Setiap butir punya
        kunci tetap, pembahasan empat lapis, dan metadata tipe soal. Bank produksi
        akan ditambah bertahap sampai ribuan butir.
      </Callout>

      <Section
        title="Pilih paket"
        glyph="選"
        description="Satu paket berisi campuran tipe soal dari bank, bukan soal yang dibuat saat runtime."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {bankDecks.map((option) => (
            <Card key={option.id} className="flex flex-col">
              <CardBody className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <span
                    lang="ja"
                    aria-hidden="true"
                    className="jp-serif grid h-11 w-11 place-items-center rounded-lg bg-level-soft text-base font-semibold text-level"
                  >
                    {option.japanese}
                  </span>
                  <Badge tone="neutral">Beta</Badge>
                </div>

                <h3 className="mt-3 font-display text-h2 font-semibold tracking-tight text-fg">
                  {option.label}
                </h3>
                <p className="mt-1.5 text-caption leading-relaxed text-fg-muted">
                  {option.description}
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-2 rounded-lg border border-border bg-surface-muted/60 p-2.5 text-center">
                  <div>
                    <dt className="label-micro">Butir</dt>
                    <dd className="tnum mt-1 font-display text-h2 font-semibold leading-none text-fg">
                      {option.questions.length}
                    </dd>
                  </div>
                  <div>
                    <dt className="label-micro">Seksi</dt>
                    <dd className="tnum mt-1 font-display text-h2 font-semibold leading-none text-fg">
                      {option.sectionCounts.length}
                    </dd>
                  </div>
                </dl>

                <ul className="mt-3 space-y-1">
                  {option.sectionCounts.map((section) => (
                    <li
                      key={section.label}
                      className="flex items-baseline justify-between gap-3 text-caption text-fg-muted"
                    >
                      <span className="min-w-0">{section.label}</span>
                      <span className="tnum shrink-0 text-fg-subtle">{section.count} butir</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
              <CardFooter className="justify-between px-5 py-3">
                <span className={cn("text-caption text-fg-muted", option.questions.length === 0 && "text-danger")}>
                  {option.questions.length === 0 ? "Belum ada butir" : "Siap dikerjakan"}
                </span>
                <Button
                  variant="level"
                  onClick={() => start(option)}
                  disabled={option.questions.length === 0}
                  leading={<span aria-hidden="true">▶</span>}
                >
                  Mulai
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </Section>

      <Card variant="muted">
        <CardBody className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="label-micro">Ingin latihan bebas?</p>
            <p className="mt-1.5 text-body font-semibold text-fg">Latihan campuran</p>
            <p className="mt-0.5 text-caption text-fg-muted">
              Generator latihan lama tetap tersedia untuk sesi cepat dari materi level ini.
            </p>
          </div>
          <Link href={levelHref(level, "quiz")} className="shrink-0">
            <Button variant="outline">Buka latihan</Button>
          </Link>
        </CardBody>
      </Card>
    </div>
  );
}
