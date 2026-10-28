"use client";

import { useState } from "react";
import { Badge, Button, Card, CardContent } from "@manabi/ui";
import { QuizRunner } from "@/components/quiz-runner";
import {
  buildGrammarQuestions,
  buildKanaQuestions,
  buildKanjiQuestions,
  buildMixedQuestions,
  buildVocabQuestions,
  type Question,
} from "@/lib/quiz";
import { grammar, kana, kanji, vocab } from "@manabi/content";

type ModeKey = "campuran" | "kosakata" | "kanji" | "kana" | "tata-bahasa";

interface QuizMode {
  key: ModeKey;
  glyph: string;
  title: string;
  description: string;
  label: string;
  build: () => Question[];
}

const MODES: QuizMode[] = [
  {
    key: "campuran",
    glyph: "混",
    title: "Campuran",
    description: "12 soal dari semua modul — uji menyeluruh.",
    label: "Latihan campuran",
    build: () => buildMixedQuestions(12),
  },
  {
    key: "kosakata",
    glyph: "語",
    title: "Kosakata",
    description: `${vocab.length} kata N5, pilih arti yang tepat.`,
    label: "Latihan kosakata",
    build: () => buildVocabQuestions(vocab, 10),
  },
  {
    key: "kanji",
    glyph: "漢",
    title: "Kanji",
    description: `${kanji.length} kanji N5, tebak arti dasarnya.`,
    label: "Latihan kanji",
    build: () => buildKanjiQuestions(kanji, 8),
  },
  {
    key: "kana",
    glyph: "あ",
    title: "Kana",
    description: `${kana.length} huruf hiragana & katakana.`,
    label: "Latihan kana",
    build: () => buildKanaQuestions(kana, 10),
  },
  {
    key: "tata-bahasa",
    glyph: "文",
    title: "Tata bahasa",
    description: `${grammar.length} pola kalimat N5.`,
    label: "Latihan tata bahasa",
    build: () => buildGrammarQuestions(grammar, 6),
  },
];

export default function QuizPage() {
  const [active, setActive] = useState<QuizMode | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  function start(mode: QuizMode) {
    setActive(mode);
    setQuestions(mode.build());
  }

  if (active) {
    return (
      <div className="space-y-4 pb-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">{active.label}</h1>
            <p className="mt-1 text-sm text-ink-500">
              {questions.length} soal · pilih satu jawaban lalu periksa.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setActive(null);
              setQuestions([]);
            }}
          >
            Ganti mode
          </Button>
        </header>

        <QuizRunner
          questions={questions}
          label={active.label}
          onRestart={() => setQuestions(active.build())}
          restartLabel="Soal baru"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Latihan</h1>
        <p className="mt-1 text-sm text-ink-500">
          Pilih jenis latihan. Setiap sesi memberi XP dan tercatat di dasbor.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODES.map((mode) => (
          <Card key={mode.key} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between">
                <span lang="ja" className="jp grid h-10 w-10 place-items-center rounded-xl bg-sakura-50 text-lg font-semibold text-sakura-700">
                  {mode.glyph}
                </span>
                <Badge tone="neutral">{mode.key}</Badge>
              </div>
              <h2 className="mt-3 text-sm font-semibold text-ink-900">{mode.title}</h2>
              <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-500">
                {mode.description}
              </p>
              <Button className="mt-4" onClick={() => start(mode)}>
                Mulai
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-ink-50">
        <CardContent className="p-4">
          <p className="text-xs leading-relaxed text-ink-500">
            Petunjuk: jawaban salah tidak mengurangi XP, tetapi akurasi tercatat di riwayat
            latihan. Materi yang sering salah akan lebih cepat muncul di ulasan SRS.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
