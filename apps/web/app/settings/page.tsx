"use client";

import Link from "next/link";
import { Badge, Button, Card, CardContent, PageHeader, ProgressBar, SegmentedControl } from "@manabi/ui";
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
      <PageHeader
        title="Pengaturan"
        description="Tersimpan di browser ini saja — tidak dikirim ke server mana pun."
      />

      {/* ---------- Tampilan ---------- */}
      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-ink-900">Tampilan</h2>
          <p className="mt-1 text-xs text-ink-400">Pilih tema terang, gelap, atau ikuti pengaturan OS.</p>
          <SegmentedControl
            className="mt-3"
            ariaLabel="Pilih tema"
            value={prefs.theme}
            onChange={(theme) => setPrefs({ theme })}
            options={THEMES.map((theme) => ({
              value: theme.key,
              label: theme.label,
              glyph: theme.glyph,
            }))}
          />
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

          <SegmentedControl
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
            <SegmentedControl
              className="mt-2"
              ariaLabel="Kecepatan pelafalan"
              value={prefs.ttsRate}
              onChange={(ttsRate) => setPrefs({ ttsRate })}
              options={RATES.map((rate) => ({ value: rate.value, label: rate.label }))}
            />
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
