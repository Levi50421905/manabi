"use client";

import { useState } from "react";
import { Badge, Button, Card, CardContent, PageHeader, SegmentedControl, cn } from "@manabi/ui";
import { QuizRunner } from "@/components/quiz-runner";
import {
  buildTypedQuestions,
  type AnswerType,
  type Question,
  type QuizSource,
} from "@/lib/quiz";

const SOURCES: Array<{ key: QuizSource; title: string; detail: string }> = [
  { key: "kanji-recognize", title: "Pengesanan Kanji", detail: "Kanji → jawaban" },
  { key: "kanji-recall", title: "Mengingat Kanji", detail: "Jawaban → kanji" },
  { key: "vocab", title: "Kosakata", detail: "Kosakata → jawaban" },
];

const ANSWER_TYPES: Array<{ key: AnswerType; label: string; sources: QuizSource[] }> = [
  { key: "meaning", label: "Terjemahan", sources: ["kanji-recognize", "kanji-recall", "vocab"] },
  { key: "romaji", label: "Romaji", sources: ["vocab"] },
  { key: "kana", label: "Kana", sources: ["kanji-recognize", "kanji-recall", "vocab"] },
];

const COUNTS = [10, 20, 30];

export default function QuizPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState<Question[] | null>(null);

  function toggle(key: string) {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  }

  function start() {
    const groups = new Map<QuizSource, AnswerType[]>();

    for (const key of selected) {
      const [source, type] = key.split(":") as [QuizSource, AnswerType];
      const list = groups.get(source) ?? [];
      groups.set(source, [...list, type]);
    }

    const perType = Math.max(1, Math.floor(count / Math.max(1, selected.length)));
    const built = Array.from(groups.entries()).flatMap(([source, types]) =>
      types.flatMap((type) => buildTypedQuestions(source, type, perType)),
    );

    setQuestions(built.slice(0, count));
  }

  /* ---------- sesi latihan ---------- */
  if (questions) {
    return (
      <div className="space-y-4 pb-6">
        <PageHeader
          title="Latihan"
          description={`${questions.length} soal · ${selected.length} jenis dipilih`}
          actions={
            <Button
              variant="ghost"
              onClick={() => {
                setQuestions(null);
              }}
            >
              Ubah pilihan
            </Button>
          }
        />
        <QuizRunner
          questions={questions}
          label="Latihan kustom"
          onRestart={start}
          restartLabel="Soal baru"
        />
      </div>
    );
  }

  /* ---------- konfigurasi ---------- */
  return (
    <div className="space-y-4 pb-6">
      <PageHeader
        title="Kuis"
        description="Pilih dari sisi mana kamu ingin berlatih, lalu mulai."
      />

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
              <span className="jp grid h-8 w-8 place-items-center rounded-lg bg-accent-soft text-accent">
                問
              </span>
              Jenis soal
            </h2>
            <span className="text-xs text-fg-muted">{selected.length} dipilih</span>
          </div>

          <div className="mt-4 space-y-4">
            {SOURCES.map((source) => (
              <div key={source.key}>
                <p className="text-sm font-medium text-fg">{source.title}</p>
                <p className="text-[11px] text-fg-muted">{source.detail}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ANSWER_TYPES.filter((type) => type.sources.includes(source.key)).map((type) => {
                    const key = `${source.key}:${type.key}`;
                    const active = selected.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggle(key)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs transition-colors",
                          active
                            ? "border-accent bg-accent-soft font-medium text-accent"
                            : "border-border bg-surface text-fg-muted hover:border-accent/40",
                        )}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
            <span className="jp grid h-8 w-8 place-items-center rounded-lg bg-success-soft text-success">
              級
            </span>
            Level JLPT
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-accent bg-accent-soft px-4 py-1.5 text-xs font-medium text-accent">
              N5
            </span>
            {["N4", "N3", "N2"].map((level) => (
              <span
                key={level}
                className="rounded-full border border-border px-4 py-1.5 text-xs text-fg-muted opacity-50"
                title="Materi belum tersedia"
              >
                {level}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-fg-muted">
            N4–N2 akan aktif otomatis setelah materinya ditambahkan.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-fg">
              <span className="jp grid h-8 w-8 place-items-center rounded-lg bg-warning-soft text-warning">
                数
              </span>
              Jumlah soal
            </h2>
            <Badge tone="neutral">{count} soal</Badge>
          </div>
          <SegmentedControl
            className="mt-3"
            ariaLabel="Jumlah soal"
            value={count}
            onChange={setCount}
            options={COUNTS.map((value) => ({ value, label: String(value) }))}
          />
        </CardContent>
      </Card>

      <div className="space-y-2 text-center">
        {selected.length === 0 && (
          <p className="text-xs text-fg-muted">Pilih minimal satu jenis soal</p>
        )}
        <Button className="w-full" size="lg" disabled={selected.length === 0} onClick={start}>
          Mulai kuis
        </Button>
      </div>
    </div>
  );
}
