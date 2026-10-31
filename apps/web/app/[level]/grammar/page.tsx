"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  availableLevels,
  grammarByLevel,
  levelHref,
  levelMeta,
  sentenceOrderN5,
} from "@manabi/content";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardTitle,
  EmptyState,
  PageHeader,
  SearchField,
  Section,
  Toolbar,
  cn,
} from "@manabi/ui";
import { QuizRunner } from "@/components/quiz-runner";
import { SpeakButton } from "@/components/speak-button";
import { useActiveLevel } from "@/lib/level";
import { buildGrammarQuestions, buildSentenceOrderQuestions, type Question } from "@/lib/quiz";

type QuizMode = "grammar" | "order";

const QUIZ_LABEL: Record<QuizMode, string> = {
  grammar: "Latihan tata bahasa",
  order: "Latihan 文の組み立て",
};

const OUTLINE_LINK =
  "inline-flex h-11 items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

export default function GrammarPage() {
  const { level } = useActiveLevel();

  const [query, setQuery] = useState("");
  /** undefined = buka kartu pertama, null = semua tertutup. */
  const [openId, setOpenId] = useState<string | null | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [quizMode, setQuizMode] = useState<QuizMode>("grammar");

  const items = useMemo(() => grammarByLevel(level), [level]);
  const meta = levelMeta(level);

  // Latihan mengikuti level yang sedang dibuka, bukan menumpuk soal level lain.
  useEffect(() => {
    setQuestions(null);
    setQuizMode("grammar");
  }, [level]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => {
      const haystack = [
        item.title,
        item.pattern,
        item.explanation,
        ...(item.notes ?? []),
        ...item.examples.flatMap((example) => [example.jp, example.id]),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [items, query]);

  const activeId =
    openId === null
      ? null
      : openId && visible.some((item) => item.id === openId)
        ? openId
        : (visible[0]?.id ?? null);

  const hasOrderPractice = useMemo(
    () => sentenceOrderN5.some((item) => item.level === level),
    [level],
  );
  /** Level pertama yang sudah punya materi — tujuan empty state. */
  const fallbackLevel = availableLevels[0] ?? level;

  function startQuiz(mode: QuizMode) {
    setQuizMode(mode);
    setQuestions(
      mode === "order" ? buildSentenceOrderQuestions(5) : buildGrammarQuestions(items, 6),
    );
  }

  const header = (
    <PageHeader
      eyebrow={
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="level" mono>
            {meta.label}
          </Badge>
          <span className="label-micro">Tata Bahasa</span>
        </div>
      }
      title="Tata Bahasa"
      japanese="文法"
      description={`${items.length} pola kalimat ${meta.label} — dijelaskan dalam bahasa Indonesia, lengkap dengan contoh kalimat dan latihan.`}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="#latihan"
            className="inline-flex h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-level transition-colors hover:bg-level-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
          >
            Latihan 文の組み立て
          </a>
          <Link href={levelHref(level, "reading")} className={OUTLINE_LINK}>
            Membaca
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      }
    />
  );

  if (items.length === 0) {
    return (
      <div className="space-y-8 md:space-y-10">
        {header}
        <EmptyState
          glyph="文"
          title={`Tata bahasa ${meta.label} belum tersedia`}
          description={`Materi ${meta.name} sedang disusun. Sementara ini kamu bisa belajar pola dasar di level ${levelMeta(fallbackLevel).label}.`}
          action={
            <Link href={levelHref(fallbackLevel, "grammar")} className={OUTLINE_LINK}>
              Ke Tata Bahasa {levelMeta(fallbackLevel).label}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-10">
      {header}

      <Section
        title="Pola kalimat"
        glyph="文"
        description={
          query.trim()
            ? `${visible.length} dari ${items.length} pola cocok dengan “${query.trim()}”.`
            : "Ketuk satu pola untuk melihat penjelasan dan contohnya."
        }
      >
        <div className="space-y-4">
          <Toolbar sticky>
            <SearchField
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onClear={() => setQuery("")}
              placeholder="Cari pola, penjelasan, atau contoh…"
              aria-label="Cari pola tata bahasa"
              className="h-11"
            />
            <p className="tnum shrink-0 text-caption text-fg-muted">
              {visible.length}/{items.length} pola
            </p>
          </Toolbar>

          {visible.length === 0 ? (
            <EmptyState
              glyph="検"
              title="Tidak ada pola yang cocok"
              description={`Pencarian “${query.trim()}” tidak menemukan pola di ${meta.label}. Coba kata kunci lain, misalnya arti atau bentuk kalimatnya.`}
              action={
                <Button variant="outline" onClick={() => setQuery("")}>
                  Hapus pencarian
                </Button>
              }
            />
          ) : (
            <div className="space-y-2.5">
              {visible.map((item) => {
                const open = activeId === item.id;
                const panelId = `pola-${item.id.replace(/[:]/g, "-")}`;
                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "overflow-hidden transition-colors",
                      open ? "border-level/40" : "hover:border-border-strong",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : item.id)}
                      aria-expanded={open}
                      aria-controls={panelId}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:px-5",
                        open ? "bg-level-soft/40" : "hover:bg-surface-muted/60",
                      )}
                    >
                      <span
                        lang="ja"
                        aria-hidden="true"
                        className={cn(
                          "jp-serif grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm font-semibold transition-colors",
                          open ? "bg-level text-level-contrast" : "bg-level-soft text-level",
                        )}
                      >
                        文
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-h3 font-semibold text-fg">{item.title}</span>
                        <span
                          lang="ja"
                          className="jp mt-0.5 block text-sm leading-relaxed text-fg-muted"
                        >
                          {item.pattern}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-md transition-transform duration-150",
                          open ? "rotate-180 text-level" : "text-fg-subtle",
                        )}
                      >
                        <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4">
                          <path
                            d="m5 8 5 5 5-5"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>

                    <div
                      id={panelId}
                      hidden={!open}
                      className="animate-fade-up border-t border-border px-4 py-4 sm:px-5 sm:py-5"
                    >
                      {open ? (
                        <>
                        <div className="rounded-lg border border-border bg-surface-muted px-4 py-3">
                          <p className="label-micro mb-1.5">Pola</p>
                          <p
                            lang="ja"
                            className="font-jp-serif text-xl leading-relaxed text-fg"
                          >
                            {item.pattern}
                          </p>
                        </div>

                        <p className="mt-3 max-w-[68ch] text-body leading-relaxed text-fg">
                          {item.explanation}
                        </p>

                        <div className="mt-4">
                          <p className="label-micro mb-2">Contoh</p>
                          <ul className="space-y-2">
                            {item.examples.map((example, index) => (
                              <li
                                key={`${item.id}-contoh-${index}`}
                                className="flex items-start justify-between gap-3 rounded-lg border border-border px-3.5 py-3"
                              >
                                <div className="min-w-0">
                                  <p
                                    lang="ja"
                                    className="jp text-base leading-relaxed text-fg"
                                  >
                                    {example.jp}
                                  </p>
                                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                                    {example.id}
                                  </p>
                                </div>
                                <SpeakButton
                                  text={example.jp}
                                  className="min-h-11 min-w-11 shrink-0 sm:min-h-0 sm:min-w-0"
                                />
                              </li>
                            ))}
                          </ul>
                        </div>

                        {item.notes && item.notes.length > 0 ? (
                          <Callout tone="info" title="Catatan" className="mt-4">
                            <ul className="list-disc space-y-1 pl-4">
                              {item.notes.map((note) => (
                                <li key={note}>{note}</li>
                              ))}
                            </ul>
                          </Callout>
                        ) : null}
                        </>
                      ) : null}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </Section>

      <Section
        id="latihan"
        className="scroll-mt-24"
        title="Latihan"
        glyph="問"
        description="Periksa pemahamanmu lewat soal pilihan ganda atau latihan menyusun kalimat format JLPT."
        action={
          questions ? (
            <Button variant="ghost" size="sm" onClick={() => setQuestions(null)}>
              Tutup latihan
            </Button>
          ) : null
        }
      >
        {questions ? (
          <QuizRunner
            questions={questions}
            label={QUIZ_LABEL[quizMode]}
            onRestart={() => startQuiz(quizMode)}
            restartLabel="Soal baru"
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="flex flex-col">
              <CardBody className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span
                    lang="ja"
                    aria-hidden="true"
                    className="jp grid h-8 w-8 place-items-center rounded-md bg-surface-muted text-caption font-semibold text-fg-muted"
                  >
                    文
                  </span>
                  <CardTitle>Tebak pola</CardTitle>
                </div>
                <p className="text-sm leading-relaxed text-fg-muted">
                  Enam soal: pilih pola yang tepat untuk kalimat contohnya.
                </p>
                <Button
                  variant="outline"
                  size="lg"
                  block
                  className="mt-auto"
                  onClick={() => startQuiz("grammar")}
                  disabled={items.length === 0}
                >
                  Mulai latihan pola
                </Button>
              </CardBody>
            </Card>

            {hasOrderPractice ? (
              <Card className="flex flex-col border-level/30">
                <CardBody className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <span
                      lang="ja"
                      aria-hidden="true"
                      className="jp grid h-8 w-8 place-items-center rounded-md bg-level-soft text-caption font-semibold text-level"
                    >
                      組
                    </span>
                    <CardTitle>文の組み立て</CardTitle>
                  </div>
                  <p className="text-sm leading-relaxed text-fg-muted">
                    Susun empat potongan menjadi kalimat yang benar — tentukan kata di celah ★.
                  </p>
                  <Button
                    variant="level"
                    size="lg"
                    block
                    className="mt-auto"
                    onClick={() => startQuiz("order")}
                  >
                    Mulai 文の組み立て
                  </Button>
                </CardBody>
              </Card>
            ) : (
              <Card className="flex flex-col border-dashed">
                <CardBody className="flex flex-1 flex-col gap-2 p-4 sm:p-5">
                  <div className="flex items-center gap-2">
                    <span
                      lang="ja"
                      aria-hidden="true"
                      className="jp grid h-8 w-8 place-items-center rounded-md bg-surface-muted text-caption font-semibold text-fg-muted"
                    >
                      組
                    </span>
                    <CardTitle>文の組み立て</CardTitle>
                  </div>
                  <p className="text-sm leading-relaxed text-fg-muted">
                    Latihan menyusun kalimat belum tersedia untuk {meta.label}.
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        )}
      </Section>
    </div>
  );
}
