"use client";

import { useState } from "react";
import { kanji } from "@manabi/content";
import { Badge, Button, Card, CardContent, cn } from "@manabi/ui";
import { QuizRunner } from "@/components/quiz-runner";
import { SpeakButton } from "@/components/speak-button";
import { buildKanjiQuestions, type Question } from "@/lib/quiz";
import { useProgress } from "@/lib/store";

export default function KanjiPage() {
  const progress = useProgress();
  const [selectedId, setSelectedId] = useState<string>(kanji[0]?.id ?? "");
  const [questions, setQuestions] = useState<Question[] | null>(null);

  const selected = kanji.find((item) => item.id === selectedId) ?? kanji[0];

  function startQuiz() {
    setQuestions(buildKanjiQuestions(kanji, 8));
  }

  return (
    <div className="space-y-5 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Kanji N5</h1>
          <p className="mt-1 text-sm text-ink-500">
            {kanji.length} kanji fondasi — lengkap dengan bacaan, radikal, dan mnemonic.
          </p>
        </div>
        <Button onClick={startQuiz}>Latihan kanji</Button>
      </header>

      {questions ? (
        <QuizRunner
          questions={questions}
          label="Latihan kanji"
          onRestart={startQuiz}
          restartLabel="Soal baru"
        />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            {/* ---------- grid kanji ---------- */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-7">
                  {kanji.map((item) => {
                    const card = progress.cards[item.id];
                    const active = item.id === selectedId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        aria-pressed={active}
                        className={cn(
                          "relative flex aspect-square items-center justify-center rounded-xl border transition-colors",
                          active
                            ? "border-sakura-500 bg-sakura-50 text-sakura-700"
                            : "border-ink-100 bg-surface text-ink-800 hover:border-sakura-200 hover:bg-sakura-50/60",
                        )}
                      >
                        <span lang="ja" className="jp text-2xl font-semibold">{item.character}</span>
                        {card && card.interval >= 21 && (
                          <span
                            className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-matcha-500"
                            title="Sudah matang"
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[11px] text-ink-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-matcha-500" />
                  Titik hijau = kanji sudah diulang dan matang (interval ≥ 21 hari)
                </p>
              </CardContent>
            </Card>

            {/* ---------- detail kanji ---------- */}
            <Card className="h-fit lg:sticky lg:top-6">
              <CardContent className="p-5">
                <div className="genko-grid flex items-center justify-center rounded-2xl border border-ink-100 bg-surface py-8">
                  <span lang="ja" className="jp text-6xl font-semibold text-ink-900">
                    {selected?.character}
                  </span>
                </div>

                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-ink-900">
                      {selected?.meanings.join(", ")}
                    </h2>
                    <p className="mt-0.5 text-xs text-ink-400">
                      {selected?.strokes} goresan · radikal {selected?.radical}
                    </p>
                  </div>
                  <Badge tone="sakura">{selected?.level}</Badge>
                </div>

                <dl className="mt-4 space-y-3 text-sm">
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                      On&apos;yomi
                    </dt>
                    <dd lang="ja" className="jp mt-0.5 text-ink-800">
                      {selected?.onyomi.join("、") || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                      Kun&apos;yomi
                    </dt>
                    <dd lang="ja" className="jp mt-0.5 text-ink-800">
                      {selected?.kunyomi.join("、") || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                      Mnemonic
                    </dt>
                    <dd className="mt-0.5 leading-relaxed text-ink-600">{selected?.mnemonic}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                      Kata yang memakai kanji ini
                    </dt>
                    <dd className="mt-1 flex flex-wrap gap-1.5">
                      {selected?.words.map((word) => (
                        <span
                          key={word}
                          lang="ja" className="jp rounded-lg bg-ink-50 px-2 py-1 text-xs text-ink-700"
                        >
                          {word}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>

                {selected && (
                  <div className="mt-4 flex gap-2">
                    <SpeakButton text={selected.character} label="Dengar" />
                    <SpeakButton
                      text={selected.words[0]?.replace(/\s*\(.*?\)/g, "") ?? selected.character}
                      rate={0.8}
                      label="Dengar kata"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
