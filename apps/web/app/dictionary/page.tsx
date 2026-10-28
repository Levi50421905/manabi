"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { grammar, kanji, vocab, searchContent, type SearchHit } from "@manabi/content";
import { Badge, Card, CardContent, cn } from "@manabi/ui";

const KIND_TONE: Record<SearchHit["kind"], "sakura" | "matcha" | "amber" | "sky"> = {
  kosakata: "sakura",
  kanji: "matcha",
  "tata-bahasa": "amber",
  bacaan: "sky",
};

const KIND_LINK: Record<SearchHit["kind"], string> = {
  kosakata: "/vocab",
  kanji: "/kanji",
  "tata-bahasa": "/grammar",
  bacaan: "/reading",
};

const SUGGESTIONS = ["makan", "学生", "partikel", "みず", "teman", "大きい"];

export default function DictionaryPage() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchContent(query), [query]);

  return (
    <div className="space-y-5 pb-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Kamus</h1>
        <p className="mt-1 text-sm text-ink-500">
          Cari lintas {vocab.length} kosakata, {kanji.length} kanji, dan {grammar.length} pola
          tata bahasa.
        </p>
      </header>

      <div>
        <input
          type="search"
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ketik kanji, kana, romaji, atau arti Indonesia…"
          className="h-12 w-full rounded-2xl border border-ink-200 bg-surface px-4 text-sm text-ink-800 shadow-sm placeholder:text-ink-400 focus:border-sakura-300 focus:outline-none focus:ring-2 focus:ring-sakura-100"
        />
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-ink-400">Coba:</span>
          {SUGGESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setQuery(item)}
              className={cn(
                "jp rounded-full border border-ink-200 px-2.5 py-0.5 text-[11px] text-ink-500 transition-colors hover:border-sakura-300 hover:text-sakura-700",
                query === item && "border-sakura-300 bg-sakura-50 text-sakura-700",
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {query.trim().length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p lang="ja" className="jp book-open text-3xl text-ink-300">辞</p>
            <p className="mt-2 text-sm font-medium text-ink-700">Mulai mengetik untuk mencari</p>
            <p className="mt-1 text-xs text-ink-400">
              Contoh: <span lang="ja" className="jp">学生</span> (gakusei), &quot;makan&quot;, atau
              &quot;partikel&quot;.
            </p>
          </CardContent>
        </Card>
      ) : results.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-400">
          Tidak ada hasil untuk &quot;{query}&quot;. Coba kata kunci lain.
        </p>
      ) : (
        <div>
          <p className="mb-2 text-xs text-ink-400">{results.length} hasil ditemukan</p>
          <div className="space-y-1.5">
            {results.map((hit) => (
              <Link key={`${hit.kind}-${hit.id}`} href={KIND_LINK[hit.kind]}>
                <Card className="transition-colors hover:border-sakura-200 hover:bg-sakura-50/40">
                  <CardContent className="flex items-center gap-3 p-3">
                    <Badge tone={KIND_TONE[hit.kind]}>{hit.kind}</Badge>
                    <div className="min-w-0 flex-1">
                      <p lang="ja" className="jp truncate text-sm font-medium text-ink-900">{hit.title}</p>
                      <p className="truncate text-xs text-ink-500">{hit.subtitle}</p>
                    </div>
                    <span className="text-xs text-ink-300">{hit.level}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
