"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  ProgressBar,
  Section,
  SegmentedControl,
  cn,
} from "@manabi/ui";
import {
  availableLevels,
  kanjiByLevel,
  levelHref,
  levelMeta,
  type Kanji,
} from "@manabi/content";
import type { SrsCard } from "@manabi/srs";
import { QuizRunner } from "@/components/quiz-runner";
import { SpeakButton } from "@/components/speak-button";
import { buildKanjiQuestions, type Question } from "@/lib/quiz";
import { useProgress } from "@/lib/store";
import { useActiveLevel } from "@/lib/level";

type KanjiFilter = "semua" | "belum" | "dikuasai";

const FILTERS: Array<{ value: KanjiFilter; label: string }> = [
  { value: "semua", label: "Semua" },
  { value: "belum", label: "Belum" },
  { value: "dikuasai", label: "Sudah dikuasai" },
];

const FILTER_DESCRIPTION: Record<KanjiFilter, string> = {
  semua: "Seluruh kanji level ini.",
  belum: "Kanji yang belum Anda tandai sebagai dikuasai.",
  dikuasai: "Kanji yang sudah Anda tandai kuasai.",
};

/**
 * Tanda "dikuasai" sengaja disimpan terpisah dari jadwal SRS: menandai
 * penguasaan adalah penilaian pribadi, sedangkan SRS tetap menghitung
 * kapan sebuah kanji perlu diulas lagi.
 */
const MASTERED_KEY = "manabi:v1:kanji-mastered";

function readMasteredIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MASTERED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function persistMasteredIds(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MASTERED_KEY, JSON.stringify(ids));
  } catch {
    // storage penuh / diblokir — status tetap hidup di memori
  }
}

export default function KanjiPage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);
  const progress = useProgress();
  const items = useMemo(() => kanjiByLevel(level), [level]);

  const [filter, setFilter] = useState<KanjiFilter>("semua");
  const [selectedId, setSelectedId] = useState("");
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const detailRef = useRef<HTMLDivElement | null>(null);

  // localStorage hanya tersedia di klien, jadi hidrasi setelah mount.
  useEffect(() => {
    setMasteredIds(readMasteredIds());
  }, []);

  // Pindah level = konteks baru: filter, pilihan, dan kuis direset.
  useEffect(() => {
    setFilter("semua");
    setSelectedId("");
    setQuestions(null);
  }, [level]);

  const mastered = useMemo(() => new Set(masteredIds), [masteredIds]);

  const filtered = useMemo(() => {
    if (filter === "belum") return items.filter((item) => !mastered.has(item.id));
    if (filter === "dikuasai") return items.filter((item) => mastered.has(item.id));
    return items;
  }, [items, filter, mastered]);

  // Pilihan turunan: kalau kanji terpilih tidak ada di filter aktif, pakai
  // kanji pertama yang terlihat — detail tidak pernah menampilkan item kosong.
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];

  const masteredCount = items.filter((item) => mastered.has(item.id)).length;
  const matureCount = items.filter((item) => {
    const card = progress.cards[item.id];
    return card ? card.interval >= 21 : false;
  }).length;

  function toggleMastered(id: string) {
    setMasteredIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      persistMasteredIds(next);
      return next;
    });
  }

  function selectKanji(id: string) {
    setSelectedId(id);
    // Di layar kecil detail berada di bawah peta kanji — bawa ke pandangan.
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 1023px)").matches) {
      detailRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    }
  }

  function startQuiz() {
    if (items.length === 0) return;
    setQuestions(buildKanjiQuestions(items, Math.min(8, items.length)));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }

  /* ---------- level tanpa materi ---------- */
  if (items.length === 0) {
    const fallback = availableLevels[0] ?? level;
    return (
      <div className="space-y-8 pb-8">
        <KanjiHeader
          level={level}
          description={`Materi kanji level ${level} (${meta.name}) sedang disusun. Level yang sudah tersedia tetap bisa dibuka kapan saja.`}
        />
        <EmptyState
          glyph="漢"
          title={`Kanji ${level} belum tersedia`}
          description="Kurikulum ditambahkan bertahap. Sementara itu, lanjutkan belajar di level yang sudah punya materi."
          action={
            <Link href={levelHref(fallback, "kanji")}>
              <Button variant="level">Buka kanji {fallback}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  /* ---------- mode kuis ---------- */
  if (questions) {
    return (
      <div className="space-y-6 pb-8">
        <KanjiHeader
          level={level}
          description={`Kuis level ${level}. Shortcut 1–4 memilih jawaban, Enter memeriksa, lalu lanjut ke soal berikutnya.`}
          action={
            <Button variant="outline" onClick={() => setQuestions(null)}>
              Kembali ke daftar
            </Button>
          }
        />
        <div aria-live="polite">
          <QuizRunner
            questions={questions}
            label={`Latihan kanji ${level}`}
            onRestart={startQuiz}
            restartLabel="Soal baru"
          />
        </div>
      </div>
    );
  }

  /* ---------- peta kanji + detail ---------- */
  return (
    <div className="space-y-8 pb-8">
      <KanjiHeader
        level={level}
        description={`${items.length} kanji · ${masteredCount} dikuasai · ${matureCount} matang. Bacaan, radikal, goresan, dan mnemonic level ${level}.`}
        action={
          <Button
            onClick={startQuiz}
            leading={
              <span lang="ja" aria-hidden="true" className="font-jp text-caption">
                問
              </span>
            }
          >
            Kuis kanji
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <Section
          title="Pilih kanji"
          glyph="漢"
          description={`${filtered.length} dari ${items.length} kanji ditampilkan. ${FILTER_DESCRIPTION[filter]}`}
          action={
            <SegmentedControl
              options={FILTERS}
              value={filter}
              onChange={setFilter}
              size="sm"
              ariaLabel="Filter kanji"
            />
          }
        >
          <Card className="overflow-hidden">
            <div className="p-3 sm:p-4">
              {filtered.length === 0 ? (
                <EmptyState
                  glyph="漢"
                  title="Tidak ada kanji di filter ini"
                  description="Belum ada kanji yang cocok. Tandai kanji sebagai dikuasai atau kembali ke daftar lengkap."
                  action={
                    <Button variant="outline" size="sm" onClick={() => setFilter("semua")}>
                      Lihat semua kanji
                    </Button>
                  }
                />
              ) : (
                <ul
                  className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-7"
                  aria-label="Peta kanji"
                >
                  {filtered.map((item) => {
                    const card = progress.cards[item.id];
                    const isMastered = mastered.has(item.id);
                    const isSelected = selected?.id === item.id;

                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => selectKanji(item.id)}
                          aria-pressed={isSelected}
                          aria-current={isSelected ? "true" : undefined}
                          aria-label={`${item.character} — ${item.meanings.join(", ")}${
                            isMastered ? ", sudah dikuasai" : ""
                          }`}
                          className={cn(
                            "relative flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-lg border px-1 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                            isSelected
                              ? "border-level bg-level-soft text-level"
                              : "border-border bg-surface text-fg hover:border-border-strong hover:bg-surface-muted",
                          )}
                        >
                          <span
                            lang="ja"
                            className="font-jp-serif text-[26px] font-semibold leading-none sm:text-[30px]"
                          >
                            {item.character}
                          </span>
                          <span
                            className={cn(
                              "line-clamp-1 w-full text-center text-caption leading-tight",
                              isSelected ? "text-level" : "text-fg-subtle",
                            )}
                          >
                            {item.meanings[0] ?? ""}
                          </span>

                          {isMastered ? (
                            <span
                              aria-hidden="true"
                              className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-success"
                              title="Sudah dikuasai"
                            />
                          ) : card ? (
                            <span
                              aria-hidden="true"
                              className={cn(
                                "absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full",
                                isSelected ? "bg-level" : "bg-fg-subtle/60",
                              )}
                              title="Pernah diulas di SRS"
                            />
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-border px-4 py-3.5">
              <div className="flex items-center justify-between gap-2 text-caption text-fg-muted">
                <span>Sudah dikuasai</span>
                <span className="tnum font-semibold text-fg">
                  {masteredCount}/{items.length}
                </span>
              </div>
              <ProgressBar
                className="mt-2"
                value={masteredCount}
                max={Math.max(1, items.length)}
                tone="level"
              />
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-fg-subtle">
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-success" />
                  Dikuasai
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-fg-subtle/60" />
                  Pernah diulas (SRS)
                </span>
                <span className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-level" />
                  Sedang dipilih
                </span>
              </div>
            </div>
          </Card>
        </Section>

        <div ref={detailRef} className="min-w-0 scroll-mt-20 lg:sticky lg:top-6">
          {selected ? (
            <KanjiDetail
              item={selected}
              card={progress.cards[selected.id]}
              mastered={mastered.has(selected.id)}
              onToggleMastered={() => toggleMastered(selected.id)}
            />
          ) : (
            <Card className="p-5 text-center">
              <p className="text-sm text-fg-muted">Pilih kanji di peta untuk melihat detailnya.</p>
            </Card>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-caption text-fg-subtle">
        <p>
          {matureCount > 0
            ? `${matureCount} kanji sudah matang di jadwal SRS.`
            : "Tandai kanji yang sudah Anda kuasai agar daftar makin ringkas."}
        </p>
        <Link
          href={levelHref(level, "vocab")}
          className="text-accent underline-offset-2 hover:underline"
        >
          Ulas kosakata {level} →
        </Link>
      </div>
    </div>
  );
}

/** Header seragam untuk mode daftar, kuis, dan level kosong. */
function KanjiHeader({
  level,
  description,
  action,
}: {
  level: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <PageHeader
      eyebrow={
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="level" mono>
            {level}
          </Badge>
          <span className="label-micro">Kanji</span>
        </div>
      }
      title="Kanji"
      japanese="漢字"
      description={description}
      actions={action}
    />
  );
}

/** Kartu detail satu kanji — sticky di samping peta pada layar lebar. */
function KanjiDetail({
  item,
  card,
  mastered,
  onToggleMastered,
}: {
  item: Kanji;
  card: SrsCard | undefined;
  mastered: boolean;
  onToggleMastered: () => void;
}) {
  const firstWord = item.words[0]?.replace(/\s*\(.*?\)/g, "") ?? item.character;

  return (
    <Card className="overflow-hidden">
      <div className="genko-grid flex items-center justify-center border-b border-border bg-surface py-8 sm:py-10">
        <span
          lang="ja"
          className="font-jp-serif select-none text-[88px] font-semibold leading-none tracking-tight text-fg sm:text-[104px]"
        >
          {item.character}
        </span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-h2 font-semibold tracking-tight text-fg">
              {item.meanings.join(", ")}
            </h2>
            <p className="mt-1 text-caption text-fg-subtle">
              {item.strokes} goresan · radikal{" "}
              <span lang="ja" className="font-jp">
                {item.radical}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Badge tone="level" mono>
              {item.level}
            </Badge>
            {mastered ? (
              <Badge tone="success">dikuasai</Badge>
            ) : card ? (
              <Badge tone="neutral" className="tnum">
                {card.reviews}× diulas
              </Badge>
            ) : (
              <Badge tone="outline">baru</Badge>
            )}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-2.5">
          <div className="min-w-0 rounded-lg border border-border bg-surface-muted p-3">
            <dt className="label-micro">On&apos;yomi</dt>
            <dd
              lang="ja"
              className="font-jp mt-1.5 break-words text-body leading-relaxed text-fg"
            >
              {item.onyomi.join("、") || "—"}
            </dd>
          </div>
          <div className="min-w-0 rounded-lg border border-border bg-surface-muted p-3">
            <dt className="label-micro">Kun&apos;yomi</dt>
            <dd
              lang="ja"
              className="font-jp mt-1.5 break-words text-body leading-relaxed text-fg"
            >
              {item.kunyomi.join("、") || "—"}
            </dd>
          </div>
        </dl>

        <div className="mt-4">
          <p className="label-micro">Mnemonic</p>
          <p className="mt-1.5 max-w-[62ch] text-sm leading-relaxed text-fg-muted">
            {item.mnemonic}
          </p>
        </div>

        <div className="mt-4">
          <p className="label-micro">Kata yang memakai kanji ini</p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {item.words.map((word) => (
              <li
                key={word}
                lang="ja"
                className="font-jp rounded-md border border-border bg-surface-muted px-2 py-1 text-sm text-fg"
              >
                {word}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-border pt-4">
          <SpeakButton
            text={item.character}
            label="Dengar kanji"
            variant="outline"
            size="lg"
            className="w-full"
          />
          <SpeakButton
            text={firstWord}
            rate={0.8}
            label="Dengar kata"
            variant="outline"
            size="lg"
            className="w-full"
          />
          <Button
            variant={mastered ? "outline" : "level"}
            size="lg"
            block
            onClick={onToggleMastered}
            aria-pressed={mastered}
          >
            {mastered ? "Batalkan tanda dikuasai" : "Tandai sudah dikuasai"}
          </Button>
        </div>
        <p className="mt-2.5 text-caption leading-relaxed text-fg-subtle">
          Tanda &ldquo;dikuasai&rdquo; tersimpan di browser ini. Jadwal ulasan SRS dihitung
          terpisah.
        </p>
      </div>
    </Card>
  );
}
