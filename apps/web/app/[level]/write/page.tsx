"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Callout,
  Card,
  EmptyState,
  PageHeader,
  Section,
  SegmentedControl,
  cn,
} from "@manabi/ui";
import { hiragana, katakana, kanjiByLevel, levelHref } from "@manabi/content";
import { WritingPad } from "@/components/writing-pad";
import { useActiveLevel } from "@/lib/level";

type SetKey = "hiragana" | "katakana" | "kanji";

interface WriteItem {
  char: string;
  hint?: string;
  meaning?: string;
}

const SETS: Array<{ value: SetKey; label: string; glyph: string }> = [
  { value: "hiragana", label: "Hiragana", glyph: "あ" },
  { value: "katakana", label: "Katakana", glyph: "ア" },
  { value: "kanji", label: "Kanji", glyph: "漢" },
];

const KANA_TOTAL = hiragana.length + katakana.length;

export default function WritePage() {
  const { level } = useActiveLevel();
  const kanjiItems = useMemo(() => kanjiByLevel(level), [level]);

  const [setKey, setSetKey] = useState<SetKey>("hiragana");
  const [index, setIndex] = useState(0);

  /** Huruf yang bisa dilatih pada set aktif. Kanji selalu mengikuti level. */
  const items = useMemo<WriteItem[]>(() => {
    if (setKey === "kanji") {
      return kanjiItems.map((item) => ({
        char: item.character,
        hint: item.onyomi[0] ?? item.kunyomi[0] ?? "",
        meaning: item.meanings.join(", "),
      }));
    }
    const list = setKey === "hiragana" ? hiragana : katakana;
    return list.map((item) => ({ char: item.char, hint: item.romaji }));
  }, [setKey, kanjiItems]);

  const safeIndex = items.length === 0 ? 0 : index % items.length;
  const current = items[safeIndex];
  const setLabel = SETS.find((item) => item.value === setKey)?.label ?? "";

  // Pindah level mengubah daftar kanji — mulai lagi dari huruf pertama.
  useEffect(() => {
    setIndex(0);
  }, [level]);

  // Shortcut ← → untuk berpindah huruf selama fokus tidak di kolom teks.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "ArrowRight" && items.length > 0) {
        event.preventDefault();
        setIndex((value) => (value + 1) % items.length);
      }
      if (event.key === "ArrowLeft" && items.length > 0) {
        event.preventDefault();
        setIndex((value) => (value - 1 + items.length) % items.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items.length]);

  function changeSet(next: SetKey) {
    setSetKey(next);
    setIndex(0);
  }

  function go(step: number) {
    if (items.length === 0) return;
    setIndex((value) => (value + step + items.length) % items.length);
  }

  function pickRandom() {
    if (items.length === 0) return;
    setIndex(Math.floor(Math.random() * items.length));
  }

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">Menulis</span>
          </div>
        }
        title="Menulis"
        japanese="書く"
        description={`Latih urutan dan bentuk goresan — ${KANA_TOTAL} kana dan ${kanjiItems.length} kanji level ${level}. Mendukung mouse, stylus, dan layar sentuh.`}
        actions={
          <SegmentedControl
            options={SETS}
            value={setKey}
            onChange={changeSet}
            ariaLabel="Pilih jenis huruf"
            size="sm"
          />
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        <Section
          title="Kanvas latihan"
          glyph="書"
          description={
            current
              ? `${setLabel} · huruf ${safeIndex + 1} dari ${items.length}`
              : `${setLabel} · belum ada huruf untuk level ini`
          }
        >
          <Card>
            <div className="p-4 sm:p-6">
              {current ? (
                <WritingPad
                  character={current.char}
                  romaji={current.hint}
                  meaning={current.meaning}
                  onNext={items.length > 1 ? () => go(1) : undefined}
                  nextLabel="Berikutnya"
                />
              ) : (
                <EmptyState
                  glyph="書"
                  title={`Kanji ${level} belum tersedia`}
                  description="Latihan kanji aktif begitu materi level ini ditambahkan. Sementara itu, latih hiragana dan katakana."
                  action={
                    <Button variant="outline" onClick={() => changeSet("hiragana")}>
                      Ke hiragana
                    </Button>
                  }
                />
              )}
            </div>
          </Card>
        </Section>

        <div className="space-y-4">
          <Card>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="label-micro">Pemilih huruf</p>
                <span className="tnum text-caption text-fg-muted">
                  {items.length === 0 ? 0 : safeIndex + 1} / {items.length}
                </span>
              </div>
              <p className="mt-1 text-caption text-fg-subtle">
                {setLabel}
                <span className="hidden sm:inline"> · gunakan ← → untuk berpindah huruf.</span>
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => go(-1)}
                  disabled={items.length < 2}
                  aria-label="Huruf sebelumnya"
                >
                  ‹ Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => go(1)}
                  disabled={items.length < 2}
                  aria-label="Huruf berikutnya"
                >
                  Berikutnya ›
                </Button>
              </div>
              <Button
                variant="ghost"
                size="md"
                block
                className="mt-2"
                onClick={pickRandom}
                disabled={items.length < 2}
              >
                Acak huruf
              </Button>

              <div className="mt-4 max-h-[300px] overflow-y-auto pr-1 [scrollbar-width:thin]">
                {items.length === 0 ? (
                  <p className="py-6 text-center text-caption text-fg-subtle">
                    Belum ada huruf pada set ini.
                  </p>
                ) : (
                  <ul className="grid grid-cols-6 gap-1.5" aria-label={`Pilih huruf ${setLabel}`}>
                    {items.map((item, itemIndex) => {
                      const active = itemIndex === safeIndex;
                      return (
                        <li key={`${item.char}-${itemIndex}`}>
                          <button
                            type="button"
                            onClick={() => setIndex(itemIndex)}
                            aria-pressed={active}
                            aria-current={active ? "true" : undefined}
                            aria-label={`Pilih huruf ${item.char}${
                              item.hint ? `, ${item.hint}` : ""
                            }`}
                            className={cn(
                              "flex aspect-square min-h-11 w-full items-center justify-center rounded-lg border text-base transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1",
                              active
                                ? "border-level bg-level-soft text-level"
                                : "border-border bg-surface text-fg hover:border-border-strong hover:bg-surface-muted",
                            )}
                          >
                            <span lang="ja" className="font-jp">
                              {item.char}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </Card>

          <Callout tone="info" title="Tips menulis">
            <p>
              Sembunyikan contoh setelah beberapa kali mencoba, lalu tulis dari ingatan. Tidak ada
              penilaian otomatis — fokusnya melatih urutan dan bentuk goresan.
            </p>
          </Callout>

          <Card variant="muted">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 p-4 text-caption">
              <Link
                href={levelHref(level, "kanji")}
                className="text-accent underline-offset-2 hover:underline"
              >
                Peta kanji {level} →
              </Link>
              <Link
                href={levelHref(level, "vocab")}
                className="text-accent underline-offset-2 hover:underline"
              >
                Ulas kosakata {level} →
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
