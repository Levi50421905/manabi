"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  PageHeader,
  Pill,
  PillRow,
  Section,
  SearchField,
  cn,
} from "@manabi/ui";
import {
  grammar,
  kanji,
  levelClassName,
  levelHref,
  reading,
  searchContent,
  vocab,
  type SearchHit,
} from "@manabi/content";

type KindFilter = "semua" | SearchHit["kind"];

const GROUP_ORDER: SearchHit["kind"][] = ["kosakata", "kanji", "tata-bahasa", "bacaan"];

const KIND_LABEL: Record<SearchHit["kind"], string> = {
  kosakata: "Kosakata",
  kanji: "Kanji",
  "tata-bahasa": "Tata Bahasa",
  bacaan: "Bacaan",
};

const KIND_GLYPH: Record<SearchHit["kind"], string> = {
  kosakata: "語",
  kanji: "漢",
  "tata-bahasa": "文",
  bacaan: "読",
};

const KIND_PATH: Record<SearchHit["kind"], string> = {
  kosakata: "vocab",
  kanji: "kanji",
  "tata-bahasa": "grammar",
  bacaan: "reading",
};

const FILTERS: Array<{ key: KindFilter; label: string; glyph: string }> = [
  { key: "semua", label: "Semua", glyph: "全" },
  ...GROUP_ORDER.map((kind) => ({
    key: kind as KindFilter,
    label: KIND_LABEL[kind],
    glyph: KIND_GLYPH[kind],
  })),
];

const SUGGESTIONS = ["makan", "学生", "partikel", "みず", "teman", "大きい"];

/** Apakah teks memuat huruf Jepang (kana/kanji)? */
const JAPANESE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uff66-\uff9f]/;

/** Judul Jepang tampil paling besar — konten Jepang adalah bintang halaman. */
function entryTitle(title: string): string {
  const japanese = JAPANESE.test(title);
  return cn(
    japanese ? "font-jp-serif" : "font-display",
    title.length <= 8 ? "text-h1" : "text-h2",
    "font-semibold leading-snug tracking-tight",
  );
}

export default function DictionaryPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("semua");

  const results = useMemo(() => searchContent(query), [query]);

  const counts = useMemo(() => {
    const base: Record<SearchHit["kind"], number> = {
      kosakata: 0,
      kanji: 0,
      "tata-bahasa": 0,
      bacaan: 0,
    };
    for (const hit of results) base[hit.kind] += 1;
    return base;
  }, [results]);

  const filtered = useMemo(
    () => (kind === "semua" ? results : results.filter((hit) => hit.kind === kind)),
    [results, kind],
  );

  const groups = useMemo(
    () =>
      GROUP_ORDER.map((groupKind) => ({
        kind: groupKind,
        hits: filtered.filter((hit) => hit.kind === groupKind),
      })).filter((group) => group.hits.length > 0),
    [filtered],
  );

  const filterLabel =
    kind === "semua" ? "semua jenis" : KIND_LABEL[kind].toLowerCase();
  const searching = query.trim().length > 0;

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        eyebrow={<span className="label-micro">Referensi · Kamus</span>}
        title="Kamus"
        japanese="辞書"
        description={`Cari lintas ${vocab.length} kosakata, ${kanji.length} kanji, ${grammar.length} pola tata bahasa, dan ${reading.length} bacaan dari semua level.`}
      />

      {/* Pencarian — fokus utama halaman */}
      <section
        aria-label="Pencarian kamus"
        className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="label-micro">Cari lintas materi</p>
          <span className="tnum text-caption text-fg-subtle">
            {searching ? `${results.length} hasil` : "kanji · kana · romaji · arti"}
          </span>
        </div>

        <div className="mt-3">
          <SearchField
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onClear={() => setQuery("")}
            placeholder="Ketik kanji, kana, romaji, atau arti Indonesia…"
            aria-label="Cari di kamus"
            enterKeyHint="search"
            className="h-14 rounded-xl pl-11 pr-10 text-base sm:h-16"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-caption text-fg-subtle">Coba:</span>
          {SUGGESTIONS.map((item) => (
            <Pill
              key={item}
              active={query === item}
              onClick={() => setQuery(item)}
              aria-label={`Cari ${item}`}
            >
              <span lang={JAPANESE.test(item) ? "ja" : undefined} className={JAPANESE.test(item) ? "font-jp" : undefined}>
                {item}
              </span>
            </Pill>
          ))}
        </div>
      </section>

      {/* Filter jenis materi */}
      <PillRow aria-label="Filter jenis materi">
        {FILTERS.map((filter) => {
          const total = filter.key === "semua" ? results.length : counts[filter.key];
          return (
            <Pill
              key={filter.key}
              active={kind === filter.key}
              glyph={filter.glyph}
              onClick={() => setKind(filter.key)}
            >
              {filter.label}
              {searching ? (
                <span className="tnum opacity-70" aria-hidden="true">
                  {total}
                </span>
              ) : null}
            </Pill>
          );
        })}
      </PillRow>

      {!searching ? (
        <EmptyState
          glyph="辞"
          title="Mulai mengetik untuk mencari"
          description="Kamus mencakup seluruh level. Coba kanji seperti 学生, kata seperti “makan”, atau istilah seperti “partikel”."
        />
      ) : results.length === 0 ? (
        <EmptyState
          glyph="無"
          title={`Tidak ada hasil untuk “${query.trim()}”`}
          description="Coba kanji, kana, romaji, atau arti Indonesia lain. Pencarian berlaku untuk semua level."
          action={
            <Button variant="outline" onClick={() => setQuery("")}>
              Hapus pencarian
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          glyph="空"
          title={`Tidak ada ${filterLabel} untuk “${query.trim()}”`}
          description="Jenis materi lain tetap punya hasil untuk kata kunci ini."
          action={
            <Button variant="outline" onClick={() => setKind("semua")}>
              Tampilkan semua hasil
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
            <p aria-live="polite" className="text-caption text-fg-muted">
              <span className="tnum font-semibold text-fg">{filtered.length}</span> hasil ·{" "}
              {filterLabel}
            </p>
            <span className="label-micro">Semua level</span>
          </div>

          {groups.map((group) => (
            <Section
              key={group.kind}
              title={KIND_LABEL[group.kind]}
              glyph={KIND_GLYPH[group.kind]}
              action={
                <Badge tone="neutral" mono>
                  {group.hits.length}
                </Badge>
              }
            >
              <ul className="space-y-2">
                {group.hits.map((hit) => (
                  <li key={`${hit.kind}-${hit.id}`}>
                    <Link href={levelHref(hit.level, KIND_PATH[hit.kind])} className="group block">
                      <Card variant="interactive">
                        <CardBody className="flex items-start gap-3 p-4 sm:p-5">
                          <span
                            lang="ja"
                            aria-hidden="true"
                            className={cn(
                              levelClassName(hit.level),
                              "jp-serif grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-level-soft text-base font-semibold text-level",
                            )}
                          >
                            {KIND_GLYPH[hit.kind]}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p
                              lang={JAPANESE.test(hit.title) ? "ja" : undefined}
                              className={entryTitle(hit.title)}
                            >
                              {hit.title}
                            </p>
                            <p className="mt-1 text-caption leading-relaxed text-fg-muted">
                              {hit.subtitle}
                            </p>
                          </div>
                          <Badge
                            tone="level"
                            mono
                            className={cn(levelClassName(hit.level), "shrink-0")}
                          >
                            {hit.level}
                          </Badge>
                        </CardBody>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </Section>
          ))}
        </div>
      )}
    </div>
  );
}
