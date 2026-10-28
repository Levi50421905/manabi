"use client";

import { useEffect, useState } from "react";
import { listening } from "@manabi/content";
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
  const rate = prefs.ttsRate;

  useEffect(() => {
    setSupported(isSpeechSupported());
    return () => stopSpeaking();
  }, []);

  const track = listening.find((item) => item.id === activeId) ?? listening[0];

  function playAll() {
    if (!isSpeechSupported() || !track) return;

    const synth = window.speechSynthesis;
    synth.cancel();

    const lines = track.lines;
    let cursor = 0;

    const playNext = () => {
      if (cursor >= lines.length) return;
      const line = lines[cursor];
      cursor += 1;
      const utterance = createUtterance(line?.jp ?? "", rate);
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
                  : "border-ink-100 bg-white hover:border-sakura-200",
              )}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="jp text-sm font-semibold text-ink-900">{item.title}</span>
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
                <h2 className="jp text-base font-semibold text-ink-900">{track?.title}</h2>
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
                      rate === item.value ? "bg-ink-900 text-white" : "text-ink-500",
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
                    <p className="jp mt-1 text-base text-ink-900">{line.jp}</p>
                    {showKana && line.kana && (
                      <p className="jp mt-0.5 text-xs text-ink-400">{line.kana}</p>
                    )}
                    {showTranslation && (
                      <p className="mt-1 text-xs text-ink-500">{line.id}</p>
                    )}
                  </div>
                  <SpeakButton text={line.jp} rate={rate} />
                </div>
              ))}
            </div>

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
