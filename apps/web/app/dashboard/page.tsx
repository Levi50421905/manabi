"use client";

import Link from "next/link";
import { Badge, Button, Card, CardContent, ProgressBar, cn } from "@manabi/ui";
import { grammar, kanji, kana, vocab } from "@manabi/content";
import { isDue, summarize, type SrsCard } from "@manabi/srs";
import { dayKey, levelFromXp, resetProgress, useProgress } from "@/lib/store";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

interface DeckStat {
  total: number;
  reviewed: number;
  due: number;
  mature: number;
  accuracy: number;
}

function deckStats(ids: string[], cards: Record<string, SrsCard>): DeckStat {
  const list = ids
    .map((id) => cards[id])
    .filter((card): card is SrsCard => Boolean(card));

  const summary = summarize(list);

  return {
    total: ids.length,
    reviewed: list.filter((card) => card.reviews > 0).length,
    due: ids.filter((id) => !cards[id] || isDue(cards[id] as SrsCard)).length,
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
  const { level, intoLevel, need } = levelFromXp(progress.xp);

  const vocabStats = deckStats(
    vocab.map((item) => item.id),
    progress.cards,
  );
  const kanjiStats = deckStats(
    kanji.map((item) => item.id),
    progress.cards,
  );
  const grammarStats = deckStats(
    grammar.map((item) => item.id),
    progress.cards,
  );

  const totalDue = vocabStats.due + kanjiStats.due + grammarStats.due;

  const weekly = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = dayKey(date);
    return {
      key,
      label: DAY_LABELS[date.getDay()] ?? "",
      value: progress.activity[key] ?? 0,
    };
  });
  const weeklyMax = Math.max(1, ...weekly.map((day) => day.value));
  const weekTotal = weekly.reduce((sum, day) => sum + day.value, 0);

  const modules = [
    {
      href: "/kana",
      glyph: "あ",
      title: "Kana",
      detail: `${kana.length} huruf hiragana & katakana`,
      due: null as number | null,
    },
    {
      href: "/vocab",
      glyph: "語",
      title: "Kosakata N5",
      detail: `${vocabStats.reviewed}/${vocabStats.total} kata pernah diulas`,
      due: vocabStats.due,
    },
    {
      href: "/kanji",
      glyph: "漢",
      title: "Kanji N5",
      detail: `${kanjiStats.mature} kanji matang`,
      due: kanjiStats.due,
    },
    {
      href: "/grammar",
      glyph: "文",
      title: "Tata bahasa",
      detail: `${grammarStats.reviewed}/${grammarStats.total} pola dipelajari`,
      due: grammarStats.due,
    },
  ];

  return (
    <div className="space-y-6 pb-6">
      {/* ---------- Sapaan ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-400">{formatToday()}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink-900">
            おかえりなさい — selamat belajar lagi
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {totalDue > 0
              ? `Ada ${totalDue} materi siap diulang hari ini.`
              : "Tidak ada ulasan tertunda — tambah materi baru, yuk."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/quiz">
            <Button variant="outline">Latihan cepat</Button>
          </Link>
          <Link href="/vocab">
            <Button>Mulai review</Button>
          </Link>
        </div>
      </div>

      {/* ---------- Statistik ---------- */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-ink-400">Streak</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">
              {progress.streak} <span className="text-sm font-medium text-ink-400">hari</span>
            </p>
            <p className="mt-1 text-[11px] text-ink-400">
              {progress.lastStudyDate ? `Terakhir: ${progress.lastStudyDate}` : "Belum mulai"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-ink-400">Level {level}</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">
              {progress.xp} <span className="text-sm font-medium text-ink-400">XP</span>
            </p>
            <ProgressBar className="mt-2" value={intoLevel} max={need} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-ink-400">Ulasan tertunda</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">{totalDue}</p>
            <p className="mt-1 text-[11px] text-ink-400">
              kosakata {vocabStats.due} · kanji {kanjiStats.due} · tata bahasa {grammarStats.due}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-ink-400">Akurasi ulasan</p>
            <p className="mt-1 text-2xl font-bold text-ink-900">
              {vocabStats.accuracy}
              <span className="text-sm font-medium text-ink-400">%</span>
            </p>
            <p className="mt-1 text-[11px] text-ink-400">
              dari {vocabStats.reviewed} kosakata yang pernah diulas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ---------- Lanjut belajar ---------- */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900">Lanjut belajar</h2>
              <span className="text-xs text-ink-400">{progress.quizzes.length} sesi latihan</span>
            </div>
            <div className="space-y-2">
              {modules.map((module) => (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group flex items-center gap-3 rounded-xl border border-ink-100 px-3 py-2.5 transition-colors hover:border-sakura-200 hover:bg-sakura-50/60"
                >
                  <span className="jp grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ink-50 text-sm font-semibold text-ink-600 group-hover:bg-sakura-100 group-hover:text-sakura-700">
                    {module.glyph}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink-800">{module.title}</span>
                    <span className="block truncate text-xs text-ink-400">{module.detail}</span>
                  </span>
                  {module.due !== null && module.due > 0 ? (
                    <Badge tone="sakura">{module.due} due</Badge>
                  ) : (
                    <span className="text-xs text-ink-300">→</span>
                  )}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ---------- Aktivitas mingguan ---------- */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-ink-900">Aktivitas 7 hari</h2>
              <span className="text-xs text-ink-400">{weekTotal} aksi</span>
            </div>
            <div className="flex h-36 items-end gap-2">
              {weekly.map((day) => {
                const height = day.value === 0 ? 4 : Math.max(8, (day.value / weeklyMax) * 100);
                return (
                  <div key={day.key} className="flex flex-1 flex-col items-center gap-1.5">
                    <div
                      className={cn(
                        "w-full rounded-md transition-all",
                        day.value > 0 ? "bg-sakura-400" : "bg-ink-100",
                      )}
                      style={{ height: `${height}%` }}
                      title={`${day.value} aksi`}
                    />
                    <span className="text-[10px] text-ink-400">{day.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-3 border-t border-ink-100 pt-4">
              <div>
                <div className="mb-1 flex justify-between text-xs text-ink-500">
                  <span>Kosakata N5</span>
                  <span>
                    {vocabStats.reviewed}/{vocabStats.total}
                  </span>
                </div>
                <ProgressBar value={vocabStats.reviewed} max={vocabStats.total} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-ink-500">
                  <span>Kanji N5</span>
                  <span>
                    {kanjiStats.reviewed}/{kanjiStats.total}
                  </span>
                </div>
                <ProgressBar value={kanjiStats.reviewed} max={kanjiStats.total} tone="matcha" />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-ink-500">
                  <span>Tata bahasa N5</span>
                  <span>
                    {grammarStats.reviewed}/{grammarStats.total}
                  </span>
                </div>
                <ProgressBar value={grammarStats.reviewed} max={grammarStats.total} tone="ink" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ---------- Riwayat quiz ---------- */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink-900">Riwayat latihan</h2>
            <Link href="/quiz" className="text-xs text-sakura-600 hover:underline">
              Latihan lagi
            </Link>
          </div>
          {progress.quizzes.length === 0 ? (
            <p className="rounded-xl border border-dashed border-ink-200 p-6 text-center text-sm text-ink-400">
              Belum ada latihan. Coba{" "}
              <Link href="/quiz" className="text-sakura-600 underline underline-offset-2">
                latihan campuran
              </Link>{" "}
              untuk memulai.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {progress.quizzes.slice(0, 5).map((quiz) => {
                const percent = Math.round((quiz.correct / quiz.total) * 100);
                return (
                  <li key={quiz.id} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink-800">{quiz.label}</p>
                      <p className="text-xs text-ink-400">
                        {new Date(quiz.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge tone={percent >= 70 ? "matcha" : percent >= 40 ? "amber" : "sakura"}>
                      {quiz.correct}/{quiz.total} · {percent}%
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-[11px] text-ink-400">
        <p>Progres disimpan di localStorage browser ini.</p>
        <button
          type="button"
          className="underline underline-offset-2 hover:text-ink-600"
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
