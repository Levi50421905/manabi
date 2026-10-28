"use client";

import { useMemo, useState } from "react";
import {
  hiragana,
  katakana,
  kanaRows,
  kanaRowLabels,
  type Kana,
  type KanaType,
} from "@manabi/content";
import { Badge, Button, Card, CardContent, cn } from "@manabi/ui";
import { QuizRunner } from "@/components/quiz-runner";
import { buildKanaQuestions, type Question } from "@/lib/quiz";
import { speak } from "@/lib/tts";

type Mode = "belajar" | "latihan";

export default function KanaPage() {
  const [type, setType] = useState<KanaType>("hiragana");
  const [mode, setMode] = useState<Mode>("belajar");
  const [showRomaji, setShowRomaji] = useState(true);
  const [questions, setQuestions] = useState<Question[] | null>(null);

  const pool: Kana[] = type === "hiragana" ? hiragana : katakana;

  const grouped = useMemo(
    () =>
      kanaRows.map((row) => ({
        row,
        label: kanaRowLabels[row] ?? row,
        items: pool.filter((item) => item.row === row),
      })),
    [pool],
  );

  function startQuiz() {
    setQuestions(buildKanaQuestions(pool, 10));
  }

  return (
    <div className="space-y-5 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Kana Trainer</h1>
          <p className="mt-1 text-sm text-ink-500">
            46 huruf dasar per aksara. Klik kartu untuk mendengar pelafalannya.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-xl border border-ink-200 bg-white p-1">
            {(["hiragana", "katakana"] as KanaType[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setType(item);
                  setQuestions(null);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                  type === item ? "bg-ink-900 text-white" : "text-ink-500 hover:text-ink-800",
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="flex rounded-xl border border-ink-200 bg-white p-1">
            {(
              [
                { key: "belajar", label: "Belajar" },
                { key: "latihan", label: "Latihan" },
              ] as Array<{ key: Mode; label: string }>
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setMode(item.key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  mode === item.key ? "bg-sakura-600 text-white" : "text-ink-500 hover:text-ink-800",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {mode === "belajar" ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge tone="sakura">{pool.length} huruf</Badge>
              <Badge tone="neutral">{type === "hiragana" ? "Hiragana" : "Katakana"}</Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowRomaji((value) => !value)}>
              {showRomaji ? "Sembunyikan romaji" : "Tampilkan romaji"}
            </Button>
          </div>

          <div className="space-y-4">
            {grouped.map((group) => (
              <Card key={group.row}>
                <CardContent className="p-4">
                  <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-400">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-5 gap-2">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => speak(item.char)}
                        title={`${item.char} — ${item.romaji} (klik untuk mendengar)`}
                        className="group flex flex-col items-center justify-center rounded-xl border border-ink-100 bg-white py-3 transition-colors hover:border-sakura-200 hover:bg-sakura-50"
                      >
                        <span className="jp text-2xl font-semibold text-ink-900">{item.char}</span>
                        <span
                          className={cn(
                            "mt-0.5 text-[11px] text-ink-400 transition-opacity",
                            showRomaji ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                          )}
                        >
                          {item.romaji}
                        </span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-sakura-50/60">
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-medium text-ink-800">Sudah hafal hurufnya?</p>
                <p className="text-xs text-ink-500">
                  Uji dengan 10 soal acak — arahkan baca dan tulis.
                </p>
              </div>
              <Button onClick={startQuiz}>Mulai latihan kana</Button>
            </CardContent>
          </Card>
        </>
      ) : questions ? (
        <QuizRunner
          questions={questions}
          label={`Latihan ${type}`}
          onRestart={startQuiz}
          restartLabel="Soal baru"
        />
      ) : (
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <p className="jp text-4xl">あ</p>
            <div>
              <p className="text-sm font-medium text-ink-800">
                10 soal acak dari {pool.length} huruf {type}
              </p>
              <p className="mt-1 text-xs text-ink-500">
                Campuran membaca huruf → romaji dan romaji → huruf.
              </p>
            </div>
            <Button onClick={startQuiz}>Mulai</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
