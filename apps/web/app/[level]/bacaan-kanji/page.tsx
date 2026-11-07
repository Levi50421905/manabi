"use client";

import Link from "next/link";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  EmptyState,
  PageHeader,
  Section,
  cn,
} from "@manabi/ui";
import {
  levelHref,
  levelMeta,
  readingEntriesByLevel,
  readingEntriesByKind,
  readingRulesByLevel,
  type ReadingChangeKind,
  type ReadingEntry,
  type ReadingRule,
} from "@manabi/content";
import { SpeakButton } from "@/components/speak-button";
import { useActiveLevel } from "@/lib/level";
import { READING_KIND_HINT, READING_KIND_LABEL } from "@/lib/bacaan-kanji";

const KIND_TONE: Record<ReadingChangeKind, "accent" | "success" | "level" | "neutral"> = {
  jukujikun: "accent",
  rendaku: "success",
  onyomi: "level",
  "kunyomi-gabung": "neutral",
  standar: "neutral",
};

/** Satu baris tabel konteks: bentuk · bacaan · arti · catatan. */
function ContextRow({
  word,
  kana,
  meaning,
  context,
}: {
  word: string;
  kana: string;
  meaning: string;
  context: string;
}) {
  return (
    <div className="grid gap-1 border-t border-border py-2.5 sm:grid-cols-[minmax(0,7rem)_minmax(0,7rem)_minmax(0,1fr)] sm:items-baseline sm:gap-3">
      <div className="flex items-baseline gap-2">
        <span lang="ja" className="font-jp-serif text-h3 font-semibold text-fg">
          {word}
        </span>
        <span lang="ja" className="font-jp text-caption text-level">
          {kana}
        </span>
      </div>
      <p className="text-caption text-fg-muted">{meaning}</p>
      <p className="text-caption leading-relaxed text-fg-subtle">{context}</p>
    </div>
  );
}

function RuleCard({ rule }: { rule: ReadingRule }) {
  return (
    <Card>
      <CardBody className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              lang="ja"
              className="jp-serif grid h-12 w-12 place-items-center rounded-lg bg-level-soft text-2xl font-semibold leading-none text-level"
            >
              {rule.kanji}
            </span>
            <div>
              <h3 className="text-h3 font-semibold text-fg">{rule.title}</h3>
              <p className="text-caption text-fg-muted">
                {rule.examples.length} contoh · {rule.exceptions?.length ?? 0} pengecualian
              </p>
            </div>
          </div>
          <Badge tone={rule.strength === "kuat" ? "success" : "warning"}>
            {rule.strength === "kuat" ? "Hampir selalu" : "Kecenderungan"}
          </Badge>
        </div>

        <p className="mt-3 rounded-lg border border-border bg-surface-muted p-3 text-sm leading-relaxed text-fg">
          {rule.rule}
        </p>

        <div className="mt-3">
          <p className="label-micro mb-1">Bentuk &amp; bacaan</p>
          <div className="hidden gap-3 border-b border-border pb-1.5 text-caption text-fg-subtle sm:grid sm:grid-cols-[minmax(0,7rem)_minmax(0,7rem)_minmax(0,1fr)]">
            <span>Bentuk</span>
            <span>Arti</span>
            <span>Kapan dipakai</span>
          </div>
          <ContextRow
            word={rule.standalone.word}
            kana={rule.standalone.kana}
            meaning={rule.standalone.meaning}
            context={rule.standalone.context}
          />
          {rule.examples.map((example) => (
            <ContextRow
              key={example.word}
              word={example.word}
              kana={example.kana}
              meaning={example.meaning}
              context={example.context}
            />
          ))}
        </div>

        {rule.exceptions?.length ? (
          <div className="mt-4">
            <p className="label-micro mb-1.5">Pengecualian yang perlu diingat</p>
            <ul className="space-y-1.5">
              {rule.exceptions.map((exception) => (
                <li key={exception.word} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span lang="ja" className="font-jp text-sm font-medium text-fg">
                    {exception.word}
                  </span>
                  <span lang="ja" className="font-jp text-caption text-level">
                    {exception.kana}
                  </span>
                  <span className="text-caption leading-relaxed text-fg-muted">
                    — {exception.note}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
}

function EntryCard({ entry }: { entry: ReadingEntry }) {
  return (
    <Card className="h-full">
      <CardBody className="flex h-full flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <span lang="ja" className="font-jp-serif text-2xl font-semibold leading-none text-fg">
            {entry.word}
          </span>
          <SpeakButton text={entry.word} size="sm" variant="ghost" label={`Putar ${entry.word}`} />
        </div>
        <div>
          <p lang="ja" className="font-jp text-sm font-medium text-level">
            {entry.kana}
          </p>
          <p className="text-caption text-fg-subtle">{entry.romaji}</p>
        </div>
        <p className="text-sm text-fg">{entry.meaning}</p>
        <p className="mt-auto text-caption leading-relaxed text-fg-muted">{entry.note}</p>
      </CardBody>
    </Card>
  );
}

function KindSection({
  kind,
  entries,
  glyph,
}: {
  kind: ReadingChangeKind;
  entries: ReadingEntry[];
  glyph: string;
}) {
  if (entries.length === 0) return null;
  return (
    <Section
      title={READING_KIND_LABEL[kind]}
      glyph={glyph}
      description={READING_KIND_HINT[kind]}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
    </Section>
  );
}

export default function BacaanKanjiPage() {
  const { level } = useActiveLevel();
  const meta = levelMeta(level);
  const rules = readingRulesByLevel(level);
  const entries = readingEntriesByLevel(level);

  const header = (
    <PageHeader
      eyebrow={
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="level" mono>
            {level}
          </Badge>
          <span className="label-micro">{meta.name} · Bacaan Kanji</span>
        </div>
      }
      title="Bacaan Kanji"
      japanese="読み方"
      description="Bacaan kanji berubah tergantung kata yang mengikutinya. Di sini aturannya dijelaskan beserta kapan dipakai dan kapan tidak."
      actions={
        <Link href={levelHref(level, "bacaan-kanji/latihan")}>
          <Button>Latihan membaca</Button>
        </Link>
      }
    />
  );

  if (entries.length === 0 && rules.length === 0) {
    return (
      <div className="space-y-8 pb-8">
        {header}
        <EmptyState
          glyph="読"
          title="Materi bacaan kanji belum tersedia"
          description="Saat ini materi bacaan kanji baru disusun untuk level N5."
          action={
            <Link href={levelHref("N5", "bacaan-kanji")}>
              <Button>Ke bacaan kanji N5</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 md:space-y-10">
      {header}

      <Callout tone="info" title="Kenapa bacaan bisa berubah?">
        Kanji tidak punya satu bacaan tetap. Bacaan bisa berubah karena bunyi di sekitarnya
        (rendaku), karena digabung dengan kanji lain, atau karena bentuknya memang dibaca khusus
        sejak lama (jukujikun). Aturan di bawah adalah <strong>kecenderungan</strong> — selalu ada
        pengecualian, jadi perhatikan contohnya.
      </Callout>

      {rules.length > 0 ? (
        <Section
          title="Aturan cepat"
          glyph="則"
          description="Kanji yang bacaannya paling sering ditanyakan pemula."
        >
          <div className="space-y-3">
            {rules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} />
            ))}
          </div>
        </Section>
      ) : null}

      <KindSection
        kind="jukujikun"
        entries={readingEntriesByKind("jukujikun").filter((entry) => entries.includes(entry))}
        glyph="特"
      />
      <KindSection
        kind="rendaku"
        entries={readingEntriesByKind("rendaku").filter((entry) => entries.includes(entry))}
        glyph="濁"
      />
      <KindSection
        kind="onyomi"
        entries={readingEntriesByKind("onyomi").filter((entry) => entries.includes(entry))}
        glyph="音"
      />
      <KindSection
        kind="kunyomi-gabung"
        entries={readingEntriesByKind("kunyomi-gabung").filter((entry) => entries.includes(entry))}
        glyph="訓"
      />

      <p className={cn("border-t border-border pt-4 text-caption leading-relaxed text-fg-subtle")}>
        Aturan di halaman ini disusun sebagai pegangan belajar, bukan patokan mutlak. Beberapa
        bentuk memiliki bacaan berbeda menurut konteks dan kebiasaan pemakaian.
      </p>
    </div>
  );
}
