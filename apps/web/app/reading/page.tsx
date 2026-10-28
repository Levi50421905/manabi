"use client";

import { useEffect, useMemo, useState } from "react";
import { reading } from "@manabi/content";
import { Badge, Button, Card, CardContent, cn } from "@manabi/ui";
import { SpeakButton } from "@/components/speak-button";
import { recordStudy } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";

export default function ReadingPage() {
  const [prefs] = usePrefs();
  const [activeId, setActiveId] = useState(reading[0]?.id ?? "");
  const [showFurigana, setShowFurigana] = useState(true);

  // Furigana mengikuti pengaturan pengguna saat halaman dibuka.
  useEffect(() => {
    setShowFurigana(prefs.furigana);
  }, [prefs.furigana]);
  const [showTranslation, setShowTranslation] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const passage = reading.find((item) => item.id === activeId) ?? reading[0];

  const plainText = useMemo(
    () => passage?.segments.map((segment) => segment.text).join("") ?? "",
    [passage],
  );

  function selectPassage(id: string) {
    setActiveId(id);
    setAnswers({});
    setChecked({});
  }

  if (!passage) {
    return <p className="text-sm text-ink-500">Belum ada bacaan.</p>;
  }

  return (
    <div className="space-y-5 pb-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Membaca</h1>
        <p className="mt-1 text-sm text-ink-500">
          Bacaan pendek level N5 dengan furigana, terjemahan, dan pertanyaan pemahaman.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {reading.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectPassage(item.id)}
            className={cn(
              "jp rounded-full border px-3 py-1.5 text-xs transition-colors",
              item.id === activeId
                ? "border-sakura-300 bg-sakura-50 text-sakura-700"
                : "border-ink-200 bg-white text-ink-500 hover:text-ink-800",
            )}
          >
            {item.title}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="jp text-xl font-semibold text-ink-900">{passage.title}</h2>
                <p className="mt-0.5 text-xs text-ink-400">{passage.level} · bacaan pendek</p>
              </div>
              <Badge tone="sakura">{passage.level}</Badge>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 border-y border-ink-100 py-3">
              <label className="flex items-center gap-1.5 text-xs text-ink-600">
                <input
                  type="checkbox"
                  checked={showFurigana}
                  onChange={(event) => setShowFurigana(event.target.checked)}
                  className="accent-sakura-600"
                />
                Furigana
              </label>
              <label className="flex items-center gap-1.5 text-xs text-ink-600">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(event) => setShowTranslation(event.target.checked)}
                  className="accent-sakura-600"
                />
                Terjemahan
              </label>
              <div className="ml-auto flex gap-2">
                <SpeakButton text={plainText} label="Dengar" />
                <Button size="sm" variant="ghost" onClick={() => setShowTranslation((v) => !v)}>
                  {showTranslation ? "Sembunyikan arti" : "Lihat arti"}
                </Button>
              </div>
            </div>

            <p className="jp mt-5 text-lg leading-loose text-ink-900">
              {passage.segments.map((segment, index) =>
                segment.reading ? (
                  <ruby key={`${segment.text}-${index}`}>
                    {segment.text}
                    <rt
                      className={cn(
                        "transition-opacity",
                        showFurigana ? "opacity-100" : "opacity-0",
                      )}
                    >
                      {segment.reading}
                    </rt>
                  </ruby>
                ) : (
                  <span key={`${segment.text}-${index}`}>{segment.text}</span>
                ),
              )}
            </p>

            {showTranslation && (
              <div className="mt-5 rounded-xl bg-ink-50 p-4 animate-pop">
                <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                  Terjemahan
                </p>
                <p className="mt-1 text-sm leading-relaxed text-ink-700">
                  {passage.translation}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-ink-900">Pertanyaan pemahaman</h3>
              {passage.questions.length === 0 ? (
                <p className="mt-2 text-xs text-ink-400">Belum ada pertanyaan untuk bacaan ini.</p>
              ) : (
                <div className="mt-3 space-y-4">
                  {passage.questions.map((question, questionIndex) => {
                    const key = `${passage.id}:${questionIndex}`;
                    const selected: number | undefined = answers[key];
                    const isChecked = checked[key] === true;
                    const isCorrect = selected === question.answer;

                    return (
                      <div key={key}>
                        <p className="jp text-sm font-medium text-ink-800">{question.question}</p>
                        <div className="mt-2 space-y-1.5">
                          {question.options.map((option, optionIndex) => {
                            const picked = selected === optionIndex;
                            const correctOption = isChecked && optionIndex === question.answer;
                            const wrongPicked = isChecked && picked && optionIndex !== question.answer;

                            return (
                              <button
                                key={option}
                                type="button"
                                disabled={isChecked}
                                onClick={() => setAnswers((prev) => ({ ...prev, [key]: optionIndex }))}
                                className={cn(
                                  "jp flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                                  "border-ink-200 bg-white text-ink-700 hover:border-sakura-300",
                                  picked && !isChecked && "border-sakura-400 bg-sakura-50",
                                  correctOption && "border-matcha-400 bg-matcha-50 text-matcha-600",
                                  wrongPicked && "border-red-300 bg-red-50 text-red-700",
                                )}
                              >
                                <span>{option}</span>
                                {correctOption && <span aria-hidden="true">✓</span>}
                                {wrongPicked && <span aria-hidden="true">✕</span>}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          {!isChecked ? (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={selected === undefined}
                              onClick={() =>
                                setChecked((prev) => ({ ...prev, [key]: true }))
                              }
                            >
                              Periksa
                            </Button>
                          ) : (
                            <p
                              className={cn(
                                "text-xs font-medium",
                                isCorrect ? "text-matcha-600" : "text-red-600",
                              )}
                            >
                              {isCorrect ? "Benar!" : "Belum tepat — coba baca ulang kalimatnya."}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 border-t border-ink-100 pt-3">
                <Button variant="ghost" size="sm" onClick={() => recordStudy("reading")}>
                  Tandai sudah dibaca (+3 XP, sekali per hari)
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-matcha-50/60">
            <CardContent className="p-4">
              <p className="text-xs leading-relaxed text-ink-600">
                Tips: baca kalimat Jepang dulu tanpa furigana, tebak artinya, baru nyalakan
                furigana dan terjemahan untuk memeriksa.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
