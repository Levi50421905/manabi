"use client";

import { useEffect, useState } from "react";
import { listening, listeningQuestions } from "@manabi/content";
import { Badge, Button, Card, CardContent, cn } from "@manabi/ui";
import { SpeakButton } from "@/components/speak-button";
import { createUtterance, isSpeechSupported, stopSpeaking } from "@/lib/tts";
import { recordStudy } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";

const RATES = [
  { value: 0.7, label: "Lambat" },
  { value: 0.9, label: "Normal" },
  { value: 1.1, label: "Cepat" },
];

export default function ListeningPage() {
  const [activeId, setActiveId] = useState(listening[0]?.id ?? "");
  const [showKana, setShowKana] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [prefs, setPrefs] = usePrefs();
  const [supported, setSupported] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const rate = prefs.ttsRate;

  useEffect(() => {
    setSupported(isSpeechSupported());
    return () => stopSpeaking();
  }, []);

  const track = listening.find((item) => item.id === activeId) ?? listening[0];
  const speakerNames = track
    ? Array.from(new Set(track.lines.map((line) => line.speaker)))
    : [];
  const speakerIndexOf = (name: string) => Math.max(0, speakerNames.indexOf(name));

  function playAll() {
    if (!isSpeechSupported() || !track) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const lines = track.lines;
    let cursor = 0;
    const names = Array.from(new Set(lines.map((line) => line.speaker)));

    const playNext = () => {
      if (cursor >= lines.length) return;
      const line = lines[cursor];
      cursor += 1;
      const utterance = createUtterance(
        line?.jp ?? "",
        rate,
        Math.max(0, names.indexOf(line?.speaker ?? "")),
      );
      if (!utterance) return;
      utterance.onend = playNext;
      synth.speak(utterance);
    };

    playNext();
    recordStudy("listening");
  }

  return (
    <div className="space-y-5 pb-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Listening</h1>
        <p className="mt-1 text-sm text-ink-500">
          Dialog sehari-hari. Pelafalan memakai suara Jepang dari browser/OS kamu.
        </p>
      </header>

      {!supported && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          Browser ini tidak mendukung Web Speech API. Teks dialog tetap bisa dibaca, dan
          tombol pelafalan akan nonaktif.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
        {/* ---------- daftar track ---------- */}
        <div className="space-y-2">
          {listening.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className={cn(
                "w-full rounded-2xl border p-3 text-left transition-colors",
                item.id === activeId
                  ? "border-sakura-300 bg-sakura-50"
                  : "border-ink-100 bg-surface hover:border-sakura-200",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span lang="ja" className="jp text-sm font-semibold text-ink-900">{item.title}</span>
                <Badge tone="neutral">{item.level}</Badge>
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                {item.description}
              </span>
            </button>
          ))}
        </div>

        {/* ---------- player ---------- */}
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 lang="ja" className="jp text-base font-semibold text-ink-900">{track?.title}</h2>
                <p className="text-xs text-ink-500">
                  {track?.lines.length} baris dialog · {track?.level}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={playAll} disabled={!supported}>
                  ▶ Putar semua
                </Button>
                <Button size="sm" variant="outline" onClick={() => stopSpeaking()}>
                  Stop
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 border-y border-ink-100 py-3">
              <div className="flex rounded-lg border border-ink-200 p-0.5">
                {RATES.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPrefs({ ttsRate: item.value })}
                    className={cn(
                      "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                      rate === item.value ? "bg-fg text-canvas" : "text-ink-500",
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <label className="flex items-center gap-1.5 text-xs text-ink-600">
                <input
                  type="checkbox"
                  checked={showKana}
                  onChange={(event) => setShowKana(event.target.checked)}
                  className="accent-sakura-600"
                />
                Tampilkan kana
              </label>
              <label className="flex items-center gap-1.5 text-xs text-ink-600">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(event) => setShowTranslation(event.target.checked)}
                  className="accent-sakura-600"
                />
                Tampilkan terjemahan
              </label>
            </div>

            <div className="mt-4 space-y-3">
              {track?.lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-ink-100 p-3"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium uppercase tracking-wide text-ink-400">
                      {line.speaker}
                    </p>
                    <p lang="ja" className="jp mt-1 text-base text-ink-900">{line.jp}</p>
                    {showKana && line.kana && (
                      <p lang="ja" className="jp mt-0.5 text-xs text-ink-400">{line.kana}</p>
                    )}
                    {showTranslation && (
                      <p className="mt-1 text-xs text-ink-500">{line.id}</p>
                    )}
                  </div>
                  <SpeakButton
                    text={line.jp}
                    rate={rate}
                    speakerIndex={speakerIndexOf(line.speaker)}
                  />
                </div>
              ))}
            </div>

            {track && (listeningQuestions[track.id]?.length ?? 0) > 0 && (
              <div className="mt-5 border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-fg">Soal pemahaman</h3>
                <p className="mt-0.5 text-[11px] text-fg-muted">
                  Coba putar dialog tanpa melihat teks, lalu jawab pertanyaan ini.
                </p>

                {listeningQuestions[track.id]?.map((question) => {
                  const selected = answers[question.id];
                  const isChecked = checked[question.id] === true;
                  const isCorrect = selected === question.answer;

                  return (
                    <div key={question.id} className="mt-3">
                      <p className="text-sm font-medium text-fg">{question.prompt}</p>
                      <div className="mt-2 space-y-1.5">
                        {question.options.map((option, optionIndex) => {
                          const picked = selected === optionIndex;
                          const showCorrect = isChecked && optionIndex === question.answer;
                          const showWrong = isChecked && picked && optionIndex !== question.answer;

                          return (
                            <button
                              key={option}
                              type="button"
                              disabled={isChecked}
                              onClick={() =>
                                setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))
                              }
                              className={cn(
                                "jp flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                                "border-border bg-surface text-fg hover:border-accent/40",
                                picked && !isChecked && "border-accent bg-accent-soft",
                                showCorrect && "border-success bg-success-soft text-success",
                                showWrong && "border-danger bg-danger-soft text-danger",
                              )}
                            >
                              <span>{option}</span>
                              {showCorrect && <span aria-hidden="true">✓</span>}
                              {showWrong && <span aria-hidden="true">✕</span>}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-2">
                        {!isChecked ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={selected === undefined}
                            onClick={() =>
                              setChecked((prev) => ({ ...prev, [question.id]: true }))
                            }
                          >
                            Periksa jawaban
                          </Button>
                        ) : (
                          <p
                            className={cn(
                              "text-xs",
                              isCorrect ? "text-success" : "text-danger",
                            )}
                          >
                            {isCorrect ? "Benar! " : "Belum tepat. "}
                            <span className="text-fg-muted">{question.explanation}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => recordStudy("listening")}>
                Tandai sudah didengarkan (+3 XP, sekali per hari)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
