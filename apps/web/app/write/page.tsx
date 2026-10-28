"use client";

import { useMemo, useState } from "react";
import { hiragana, kanji, katakana } from "@manabi/content";
import { Badge, Button, Card, CardContent, cn } from "@manabi/ui";
import { WritingPad } from "@/components/writing-pad";

type SetKey = "hiragana" | "katakana" | "kanji";

interface WriteItem {
  char: string;
  hint?: string;
  meaning?: string;
}

const SETS: Array<{ key: SetKey; label: string; glyph: string }> = [
  { key: "hiragana", label: "Hiragana", glyph: "あ" },
  { key: "katakana", label: "Katakana", glyph: "ア" },
  { key: "kanji", label: "Kanji N5", glyph: "漢" },
];

export default function WritePage() {
  const [setKey, setSetKey] = useState<SetKey>("hiragana");
  const [index, setIndex] = useState(0);

  const items = useMemo<WriteItem[]>(() => {
    if (setKey === "kanji") {
      return kanji.map((item) => ({
        char: item.character,
        hint: item.onyomi[0] ?? item.kunyomi[0] ?? "",
        meaning: item.meanings.join(", "),
      }));
    }
    const list = setKey === "hiragana" ? hiragana : katakana;
    return list.map((item) => ({ char: item.char, hint: item.romaji }));
  }, [setKey]);

  const safeIndex = items.length === 0 ? 0 : index % items.length;
  const current = items[safeIndex];

  function changeSet(next: SetKey) {
    setSetKey(next);
    setIndex(0);
  }

  function go(step: number) {
    if (items.length === 0) return;
    setIndex((value) => (value + step + items.length) % items.length);
  }

  return (
    <div className="space-y-5 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Latihan Menulis</h1>
          <p className="mt-1 text-sm text-ink-500">
            Tulis di kanvas, ikuti contoh yang samar. Mendukung mouse, stylus, dan layar sentuh.
          </p>
        </div>
        <div className="flex rounded-xl border border-ink-200 bg-surface p-1">
          {SETS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => changeSet(item.key)}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                setKey === item.key
                  ? "bg-sakura-600 text-white"
                  : "text-ink-500 hover:text-ink-800",
              )}
            >
              <span lang="ja" className="jp">{item.glyph}</span>
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardContent className="p-5">
            {current ? (
              <WritingPad
                character={current.char}
                romaji={current.hint}
                meaning={current.meaning}
                onNext={() => go(1)}
                nextLabel="Berikutnya"
              />
            ) : (
              <p className="text-sm text-ink-400">Tidak ada data.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <Badge tone="sakura">
                    {safeIndex + 1}/{items.length}
                  </Badge>
                  <span>{SETS.find((item) => item.key === setKey)?.label}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => go(-1)}>
                    ← Sebelumnya
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIndex(Math.floor(Math.random() * Math.max(1, items.length)))}
                  >
                    Acak
                  </Button>
                  <Button size="sm" onClick={() => go(1)}>
                    Berikutnya →
                  </Button>
                </div>
              </div>

              <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
                Tips: sembunyikan contoh setelah beberapa kali mencoba, lalu tulis dari ingatan.
                Tidak ada penilaian otomatis — fokusnya melatih urutan dan bentuk goresan.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-ink-400">
                Pilih huruf
              </p>
              <div
                className={cn(
                  "max-h-[320px] overflow-y-auto pr-1",
                  setKey === "kanji" ? "grid grid-cols-8 gap-1" : "grid grid-cols-10 gap-1",
                )}
              >
                {items.map((item, itemIndex) => (
                  <button
                    key={`${item.char}-${itemIndex}`}
                    type="button"
                    onClick={() => setIndex(itemIndex)}
                    aria-pressed={itemIndex === safeIndex}
                    className={cn(
                      "jp flex aspect-square items-center justify-center rounded-lg border text-sm transition-colors",
                      itemIndex === safeIndex
                        ? "border-sakura-500 bg-sakura-50 text-sakura-700"
                        : "border-ink-100 text-ink-700 hover:border-sakura-200 hover:bg-sakura-50/60",
                    )}
                  >
                    {item.char}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
