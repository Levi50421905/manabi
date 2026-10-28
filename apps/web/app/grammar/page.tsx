"use client";

import { useState } from "react";
import { grammar } from "@manabi/content";
import { Badge, Button, Card, CardContent, cn } from "@manabi/ui";
import { QuizRunner } from "@/components/quiz-runner";
import { SpeakButton } from "@/components/speak-button";
import { buildGrammarQuestions, type Question } from "@/lib/quiz";

export default function GrammarPage() {
  const [openId, setOpenId] = useState<string | null>(grammar[0]?.id ?? null);
  const [questions, setQuestions] = useState<Question[] | null>(null);

  function startQuiz() {
    setQuestions(buildGrammarQuestions(grammar, 6));
  }

  return (
    <div className="space-y-5 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Tata Bahasa N5</h1>
          <p className="mt-1 text-sm text-ink-500">
            {grammar.length} pola kalimat dasar, dijelaskan dalam bahasa Indonesia.
          </p>
        </div>
        <Button onClick={startQuiz}>Latihan tata bahasa</Button>
      </header>

      {questions ? (
        <QuizRunner
          questions={questions}
          label="Latihan tata bahasa"
          onRestart={startQuiz}
          restartLabel="Soal baru"
        />
      ) : (
        <div className="space-y-2">
          {grammar.map((item) => {
            const open = openId === item.id;
            return (
              <Card
                key={item.id}
                className={cn("overflow-hidden transition-colors", open && "border-sakura-200")}
              >
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : item.id)}
                  aria-expanded={open}
                  className="flex w-full items-center gap-3 p-4 text-left hover:bg-ink-50/60"
                >
                  <span className="jp grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sakura-50 text-xs font-semibold text-sakura-700">
                    文
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-ink-900">{item.title}</span>
                    <span className="jp block truncate text-xs text-ink-400">{item.pattern}</span>
                  </span>
                  <Badge tone="neutral">{item.level}</Badge>
                  <span
                    className={cn(
                      "text-ink-300 transition-transform",
                      open && "rotate-180 text-sakura-500",
                    )}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </button>

                {open && (
                  <CardContent className="animate-pop border-t border-ink-100 pt-4">
                    <p className="rounded-xl bg-ink-50 px-3 py-2 font-mono text-xs text-ink-700">
                      {item.pattern}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{item.explanation}</p>

                    <div className="mt-4 space-y-2">
                      {item.examples.map((example) => (
                        <div
                          key={example.jp}
                          className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-3"
                        >
                          <div className="min-w-0">
                            <p className="jp text-sm font-medium text-ink-900">{example.jp}</p>
                            <p className="mt-0.5 text-xs text-ink-500">{example.id}</p>
                          </div>
                          <SpeakButton text={example.jp} />
                        </div>
                      ))}
                    </div>

                    {item.notes && item.notes.length > 0 && (
                      <ul className="mt-4 space-y-1 rounded-xl bg-matcha-50 p-3">
                        {item.notes.map((note) => (
                          <li key={note} className="text-xs leading-relaxed text-matcha-600">
                            • {note}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
