"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Pagination,
  Pill,
  PillRow,
  ProgressBar,
  SearchField,
  Section,
  Toolbar,
  ToolbarGroup,
  cn,
} from "@manabi/ui";
import {
  availableLevels,
  levelHref,
  levelMeta,
  vocabByLevel,
  type PartOfSpeech,
} from "@manabi/content";
import { createCard, dueLabel, review as scheduleReview, type Rating } from "@manabi/srs";
import { SpeakButton } from "@/components/speak-button";
import { dueIds, newIds, rateCard, reviewQueue, useProgress } from "@/lib/store";
import { useActiveLevel } from "@/lib/level";

/** Nilai filter "semua jenis kata". */
const ALL = "semua" as const;
type PosFilter = PartOfSpeech | typeof ALL;

/** Jumlah kata per halaman daftar — cukup panjang untuk membaca, tidak berat. */
const PAGE_SIZE = 30;

const POS_LABEL: Record<PartOfSpeech, string> = {
  "kata-benda": "Kata benda",
  "kata-kerja": "Kata kerja",
  "kata-sifat-i": "Kata sifat-i",
  "kata-sifat-na": "Kata sifat-na",
  "kata-keterangan": "Keterangan",
  lainnya: "Lainnya",
};

/** Glyph kanji pendamping chip filter (bukan informasi penting). */
const POS_FILTERS: Array<{ value: PosFilter; label: string; glyph: string }> = [
  { value: ALL, label: "Semua", glyph: "全" },
  { value: "kata-benda", label: POS_LABEL["kata-benda"], glyph: "名" },
  { value: "kata-kerja", label: POS_LABEL["kata-kerja"], glyph: "動" },
  { value: "kata-sifat-i", label: POS_LABEL["kata-sifat-i"], glyph: "い" },
  { value: "kata-sifat-na", label: POS_LABEL["kata-sifat-na"], glyph: "な" },
  { value: "kata-keterangan", label: POS_LABEL["kata-keterangan"], glyph: "副" },
  { value: "lainnya", label: POS_LABEL.lainnya, glyph: "他" },
];

const RATINGS: Array<{
  rating: Rating;
  label: string;
  labelClass: string;
  buttonClass: string;
}> = [
  {
    rating: "again",
    label: "Lupa",
    labelClass: "text-danger",
    buttonClass: "border-danger/30 bg-danger-soft text-danger hover:border-danger/60",
  },
  {
    rating: "hard",
    label: "Sulit",
    labelClass: "text-warning",
    buttonClass: "border-warning/30 bg-warning-soft text-warning hover:border-warning/60",
  },
  {
    rating: "good",
    label: "Ingat",
    labelClass: "text-success",
    buttonClass: "border-success/30 bg-success-soft text-success hover:border-success/60",
  },
  {
    rating: "easy",
    label: "Mudah",
    labelClass: "text-level",
    buttonClass: "border-level/30 bg-level-soft text-level hover:border-level/60",
  },
];

const RATING_LABEL: Record<Rating, string> = {
  again: "Lupa",
  hard: "Sulit",
  good: "Ingat",
  easy: "Mudah",
};

const KEY_RATING: Record<string, Rating> = {
  "1": "again",
  "2": "hard",
  "3": "good",
  "4": "easy",
};

export default function VocabPage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);
  const progress = useProgress();

  /** Seluruh kosakata level aktif — satu-satunya sumber data halaman ini. */
  const items = useMemo(() => vocabByLevel(level), [level]);
  const allIds = useMemo(() => items.map((item) => item.id), [items]);

  const [query, setQuery] = useState("");
  const [pos, setPos] = useState<PosFilter>(ALL);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  /* ---------- sesi review SRS ---------- */
  const [session, setSession] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [requeueCount, setRequeueCount] = useState<Record<string, number>>({});
  const [announcement, setAnnouncement] = useState("");

  // Kartu jatuh tempo & kartu baru dihitung ulang setelah setiap penilaian
  // (`progress.cards` ikut berubah lewat useProgress).
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
    return items.filter((item) => {
      if (pos !== ALL && item.pos !== pos) return false;
      if (!q) return true;
      return `${item.kanji} ${item.kana} ${item.romaji} ${item.meaning}`.toLowerCase().includes(q);
    });
  }, [items, query, pos]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const currentId = session?.[index];
  const current = currentId ? items.find((item) => item.id === currentId) : undefined;

  // Pindah level = konteks baru: kembali ke daftar, filter, dan halaman pertama.
  useEffect(() => {
    setQuery("");
    setPos(ALL);
    setPage(1);
    setExpanded(null);
    setSession(null);
    setIndex(0);
    setRevealed(false);
    setFinished(false);
    setReviewed(0);
    setRequeueCount({});
    setAnnouncement("");
  }, [level]);

  function startSession(explicit?: string[]) {
    const ids = explicit && explicit.length > 0 ? explicit : reviewQueue(allIds, 5);
    const queue = ids.length > 0 ? ids : allIds.slice(0, 10);
    if (queue.length === 0) return;

    setSession(queue);
    setIndex(0);
    setRevealed(false);
    setFinished(false);
    setReviewed(0);
    setRequeueCount({});
    setAnnouncement(`Sesi ulasan dimulai. ${queue.length} kartu dalam antrean.`);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  }

  /** Perkiraan interval berikutnya untuk tiap tombol rating (SM-2 asli). */
  function hintFor(rating: Rating): string {
    if (!current) return "";
    const card = progress.cards[current.id] ?? createCard(current.id);
    const preview = scheduleReview(card, rating);
    return preview.interval === 0 ? "<10 mnt" : `${preview.interval} hr`;
  }

  function resetFilters() {
    setQuery("");
    setPos(ALL);
    setPage(1);
  }

  const openAnswer = useCallback(() => {
    if (!current) return;
    setRevealed(true);
    setAnnouncement(
      `Jawaban: ${current.kanji || current.kana} berarti ${current.meaning}. Pilih penilaian 1 sampai 4.`,
    );
  }, [current]);

  const exitSession = useCallback(() => {
    setSession(null);
    setIndex(0);
    setRevealed(false);
    setFinished(false);
    setAnnouncement("");
  }, []);

  const handleRate = useCallback(
    (rating: Rating) => {
      if (!currentId) return;

      rateCard(currentId, rating);
      setReviewed((value) => value + 1);
      setRevealed(false);
      setAnnouncement(`Kartu dinilai ${RATING_LABEL[rating]}.`);

      // Kartu "Lupa" diulang di akhir sesi — maksimal 2× PER KARTU
      // (bukan per sesi, supaya kartu lain tetap mendapat giliran).
      const alreadyRequeued = requeueCount[currentId] ?? 0;
      if (rating === "again" && alreadyRequeued < 2) {
        setRequeueCount((prev) => ({ ...prev, [currentId]: alreadyRequeued + 1 }));
        setSession((prev) => (prev ? [...prev, currentId] : prev));
        setIndex((value) => value + 1);
        return;
      }

      if (session && index + 1 >= session.length) {
        setFinished(true);
        setAnnouncement("Sesi ulasan selesai.");
      } else {
        setIndex((value) => value + 1);
      }
    },
    [currentId, requeueCount, session, index],
  );

  // Shortcut papan tombol: Spasi/Enter melihat arti, 1–4 menilai, Esc keluar.
  useEffect(() => {
    if (!session || finished) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        exitSession();
        return;
      }

      if (!revealed) {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          openAnswer();
        }
        return;
      }

      const rating = KEY_RATING[event.key];
      if (rating) {
        event.preventDefault();
        handleRate(rating);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [session, finished, revealed, openAnswer, exitSession, handleRate]);

  /* ---------- level tanpa materi ---------- */
  if (items.length === 0) {
    const fallback = availableLevels[0] ?? level;
    return (
      <div className="space-y-8 pb-8">
        <PageHeaderSection
          level={level}
          description={`Materi kosakata level ${level} (${meta.name}) sedang disusun. Level yang sudah tersedia tetap bisa dibuka kapan saja.`}
        />
        <EmptyState
          glyph="語"
          title={`Kosakata ${level} belum tersedia`}
          description="Kurikulum ditambahkan bertahap. Sementara itu, lanjutkan belajar di level yang sudah punya materi."
          action={
            <Link href={levelHref(fallback, "vocab")}>
              <Button variant="level">Buka kosakata {fallback}</Button>
            </Link>
          }
        />
      </div>
    );
  }

  /* ---------- layar review ---------- */
  if (session && !finished && current) {
    const card = progress.cards[current.id];

    return (
      <div className="mx-auto max-w-2xl space-y-5 pb-8">
        <p role="status" aria-live="polite" className="sr-only">
          {announcement}
        </p>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-micro">Kosakata · {level}</p>
            <p className="mt-1 text-sm text-fg-muted">
              Kartu <span className="tnum font-semibold text-fg">{index + 1}</span> dari{" "}
              <span className="tnum">{session.length}</span>
            </p>
          </div>
          <Button variant="ghost" size="md" className="h-11" onClick={exitSession}>
            Keluar
          </Button>
        </div>

        <ProgressBar value={index} max={session.length} tone="level" label="Progres sesi" showValue />

        <Card className="animate-fade-up overflow-hidden">
          <div className="px-5 py-8 text-center sm:px-8 sm:py-12">
            <p className="label-micro">{POS_LABEL[current.pos]}</p>
            <p
              lang="ja"
              className="font-jp-serif mt-5 text-[52px] font-semibold leading-none tracking-tight text-fg sm:text-[64px]"
            >
              {current.kanji || current.kana}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <p lang="ja" className="font-jp text-body leading-relaxed text-fg-muted">
                {current.kana}
              </p>
              <SpeakButton
                text={current.kana}
                variant="ghost"
                size="sm"
                className="h-11 w-11 px-0"
              />
            </div>

            {revealed ? (
              <div className="animate-pop mt-8 space-y-4 text-left sm:mt-10">
                <p className="font-display text-center text-h2 font-semibold tracking-tight text-fg">
                  {current.meaning}
                </p>
                <div className="rounded-xl border border-border bg-surface-muted p-4">
                  <p lang="ja" className="font-jp text-body leading-relaxed text-fg">
                    {current.example.jp}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                    {current.example.id}
                  </p>
                </div>
                {card && card.reviews > 0 ? (
                  <p className="text-caption text-fg-subtle">
                    Diulas {card.reviews}× · interval {card.interval} hari · ease{" "}
                    {card.ease.toFixed(2)} · jatuh tempo {dueLabel(card.due)}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="mx-auto mt-8 max-w-[42ch] text-sm leading-relaxed text-fg-muted">
                Ingat arti kata ini? Tampilkan jawaban untuk menilai seberapa kuat ingatan Anda.
              </p>
            )}
          </div>

          <div className="border-t border-border bg-surface-muted/40 px-5 py-4 sm:px-6">
            {!revealed ? (
              <Button variant="level" size="lg" block onClick={openAnswer}>
                Tampilkan arti
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RATINGS.map((item) => (
                  <button
                    key={item.rating}
                    type="button"
                    onClick={() => handleRate(item.rating)}
                    className={cn(
                      "flex min-h-[56px] flex-col items-center justify-center rounded-lg border px-2 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
                      item.buttonClass,
                    )}
                  >
                    <span className={item.labelClass}>{item.label}</span>
                    <span className="mt-0.5 text-caption font-normal opacity-80">
                      {hintFor(item.rating)}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <p className="mt-3 hidden text-center text-caption text-fg-subtle sm:block">
              Spasi/Enter melihat arti · tombol 1–4 menilai · Esc keluar
            </p>
          </div>
        </Card>
      </div>
    );
  }

  /* ---------- sesi selesai ---------- */
  if (session && finished) {
    return (
      <div className="mx-auto max-w-xl pb-8">
        <p role="status" aria-live="polite" className="sr-only">
          Sesi ulasan selesai. {reviewed} kartu diulas.
        </p>
        <Card className="animate-fade-up">
          <div className="px-6 py-10 text-center">
            <p lang="ja" className="font-jp-serif text-[32px] leading-none text-fg">
              お疲れ様
            </p>
            <p className="mt-3 font-display text-h2 font-semibold tracking-tight text-fg">
              Sesi ulasan selesai
            </p>
            <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-relaxed text-fg-muted">
              <span className="tnum font-semibold text-fg">{reviewed}</span> kartu diulas di level{" "}
              {level}. Jadwal berikutnya sudah dihitung otomatis.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button variant="level" onClick={() => startSession()}>
                Ulas lagi
              </Button>
              <Button variant="outline" onClick={exitSession}>
                Kembali ke daftar
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* ---------- daftar kosakata ---------- */
  const isFiltered = query.trim().length > 0 || pos !== ALL;

  return (
    <div className="space-y-8 pb-8">
      <PageHeaderSection
        level={level}
        description={`${items.length} kata · ${dueCount} jatuh tempo · ${newCount} belum dipelajari`}
      />

      <div className="space-y-3">
        <Toolbar sticky>
          <ToolbarGroup className="min-w-0 flex-1">
            <SearchField
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              onClear={() => {
                setQuery("");
                setPage(1);
              }}
              placeholder="Cari kanji, kana, romaji, atau arti…"
              aria-label="Cari kosakata"
            />
          </ToolbarGroup>
          <ToolbarGroup className="shrink-0 justify-between sm:justify-end">
            <span className="tnum text-caption text-fg-muted" aria-live="polite">
              {filtered.length} kata
            </span>
            <Button variant="level" size="md" onClick={() => startSession()}>
              Mulai ulasan
            </Button>
          </ToolbarGroup>
        </Toolbar>

        <PillRow aria-label="Filter jenis kata">
          {POS_FILTERS.map((option) => (
            <Pill
              key={option.value}
              active={pos === option.value}
              glyph={option.glyph}
              onClick={() => {
                setPos(option.value);
                setPage(1);
              }}
            >
              {option.label}
            </Pill>
          ))}
        </PillRow>
      </div>

      <Section
        title="Daftar kata"
        glyph="語"
        description={
          isFiltered
            ? `${filtered.length} kata cocok dengan pencarian dan filter Anda.`
            : `${items.length} kata di level ${level}. Tekan baris untuk melihat contoh kalimat.`
        }
      >
        {pageItems.length === 0 ? (
          <EmptyState
            glyph="辞"
            title="Tidak ada kata yang cocok"
            description="Coba kata kunci lain, atau ubah filter jenis kata."
            action={
              <Button variant="outline" onClick={resetFilters}>
                Hapus pencarian & filter
              </Button>
            }
          />
        ) : (
          <ul className="space-y-2">
            {pageItems.map((item) => {
              const card = progress.cards[item.id];
              const isOpen = expanded === item.id;
              const word = item.kanji || item.kana;
              const writtenWithKanji = Boolean(item.kanji);

              return (
                <li key={item.id}>
                  <Card
                    className={cn(
                      "overflow-hidden transition-colors",
                      isOpen ? "border-level/40" : "hover:border-border-strong",
                    )}
                  >
                    <div className="flex items-start gap-2 p-3 sm:items-center sm:gap-4 sm:p-4">
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : item.id)}
                        aria-expanded={isOpen}
                        aria-controls={`vocab-detail-${item.id}`}
                        className="flex min-w-0 flex-1 items-start gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface sm:items-center"
                      >
                        <span className="min-w-0 sm:w-[180px] sm:shrink-0">
                          <span
                            lang="ja"
                            className="font-jp-serif block break-words text-[26px] font-semibold leading-tight text-fg sm:text-[30px]"
                          >
                            {word}
                          </span>
                          <span className="mt-1 block text-caption text-fg-muted">
                            {writtenWithKanji ? (
                              <>
                                <span lang="ja" className="font-jp">
                                  {item.kana}
                                </span>
                                <span aria-hidden="true"> · </span>
                              </>
                            ) : null}
                            <span className="text-fg-subtle">{item.romaji}</span>
                          </span>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium leading-snug text-fg">
                            {item.meaning}
                          </span>
                          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <Badge tone="outline">{POS_LABEL[item.pos]}</Badge>
                            {card ? (
                              card.interval >= 21 ? (
                                <Badge tone="success">matang</Badge>
                              ) : (
                                <Badge tone="neutral" className="tnum">
                                  {card.interval} hr
                                </Badge>
                              )
                            ) : (
                              <Badge tone="accent">baru</Badge>
                            )}
                          </span>
                        </span>

                        <span
                          aria-hidden="true"
                          className={cn(
                            "mt-1.5 hidden shrink-0 text-caption text-fg-subtle transition-transform duration-150 sm:block",
                            isOpen && "rotate-180",
                          )}
                        >
                          ▾
                        </span>
                      </button>

                      <SpeakButton
                        text={item.kana}
                        variant="ghost"
                        size="sm"
                        className="h-11 w-11 shrink-0 px-0"
                      />
                    </div>

                    {isOpen ? (
                      <div
                        id={`vocab-detail-${item.id}`}
                        className="border-t border-border bg-surface-muted/50 px-3 py-3 sm:px-4 sm:py-4"
                      >
                        <div className="max-w-[68ch]">
                          <p lang="ja" className="font-jp text-body leading-relaxed text-fg">
                            {item.example.jp}
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                            {item.example.id}
                          </p>
                        </div>
                        {card && card.reviews > 0 ? (
                          <p className="mt-3 text-caption text-fg-subtle">
                            Diulas {card.reviews}× · interval {card.interval} hari · ease{" "}
                            {card.ease.toFixed(2)} · jatuh tempo {dueLabel(card.due)}
                          </p>
                        ) : (
                          <p className="mt-3 text-caption text-fg-subtle">
                            Belum pernah diulas di sesi SRS.
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startSession([item.id])}
                          >
                            Ulas kata ini
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </Card>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 space-y-3">
          <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} />
          {pageItems.length > 0 ? (
            <p className="text-center text-caption text-fg-subtle">
              Menampilkan <span className="tnum">{pageItems.length}</span> dari{" "}
              <span className="tnum">{filtered.length}</span> kata
            </p>
          ) : null}
        </div>
      </Section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-caption text-fg-subtle">
        <p>Progres ulasan tersimpan otomatis di browser ini.</p>
        <Link
          href={levelHref(level, "kanji")}
          className="text-accent underline-offset-2 hover:underline"
        >
          Lanjut ke kanji {level} →
        </Link>
      </div>
    </div>
  );
}

/**
 * Header halaman standar. Dipisah agar cabang kosong/review/daftar memakai
 * eyebrow, judul, dan deskripsi yang persis sama tanpa duplikasi.
 */
function PageHeaderSection({
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
          <span className="label-micro">Kosakata</span>
        </div>
      }
      title="Kosakata"
      japanese="語彙"
      description={description}
      actions={action}
    />
  );
}
