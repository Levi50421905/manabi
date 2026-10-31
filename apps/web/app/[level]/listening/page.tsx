"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  availableLevels,
  levelHref,
  levelMeta,
  listeningByLevel,
  listeningQuestions,
} from "@manabi/content";
import type { ListeningTrack } from "@manabi/content";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  EmptyState,
  IconButton,
  PageHeader,
  Pill,
  SegmentedControl,
  cn,
  type SegmentedOption,
} from "@manabi/ui";
import { useActiveLevel } from "@/lib/level";
import { usePrefs } from "@/lib/prefs";
import { recordStudy } from "@/lib/store";
import {
  createUtterance,
  isSpeechSupported,
  stopSpeaking,
  totalVoiceCount,
  watchJapaneseVoices,
} from "@/lib/tts";
import { LINE_TRANSLATIONS } from "./line-translations";

type TrackLine = ListeningTrack["lines"][number];

const RATES: Array<SegmentedOption<number>> = [
  { value: 0.7, label: "0.7×" },
  { value: 0.9, label: "0.9×" },
  { value: 1.1, label: "1.1×" },
];

const OUTLINE_LINK =
  "inline-flex h-11 items-center gap-1.5 rounded-lg border border-border-strong bg-surface px-4 text-sm font-medium text-fg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

function PlayIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6 4.5v11l9-5.5-9-5.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <rect x="5.5" y="5.5" width="9" height="9" rx="1.5" />
    </svg>
  );
}

export default function ListeningPage() {
  const { level } = useActiveLevel();
  const [prefs, setPrefs] = usePrefs();
  const rate = prefs.ttsRate;

  const items = useMemo(() => listeningByLevel(level), [level]);
  const meta = levelMeta(level);

  const [activeId, setActiveId] = useState("");
  const [showKana, setShowKana] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [supported, setSupported] = useState(true);
  /**
   * Status voice Jepang. `settled` penting: selama daftar voice belum termuat
   * (Chrome mengosongkannya di awal) UI tidak boleh menyimpulkan bahwa voice
   * tidak tersedia — kalau salah, tombol jadi mati padahal voice-nya ada.
   */
  const [voiceCount, setVoiceCount] = useState(0);
  const [voicesSettled, setVoicesSettled] = useState(false);
  const [probeKey, setProbeKey] = useState(0);
  /**
   * Pesan kegagalan dari Web Speech API. Tanpa ini, pemutaran yang diblokir
   * browser tampak seperti tombol rusak (tidak ada suara, tidak ada penjelasan).
   */
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [playingLine, setPlayingLine] = useState<string | null>(null);
  const [playingAll, setPlayingAll] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const runRef = useRef(0);
  const playerRef = useRef<HTMLDivElement | null>(null);

  const track = items.find((item) => item.id === activeId) ?? items[0];
  const speakerNames = useMemo(
    () => (track ? Array.from(new Set(track.lines.map((line) => line.speaker))) : []),
    [track],
  );
  const questions = useMemo(
    () => (track ? (listeningQuestions[track.id] ?? []) : []),
    [track],
  );
  const fallbackLevel = availableLevels[0] ?? level;

  const speakerIndexOf = (name: string) => Math.max(0, speakerNames.indexOf(name));
  /**
   * Bisa memutar suara selama browser mendukung. Selama deteksi voice belum
   * selesai tombol sengaja tetap aktif; hanya setelah dipastikan tidak ada
   * voice Jepang tombol dimatikan (dengan penjelasan di layar).
   */
  const canPlay = supported && (voiceCount > 0 || !voicesSettled);

  useEffect(() => {
    setSupported(isSpeechSupported());
    const unwatch = watchJapaneseVoices(({ voices, settled }) => {
      setVoiceCount(voices.length);
      setVoicesSettled(settled);
    });
    return () => {
      unwatch();
      stopSpeaking();
    };
  }, [probeKey]);

  // Hentikan suara saat dialog berganti supaya tidak ada dua track bersahutan.
  useEffect(() => {
    runRef.current += 1;
    stopSpeaking();
    setPlayingLine(null);
    setPlayingAll(false);
  }, [track?.id]);

  function stopAll() {
    runRef.current += 1;
    stopSpeaking();
    setPlayingLine(null);
    setPlayingAll(false);
  }

  function playAll() {
    if (!track || !isSpeechSupported()) return;

    const synth = window.speechSynthesis;
    synth.cancel();
    setPlaybackError(null);
    recordStudy("listening");

    const run = runRef.current + 1;
    runRef.current = run;
    setPlayingAll(true);

    const lines = track.lines;
    const names = speakerNames;
    let cursor = 0;

    const playNext = () => {
      if (runRef.current !== run) return;
      if (cursor >= lines.length) {
        setPlayingLine(null);
        setPlayingAll(false);
        return;
      }
      const line = lines[cursor];
      cursor += 1;
      setPlayingLine(line.id);
      const utterance = createUtterance(
        line.jp,
        rate,
        Math.max(0, names.indexOf(line.speaker)),
      );
      if (!utterance) {
        setPlayingLine(null);
        setPlayingAll(false);
        return;
      }
      utterance.onend = playNext;
      utterance.onerror = (event) => {
        setPlaybackError(event.error);
        setPlayingLine(null);
        setPlayingAll(false);
      };
      synth.speak(utterance);
    };

    playNext();
  }

  function playLine(line: TrackLine) {
    if (!isSpeechSupported()) return;

    const synth = window.speechSynthesis;
    synth.cancel();
    setPlaybackError(null);

    const run = runRef.current + 1;
    runRef.current = run;
    setPlayingAll(false);
    setPlayingLine(line.id);

    const utterance = createUtterance(line.jp, rate, speakerIndexOf(line.speaker));
    if (!utterance) return;
    utterance.onend = () => {
      if (runRef.current === run) setPlayingLine(null);
    };
    synth.speak(utterance);
  }

  function selectTrack(id: string) {
    setActiveId(id);
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 1023px)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    playerRef.current?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
  }

  const header = (
    <PageHeader
      eyebrow={
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="level" mono>
            {meta.label}
          </Badge>
          <span className="label-micro">Mendengar</span>
        </div>
      }
      title="Mendengar"
      japanese="聴解"
      description={`${items.length} dialog ${meta.label} sehari-hari. Pelafalan memakai suara Jepang bawaan browser/OS-mu.`}
      actions={
        <Link href={levelHref(level, "grammar")} className={OUTLINE_LINK}>
          <span aria-hidden="true">←</span>
          Tata Bahasa
        </Link>
      }
    />
  );

  if (items.length === 0 || !track) {
    return (
      <div className="space-y-8 md:space-y-10">
        {header}
        <EmptyState
          glyph="聴"
          title={`Dialog ${meta.label} belum tersedia`}
          description={`Materi mendengar level ${meta.name} sedang disusun. Sementara ini kamu bisa berlatih dengan dialog dasar di level ${levelMeta(fallbackLevel).label}.`}
          action={
            <Link href={levelHref(fallbackLevel, "listening")} className={OUTLINE_LINK}>
              Ke Mendengar {levelMeta(fallbackLevel).label}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 md:space-y-10">
      {header}

      {!supported ? (
        <Callout tone="warning" title="Browser ini tidak bisa memutar suara">
          Browser ini tidak mendukung Web Speech API. Teks dialog, kana, dan terjemahan tetap bisa
          dibaca, tetapi tombol pemutaran dinonaktifkan.
        </Callout>
      ) : voicesSettled && voiceCount === 0 ? (
        <Callout tone="warning" title="Perangkat ini belum punya voice Jepang">
          <p>
            Manabi memakai suara bawaan perangkat, dan saat ini belum ada voice bahasa Jepang yang
            terpasang. Tombol pemutaran belum bisa berbunyi, tetapi kana dan terjemahan tetap
            tersedia.
          </p>
          <p className="mt-2 font-medium text-fg">Cara memasang voice Jepang:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5">
            <li>
              <strong>Windows</strong> — Settings → Time &amp; Language → Speech → Add voices →
              Japanese
            </li>
            <li>
              <strong>macOS</strong> — System Settings → Accessibility → Spoken Content → System
              Voice → Manage Voices → Japanese
            </li>
            <li>
              <strong>Android</strong> — Settings → Language &amp; input → Text-to-speech → install
              Japanese voice data
            </li>
            <li>
              <strong>iOS</strong> — Settings → Accessibility → Spoken Content → Voices → Japanese
            </li>
            <li>
              <strong>Chrome desktop</strong> — biasanya sudah membawa “Google 日本語” (butuh
              internet)
            </li>
          </ul>
          <p className="mt-2">Setelah dipasang, klik “Cek ulang” di bawah.</p>
          <p className="mt-2 text-caption text-fg-subtle">
            Terdeteksi {totalVoiceCount()} voice di browser ini, tidak ada yang berbahasa Jepang.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setProbeKey((value) => value + 1)}
          >
            Cek ulang
          </Button>
        </Callout>
      ) : voiceCount === 1 ? (
        <Callout tone="info" title="Satu voice Jepang terdeteksi">
          Semua pembicara memakai voice yang sama; giliran bicara dibedakan lewat nada. Untuk suara
          laki-laki dan perempuan terpisah, pasang voice Jepang tambahan di pengaturan sistem.
        </Callout>
      ) : null}

      {playbackError ? (
        <Callout tone="warning" title="Suara tidak bisa diputar">
          {playbackError === "not-allowed"
            ? "Browser memblokir pemutaran otomatis. Klik sekali lagi pada tombol putar — biasanya suara langsung jalan setelah itu."
            : `Terjadi kesalahan saat memutar suara (${playbackError}). Coba lagi, atau periksa volume perangkat.`}
        </Callout>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(260px,300px)_minmax(0,1fr)] lg:items-start">
        {/* ---------- daftar dialog ---------- */}
        <section
          aria-label="Daftar dialog"
          className="order-2 min-w-0 lg:order-1"
        >
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-h2 font-semibold tracking-tight text-fg">Dialog</h2>
            <span className="tnum text-caption text-fg-muted">{items.length} pilihan</span>
          </div>

          <ul className="space-y-2">
            {items.map((item) => {
              const active = item.id === track.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => selectTrack(item.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "w-full rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
                      active
                        ? "border-level/40 bg-level-soft"
                        : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted/60",
                    )}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span
                        lang="ja"
                        className="jp-serif min-w-0 text-sm font-semibold leading-snug text-fg"
                      >
                        {item.title}
                      </span>
                      <Badge tone={active ? "level" : "neutral"} mono>
                        {item.level}
                      </Badge>
                    </span>
                    <span className="mt-1.5 block text-caption leading-relaxed text-fg-muted">
                      {item.description}
                    </span>
                    <span className="tnum mt-2 block text-caption text-fg-subtle">
                      {item.lines.length} baris dialog
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* ---------- pemutar ---------- */}
        <div ref={playerRef} className="order-1 min-w-0 scroll-mt-20 lg:order-2">
          <Card className="overflow-hidden">
            <CardHeader className="p-4 sm:px-5">
              <div className="min-w-0">
                <p className="label-micro mb-1">Dialog · {track.level}</p>
                <h2
                  lang="ja"
                  className="font-jp-serif text-h2 font-semibold leading-tight text-fg"
                >
                  {track.title}
                </h2>
                <p className="mt-1 max-w-[62ch] text-sm leading-relaxed text-fg-muted">
                  {track.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="level" size="lg" onClick={playAll} disabled={!canPlay}>
                  <PlayIcon />
                  {playingAll ? "Memutar…" : "Putar semua"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={stopAll}
                  disabled={!canPlay || (!playingAll && !playingLine)}
                >
                  Stop
                </Button>
              </div>
            </CardHeader>

            <CardBody className="p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-border bg-surface-muted/60 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="label-micro">Kecepatan</span>
                  <SegmentedControl
                    ariaLabel="Kecepatan suara"
                    size="sm"
                    options={RATES}
                    value={rate}
                    onChange={(value) => setPrefs({ ttsRate: value })}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Pill active={showKana} onClick={() => setShowKana((value) => !value)}>
                    Kana
                  </Pill>
                  <Pill
                    active={showTranslation}
                    onClick={() => setShowTranslation((value) => !value)}
                  >
                    Terjemahan
                  </Pill>
                </div>
              </div>

              <ol className="mt-4 space-y-2">
                {track.lines.map((line, index) => {
                  const isPlaying = playingLine === line.id;
                  const translation = LINE_TRANSLATIONS[track.id]?.[index];
                  return (
                    <li
                      key={line.id}
                      aria-current={isPlaying ? "true" : undefined}
                      className={cn(
                        "rounded-xl border px-3.5 py-3 transition-colors",
                        isPlaying
                          ? "border-level/50 bg-level-soft"
                          : "border-border bg-surface",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="flex flex-wrap items-center gap-2 text-caption font-semibold text-fg-muted">
                            <span lang="ja" className="jp">
                              {line.speaker}
                            </span>
                            {isPlaying ? (
                              <span className="label-micro text-level">Memutar</span>
                            ) : null}
                          </p>
                          <p lang="ja" className="jp mt-1 text-base leading-relaxed text-fg">
                            {line.jp}
                          </p>
                          {showKana && line.kana ? (
                            <p
                              lang="ja"
                              className="jp mt-1 text-sm leading-relaxed text-fg-muted"
                            >
                              {line.kana}
                            </p>
                          ) : null}
                          {showTranslation && translation ? (
                            <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                              {translation}
                            </p>
                          ) : null}
                        </div>
                        <IconButton
                          size="sm"
                          variant="outline"
                          disabled={!canPlay}
                          aria-label={
                            isPlaying
                              ? `Hentikan baris ${index + 1}`
                              : `Putar baris ${index + 1} — ${line.speaker}`
                          }
                          onClick={() => (isPlaying ? stopAll() : playLine(line))}
                          className={cn(
                            "min-h-11 min-w-11 shrink-0 sm:min-h-0 sm:min-w-0",
                            isPlaying && "border-level text-level",
                          )}
                        >
                          {isPlaying ? <StopIcon /> : <PlayIcon />}
                        </IconButton>
                      </div>
                    </li>
                  );
                })}
              </ol>

              {questions.length > 0 ? (
                <div className="mt-5 border-t border-border pt-4">
                  <h3 className="text-h3 font-semibold text-fg">Soal pemahaman</h3>
                  <p className="mt-1 text-sm leading-relaxed text-fg-muted">
                    Coba putar dialog tanpa melihat teks, lalu jawab pertanyaan berikut.
                  </p>

                  <div className="mt-4 space-y-4">
                    {questions.map((question) => {
                      const selected = answers[question.id];
                      const isChecked = checked[question.id] === true;
                      const isCorrect = selected === question.answer;

                      return (
                        <div
                          key={question.id}
                          className="rounded-lg border border-border bg-surface p-3.5 sm:p-4"
                        >
                          <p className="text-body font-medium leading-relaxed text-fg">
                            {question.prompt}
                          </p>

                          <div
                            role="group"
                            aria-label={question.prompt}
                            className="mt-2.5 grid gap-2 sm:grid-cols-2"
                          >
                            {question.options.map((option, optionIndex) => {
                              const picked = selected === optionIndex;
                              const showCorrect = isChecked && optionIndex === question.answer;
                              const showWrong =
                                isChecked && picked && optionIndex !== question.answer;

                              return (
                                <button
                                  key={`${question.id}-${optionIndex}`}
                                  type="button"
                                  lang="ja"
                                  disabled={isChecked}
                                  aria-pressed={picked}
                                  onClick={() =>
                                    setAnswers((prev) => ({
                                      ...prev,
                                      [question.id]: optionIndex,
                                    }))
                                  }
                                  className={cn(
                                    "jp flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-base leading-relaxed transition-colors disabled:cursor-default",
                                    "border-border bg-surface text-fg hover:border-accent/40",
                                    picked && !isChecked && "border-accent bg-accent-soft",
                                    showCorrect && "border-success bg-success-soft text-success",
                                    showWrong && "border-danger bg-danger-soft text-danger",
                                  )}
                                >
                                  <span>{option}</span>
                                  {showCorrect ? <span aria-hidden="true">✓</span> : null}
                                  {showWrong ? <span aria-hidden="true">✕</span> : null}
                                </button>
                              );
                            })}
                          </div>

                          {!isChecked ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2.5"
                              disabled={selected === undefined}
                              onClick={() =>
                                setChecked((prev) => ({ ...prev, [question.id]: true }))
                              }
                            >
                              Periksa jawaban
                            </Button>
                          ) : null}

                          <div aria-live="polite" className="mt-2 text-sm leading-relaxed">
                            {isChecked ? (
                              <p
                                className={cn(
                                  "font-medium",
                                  isCorrect ? "text-success" : "text-danger",
                                )}
                              >
                                {isCorrect ? "Benar! " : "Belum tepat. "}
                                <span className="font-normal text-fg-muted">
                                  {question.explanation}
                                </span>
                              </p>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </CardBody>

            <CardFooter className="justify-between gap-3 p-4 sm:px-5">
              <p className="max-w-[62ch] text-caption leading-relaxed text-fg-subtle">
                Memutar semua otomatis mencatat sesi mendengar (+3 XP, sekali per hari).
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => recordStudy("listening")}
                className="shrink-0"
              >
                Tandai sudah didengarkan
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
