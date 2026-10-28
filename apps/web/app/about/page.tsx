import Link from "next/link";
import type { Metadata } from "next";
import { SOURCE_CREDITS } from "@manabi/content";
import { Badge, Card, CardContent } from "@manabi/ui";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Kredit data terbuka, lisensi, dan teknologi yang dipakai Manabi.",
};

const STACK = [
  { name: "Next.js 15 (App Router)", role: "Framework & routing" },
  { name: "React 19 + TypeScript", role: "UI & tipe aman" },
  { name: "Tailwind CSS 3", role: "Styling" },
  { name: "pnpm workspace", role: "Monorepo" },
  { name: "SM-2 SRS (paket @manabi/srs)", role: "Penjadwalan ulasan" },
  { name: "Web Speech API", role: "Pelafalan (TTS) di browser" },
  { name: "Supabase", role: "Rencana backend jangka panjang" },
  { name: "Vercel", role: "Rencana deployment" },
];

const ROADMAP = [
  { phase: "MVP (sekarang)", detail: "Kana, kanji N5, kosakata + SRS, tata bahasa, listening, reading, quiz, kamus" },
  { phase: "v0.2", detail: "Latihan menulis goresan (KanjiVG), auth akun, sinkron progres ke Supabase" },
  { phase: "v1.0", detail: "Materi N4–N3, jalur belajar personal, gamifikasi lengkap" },
  { phase: "v2.0", detail: "Speaking practice, komunitas, mode offline (PWA), AI tutor" },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl space-y-6 pb-6">
      <header>
        <Badge tone="sakura">Tentang</Badge>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-ink-900">
          Manabi (学び) — catatan proyek
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-500">
          Manabi adalah aplikasi belajar bahasa Jepang yang menyusun materi mengikuti silabus
          JLPT. Versi MVP ini sepenuhnya berjalan di browser: materi bersifat statis, progres
          belajar disimpan di localStorage, dan pelafalan memakai suara Jepang yang tersedia di
          OS/browser.
        </p>
      </header>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-ink-900">Sumber data & lisensi</h2>
          <p className="mt-1 text-xs text-ink-400">
            Semua data materi pada versi MVP ditulis ulang secara manual untuk keperluan demo.
            Saat dataset lengkap dipasang, sumber berikut wajib dicantumkan:
          </p>
          <ul className="mt-3 divide-y divide-ink-100">
            {SOURCE_CREDITS.map((credit) => (
              <li key={credit.name} className="flex flex-wrap items-baseline gap-x-2 py-2.5">
                <a
                  href={credit.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-ink-800 underline underline-offset-2 hover:text-sakura-700"
                >
                  {credit.name}
                </a>
                <span className="text-xs text-ink-500">{credit.usage}</span>
                <span className="ml-auto text-[11px] text-ink-400">{credit.license}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-ink-900">Teknologi</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {STACK.map((item) => (
              <div key={item.name} className="rounded-xl border border-ink-100 px-3 py-2">
                <p className="text-xs font-medium text-ink-800">{item.name}</p>
                <p className="text-[11px] text-ink-400">{item.role}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h2 className="text-sm font-semibold text-ink-900">Rencana pengembangan</h2>
          <ul className="mt-3 space-y-2">
            {ROADMAP.map((item) => (
              <li key={item.phase} className="flex gap-3 text-sm">
                <span className="w-28 shrink-0 text-xs font-medium text-sakura-600">
                  {item.phase}
                </span>
                <span className="text-ink-600">{item.detail}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href="/" className="text-sm text-sakura-600 underline underline-offset-2">
          ← Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}
