"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  PageHeader,
  ProgressBar,
  Section,
  StatTile,
  cn,
} from "@manabi/ui";
import {
  contentCountByLevel,
  grammarByLevel,
  kanjiByLevel,
  levelHref,
  levelMeta,
  readingByLevel,
  vocabByLevel,
} from "@manabi/content";
import { isDue, summarize, type SrsCard } from "@manabi/srs";
import { currentStreak, dayKey, levelFromXp, resetProgress, useProgress } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { useActiveLevel } from "@/lib/level";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

interface DeckStat {
  total: number;
  reviewed: number;
  /** Kartu yang sudah pernah diulas dan kini jatuh tempo. */
  due: number;
  /** Kartu yang belum pernah dilihat sama sekali. */
  fresh: number;
  mature: number;
  accuracy: number;
}

function deckStats(ids: string[], cards: Record<string, SrsCard>): DeckStat {
  const list = ids
    .map((id) => cards[id])
    .filter((card): card is SrsCard => Boolean(card));
  const summary = summarize(list);

  let due = 0;
  let fresh = 0;
  for (const id of ids) {
    const card = cards[id];
    if (!card) {
      fresh += 1;
    } else if (isDue(card)) {
      due += 1;
    }
  }

  return {
    total: ids.length,
    reviewed: list.filter((card) => card.reviews > 0).length,
    due,
    fresh,
    mature: summary.mature,
    accuracy: summary.accuracy,
  };
}

function formatToday(): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function DashboardPage() {
  const progress = useProgress();
  const [prefs] = usePrefs();
  const { level } = useActiveLevel();
  const meta = levelMeta(level);
  const counts = contentCountByLevel(level);

  const { level: xpLevel, intoLevel, need } = levelFromXp(progress.xp);
  const streak = currentStreak(progress);

  const vocabStats = deckStats(
    vocabByLevel(level).map((item) => item.id),
    progress.cards,
  );
  const kanjiStats = deckStats(
    kanjiByLevel(level).map((item) => item.id),
    progress.cards,
  );
  const grammarStats = deckStats(
    grammarByLevel(level).map((item) => item.id),
    progress.cards,
  );

  const totalDue = vocabStats.due + kanjiStats.due + grammarStats.due;
  const totalFresh = vocabStats.fresh + kanjiStats.fresh + grammarStats.fresh;
  const totalReviewed = vocabStats.reviewed + kanjiStats.reviewed + grammarStats.reviewed;
  const totalItems = vocabStats.total + kanjiStats.total + grammarStats.total;

  const weekly = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = dayKey(date);
    return { key, label: DAY_LABELS[date.getDay()] ?? "", value: progress.activity[key] ?? 0 };
  });
  const weeklyMax = Math.max(1, ...weekly.map((day) => day.value));
  const weekTotal = weekly.reduce((sum, day) => sum + day.value, 0);

  const modules = [
    {
      path: "kana",
      glyph: "あ",
      title: "Kana",
      detail: "Hiragana & katakana",
      value: null as number | null,
      caption: "208 huruf",
      due: 0,
    },
    {
      path: "vocab",
      glyph: "語",
      title: "Kosakata",
      detail: `${vocabStats.reviewed} dari ${vocabStats.total} kata pernah diulas`,
      value: vocabStats.reviewed,
      caption: `${vocabStats.total}`,
      due: vocabStats.due,
    },
    {
      path: "kanji",
      glyph: "漢",
      title: "Kanji",
      detail: `${kanjiStats.mature} kanji sudah matang`,
      value: kanjiStats.reviewed,
      caption: `${kanjiStats.total}`,
      due: kanjiStats.due,
    },
    {
      path: "grammar",
      glyph: "文",
      title: "Tata bahasa",
      detail: `${grammarStats.reviewed} dari ${grammarStats.total} pola dipelajari`,
      value: grammarStats.reviewed,
      caption: `${grammarStats.total}`,
      due: grammarStats.due,
    },
    {
      path: "reading",
      glyph: "読",
      title: "Membaca",
      detail: `${progress.readPassages.length} bacaan diselesaikan`,
      value: null,
      caption: `${counts.reading} bacaan`,
      due: 0,
    },
    {
      path: "listening",
      glyph: "聴",
      title: "Mendengar",
      detail: "Dialog dengan pelafalan Jepang",
      value: null,
      caption: `${counts.listening} dialog`,
      due: 0,
    },
  ];

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">{formatToday()}</span>
          </div>
        }
        title="Selamat belajar lagi"
        japanese="おかえりなさい"
        description={
          totalDue > 0
            ? `Ada ${totalDue} kartu jatuh tempo hari ini di level ${level} (${meta.name}) — plus ${totalFresh} kartu baru yang bisa dipelajari.`
            : totalFresh > 0
              ? `Tidak ada ulasan tertunda. ${totalFresh} kartu baru di level ${level} siap dipelajari.`
              : `Semua kartu level ${level} sudah diulang. Tambah materi baru lewat modul lain, yuk.`
        }
        actions={
          <>
            <Link href={levelHref(level, "quiz")}>
              <Button variant="outline">Latihan cepat</Button>
            </Link>
            <Link href={levelHref(level, "vocab")}>
              <Button>Mulai ulasan</Button>
            </Link>
          </>
        }
      />

      {/* ---------- Fokus hari ini ---------- */}
      <Card className="overflow-hidden">
        <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <p className="label-micro">Fokus hari ini</p>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span className="tnum font-display text-[44px] font-semibold leading-none text-fg">
                {totalDue}
              </span>
              <span className="text-sm text-fg-muted">kartu jatuh tempo</span>
            </div>
            <p className="mt-3 max-w-[52ch] text-sm leading-relaxed text-fg-muted">
              {totalDue > 0
                ? `Kosakata ${vocabStats.due} · kanji ${kanjiStats.due} · tata bahasa ${grammarStats.due}. Ulasan singkat hari ini menjaga materi lama tetap tinggal. Masih ada ${totalFresh} kartu baru bila ingin menambah beban.`
                : `Tidak ada ulasan yang menumpuk. Ini waktu yang tepat untuk membuka ${totalFresh} kartu baru atau mencoba latihan campuran.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href={levelHref(level, "vocab")}>
                <Button size="lg">Ulas kosakata</Button>
              </Link>
              <Link href={levelHref(level, "kanji")}>
                <Button size="lg" variant="outline">
                  Ulas kanji
                </Button>
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-muted p-4">
            <div className="flex items-baseline justify-between">
              <span className="label-micro">Progres level {level}</span>
              <span className="tnum text-caption font-semibold text-fg">
                {totalItems > 0 ? Math.round((totalReviewed / totalItems) * 100) : 0}%
              </span>
            </div>
            <ProgressBar className="mt-2.5" value={totalReviewed} max={Math.max(1, totalItems)} tone="level" />
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between text-caption text-fg-muted">
                <span>Kosakata</span>
                <span className="tnum">
                  {vocabStats.reviewed}/{vocabStats.total}
                </span>
              </div>
              <ProgressBar value={vocabStats.reviewed} max={Math.max(1, vocabStats.total)} tone="level" />
              <div className="flex items-center justify-between pt-1 text-caption text-fg-muted">
                <span>Kanji</span>
                <span className="tnum">
                  {kanjiStats.reviewed}/{kanjiStats.total}
                </span>
              </div>
              <ProgressBar value={kanjiStats.reviewed} max={Math.max(1, kanjiStats.total)} tone="success" />
            </div>
          </div>
        </div>
      </Card>

      {/* ---------- Statistik ---------- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Streak"
          value={streak}
          unit="hari"
          hint={progress.lastStudyDate ? `Terakhir ${progress.lastStudyDate}` : "Belum mulai"}
          glyph="連"
        />
        <StatTile
          label={`Level ${xpLevel}`}
          value={progress.xp}
          unit="XP"
          hint={`${intoLevel}/${need} menuju level ${xpLevel + 1}`}
          glyph="級"
        />
        <StatTile
          label="Jatuh tempo"
          value={totalDue}
          hint={`${totalFresh} kartu baru menunggu`}
          glyph="復"
        />
        <StatTile
          label="Akurasi ulasan"
          value={vocabStats.accuracy}
          unit="%"
          hint={`dari ${vocabStats.reviewed} kosakata diulas`}
          glyph="正"
        />
      </div>

      {/* ---------- Aktivitas + modul ---------- */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardBody>
            <div className="flex items-baseline justify-between">
              <h2 className="text-h3 font-semibold text-fg">Aktivitas 7 hari</h2>
              <span className="tnum text-caption text-fg-muted">{weekTotal} aksi</span>
            </div>
            <div
              className="mt-5 flex h-32 items-end gap-2"
              role="img"
              aria-label={`Aktivitas tujuh hari terakhir, total ${weekTotal} aksi`}
            >
              {weekly.map((day) => {
                const barHeight =
                  day.value === 0 ? 3 : Math.max(8, Math.round((day.value / weeklyMax) * 100));
                return (
                  <div key={day.key} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <span className="text-center text-caption text-fg-subtle">
                      {day.value > 0 ? day.value : ""}
                    </span>
                    <div
                      className={cn(
                        "w-full rounded-sm transition-all",
                        day.value > 0 ? "bg-level" : "bg-surface-inset",
                      )}
                      style={{ height: `${barHeight}px` }}
                      title={`${day.value} aksi`}
                    />
                    <span className="text-center text-caption text-fg-subtle">{day.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 border-t border-border pt-4">
              <div className="flex items-center justify-between text-caption text-fg-muted">
                <span>Target harian</span>
                <span className="tnum">
                  {Math.min(progress.activity[dayKey()] ?? 0, prefs.dailyGoal)}/{prefs.dailyGoal}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-baseline justify-between">
              <h2 className="text-h3 font-semibold text-fg">Lanjut belajar</h2>
              <Link href={levelHref(level)} className="text-caption text-accent hover:underline">
                Semua modul
              </Link>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {modules.map((module) => (
                <li key={module.path}>
                  <Link
                    href={levelHref(level, module.path)}
                    className="group flex items-center gap-3 py-2.5"
                  >
                    <span
                      lang="ja"
                      aria-hidden="true"
                      className="jp grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-muted text-caption font-semibold text-fg-subtle transition-colors group-hover:bg-level-soft group-hover:text-level"
                    >
                      {module.glyph}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-fg">{module.title}</span>
                      <span className="block truncate text-caption text-fg-muted">{module.detail}</span>
                    </span>
                    {module.due > 0 ? (
                      <Badge tone="level" className="tnum">
                        {module.due} ulang
                      </Badge>
                    ) : (
                      <span aria-hidden="true" className="text-caption text-fg-subtle">
                        →
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* ---------- Riwayat ---------- */}
      <Section
        title="Riwayat latihan"
        glyph="跡"
        description="Sesi latihan dan ujian terakhir di browser ini."
        action={
          <Link href={levelHref(level, "quiz")} className="text-caption text-accent hover:underline">
            Latihan lagi
          </Link>
        }
      >
        <Card>
          <CardBody className="p-0">
            {progress.quizzes.length === 0 ? (
              <div className="px-5 py-10 text-center">
                <p lang="ja" aria-hidden="true" className="jp-serif text-3xl text-fg-subtle/50">
                  始
                </p>
                <p className="mt-3 text-sm font-medium text-fg">Belum ada latihan</p>
                <p className="mt-1 text-caption text-fg-muted">
                  Mulai dari latihan campuran untuk mengukur kemampuan awal.
                </p>
                <Link href={levelHref(level, "quiz")} className="mt-4 inline-block">
                  <Button size="sm">Coba latihan campuran</Button>
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {progress.quizzes.slice(0, 6).map((quiz) => {
                  const percent = quiz.total > 0 ? Math.round((quiz.correct / quiz.total) * 100) : 0;
                  return (
                    <li key={quiz.id} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-fg">{quiz.label}</p>
                        <p className="text-caption text-fg-subtle">
                          {new Date(quiz.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="tnum text-caption text-fg-muted">
                          {quiz.correct}/{quiz.total}
                        </span>
                        <Badge tone={percent >= 70 ? "success" : percent >= 40 ? "warning" : "danger"}>
                          {percent}%
                        </Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardBody>
        </Card>
      </Section>

      <Callout tone="info" title={`Materi level ${level}`}>
        <p>
          {meta.description} Level lain bisa dibuka kapan saja lewat pemilih level — progres tiap
          level dihitung terpisah.
        </p>
      </Callout>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-caption text-fg-subtle">
        <p>Progres disimpan di localStorage browser ini.</p>
        <button
          type="button"
          className="underline underline-offset-2 hover:text-fg"
          onClick={() => {
            if (window.confirm("Hapus semua progres belajar di browser ini?")) {
              resetProgress();
            }
          }}
        >
          Reset progres
        </button>
      </div>
    </div>
  );
}
