"use client";

import { useMemo, useState } from "react";
import { vocab, type PartOfSpeech } from "@manabi/content";
import {
  Badge,
  Button,
  Card,
  CardContent,
  EmptyState,
  Pagination,
  ProgressBar,
  cn,
} from "@manabi/ui";
import type { Rating } from "@manabi/srs";
import { createCard, review as scheduleReview } from "@manabi/srs";
import { SpeakButton } from "@/components/speak-button";
import { dueIds, newIds, rateCard, reviewQueue, useProgress } from "@/lib/store";

const POS_LABEL: Record<PartOfSpeech, string> = {
  "kata-benda": "Kata benda",
  "kata-kerja": "Kata kerja",
  "kata-sifat-i": "Kata sifat い",
  "kata-sifat-na": "Kata sifat な",
  "kata-keterangan": "Keterangan",
  lainnya: "Lainnya",
};

const RATINGS: Array<{ rating: Rating; label: string; className: string }> = [
  { rating: "again", label: "Lupa", className: "border-danger/30 bg-danger-soft text-danger hover:border-danger/60" },
  { rating: "hard", label: "Sulit", className: "border-warning/30 bg-warning-soft text-warning hover:border-warning/60" },
  { rating: "good", label: "Biasa", className: "border-success/30 bg-success-soft text-success hover:border-success/60" },
  { rating: "easy", label: "Mudah", className: "border-accent/30 bg-accent-soft text-accent hover:border-accent/60" },
];

const ALL = "semua" as const;
const PAGE_SIZE = 30;

export default function VocabPage() {
  const progress = useProgress();
  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<PartOfSpeech | typeof ALL>(ALL);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const [session, setSession] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const [requeueCount, setRequeueCount] = useState<Record<string, number>>({});

  const allIds = useMemo(() => vocab.map((item) => item.id), []);
  const dueCount = useMemo(
    () => dueIds(allIds, new Date()).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allIds, progress.cards],
  );
  const newCount = useMemo(
    () => newIds(allIds).length,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [allIds, progress.cards],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vocab.filter((item) => {
      const matchPos = pos === ALL || item.pos === pos;
      if (!matchPos) return false;
      if (!q) return true;
      return `${item.kanji} ${item.kana} ${item.romaji} ${item.meaning}`.toLowerCase().includes(q);
    });
  }, [query, pos]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const currentId = session?.[index];
  const current = vocab.find((item) => item.id === currentId);

  function startSession() {
    const ids = reviewQueue(allIds, 5);
    setSession(ids.length > 0 ? ids : allIds.slice(0, 10));
    setIndex(0);
    setRevealed(false);
    setFinished(false);
    setReviewed(0);
    setRequeueCount({});
  }

  /** Perkiraan interval berikutnya untuk tiap tombol rating (SM-2 asli). */
  function hintFor(rating: Rating): string {
    if (!current) return "";
    const card = progress.cards[current.id] ?? createCard(current.id);
    const preview = scheduleReview(card, rating);
    return preview.interval === 0 ? "<10 mnt" : `${preview.interval} hr`;
  }

  function handleRate(rating: Rating) {
    if (!currentId) return;
    rateCard(currentId, rating);
    setReviewed((value) => value + 1);
    setRevealed(false);

    // Kartu "Lupa" diulang di akhir sesi — maksimal 2× PER KARTU
    // (bukan per sesi, supaya kartu lain tetap mendapat giliran).
    const alreadyRequeued = requeueCount[currentId] ?? 0;
    const requeue = rating === "again" && alreadyRequeued < 2;

    if (requeue) {
      setRequeueCount((prev) => ({ ...prev, [currentId]: alreadyRequeued + 1 }));
      setSession((prev) => (prev ? [...prev, currentId] : prev));
      setIndex((value) => value + 1);
      return;
    }

    if (session && index + 1 >= session.length) {
      setFinished(true);
    } else {
      setIndex((value) => value + 1);
    }
  }

  /* ---------- layar review ---------- */
  if (session && !finished && current) {
    const card = progress.cards[current.id];
    return (
      <div className="mx-auto max-w-2xl space-y-4 pb-6">
        <div className="flex items-center justify-between text-sm text-ink-500">
          <span>
            Kartu {index + 1} dari {session.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSession(null);
              setFinished(false);
            }}
          >
            Keluar
          </Button>
        </div>
        <ProgressBar value={index} max={session.length} />

        <Card className="animate-fade-up">
          <CardContent className="p-8 text-center">
            <p className="text-xs uppercase tracking-wide text-ink-400">{POS_LABEL[current.pos]}</p>
            <p lang="ja" className="jp mt-4 text-5xl font-semibold text-ink-900">
              {current.kanji || current.kana}
            </p>
            <div className="mt-2 flex items-center justify-center gap-2">
              <p lang="ja" className="jp text-lg text-ink-500">{current.kana}</p>
              <SpeakButton text={current.kana} />
            </div>

            {revealed ? (
              <div className="mt-6 space-y-3 animate-pop">
                <p className="text-xl font-semibold text-ink-900">{current.meaning}</p>
                <div className="rounded-xl bg-ink-50 p-3 text-left">
                  <p lang="ja" className="jp text-sm text-ink-800">{current.example.jp}</p>
                  <p className="mt-1 text-xs text-ink-500">{current.example.id}</p>
                </div>
                {card && card.reviews > 0 && (
                  <p className="text-[11px] text-ink-400">
                    Diulas {card.reviews}× · interval {card.interval} hari · ease{" "}
                    {card.ease.toFixed(2)}
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-6 text-sm text-ink-400">
                Ingat artinya? Tekan tombol di bawah untuk melihat jawaban.
              </p>
            )}

            {!revealed ? (
              <Button className="mt-6 w-full" size="lg" onClick={() => setRevealed(true)}>
                Tampilkan arti
              </Button>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RATINGS.map((item) => (
                  <button
                    key={item.rating}
                    type="button"
                    onClick={() => handleRate(item.rating)}
                    className={cn(
                      "rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors",
                      item.className,
                    )}
                  >
                    {item.label}
                    <span className="mt-0.5 block text-[10px] font-normal opacity-70">
                      {hintFor(item.rating)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------- layar selesai ---------- */
  if (session && finished) {
    return (
      <div className="mx-auto max-w-2xl pb-6">
        <Card className="animate-fade-up">
          <CardContent className="space-y-4 p-8 text-center">
            <p lang="ja" className="jp text-4xl">お疲れ様！</p>
            <p className="text-lg font-semibold text-ink-900">Sesi review selesai</p>
            <p className="text-sm text-ink-500">
              {reviewed} kartu diulas. Jadwal berikutnya sudah dihitung otomatis.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button onClick={startSession}>Review lagi</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSession(null);
                  setFinished(false);
                }}
              >
                Kembali ke daftar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------- daftar kosakata ---------- */
  return (
    <div className="space-y-5 pb-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">Kosakata N5</h1>
          <p className="mt-1 text-sm text-ink-500">
            {vocab.length} kata · {dueCount} jatuh tempo · {newCount} belum dipelajari
          </p>
        </div>
        <Button onClick={startSession}>
          {dueCount > 0 ? `Review ${Math.min(dueCount, 15)} kartu` : "Mulai review"}
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          placeholder="Cari kanji, kana, atau arti…"
          className="h-9 min-w-[220px] flex-1 rounded-xl border border-ink-200 bg-surface px-3 text-sm text-ink-800 placeholder:text-ink-400 focus:border-sakura-300 focus:outline-none focus:ring-2 focus:ring-sakura-100"
        />
        <div className="flex flex-wrap gap-1">
          {([ALL, ...Object.keys(POS_LABEL)] as Array<PartOfSpeech | typeof ALL>).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setPos(item);
                setPage(1);
              }}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition-colors",
                pos === item
                  ? "border-sakura-300 bg-sakura-50 text-sakura-700"
                  : "border-ink-200 bg-surface text-ink-500 hover:text-ink-800",
              )}
            >
              {item === ALL ? "Semua" : POS_LABEL[item]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        {pageItems.map((item, itemIndex) => {
          const card = progress.cards[item.id];
          const isOpen = expanded === item.id;
          return (
            <Card
              key={item.id}
              className={cn("animate-fade-up", isOpen && "border-sakura-200")}
              style={{ animationDelay: `${Math.min(itemIndex, 10) * 25}ms` }}
            >
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : item.id)}
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <span lang="ja" className="jp grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-ink-50 text-sm font-semibold text-ink-700">
                  {item.kanji.slice(0, 1) || item.kana.slice(0, 1)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span lang="ja" className="jp text-sm font-semibold text-ink-900">{item.kanji}</span>
                    <span lang="ja" className="jp text-xs text-ink-400">{item.kana}</span>
                  </span>
                  <span className="block truncate text-xs text-ink-500">{item.meaning}</span>
                </span>
                {card ? (
                  <Badge tone={card.interval >= 21 ? "matcha" : "neutral"}>
                    {card.interval >= 21 ? "matang" : `${card.interval}h`}
                  </Badge>
                ) : (
                  <Badge tone="sakura">baru</Badge>
                )}
              </button>

              {isOpen && (
                <CardContent className="animate-pop border-t border-ink-100 pt-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink-900">{item.meaning}</p>
                      <p className="text-xs text-ink-400">
                        {item.romaji} · {POS_LABEL[item.pos]}
                      </p>
                    </div>
                    <SpeakButton text={item.kana} />
                  </div>
                  <div className="mt-3 rounded-xl bg-ink-50 p-3">
                    <p lang="ja" className="jp text-sm text-ink-800">{item.example.jp}</p>
                    <p className="mt-1 text-xs text-ink-500">{item.example.id}</p>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        {filtered.length === 0 && (
          <EmptyState
            glyph="辞"
            title="Tidak ada kosakata yang cocok"
            description="Coba kata kunci lain, atau ubah filter jenis kata."
          />
        )}
      </div>

      <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />

      <p className="text-center text-[11px] text-ink-400">
        Menampilkan {pageItems.length} dari {filtered.length} kata
      </p>
    </div>
  );
}
