"use client";

import Link from "next/link";
import { Badge, Button, Card, CardContent, ProgressBar, cn } from "@manabi/ui";
import { dayKey, resetProgress, useProgress } from "@/lib/store";
import { resetPrefs, type Theme, usePrefs } from "@/lib/prefs";

const THEMES: Array<{ key: Theme; label: string; glyph: string }> = [
  { key: "light", label: "Terang", glyph: "☀" },
  { key: "dark", label: "Gelap", glyph: "☾" },
  { key: "system", label: "Ikuti sistem", glyph: "⚙" },
];

const GOALS = [10, 20, 30, 50, 100];
const RATES = [
  { value: 0.7, label: "Lambat" },
  { value: 0.9, label: "Normal" },
  { value: 1.1, label: "Cepat" },
];

export default function SettingsPage() {
  const progress = useProgress();
  const [prefs, setPrefs] = usePrefs();

  const today = dayKey();
  const todayActions = progress.activity[today] ?? 0;
  const goalReached = todayActions >= prefs.dailyGoal;

  return (
    <div className="max-w-2xl space-y-5 pb-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900">Pengaturan</h1>
        <p className="mt-1 text-sm text-ink-500">
          Tersimpan di browser ini saja — tidak dikirim ke server mana pun.
        </p>
      </header>

      {/* ---------- Tampilan ---------- */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-ink-900">Tampilan</h2>
          <p className="mt-1 text-xs text-ink-400">Pilih tema terang, gelap, atau ikuti pengaturan OS.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.key}
                type="button"
                onClick={() => setPrefs({ theme: theme.key })}
                aria-pressed={prefs.theme === theme.key}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border px-3 py-3 text-xs transition-colors",
                  prefs.theme === theme.key
                    ? "border-sakura-400 bg-sakura-50 text-sakura-700"
                    : "border-ink-200 text-ink-500 hover:border-sakura-200",
                )}
              >
                <span className="text-lg" aria-hidden="true">
                  {theme.glyph}
                </span>
                {theme.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ---------- Target harian ---------- */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-ink-900">Target harian</h2>
              <p className="mt-1 text-xs text-ink-400">
                Jumlah aksi belajar per hari (review kartu, quiz, membaca).
              </p>
            </div>
            <Badge tone={goalReached ? "matcha" : "sakura"}>
              {todayActions}/{prefs.dailyGoal}
            </Badge>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            {GOALS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => setPrefs({ dailyGoal: goal })}
                aria-pressed={prefs.dailyGoal === goal}
                className={cn(
                  "rounded-lg border px-2 py-2 text-sm transition-colors",
                  prefs.dailyGoal === goal
                    ? "border-sakura-400 bg-sakura-50 font-semibold text-sakura-700"
                    : "border-ink-200 text-ink-500 hover:border-sakura-200",
                )}
              >
                {goal}
              </button>
            ))}
          </div>

          <ProgressBar
            className="mt-4"
            value={Math.min(todayActions, prefs.dailyGoal)}
            max={prefs.dailyGoal}
            tone={goalReached ? "matcha" : "sakura"}
          />
          <p className="mt-2 text-xs text-ink-400">
            {goalReached
              ? "Target hari ini tercapai. お疲れ様！"
              : `Kurang ${prefs.dailyGoal - todayActions} aksi lagi untuk mencapai target hari ini.`}
          </p>
        </CardContent>
      </Card>

      {/* ---------- Suara & furigana ---------- */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-ink-900">Suara & bacaan</h2>

          <div className="mt-3">
            <p className="text-xs font-medium text-ink-600">Kecepatan pelafalan</p>
            <div className="mt-2 flex gap-2">
              {RATES.map((rate) => (
                <button
                  key={rate.value}
                  type="button"
                  onClick={() => setPrefs({ ttsRate: rate.value })}
                  aria-pressed={prefs.ttsRate === rate.value}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs transition-colors",
                    prefs.ttsRate === rate.value
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 text-ink-500 hover:border-ink-300",
                  )}
                >
                  {rate.label}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-4 flex items-start gap-2 text-xs text-ink-600">
            <input
              type="checkbox"
              checked={prefs.furigana}
              onChange={(event) => setPrefs({ furigana: event.target.checked })}
              className="mt-0.5 accent-sakura-600"
            />
            <span>
              Tampilkan furigana secara default di halaman Membaca
              <span className="mt-0.5 block text-[11px] text-ink-400">
                Kamu tetap bisa mengubahnya per bacaan.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      {/* ---------- Data ---------- */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-ink-900">Data</h2>
          <dl className="mt-3 space-y-1.5 text-xs text-ink-500">
            <div className="flex justify-between gap-3">
              <dt>Total XP</dt>
              <dd className="font-medium text-ink-800">{progress.xp}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Kartu pernah diulas</dt>
              <dd className="font-medium text-ink-800">{Object.keys(progress.cards).length}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Riwayat latihan</dt>
              <dd className="font-medium text-ink-800">{progress.quizzes.length}</dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (window.confirm("Kembalikan tampilan & target ke pengaturan awal?")) {
                  resetPrefs();
                }
              }}
            >
              Reset pengaturan
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (
                  window.confirm(
                    "Hapus SEMUA progres belajar (XP, streak, jadwal SRS, riwayat quiz)?",
                  )
                ) {
                  resetProgress();
                }
              }}
            >
              Hapus progres belajar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3 text-xs text-ink-400">
        <Link href="/dashboard" className="underline underline-offset-2 hover:text-ink-600">
          ← Kembali ke dasbor
        </Link>
        <Link href="/about" className="underline underline-offset-2 hover:text-ink-600">
          Kredit & lisensi
        </Link>
      </div>
    </div>
  );
}
