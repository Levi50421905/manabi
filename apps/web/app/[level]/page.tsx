"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  PageHeader,
  ProgressBar,
  Section,
  StatTile,
  cn,
} from "@manabi/ui";
import {
  LEVEL_META,
  availableLevels,
  contentCountByLevel,
  grammarByLevel,
  kanjiByLevel,
  levelHref,
  levelMeta,
  nextAvailableLevel,
  readingByLevel,
  vocabByLevel,
  kana,
} from "@manabi/content";
import { isDue, type SrsCard } from "@manabi/srs";
import { useProgress } from "@/lib/store";
import { useActiveLevel } from "@/lib/level";

interface DeckProgress {
  reviewed: number;
  total: number;
  /** Sudah pernah diulas dan jatuh tempo. */
  due: number;
  /** Belum pernah dilihat. */
  fresh: number;
}

function deckProgress(ids: string[], cards: Record<string, SrsCard>): DeckProgress {
  let reviewed = 0;
  let due = 0;
  let fresh = 0;
  for (const id of ids) {
    const card = cards[id];
    if (!card) {
      fresh += 1;
      continue;
    }
    if (card.reviews > 0) reviewed += 1;
    if (isDue(card)) due += 1;
  }
  return { reviewed, total: ids.length, due, fresh };
}

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default function LevelHubPage() {
  const progress = useProgress();
  const { level } = useActiveLevel();
  const meta = levelMeta(level);
  const counts = contentCountByLevel(level);

  const vocabDeck = deckProgress(
    vocabByLevel(level).map((item) => item.id),
    progress.cards,
  );
  const kanjiDeck = deckProgress(
    kanjiByLevel(level).map((item) => item.id),
    progress.cards,
  );
  const grammarDeck = deckProgress(
    grammarByLevel(level).map((item) => item.id),
    progress.cards,
  );
  const readingDeck = readingByLevel(level).length;
  const totalDue = vocabDeck.due + kanjiDeck.due + grammarDeck.due;

  const modules: Array<{
    path: string;
    glyph: string;
    title: string;
    description: string;
    progress?: { value: number; max: number; label: string };
    badge?: string;
  }> = [
    {
      path: "kana",
      glyph: "あ",
      title: "Kana",
      description: "Hiragana & katakana dengan kuis dua arah.",
      progress: { value: kana.length, max: kana.length, label: `${kana.length} huruf` },
    },
    {
      path: "write",
      glyph: "書",
      title: "Menulis",
      description: "Latihan menggores dengan garis bantu genkō yōshi.",
    },
    {
      path: "vocab",
      glyph: "語",
      title: "Kosakata",
      description: "Flashcard spaced repetition.",
      progress: {
        value: vocabDeck.reviewed,
        max: vocabDeck.total,
        label: `${vocabDeck.reviewed}/${vocabDeck.total} diulas`,
      },
      badge: vocabDeck.due > 0 ? `${vocabDeck.due} ulang` : undefined,
    },
    {
      path: "kanji",
      glyph: "漢",
      title: "Kanji",
      description: "Bacaan, radikal, goresan, dan mnemonic.",
      progress: {
        value: kanjiDeck.reviewed,
        max: kanjiDeck.total,
        label: `${kanjiDeck.reviewed}/${kanjiDeck.total} diulas`,
      },
      badge: kanjiDeck.due > 0 ? `${kanjiDeck.due} ulang` : undefined,
    },
    {
      path: "grammar",
      glyph: "文",
      title: "Tata Bahasa",
      description: "Pola kalimat dengan contoh yang bisa diputar.",
      progress: {
        value: grammarDeck.reviewed,
        max: grammarDeck.total,
        label: `${grammarDeck.reviewed}/${grammarDeck.total} pola`,
      },
      badge: grammarDeck.due > 0 ? `${grammarDeck.due} ulang` : undefined,
    },
    {
      path: "listening",
      glyph: "聴",
      title: "Mendengar",
      description: "Dialog sehari-hari dengan kecepatan yang diatur.",
      progress: {
        value: counts.listening,
        max: counts.listening,
        label: `${counts.listening} dialog`,
      },
    },
    {
      path: "reading",
      glyph: "読",
      title: "Membaca",
      description: "Bacaan pendek berfurigana + pemahaman.",
      progress: {
        value: Math.min(progress.readPassages.length, readingDeck),
        max: Math.max(1, readingDeck),
        label: `${Math.min(progress.readPassages.length, readingDeck)}/${readingDeck} selesai`,
      },
    },
    {
      path: "quiz",
      glyph: "問",
      title: "Latihan",
      description: "Kuis campuran dan per modul.",
    },
    {
      path: "ujian",
      glyph: "試",
      title: "Ujian",
      description: "Simulasi JLPT dan JFT-Basic.",
    },
  ];

  const upcoming = nextAvailableLevel(level, availableLevels);
  const weekBars = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`;
    return { key, label: DAY_LABELS[date.getDay()] ?? "", value: progress.activity[key] ?? 0 };
  });
  const weekMax = Math.max(1, ...weekBars.map((bar) => bar.value));

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">{meta.hours}</span>
          </div>
        }
        title={meta.name}
        japanese={meta.japanese}
        description={meta.description}
        actions={
          <>
            <Link href={levelHref(level, "quiz")}>
              <Button variant="outline">Latihan</Button>
            </Link>
            <Link href={levelHref(level, "vocab")}>
              <Button>{totalDue > 0 ? `Ulas ${totalDue} kartu` : "Mulai belajar"}</Button>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Kosakata" value={counts.vocab} hint={`${vocabDeck.reviewed} diulas`} glyph="語" />
        <StatTile label="Kanji" value={counts.kanji} hint={`${kanjiDeck.reviewed} diulas`} glyph="漢" />
        <StatTile
          label="Tata bahasa"
          value={counts.grammar}
          hint={`${grammarDeck.reviewed} dipelajari`}
          glyph="文"
        />
        <StatTile
          label="Bacaan & dialog"
          value={counts.reading + counts.listening}
          hint={`${counts.reading} bacaan · ${counts.listening} dialog`}
          glyph="読"
        />
      </div>

      <Section
        title="Modul"
        glyph="科"
        description={`Semua materi level ${level} terbuka langsung.`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link key={module.path} href={levelHref(level, module.path)} className="group">
              <Card variant="interactive" className="h-full">
                <CardBody className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      lang="ja"
                      aria-hidden="true"
                      className="jp-serif grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-surface-muted text-base font-semibold text-fg-subtle transition-colors group-hover:bg-level-soft group-hover:text-level"
                    >
                      {module.glyph}
                    </span>
                    {module.badge ? (
                      <Badge tone="level" className="tnum">
                        {module.badge}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-fg">{module.title}</h3>
                    <p className="mt-1 text-caption leading-relaxed text-fg-muted">
                      {module.description}
                    </p>
                  </div>
                  {module.progress ? (
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-caption text-fg-subtle">
                        <span>{module.progress.label}</span>
                        <span className="tnum">
                          {Math.round(
                            (module.progress.value / Math.max(1, module.progress.max)) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <ProgressBar
                        value={module.progress.value}
                        max={Math.max(1, module.progress.max)}
                        tone="level"
                      />
                    </div>
                  ) : null}
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      </Section>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardBody>
            <div className="flex items-baseline justify-between">
              <h2 className="text-h3 font-semibold text-fg">Aktivitas minggu ini</h2>
              <span className="tnum text-caption text-fg-muted">
                {weekBars.reduce((sum, bar) => sum + bar.value, 0)} aksi
              </span>
            </div>
            <div className="mt-5 flex h-28 items-end gap-2">
              {weekBars.map((bar) => {
                const barHeight =
                  bar.value === 0 ? 3 : Math.max(8, Math.round((bar.value / weekMax) * 88));
                return (
                  <div key={bar.key} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <div
                      className={cn(
                        "w-full rounded-sm",
                        bar.value > 0 ? "bg-level" : "bg-surface-inset",
                      )}
                      style={{ height: `${barHeight}px` }}
                      title={`${bar.value} aksi`}
                    />
                    <span className="text-center text-caption text-fg-subtle">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card variant="muted">
          <CardBody className="flex h-full flex-col justify-between gap-4">
            <div>
              <p className="label-micro">Level berikutnya</p>
              <p className="mt-2 font-display text-h2 font-semibold text-fg">
                {LEVEL_META[meta.next ?? level].label}
                <span lang="ja" className="ml-2 text-sm font-normal text-fg-subtle">
                  {LEVEL_META[meta.next ?? level].japanese}
                </span>
              </p>
              <p className="mt-2 text-caption leading-relaxed text-fg-muted">
                {upcoming
                  ? LEVEL_META[upcoming].description
                  : `Level ${meta.next ?? level} sedang disusun. Materi ${level} tetap bisa dipelajari sepuasnya.`}
              </p>
            </div>
            <Link href="/dashboard" className="text-caption font-semibold text-accent hover:underline">
              Lihat ringkasan progres →
            </Link>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
