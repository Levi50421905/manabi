"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  EmptyState,
  PageHeader,
  ProgressBar,
  SegmentedControl,
  cn,
} from "@manabi/ui";
import type { Rating } from "@manabi/srs";
import { levelHref, levelMeta } from "@manabi/content";
import { useActiveLevel } from "@/lib/level";
import { dueIds, newIds, rateCard, reviewQueue, useProgress } from "@/lib/store";
import {
  CONTEXT_DECK_HINT,
  CONTEXT_DECK_LABEL,
  contextDeck,
  type ContextDeckKind,
} from "@/lib/review-deck";

const RATINGS: Array<{ value: Rating; label: string; hint: string; tone: string }> = [
  { value: "again", label: "Lupa", hint: "ulangi besok", tone: "border-danger/40 text-danger" },
  { value: "hard", label: "Sulit", hint: "sedikit lebih lambat", tone: "border-warning/40 text-warning" },
  { value: "good", label: "Bagus", hint: "sesuai jadwal", tone: "border-success/40 text-success" },
  { value: "easy", label: "Mudah", hint: "lebih lama", tone: "border-accent/40 text-accent" },
];

const NEW_LIMIT_OPTIONS = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 20, label: "20" },
];

export default function UlasanPage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);
  const progress = useProgress();

  const deck = useMemo(() => contextDeck(level), [level]);
  const allIds = useMemo(() => deck.map((card) => card.id), [deck]);
  const byId = useMemo(() => new Map(deck.map((card) => [card.id, card])), [deck]);

  const [kindFilter, setKindFilter] = useState<ContextDeckKind | "semua">("semua");
  const [newLimit, setNewLimit] = useState(5);
  const [queue, setQueue] = useState<string[] | null>(null);
  const [position, setPosition] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  // Kartu tersedia mengikuti saringan jenis.
  const filteredIds = useMemo(() => {
    if (kindFilter === "semua") return allIds;
    return deck.filter((card) => card.kind === kindFilter).map((card) => card.id);
  }, [allIds, deck, kindFilter]);

  const dueCount = dueIds(filteredIds).length;
  const freshCount = newIds(filteredIds).length;

  // Statistik deck diperbarui setiap kali progress berubah.
  const cardCount = Object.keys(progress.cards ?? {}).length;

  useEffect(() => {
    setQueue(null);
    setPosition(0);
    setRevealed(false);
    setReviewed(0);
  }, [level, kindFilter, newLimit]);

  const activeId = queue?.[position];
  const active = activeId ? byId.get(activeId) : undefined;

  function start() {
    const next = reviewQueue(filteredIds, newLimit);
    if (next.length === 0) return;
    setQueue(next);
    setPosition(0);
    setRevealed(false);
    setReviewed(0);
  }

  function rate(rating: Rating) {
    if (!activeId) return;
    rateCard(activeId, rating);
    setReviewed((value) => value + 1);
    if (position + 1 >= (queue?.length ?? 0)) {
      setQueue(null);
      setPosition(0);
      setRevealed(false);
      return;
    }
    setPosition((value) => value + 1);
    setRevealed(false);
  }

  /* ---------------- sesi ulasan ---------------- */
  if (queue && active) {
    return (
      <div className="mx-auto max-w-[720px] space-y-5 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">
              Kartu {position + 1} dari {queue.length}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQueue(null);
              setPosition(0);
              setRevealed(false);
            }}
          >
            Selesai
          </Button>
        </div>

        <ProgressBar value={position} max={Math.max(1, queue.length)} tone="level" />

        <Card>
          <CardBody className="space-y-4 p-5 sm:p-7">
            <div className="flex items-center justify-between gap-2">
              <span className="label-micro">{CONTEXT_DECK_LABEL[active.kind]}</span>
              <span className="text-caption text-fg-subtle">{active.hint}</span>
            </div>

            <p
              lang="ja"
              className="font-jp-serif text-h1 font-semibold leading-tight text-fg"
            >
              {active.front}
            </p>

            {revealed ? (
              <div className="space-y-2 border-t border-border pt-4">
                <p lang="ja" className="font-jp text-h2 font-semibold leading-tight text-level">
                  {active.back}
                </p>
                {active.note ? (
                  <p className="text-caption leading-relaxed text-fg-muted">{active.note}</p>
                ) : null}
              </div>
            ) : null}

            {revealed ? (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RATINGS.map((rating) => (
                  <button
                    key={rating.value}
                    type="button"
                    onClick={() => rate(rating.value)}
                    className={cn(
                      "flex flex-col items-start gap-0.5 rounded-lg border bg-surface px-3 py-2.5 text-left transition-colors",
                      "hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                      rating.tone,
                    )}
                  >
                    <span className="text-sm font-semibold">{rating.label}</span>
                    <span className="text-caption text-fg-subtle">{rating.hint}</span>
                  </button>
                ))}
              </div>
            ) : (
              <Button block size="lg" onClick={() => setRevealed(true)}>
                Tampilkan jawaban
              </Button>
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  /* ---------------- ringkasan deck ---------------- */
  const kindCounts = (Object.keys(CONTEXT_DECK_LABEL) as ContextDeckKind[]).map((kind) => ({
    kind,
    total: deck.filter((card) => card.kind === kind).length,
  }));

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="level" mono>
              {level}
            </Badge>
            <span className="label-micro">{meta.name} · Ulasan</span>
          </div>
        }
        title="Ulasan Konteks"
        japanese="復習"
        description="Kartu ulangan untuk pola yang berubah menurut konteks — bacaan kanji, partikel, dan situasi bicara. Bukan hafalan arti lepas."
        actions={
          <Link href={levelHref(level, "konteks")}>
            <Button variant="outline">Materi konteks</Button>
          </Link>
        }
      />

      {deck.length === 0 ? (
        <EmptyState
          glyph="復"
          title="Belum ada kartu ulasan"
          description="Kartu ulasan konteks tersedia setelah materi bacaan, partikel, dan situasi ditambahkan."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardBody className="p-4">
                <p className="label-micro">Jatuh tempo</p>
                <p className="tnum mt-1 font-display text-3xl font-semibold text-fg">{dueCount}</p>
                <p className="text-caption text-fg-muted">kartu siap diulang hari ini</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4">
                <p className="label-micro">Kartu baru</p>
                <p className="tnum mt-1 font-display text-3xl font-semibold text-fg">{freshCount}</p>
                <p className="text-caption text-fg-muted">belum pernah diulang</p>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="p-4">
                <p className="label-micro">Total kartu</p>
                <p className="tnum mt-1 font-display text-3xl font-semibold text-fg">
                  {deck.length}
                </p>
                <p className="text-caption text-fg-muted">
                  {cardCount} tersimpan di perangkat ini
                </p>
              </CardBody>
            </Card>
          </div>

          <Card>
            <CardBody className="space-y-4 p-4 sm:p-5">
              <div>
                <p className="label-micro mb-2">Jenis kartu</p>
                <SegmentedControl
                  block
                  ariaLabel="Jenis kartu"
                  value={kindFilter === "semua" ? "semua" : kindFilter}
                  onChange={(value) => setKindFilter(value as ContextDeckKind | "semua")}
                  options={[
                    { value: "semua", label: "Semua" },
                    ...kindCounts.map((entry) => ({ value: entry.kind, label: entry.kind })),
                  ]}
                />
                <p className="mt-2 text-caption text-fg-muted">
                  {kindFilter === "semua"
                    ? CONTEXT_DECK_HINT.bacaan
                    : CONTEXT_DECK_HINT[kindFilter]}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <p className="label-micro">Kartu baru per sesi</p>
                  <Badge tone="neutral" mono>
                    {Math.min(newLimit, freshCount)} dari {freshCount}
                  </Badge>
                </div>
                <SegmentedControl
                  className="mt-2"
                  block
                  ariaLabel="Kartu baru per sesi"
                  value={newLimit}
                  onChange={setNewLimit}
                  options={NEW_LIMIT_OPTIONS}
                />
              </div>

              <Button
                block
                size="lg"
                onClick={start}
                disabled={dueCount + Math.min(newLimit, freshCount) === 0}
              >
                Mulai ulasan
              </Button>
            </CardBody>
          </Card>

          <Callout tone="info" title="Kenapa kartunya berbentuk begini?">
            Kartu ulangan menyimpan <strong>pola konteks</strong>, bukan arti kanji lepas. Contoh:
            kartu depannya 「何で」 dan jawabannya 「なんで — kenapa」, bukan 「何 = apa」. Dengan
            begitu yang terlatih adalah kebiasaan membaca dalam konteks.
          </Callout>
        </>
      )}
    </div>
  );
}
