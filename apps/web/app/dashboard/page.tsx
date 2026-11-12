"use client";

import Link from "next/link";
import {
  LEVEL_META,
  LEVEL_ORDER,
  availableLevels,
  contentCountByLevel,
  grammarByLevel,
  kana,
  kanjiByLevel,
  levelHref,
  levelMeta,
  vocabByLevel,
} from "@manabi/content";
import { isDue, summarize, type SrsCard } from "@manabi/srs";
import { cn } from "@manabi/ui";
import { currentStreak, dayKey, levelFromXp, resetProgress, useProgress } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { useActiveLevel } from "@/lib/level";
import { dailyCards } from "@/lib/daily-card";
import { Mascot } from "@/components/mascot";

const DAY_LABELS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

interface DeckStat {
  total: number;
  reviewed: number;
  due: number;
  fresh: number;
  mature: number;
  accuracy: number;
}

function deckStats(ids: string[], cards: Record<string, SrsCard>): DeckStat {
  const list = ids.map((id) => cards[id]).filter((card): card is SrsCard => Boolean(card));
  const summary = summarize(list);

  let due = 0;
  let fresh = 0;
  for (const id of ids) {
    const card = cards[id];
    if (!card) fresh += 1;
    else if (isDue(card)) due += 1;
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

  const vocabStats = deckStats(vocabByLevel(level).map((item) => item.id), progress.cards);
  const kanjiStats = deckStats(kanjiByLevel(level).map((item) => item.id), progress.cards);
  const grammarStats = deckStats(grammarByLevel(level).map((item) => item.id), progress.cards);

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
  const todayActions = progress.activity[dayKey()] ?? 0;
  const goalPct = Math.min(100, Math.round((todayActions / Math.max(1, prefs.dailyGoal)) * 100));
  const todayCard = dailyCards(dayKey(), 1)[0];

  const modules: Array<{
    href: string;
    glyph: string;
    title: string;
    caption: string;
    pct: number | null;
    tone: string;
  }> = [
    {
      href: levelHref(level, "kana"),
      glyph: "あ",
      title: "Kana & Menulis",
      caption: `${kana.length} huruf · kanvas menulis`,
      pct: 100,
      tone: "bg-accent-soft text-accent",
    },
    {
      href: levelHref(level, "vocab"),
      glyph: "語",
      title: "Kosakata",
      caption: `${vocabStats.reviewed} / ${vocabStats.total} diulas`,
      pct: Math.round((vocabStats.reviewed / Math.max(1, vocabStats.total)) * 100),
      tone: "bg-coral-soft text-coral-strong",
    },
    {
      href: levelHref(level, "kanji"),
      glyph: "漢",
      title: "Kanji & Bacaan",
      caption: `${kanjiStats.reviewed} / ${kanjiStats.total} diulas`,
      pct: Math.round((kanjiStats.reviewed / Math.max(1, kanjiStats.total)) * 100),
      tone: "bg-sky-soft text-sky",
    },
    {
      href: levelHref(level, "grammar"),
      glyph: "文",
      title: "Tata Bahasa",
      caption: `${grammarStats.reviewed} / ${grammarStats.total} pola`,
      pct: Math.round((grammarStats.reviewed / Math.max(1, grammarStats.total)) * 100),
      tone: "bg-sun-soft text-sun",
    },
    {
      href: levelHref(level, "partikel"),
      glyph: "助",
      title: "Partikel",
      caption: `${counts.particles} partikel · 6 pasangan`,
      pct: null,
      tone: "bg-accent-soft text-accent",
    },
    {
      href: levelHref(level, "listening"),
      glyph: "聴",
      title: "Mendengar",
      caption: `${counts.listening} dialog · 3 kecepatan`,
      pct: null,
      tone: "bg-sky-soft text-sky",
    },
    {
      href: levelHref(level, "reading"),
      glyph: "読",
      title: "Membaca",
      caption: `${Math.min(progress.readPassages.length, counts.reading)} / ${counts.reading} bacaan`,
      pct: Math.round((Math.min(progress.readPassages.length, counts.reading) / Math.max(1, counts.reading)) * 100),
      tone: "bg-sun-soft text-sun",
    },
    {
      href: levelHref(level, "konteks"),
      glyph: "敬",
      title: "Konteks & Etiket",
      caption: "Tingkat bicara, keigo, kebiasaan",
      pct: null,
      tone: "bg-coral-soft text-coral-strong",
    },
  ];

  return (
    <div className="space-y-7 pb-10 sm:space-y-9">
      {/* ---------- Sapaan ---------- */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-black text-accent">
              {level} · {meta.name}
            </span>
            <span className="text-[11px] font-black uppercase tracking-[0.12em] text-fg-subtle">
              {formatToday()}
            </span>
          </div>
          <h1 className="mt-2 font-display text-[clamp(2rem,4.4vw,3.1rem)] font-black leading-[1.04] tracking-[-0.035em] text-fg">
            Ringkasan belajar
          </h1>
          <p className="mt-2 max-w-[64ch] text-[13.5px] font-medium leading-relaxed text-fg-muted">
            {totalDue > 0
              ? `Ada ${totalDue} kartu jatuh tempo dan ${totalFresh} kartu baru di level ${level}.`
              : totalFresh > 0
                ? `Tidak ada ulasan tertunda. ${totalFresh} kartu baru siap dipelajari.`
                : `Semua kartu level ${level} sudah diulang. Saatnya menambah materi baru.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={levelHref(level, "quiz")}
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-border bg-surface px-4 text-[13px] font-black text-fg shadow-soft transition-colors hover:border-accent/40"
          >
            Latihan cepat
          </Link>
          <Link
            href={levelHref(level, "vocab")}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-[13px] font-black text-accent-contrast shadow-soft transition-colors hover:bg-accent-strong"
          >
            Mulai ulasan
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      {/* ---------- Fokus + streak ---------- */}
      <div className="grid gap-3 lg:grid-cols-[1.45fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[2rem] border border-accent/20 bg-gradient-to-br from-accent-soft via-surface to-sun-soft/60 p-6 shadow-soft sm:p-7">
          <div className="relative z-10 max-w-[58ch]">
            <p className="label-micro text-accent">Fokus hari ini</p>
            <h2 className="mt-2 font-display text-[clamp(1.5rem,3vw,2rem)] font-black leading-[1.14] tracking-[-0.025em] text-fg">
              {totalDue > 0 ? "Ulasan kartu menunggu." : "Latihan singkat untuk hari ini."}
            </h2>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-fg-muted">
              {totalDue > 0
                ? `Kosakata ${vocabStats.due} · kanji ${kanjiStats.due} · tata bahasa ${grammarStats.due}. Ulasan singkat menjaga materi lama tetap tinggal.`
                : `Tidak ada antrean. Gunakan waktu ini untuk latihan campuran atau membuka ${totalFresh} kartu baru.`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-surface px-3 py-1.5 text-[11.5px] font-black text-fg shadow-soft">
                {totalDue} jatuh tempo
              </span>
              <span className="rounded-full bg-surface px-3 py-1.5 text-[11.5px] font-black text-fg shadow-soft">
                {totalFresh} kartu baru
              </span>
              <span className="rounded-full bg-surface px-3 py-1.5 text-[11.5px] font-black text-fg shadow-soft">
                ±10 menit
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={levelHref(level, "vocab")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-[13.5px] font-black text-accent-contrast shadow-soft hover:bg-accent-strong"
              >
                Ulas kosakata
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href={levelHref(level, "quiz")}
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-surface px-5 text-[13.5px] font-black text-fg shadow-soft hover:bg-surface-muted"
              >
                Latihan Soal
              </Link>
            </div>
          </div>
          <Mascot size={120} className="pointer-events-none absolute -bottom-4 right-2 hidden opacity-90 sm:block sm:right-8" />
        </section>

        <section className="rounded-[2rem] border border-border bg-surface p-5 shadow-soft sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="label-micro text-coral-strong">Streak</p>
              <p className="mt-1 font-display text-[30px] font-black leading-none text-fg">
                {streak} hari
              </p>
              <p className="mt-1 text-[12px] font-semibold text-fg-muted">
                Total {weekTotal} aksi pekan ini
              </p>
            </div>
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-coral-soft text-lg" aria-hidden="true">
              🔥
            </span>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-1 text-center">
            {weekly.map((day) => {
              const levelDot = day.value === 0 ? 0 : day.value >= 20 ? 2 : 1;
              return (
                <div key={day.key} className="flex flex-col items-center gap-1">
                  <span className="text-[10.5px] font-black text-fg-subtle">{day.label}</span>
                  <span
                    className={cn(
                      "h-3.5 w-3.5 rounded-full",
                      levelDot === 0
                        ? "border border-dashed border-border bg-transparent"
                        : levelDot === 2
                          ? "bg-accent"
                          : "bg-accent/45",
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-[10.5px] font-black text-fg-muted">{day.value}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 border-t border-border pt-3">
            <div className="flex items-center justify-between text-[11.5px] font-black text-fg-muted">
              <span>Target hari ini</span>
              <span className="tnum">
                {Math.min(todayActions, prefs.dailyGoal)}/{prefs.dailyGoal}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-inset">
              <div className="h-full rounded-full bg-sun" style={{ width: `${goalPct}%` }} />
            </div>
          </div>
        </section>
      </div>

      {/* ---------- Statistik ---------- */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "XP total",
            value: progress.xp.toLocaleString("id-ID"),
            unit: "XP",
            hint: `Level ${xpLevel} · ${intoLevel}/${need} menuju ${xpLevel + 1}`,
            pct: Math.round((intoLevel / need) * 100),
            tone: "bg-accent",
          },
          {
            label: "Akurasi ulasan",
            value: String(vocabStats.accuracy),
            unit: "%",
            hint: `Dari ${vocabStats.reviewed} kosakata diulas`,
            pct: vocabStats.accuracy,
            tone: "bg-sun",
          },
          {
            label: "Progres level",
            value: String(totalItems ? Math.round((totalReviewed / totalItems) * 100) : 0),
            unit: "%",
            hint: `${totalReviewed} dari ${totalItems} kartu pernah diulas`,
            pct: totalItems ? Math.round((totalReviewed / totalItems) * 100) : 0,
            tone: "bg-coral",
          },
        ].map((stat) => (
          <div key={stat.label} className="rounded-3xl border border-border bg-surface p-4 shadow-soft">
            <p className="text-[11px] font-black uppercase tracking-[0.11em] text-fg-subtle">
              {stat.label}
            </p>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="tnum font-display text-[28px] font-black leading-none text-fg">
                {stat.value}
              </span>
              <span className="text-[12px] font-black text-fg-muted">{stat.unit}</span>
            </p>
            <p className="mt-1 text-[11.5px] font-semibold text-fg-muted">{stat.hint}</p>
            <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-surface-inset">
              <div className={cn("h-full rounded-full", stat.tone)} style={{ width: `${stat.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* ---------- Materi ---------- */}
      <section aria-labelledby="modulesTitle">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="modulesTitle" className="font-display text-[26px] font-black tracking-tight text-fg">
              Materi level {level}
            </h2>
            <p className="mt-1 text-[12.5px] font-semibold text-fg-muted">
              8 modul · {counts.vocab} kosakata · {counts.kanji} kanji · {counts.grammar} tata bahasa
            </p>
          </div>
          <Link
            href={levelHref(level)}
            className="inline-flex h-10 items-center rounded-2xl bg-surface-muted px-3.5 text-[12px] font-black text-fg-muted transition-colors hover:text-fg"
          >
            Semua modul →
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="group flex min-h-[150px] flex-col rounded-3xl border border-border bg-surface p-4 shadow-soft transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lifted"
            >
              <span
                lang="ja"
                aria-hidden="true"
                className={cn("grid h-11 w-11 place-items-center rounded-2xl text-lg font-black", module.tone)}
              >
                {module.glyph}
              </span>
              <span className="mt-3 block text-[14px] font-black text-fg">{module.title}</span>
              <span className="mt-0.5 block text-[11.5px] font-semibold leading-relaxed text-fg-muted">
                {module.caption}
              </span>
              <span className="mt-auto block pt-3">
                {module.pct === null ? (
                  <span className="text-[11px] font-black text-fg-subtle">Terbuka langsung</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-inset">
                      <span className="block h-full rounded-full bg-accent" style={{ width: `${module.pct}%` }} />
                    </span>
                    <span className="tnum text-[10.5px] font-black text-fg-subtle">{module.pct}%</span>
                  </span>
                )}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Riwayat + kartu hari ini ---------- */}
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft" aria-labelledby="historyTitle">
          <div className="flex items-center justify-between gap-3">
            <h2 id="historyTitle" className="font-display text-[22px] font-black text-fg">
              Riwayat latihan
            </h2>
            <Link href={levelHref(level, "quiz")} className="text-[12px] font-black text-accent hover:underline">
              Latihan lagi →
            </Link>
          </div>

          {progress.quizzes.length === 0 ? (
            <div className="mt-4 rounded-2xl bg-surface-muted px-4 py-8 text-center">
              <p lang="ja" aria-hidden="true" className="font-jp text-3xl font-black text-accent/40">
                始
              </p>
              <p className="mt-2 text-sm font-black text-fg">Belum ada latihan</p>
              <p className="mt-1 text-[12px] font-semibold text-fg-muted">
                Mulai dari latihan campuran untuk mengukur kemampuan awal.
              </p>
              <Link
                href={levelHref(level, "quiz")}
                className="mt-3 inline-flex h-10 items-center rounded-2xl bg-accent px-4 text-[12px] font-black text-accent-contrast"
              >
                Coba latihan
              </Link>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {progress.quizzes.slice(0, 5).map((quiz) => {
                const percent = quiz.total > 0 ? Math.round((quiz.correct / quiz.total) * 100) : 0;
                return (
                  <li key={quiz.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-black text-fg">{quiz.label}</p>
                      <p className="text-[11px] font-semibold text-fg-subtle">
                        {new Date(quiz.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="tnum text-[11.5px] font-bold text-fg-muted">
                        {quiz.correct}/{quiz.total}
                      </span>
                      <span
                        className={cn(
                          "tnum rounded-full px-2 py-0.5 text-[11px] font-black",
                          percent >= 70
                            ? "bg-success-soft text-success"
                            : percent >= 40
                              ? "bg-warning-soft text-warning"
                              : "bg-danger-soft text-danger",
                        )}
                      >
                        {percent}%
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-surface p-5 shadow-soft" aria-labelledby="dailyTitle">
          <div className="flex items-center justify-between gap-3">
            <h2 id="dailyTitle" className="font-display text-[22px] font-black text-fg">
              Kartu hari ini
            </h2>
            <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px] font-black text-accent">
              Bergilir tiap hari
            </span>
          </div>

          {todayCard ? (
            <div className="mt-4">
              <p className="text-[10.5px] font-black uppercase tracking-[0.12em] text-fg-subtle">
                {todayCard.moduleLabel} · {level}
              </p>
              <div className="mt-2 flex items-start gap-4">
                <span
                  lang="ja"
                  className={
                    todayCard.kind === "tata-bahasa"
                      ? "shrink-0 font-jp text-[44px] font-black leading-none text-fg"
                      : "shrink-0 font-jp text-[64px] font-black leading-none text-fg"
                  }
                >
                  {todayCard.kind === "tata-bahasa" ? "文" : todayCard.glyph}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[20px] font-black leading-tight text-fg">
                    {todayCard.title}
                  </p>
                  <p className="mt-1 text-[12.5px] font-semibold text-fg-muted">
                    {todayCard.reading} {todayCard.romaji ? `· ${todayCard.romaji}` : ""}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold text-fg-subtle">{todayCard.meta}</p>
                </div>
              </div>
              <p className="mt-3 rounded-2xl bg-surface-muted px-3 py-2 text-[12px] font-semibold leading-relaxed text-fg-muted">
                {todayCard.note}
              </p>
              <Link
                href={todayCard.href}
                className="mt-3 inline-flex h-10 items-center rounded-2xl bg-accent px-4 text-[12px] font-black text-accent-contrast hover:bg-accent-strong"
              >
                Buka materi →
              </Link>
            </div>
          ) : null}
        </section>
      </div>

      {/* ---------- Jalur level + reset ---------- */}
      <section className="rounded-3xl border border-border bg-surface p-4 shadow-soft" aria-labelledby="pathTitle">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="pathTitle" className="text-[12px] font-black uppercase tracking-[0.11em] text-fg-subtle">
            Jalur level
          </h2>
          <span className="text-[11px] font-semibold text-fg-subtle">
            Satu level, satu warna, satu progres
          </span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {LEVEL_ORDER.map((item) => {
            const ready = availableLevels.includes(item);
            const active = item === level;
            return (
              <Link
                key={item}
                href={ready ? levelHref(item) : "#"}
                aria-disabled={!ready}
                className={cn(
                  "rounded-2xl border px-2 py-2.5 text-center transition-colors",
                  active
                    ? "border-accent bg-accent-soft text-accent"
                    : ready
                      ? "border-border bg-surface text-fg-muted hover:border-accent/40"
                      : "pointer-events-none border-dashed border-border text-fg-subtle/60",
                )}
              >
                <span className="tnum block text-[15px] font-black">{item}</span>
                <span className="mt-0.5 block truncate text-[10px] font-bold">
                  {LEVEL_META[item].name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-[11.5px] font-semibold text-fg-subtle">
        <p>Progres disimpan di localStorage browser ini · tanpa akun.</p>
        <button
          type="button"
          className="underline underline-offset-2 hover:text-fg"
          onClick={() => {
            if (window.confirm("Hapus semua progres belajar di browser ini?")) resetProgress();
          }}
        >
          Reset progres
        </button>
      </div>
    </div>
  );
}
