import type { Metadata } from "next";
import Link from "next/link";
import { Badge, Button } from "@manabi/ui";
import {
  LEVEL_META,
  LEVEL_ORDER,
  availableLevels,
  contentCountByLevel,
  grammar,
  kana,
  kanji,
  levelHref,
  vocab,
} from "@manabi/content";

export const metadata: Metadata = {
  title: "Manabi — Belajar bahasa Jepang terstruktur",
  description:
    "Kana, kanji, kosakata dengan spaced repetition, tata bahasa, listening, membaca, dan simulasi ujian JLPT — satu jalur belajar per level dari N5 sampai N1.",
};

const MODULES = [
  {
    glyph: "あ",
    title: "Kana",
    description: "Hiragana & katakana lengkap dengan kuis dua arah.",
    path: "kana",
  },
  {
    glyph: "書",
    title: "Menulis",
    description: "Latihan menggores di kanvas dengan garis bantu genkō yōshi.",
    path: "write",
  },
  {
    glyph: "語",
    title: "Kosakata",
    description: "Flashcard spaced repetition — ulasan muncul tepat saat hampir lupa.",
    path: "vocab",
  },
  {
    glyph: "漢",
    title: "Kanji",
    description: "Bacaan, radikal, goresan, dan jembatan ingatan.",
    path: "kanji",
  },
  {
    glyph: "文",
    title: "Tata Bahasa",
    description: "Pola kalimat dengan penjelasan dan contoh yang bisa diputar.",
    path: "grammar",
  },
  {
    glyph: "聴",
    title: "Mendengar",
    description: "Dialog sehari-hari dengan kecepatan yang bisa diatur.",
    path: "listening",
  },
  {
    glyph: "読",
    title: "Membaca",
    description: "Bacaan pendek berfurigana plus pertanyaan pemahaman.",
    path: "reading",
  },
  {
    glyph: "問",
    title: "Latihan & Ujian",
    description: "Kuis campuran dan simulasi JLPT dengan pembahasan.",
    path: "quiz",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Kenali hurufnya",
    body: "Mulai dari hiragana & katakana sampai lancar membaca tanpa romaji.",
  },
  {
    number: "02",
    title: "Bangun kosakata",
    body: "Hafalkan kata lewat flashcard, lalu biarkan SRS mengatur ulangannya.",
  },
  {
    number: "03",
    title: "Pakai dalam kalimat",
    body: "Latih tata bahasa, mendengar, dan membaca dalam konteks nyata.",
  },
];

function format(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function HomePage() {
  const counts = [
    { label: "Huruf kana", value: format(kana.length) },
    { label: "Kanji N5", value: format(kanji.length) },
    { label: "Kosakata N5", value: format(vocab.length) },
    { label: "Pola tata bahasa", value: format(grammar.length) },
  ];

  const n5 = contentCountByLevel("N5");

  return (
    <div className="min-h-screen bg-paper">
      {/* ---------- Nav atas ---------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              lang="ja"
              className="jp-serif grid h-9 w-9 place-items-center rounded-lg bg-fg text-base font-semibold leading-none text-paper"
            >
              学
            </span>
            <span>
              <span className="block font-display text-base font-semibold leading-tight tracking-tight text-fg">
                Manabi
              </span>
              <span className="block text-caption leading-tight text-fg-subtle">
                学び · belajar Jepang
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-fg-muted md:flex" aria-label="Navigasi situs">
            <Link href="#kurikulum" className="transition-colors hover:text-fg">
              Kurikulum
            </Link>
            <Link href="#modul" className="transition-colors hover:text-fg">
              Modul
            </Link>
            <Link href="/dictionary" className="transition-colors hover:text-fg">
              Kamus
            </Link>
            <Link href="/about" className="transition-colors hover:text-fg">
              Tentang
            </Link>
          </nav>

          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              Buka dasbor
            </Button>
          </Link>
        </div>
      </header>

      <main>
        {/* ---------- Hero ---------- */}
        <section className="hero-backdrop border-b border-border">
          <div className="mx-auto grid w-full max-w-[1120px] items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="animate-fade-up">
              <p className="label-micro">JLPT N5 → N1 · belajar terstruktur</p>
              <h1 className="mt-4 font-display text-display font-semibold text-fg">
                Belajar bahasa Jepang,
                <br />
                <span className="text-accent">satu halaman setiap hari.</span>
              </h1>
              <p className="mt-5 max-w-[52ch] text-body leading-relaxed text-fg-muted">
                <strong className="font-semibold text-fg">Manabi（学び）</strong> menyusun huruf,
                kosakata, kanji, dan tata bahasa dalam satu jalur per level JLPT. Materi diulang
                otomatis lewat spaced repetition, jadi yang sudah dipelajari tidak mudah hilang.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={levelHref("N5", "vocab")}>
                  <Button size="lg">Mulai dari kosakata N5</Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg" variant="outline">
                    Lihat dasbor
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-caption text-fg-subtle">
                Progres tersimpan di browser · tanpa perlu daftar akun
              </p>
            </div>

            {/* Ornamen: teks vertikal + kartu contoh */}
            <div className="relative mx-auto w-full max-w-[360px] pl-0 sm:pl-12">
              <div className="pointer-events-none absolute inset-y-0 left-0 hidden select-none items-center sm:flex">
                <span
                  lang="ja"
                  className="jp-serif text-xl leading-[1.9] tracking-[0.34em] text-fg-subtle/45 [writing-mode:vertical-rl]"
                  aria-hidden="true"
                >
                  毎日少しずつ
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-1 shadow-lifted">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="label-micro">Kartu hari ini</span>
                  <Badge tone="level" mono>
                    N5
                  </Badge>
                </div>
                <div className="mx-1 grid place-items-center rounded-xl border border-border bg-surface-muted py-10">
                  <span lang="ja" className="jp-serif text-7xl font-semibold leading-none text-fg">
                    学
                  </span>
                </div>
                <div className="px-4 py-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <div>
                      <p lang="ja" className="jp text-sm font-medium text-fg">
                        まなぶ
                        <span className="ml-2 text-fg-muted">manabu</span>
                      </p>
                      <p className="mt-0.5 text-caption text-fg-muted">belajar · 8 goresan</p>
                    </div>
                    <span lang="ja" className="jp text-caption text-fg-subtle">
                      子
                    </span>
                  </div>
                  <p className="mt-3 border-t border-border pt-3 text-caption leading-relaxed text-fg-muted">
                    Anak (子) di bawah atap sekolah — sedang menimba ilmu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Angka ---------- */}
        <section className="border-b border-border">
          <div className="mx-auto grid w-full max-w-[1120px] grid-cols-2 divide-x divide-border px-5 sm:px-8 md:grid-cols-4">
            {counts.map((item) => (
              <div key={item.label} className="px-4 py-7 first:pl-0 last:pr-0 sm:px-6">
                <p className="tnum font-display text-3xl font-semibold leading-none text-fg">
                  {item.value}
                </p>
                <p className="mt-2 text-caption text-fg-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Kurikulum level ---------- */}
        <section id="kurikulum" className="border-b border-border scroll-mt-16">
          <div className="mx-auto w-full max-w-[1120px] px-5 py-16 sm:px-8 sm:py-20">
            <div className="max-w-[60ch]">
              <p className="label-micro">Kurikulum</p>
              <h2 className="mt-3 font-display text-h1 font-semibold text-fg">
                Satu jalur untuk setiap tingkat JLPT
              </h2>
              <p className="mt-3 text-body leading-relaxed text-fg-muted">
                Setiap level punya warna, materi, dan progresnya sendiri. Anda bisa berpindah level
                kapan saja tanpa kehilangan riwayat belajar.
              </p>
            </div>

            <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LEVEL_ORDER.map((level) => {
                const meta = LEVEL_META[level];
                const available = availableLevels.includes(level);
                const card = (
                  <div
                    className={`flex h-full flex-col rounded-xl border p-5 transition-colors ${
                      available
                        ? "border-border bg-surface hover:border-border-strong"
                        : "border-dashed border-border bg-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`tnum font-display text-2xl font-semibold leading-none ${
                          available ? "text-fg" : "text-fg-subtle"
                        }`}
                      >
                        {level}
                      </span>
                      <span
                        lang="ja"
                        className="jp text-caption text-fg-subtle"
                        aria-hidden="true"
                      >
                        {meta.japanese}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-fg">{meta.name}</p>
                    <p className="mt-1 flex-1 text-caption leading-relaxed text-fg-muted">
                      {available ? meta.description : "Materi sedang disusun."}
                    </p>
                    <p className="mt-4 flex items-center justify-between border-t border-border pt-3 text-caption">
                      <span className="text-fg-subtle">{meta.hours}</span>
                      {available ? (
                        <span className="font-semibold text-accent">Buka →</span>
                      ) : (
                        <Badge tone="outline">Segera</Badge>
                      )}
                    </p>
                  </div>
                );

                return available ? (
                  <Link key={level} href={levelHref(level)} className="block h-full">
                    {card}
                  </Link>
                ) : (
                  <div key={level} className="h-full">
                    {card}
                  </div>
                );
              })}

              <div className="flex h-full flex-col justify-center rounded-xl border border-border bg-surface-muted p-5">
                <p className="label-micro">Isi N5 sekarang</p>
                <ul className="mt-3 space-y-1.5 text-caption text-fg-muted">
                  <li className="tnum">{format(n5.vocab)} kosakata</li>
                  <li className="tnum">{format(n5.kanji)} kanji</li>
                  <li className="tnum">{format(n5.grammar)} pola tata bahasa</li>
                  <li className="tnum">
                    {format(n5.reading)} bacaan · {format(n5.listening)} dialog
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Modul ---------- */}
        <section id="modul" className="border-b border-border scroll-mt-16">
          <div className="mx-auto w-full max-w-[1120px] px-5 py-16 sm:px-8 sm:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label-micro">Modul</p>
                <h2 className="mt-3 font-display text-h1 font-semibold text-fg">
                  Delapan modul yang saling terhubung
                </h2>
              </div>
              <p className="max-w-[34ch] text-caption leading-relaxed text-fg-muted">
                Semuanya terbuka langsung — tidak ada urutan yang dikunci.
              </p>
            </div>

            <div className="mt-9 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {MODULES.map((item) => (
                <Link
                  key={item.path}
                  href={`/n5/${item.path}`}
                  className="group flex flex-col gap-3 bg-surface p-5 transition-colors hover:bg-surface-muted"
                >
                  <span
                    lang="ja"
                    className="jp-serif text-2xl leading-none text-fg-subtle transition-colors group-hover:text-accent"
                    aria-hidden="true"
                  >
                    {item.glyph}
                  </span>
                  <span className="text-sm font-semibold text-fg">{item.title}</span>
                  <span className="text-caption leading-relaxed text-fg-muted">
                    {item.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Cara belajar ---------- */}
        <section className="border-b border-border bg-surface-muted/50">
          <div className="mx-auto w-full max-w-[1120px] px-5 py-16 sm:px-8 sm:py-20">
            <p className="label-micro">Cara belajar</p>
            <h2 className="mt-3 max-w-[46ch] font-display text-h1 font-semibold text-fg">
              Tiga langkah yang diulang setiap hari
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {STEPS.map((step) => (
                <div key={step.number} className="border-t border-border-strong pt-4">
                  <span className="tnum font-display text-sm font-semibold text-accent">
                    {step.number}
                  </span>
                  <h3 className="mt-2 text-h3 font-semibold text-fg">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- CTA penutup ---------- */}
        <section className="border-b border-border">
          <div className="mx-auto flex w-full max-w-[1120px] flex-col items-start justify-between gap-6 px-5 py-14 sm:flex-row sm:items-center sm:px-8">
            <div>
              <h2 className="font-display text-h2 font-semibold text-fg">
                Sudah siap mulai? Ambil satu kartu dulu.
              </h2>
              <p className="mt-1.5 text-sm text-fg-muted">
                Tanpa akun, tanpa instalasi. Progres tumbuh di browser Anda.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={levelHref("N5", "vocab")}>
                <Button size="lg">Mulai belajar</Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="ghost">
                  Baca tentang Manabi
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="mx-auto w-full max-w-[1120px] px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-[52ch]">
            <p className="font-display text-sm font-semibold text-fg">Manabi</p>
            <p className="mt-2 text-caption leading-relaxed text-fg-subtle">
              Materi mengikuti silabus JLPT. Data terbuka yang direncanakan: JMDict, KANJIDIC2,
              KanjiVG, Tatoeba. Pelafalan memakai Web Speech API browser.
            </p>
          </div>
          <nav className="flex gap-6 text-caption text-fg-muted" aria-label="Tautan footer">
            <Link href="/about" className="hover:text-fg">
              Kredit & lisensi
            </Link>
            <Link href="/dictionary" className="hover:text-fg">
              Kamus
            </Link>
            <Link href="/settings" className="hover:text-fg">
              Pengaturan
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
