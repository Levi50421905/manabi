"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardBody,
  PageHeader,
  ProgressBar,
  Section,
  SegmentedControl,
  StatTile,
} from "@manabi/ui";
import { currentStreak, dayKey, resetProgress, useProgress } from "@/lib/store";
import { resetPrefs, usePrefs, type Theme } from "@/lib/prefs";
import { speak, voiceStatus, type VoiceStatus } from "@/lib/tts";

/* ------------------------------------------------------------------ *
 * Pilihan
 * ------------------------------------------------------------------ */

const THEMES: Array<{ value: Theme; label: string; glyph: string }> = [
  { value: "light", label: "Terang", glyph: "☀" },
  { value: "dark", label: "Gelap", glyph: "☾" },
  { value: "system", label: "Sistem", glyph: "⚙" },
];

const THEME_HINT: Record<Theme, string> = {
  light: "Selalu terang — nyaman untuk ruangan bercahaya.",
  dark: "Selalu gelap — nyaman untuk belajar malam hari.",
  system: "Mengikuti tema terang/gelap sistem operasi dan berubah otomatis.",
};

const GOALS: number[] = [10, 20, 30, 50, 100];

const RATES: Array<{ value: number; label: string }> = [
  { value: 0.7, label: "Lambat" },
  { value: 0.9, label: "Normal" },
  { value: 1.1, label: "Cepat" },
];

const FURIGANA_OPTIONS: Array<{ value: "on" | "off"; label: string }> = [
  { value: "on", label: "Tampilkan" },
  { value: "off", label: "Sembunyikan" },
];

const SAMPLE_SENTENCE = "こんにちは。まなびで日本語を勉強しましょう。";

/* ------------------------------------------------------------------ *
 * Halaman
 * ------------------------------------------------------------------ */

export default function SettingsPage() {
  const progress = useProgress();
  const [prefs, setPrefs] = usePrefs();
  const [notice, setNotice] = useState<string | null>(null);
  const [voice, setVoice] = useState<VoiceStatus | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Status voice hanya bisa dibaca di browser — jangan saat render server.
  useEffect(() => {
    setVoice(voiceStatus());
  }, []);

  const todayActions = progress.activity[dayKey()] ?? 0;
  const goalReached = todayActions >= prefs.dailyGoal;
  const streak = currentStreak(progress);
  const voiceUnavailable = voice === "unsupported" || voice === "missing";

  function handleTryVoice() {
    setSpeechError(null);
    const played = speak(SAMPLE_SENTENCE, { rate: prefs.ttsRate });
    if (!played) {
      setSpeechError("Pelafalan tidak bisa diputar di browser ini. Coba browser lain atau aktifkan suara Jepang di sistem.");
    }
  }

  function handleResetPrefs() {
    const confirmed = window.confirm(
      "Kembalikan tema, target harian, kecepatan suara, furigana, dan level terakhir ke pengaturan awal?",
    );
    if (!confirmed) return;
    resetPrefs();
    setNotice("Pengaturan sudah dikembalikan ke awal. Progres belajar tidak disentuh.");
  }

  function handleResetProgress() {
    const confirmed = window.confirm(
      "Hapus SEMUA progres belajar? XP, streak, jadwal SRS, dan riwayat latihan akan hilang dan tidak bisa dikembalikan.",
    );
    if (!confirmed) return;
    resetProgress();
    setNotice("Progres belajar sudah dihapus dari browser ini. Preferensi tetap tersimpan.");
  }

  return (
    <div className="max-w-3xl space-y-8 pb-10 md:space-y-10">
      <PageHeader
        title="Pengaturan"
        japanese="設定"
        eyebrow={<span className="label-micro">Pengaturan</span>}
        description="Tema, target belajar, suara, dan data. Semuanya tersimpan di browser ini saja — tidak ada akun dan tidak ada data yang dikirim ke server."
      />

      {/* ---------- Tampilan ---------- */}
      <Section
        glyph="表"
        title="Tampilan"
        description="Warna aplikasi. Pilihan diterapkan langsung dan diingat untuk kunjungan berikutnya."
      >
        <Card>
          <CardBody className="space-y-3">
            <SegmentedControl
              block
              ariaLabel="Pilih tema"
              value={prefs.theme}
              onChange={(theme) => setPrefs({ theme })}
              options={THEMES}
            />
            <p className="text-caption leading-relaxed text-fg-muted">{THEME_HINT[prefs.theme]}</p>
          </CardBody>
        </Card>
      </Section>

      {/* ---------- Belajar ---------- */}
      <Section
        glyph="学"
        title="Belajar"
        description="Ritme harian dan cara teks Jepang ditampilkan saat membaca."
      >
        <Card>
          <CardBody className="space-y-5">
            <div>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-fg">Target harian</p>
                  <p className="mt-0.5 text-caption leading-relaxed text-fg-muted">
                    Jumlah aksi belajar per hari: review kartu, kuis, dan bacaan.
                  </p>
                </div>
                <Badge tone={goalReached ? "success" : "level"} mono>
                  {todayActions}/{prefs.dailyGoal}
                </Badge>
              </div>

              <SegmentedControl
                block
                className="mt-3"
                ariaLabel="Target harian"
                value={prefs.dailyGoal}
                onChange={(dailyGoal) => setPrefs({ dailyGoal })}
                options={GOALS.map((goal) => ({ value: goal, label: String(goal) }))}
              />

              <ProgressBar
                className="mt-4"
                value={Math.min(todayActions, prefs.dailyGoal)}
                max={prefs.dailyGoal}
                tone={goalReached ? "success" : "level"}
                label="Progres hari ini"
                showValue
              />
              <p className="mt-2 text-caption leading-relaxed text-fg-muted">
                {goalReached
                  ? "Target hari ini tercapai. Pertahankan ritmenya besok."
                  : `Kurang ${prefs.dailyGoal - todayActions} aksi lagi untuk mencapai target hari ini.`}
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-fg">Furigana</p>
                <p className="mt-0.5 text-caption leading-relaxed text-fg-muted">
                  Tampilkan bacaan kana di atas kanji saat membaca. Masih bisa diubah per bacaan.
                </p>
              </div>
              <SegmentedControl
                ariaLabel="Tampilkan furigana"
                value={prefs.furigana ? "on" : "off"}
                onChange={(value) => setPrefs({ furigana: value === "on" })}
                options={FURIGANA_OPTIONS}
              />
            </div>
          </CardBody>
        </Card>
      </Section>

      {/* ---------- Suara ---------- */}
      <Section
        glyph="音"
        title="Suara"
        description="Pelafalan memakai Web Speech API — suara Jepang yang tersedia di perangkat Anda."
      >
        <Card>
          <CardBody className="space-y-5">
            <div>
              <p className="text-sm font-medium text-fg">Kecepatan pelafalan</p>
              <SegmentedControl
                block
                className="mt-2"
                ariaLabel="Kecepatan pelafalan"
                value={prefs.ttsRate}
                onChange={(ttsRate) => setPrefs({ ttsRate })}
                options={RATES}
              />
            </div>

            <div className="border-t border-border pt-5">
              <p className="label-micro">Coba suara</p>
              <p lang="ja" className="mt-2 font-jp text-base leading-relaxed text-fg">
                {SAMPLE_SENTENCE}
              </p>
              <p className="mt-1 text-caption text-fg-muted">
                “Halo. Ayo belajar bahasa Jepang bersama Manabi.”
              </p>
              <Button
                className="mt-3"
                variant="outline"
                onClick={handleTryVoice}
                disabled={voiceUnavailable}
              >
                Putar contoh dengan kecepatan ini
              </Button>
              <div role="status" aria-live="polite" className="mt-2 min-h-5">
                {speechError ? (
                  <p className="text-caption leading-relaxed text-danger">{speechError}</p>
                ) : null}
              </div>
            </div>

            {voice === "missing" ? (
              <Callout tone="warning" title="Suara Jepang belum tersedia">
                Browser berjalan normal, tetapi perangkat ini belum punya voice <code>ja-JP</code>.
                Tambahkan suara Jepang di pengaturan sistem (Windows, macOS, atau Android), lalu
                muat ulang halaman.
              </Callout>
            ) : voice === "unsupported" ? (
              <Callout tone="warning" title="Browser tidak mendukung TTS">
                Web Speech API tidak tersedia di browser ini. Pelafalan tetap bisa dilatih lewat
                modul Mendengar yang menyediakan teks dialog.
              </Callout>
            ) : (
              <p className="text-caption leading-relaxed text-fg-subtle">
                Kecepatan ini berlaku untuk semua tombol pelafalan dan latihan mendengar.
              </p>
            )}
          </CardBody>
        </Card>
      </Section>

      {/* ---------- Data ---------- */}
      <Section
        glyph="記"
        title="Data"
        description="Ringkasan progres dan kontrol untuk menghapus data di browser ini."
      >
        <Card>
          <CardBody className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <StatTile label="Total XP" value={progress.xp} unit="XP" glyph="点" />
              <StatTile
                label="Streak"
                value={streak}
                unit="hari"
                glyph="続"
                hint={streak > 0 ? "Jaga api tetap menyala." : "Belajar hari ini untuk memulai streak."}
              />
              <StatTile label="Kartu diulas" value={Object.keys(progress.cards).length} glyph="札" />
              <StatTile label="Riwayat latihan" value={progress.quizzes.length} glyph="問" />
            </div>

            <div className="rounded-lg border border-border bg-surface-muted px-3.5 py-3">
              <p className="label-micro">Penyimpanan lokal</p>
              <ul className="mt-1.5 space-y-1 text-caption leading-relaxed text-fg-muted">
                <li>
                  <code className="rounded bg-surface px-1 py-0.5 text-fg">manabi:v1:progress</code>{" "}
                  — XP, streak, kartu SRS, dan riwayat latihan.
                </li>
                <li>
                  <code className="rounded bg-surface px-1 py-0.5 text-fg">manabi:v1:prefs</code> —
                  tema, target harian, kecepatan suara, furigana, dan level terakhir.
                </li>
              </ul>
              <p className="mt-2 text-caption leading-relaxed text-fg-subtle">
                Menghapus data situs di browser akan menghapus keduanya. Tidak ada salinan di
                server.
              </p>
            </div>

            <Callout tone="warning" title="Reset bersifat permanen">
              Reset pengaturan hanya mengubah preferensi. Menghapus progres belajar tidak bisa
              dibatalkan dan tidak menyentuh preferensi.
            </Callout>

            <div role="status" aria-live="polite" className="min-h-5">
              {notice ? (
                <p className="text-caption font-medium leading-relaxed text-success">{notice}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" onClick={handleResetPrefs}>
                Kembalikan pengaturan awal
              </Button>
              <Button variant="danger" onClick={handleResetProgress}>
                Hapus progres belajar
              </Button>
            </div>
          </CardBody>
        </Card>
      </Section>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-5 text-caption text-fg-muted">
        <Link href="/dashboard" className="transition-colors hover:text-fg">
          ← Kembali ke dasbor
        </Link>
        <Link href="/about" className="transition-colors hover:text-fg">
          Kredit data &amp; lisensi
        </Link>
      </footer>
    </div>
  );
}
