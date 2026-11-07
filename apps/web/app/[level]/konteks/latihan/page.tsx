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
  PageHeader,
  ProgressBar,
  Section,
  SegmentedControl,
  cn,
} from "@manabi/ui";
import {
  AUDIENCE_LABEL,
  keigoVerbsByLevel,
  levelHref,
  levelMeta,
  registerScenariosByLevel,
} from "@manabi/content";
import { SessionExitDialog } from "@/components/session-exit-dialog";
import { scoreMessage } from "@/lib/quiz";
import { useActiveLevel } from "@/lib/level";
import { setSessionActive, useBeforeUnloadGuard } from "@/lib/session-guard";
import { recordQuiz } from "@/lib/store";

type Mode = "register" | "sopan";

interface Item {
  id: string;
  mode: Mode;
  prompt: string;
  promptId?: string;
  answer: string;
  options: string[];
  explanation: string;
}

const MODE_LABEL: Record<Mode, string> = {
  register: "Pilih tingkat bicara",
  sopan: "Pilih bentuk sopan",
};

const MODE_DESCRIPTION: Record<Mode, string> = {
  register: "Situasi sama, lawan bicara berbeda — pilih kalimat yang pas.",
  sopan: "Pilih bentuk 尊敬 (untuk orang lain) atau 謙譲 (untuk diri sendiri).",
};

const COUNTS = [10, 20, 30];

function shuffle<T>(input: T[]): T[] {
  const list = [...input];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = list[i] as T;
    list[i] = list[j] as T;
    list[j] = tmp;
  }
  return list;
}

export default function LatihanKonteksPage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);
  const router = useRouter();

  const scenarios = useMemo(() => registerScenariosByLevel(level), [level]);
  const verbs = useMemo(() => keigoVerbsByLevel(level), [level]);

  const allItems = useMemo<Item[]>(() => {
    const registerItems: Item[] = scenarios.flatMap((scenario) =>
      scenario.lines.map((line) => ({
        id: `konteks:register:${scenario.id}:${line.audience}`,
        mode: "register" as const,
        prompt: `${scenario.title} — lawan bicara: ${AUDIENCE_LABEL[line.audience]}`,
        promptId: scenario.situation,
        answer: line.jp,
        options: shuffle(scenario.lines.map((entry) => entry.jp)),
        explanation: line.note
          ? `${line.jp} — ${line.id}. ${line.note}`
          : `${line.jp} — ${line.id}`,
      })),
    );

    const sonkeigoItems: Item[] = verbs.map((verb) => ({
      id: `konteks:sopan:son:${verb.id}`,
      mode: "sopan" as const,
      prompt: `${verb.dictionary} (${verb.meaning}) — bentuk 尊敬 (untuk orang lain)`,
      answer: verb.sonkeigo,
      options: shuffle([verb.sonkeigo, verb.teinei, verb.kenjougo].map((form) => form.split(" / ")[0] as string)),
      explanation: `${verb.dictionary} → 尊敬: ${verb.sonkeigo}${verb.note ? `. ${verb.note}` : ""}`,
    }));

    const kenjougoItems: Item[] = verbs.map((verb) => ({
      id: `konteks:sopan:ken:${verb.id}`,
      mode: "sopan" as const,
      prompt: `${verb.dictionary} (${verb.meaning}) — bentuk 謙譲 (untuk diri sendiri)`,
      answer: verb.kenjougo.split(" / ")[0] as string,
      options: shuffle([verb.sonkeigo, verb.teinei, verb.kenjougo].map((form) => form.split(" / ")[0] as string)),
      explanation: `${verb.dictionary} → 謙譲: ${verb.kenjougo}${verb.note ? `. ${verb.note}` : ""}`,
    }));

    return [...registerItems, ...sonkeigoItems, ...kenjougoItems];
  }, [scenarios, verbs]);

  const [modes, setModes] = useState<Mode[]>(["register", "sopan"]);
  const [count, setCount] = useState(10);
  const [items, setItems] = useState<Item[] | null>(null);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Array<{ item: Item; picked: number; correct: boolean }>>([]);
  const [finished, setFinished] = useState(false);
  const [showExit, setShowExit] = useState(false);

  const running = items !== null && !finished;
  useEffect(() => {
    setSessionActive(running, running ? "Latihan · Konteks" : "");
    return () => setSessionActive(false);
  }, [running]);
  useBeforeUnloadGuard(running);

  const total = items?.length ?? 0;
  const current = items?.[index];
  const correctCount = answers.filter((answer) => answer.correct).length;

  function start() {
    const pool = allItems.filter((item) => modes.includes(item.mode));
    if (pool.length === 0) return;
    setItems(shuffle(pool).slice(0, Math.min(count, pool.length)));
    setIndex(0);
    setPicked(null);
    setChecked(false);
    setAnswers([]);
    setFinished(false);
    window.scrollTo({ top: 0 });
  }

  function reset() {
    setItems(null);
    setFinished(false);
    setAnswers([]);
    setIndex(0);
    setPicked(null);
    setChecked(false);
  }

  function finish() {
    if (!items) return;
    recordQuiz(`Latihan konteks · ${level}`, correctCount, items.length);
    setFinished(true);
  }

  function check() {
    if (!current || picked === null) return;
    setAnswers((prev) => [
      ...prev,
      { item: current, picked, correct: current.options[picked] === current.answer },
    ]);
    setChecked(true);
  }

  function next() {
    if (!items) return;
    if (index + 1 >= items.length) {
      finish();
      return;
    }
    setIndex((value) => value + 1);
    setPicked(null);
    setChecked(false);
  }

  useEffect(() => {
    if (!running) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        if (checked) next();
        else check();
        return;
      }
      const digit = Number(event.key);
      if (digit >= 1 && digit <= 4 && !checked && current && digit <= current.options.length) {
        setPicked(digit - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ---------------- sesi ---------------- */
  if (running && current) {
    const correctIndex = current.options.indexOf(current.answer);
    const isCorrect = picked === correctIndex;

    return (
      <div className="mx-auto max-w-[760px] space-y-5 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">
              Soal {index + 1} dari {total}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowExit(true)}>
            Keluar
          </Button>
        </div>

        <ProgressBar value={index + (checked ? 1 : 0)} max={Math.max(1, total)} tone="level" />

        <Card>
          <CardBody className="space-y-4 p-4 sm:p-6">
            <p className="label-micro">{MODE_LABEL[current.mode]}</p>
            <p className="font-display text-h2 font-semibold leading-snug text-fg">{current.prompt}</p>
            {current.promptId ? (
              <p className="text-caption text-fg-muted">{current.promptId}</p>
            ) : null}

            <div className="grid gap-2">
              {current.options.map((option, optionIndex) => {
                const selected = picked === optionIndex;
                const isAnswer = optionIndex === correctIndex;
                return (
                  <button
                    key={option}
                    type="button"
                    disabled={checked}
                    onClick={() => setPicked(optionIndex)}
                    className={cn(
                      "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      checked && isAnswer
                        ? "border-success bg-success-soft"
                        : checked && selected
                          ? "border-danger bg-danger-soft"
                          : selected
                            ? "border-level bg-level-soft"
                            : "border-border bg-surface hover:border-border-strong",
                    )}
                  >
                    <span className="tnum mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded border border-border text-caption font-semibold text-fg-muted">
                      {optionIndex + 1}
                    </span>
                    <span lang="ja" className="font-jp text-body leading-relaxed text-fg">
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {checked ? (
              <Callout tone={isCorrect ? "success" : "danger"} title={isCorrect ? "Benar" : "Belum tepat"}>
                {current.explanation}
              </Callout>
            ) : null}

            <Button block size="lg" onClick={checked ? next : check} disabled={picked === null}>
              {checked ? (index + 1 >= total ? "Lihat hasil" : "Lanjut") : "Periksa"}
            </Button>
          </CardBody>
        </Card>

        <SessionExitDialog
          open={showExit}
          title="Keluar dari latihan?"
          onCancel={() => setShowExit(false)}
          onFinish={() => {
            setShowExit(false);
            finish();
          }}
          onDiscard={() => {
            setShowExit(false);
            reset();
          }}
        />
      </div>
    );
  }

  /* ---------------- hasil ---------------- */
  if (finished && items) {
    const percent = items.length > 0 ? Math.round((correctCount / items.length) * 100) : 0;
    return (
      <div className="mx-auto max-w-[760px] space-y-6 pb-8">
        <PageHeader
          eyebrow={<span className="label-micro">{meta.name} · Hasil latihan</span>}
          title="Hasil latihan"
          japanese="結果"
          description={`${correctCount} benar dari ${items.length} soal`}
        />
        <Card>
          <CardBody className="space-y-4 p-5">
            <p className="tnum font-display text-5xl font-semibold leading-none text-fg">
              {percent}
              <span className="ml-1 text-lg text-fg-muted">%</span>
            </p>
            <p className="text-body text-fg-muted">{scoreMessage(correctCount, items.length)}</p>
            <ProgressBar value={correctCount} max={Math.max(1, items.length)} tone="level" />
            <ul className="space-y-1.5">
              {answers.map((answer, answerIndex) => (
                <li
                  key={`${answer.item.id}-${answerIndex}`}
                  className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border pt-1.5 text-caption"
                >
                  <span className="text-fg-muted">{answer.item.prompt}</span>
                  <span className={answer.correct ? "text-success" : "text-danger"}>
                    {answer.correct ? "benar" : `salah · ${answer.item.answer}`}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={reset}>Selesai</Button>
              <Button variant="outline" onClick={start}>
                Ulangi
              </Button>
              <Button variant="ghost" onClick={() => router.push("/dashboard")}>
                Ke dasbor
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  /* ---------------- penyiapan ---------------- */
  const availableTotal = allItems.filter((item) => modes.includes(item.mode)).length;
  const effectiveCount = Math.min(count, availableTotal);

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">{meta.name} · Konteks &amp; Etiket</span>
          </div>
        }
        title="Latihan Konteks"
        japanese="敬語とマナー"
        description="Latih memilih bentuk yang pas untuk lawan bicara, bukan hanya bentuk yang benar."
        actions={
          <Link href={levelHref(level, "konteks")}>
            <Button variant="outline">Materi konteks</Button>
          </Link>
        }
      />

      <Section title="Pilih mode" glyph="型" description="Boleh lebih dari satu.">
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(MODE_LABEL) as Mode[]).map((mode) => {
            const active = modes.includes(mode);
            const available = allItems.filter((item) => item.mode === mode).length;
            return (
              <button
                key={mode}
                type="button"
                aria-pressed={active}
                disabled={available === 0}
                onClick={() =>
                  setModes((prev) =>
                    prev.includes(mode) ? prev.filter((item) => item !== mode) : [...prev, mode],
                  )
                }
                className={cn(
                  "flex h-full flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  active
                    ? "border-level/45 bg-level-soft"
                    : "border-border bg-surface hover:border-border-strong",
                )}
              >
                <span className="flex w-full items-center justify-between gap-2">
                  <span className="text-h3 font-semibold text-fg">{MODE_LABEL[mode]}</span>
                  <span className="tnum text-caption text-fg-subtle">{available} soal</span>
                </span>
                <span className="text-caption leading-relaxed text-fg-muted">
                  {MODE_DESCRIPTION[mode]}
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Jumlah soal" glyph="数">
        <Card>
          <CardBody className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-h3 font-semibold text-fg">Soal per sesi</p>
              <Badge tone="neutral" mono>
                {effectiveCount} soal
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
              {modes.length} mode · {effectiveCount} soal
            </p>
          </div>
          <Button size="lg" onClick={start} disabled={effectiveCount === 0} className="w-full sm:w-auto">
            Mulai latihan
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
