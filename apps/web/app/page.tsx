import type { Metadata } from "next";
import Link from "next/link";
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
import { Badge } from "@manabi/ui";
import { dailyCards, dayKey } from "@/lib/daily-card";
import { Mascot } from "@/components/mascot";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Manabi — Belajar bahasa Jepang terstruktur",
  description:
    "Manabi (学び) adalah ruang belajar bahasa Jepang untuk persiapan JLPT N5–N1: kana, kanji, kosakata dengan SRS, tata bahasa, partikel, mendengar, membaca, dan latihan soal. Tanpa akun, progres tersimpan di browser.",
};

export const dynamic = "force-dynamic";

const PERSONAS = [
  {
    glyph: "あ",
    title: "Pemula total",
    body: "Belum mengenal hiragana? Mulai dari kana, lalu lanjut bertahap.",
    tone: "bg-accent-soft text-accent",
  },
  {
    glyph: "試",
    title: "Peserta JLPT",
    body: "Silabus per level, simulasi ujian, dan Bank Soal yang sama untuk latihan maupun ujian.",
    tone: "bg-sun-soft text-sun",
  },
  {
    glyph: "独",
    title: "Belajar sendiri",
    body: "Jadwal ulangan otomatis dan progres yang terlihat, sehingga arah belajar tetap jelas.",
    tone: "bg-coral-soft text-coral-strong",
  },
  {
    glyph: "文",
    title: "Pencinta budaya Jepang",
    body: "Dari anime sampai berita: membaca, mendengar, dan memahami nuansa lewat konteks.",
    tone: "bg-sky-soft text-sky",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Mulai dari satu kartu",
    body: "Dasbor menunjukkan apa yang jatuh tempo hari ini.",
  },
  {
    n: "02",
    title: "Ulang tepat sebelum lupa",
    body: "Sistem SRS menyimpan jadwal tiap kartu. Yang sudah dipelajari tidak hilang begitu saja.",
  },
  {
    n: "03",
    title: "Pakai dalam kalimat",
    body: "Tata bahasa, partikel, mendengar, membaca, lalu uji dengan latihan dan simulasi.",
  },
];

function fmt(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function HomePage() {
  const counts = contentCountByLevel("N5");
  const n5 = LEVEL_META.N5;
  const today = dailyCards(dayKey(), 1)[0];

  return (
    <div className="min-h-screen">
      {/* ---------- Header ---------- */}
      <header className="sticky top-0 z-40 border-b border-border bg-paper/85 backdrop-blur">
        <div className="mx-auto flex h-[72px] w-full max-w-[1240px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5">
            <Mascot size={42} />
            <span className="min-w-0">
              <span className="block font-display text-[22px] font-extrabold leading-none tracking-tight text-fg">
                Manabi
              </span>
              <span className="mt-0.5 hidden truncate text-[11px] font-semibold text-fg-subtle sm:block">
                学び · belajar bahasa Jepang
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-[13px] font-extrabold text-fg-muted md:flex" aria-label="Navigasi beranda">
            <a href="#tentang" className="transition-colors hover:text-fg">
              Tentang
            </a>
            <a href="#cara" className="transition-colors hover:text-fg">
              Cara belajar
            </a>
            <a href="#level" className="transition-colors hover:text-fg">
              Level
            </a>
            <Link href="/about" className="transition-colors hover:text-fg">
              Metodologi
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle compact />
            <Link
              href="/n5"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-accent px-4 text-[13px] font-extrabold text-accent-contrast shadow-soft transition-colors hover:bg-accent-strong"
            >
              Mulai belajar
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="mx-auto grid w-full max-w-[1240px] items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-20">
            <div className="animate-fade-up">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1.5 text-[11.5px] font-extrabold text-accent">
                  <span aria-hidden="true">●</span> JLPT N5–N1
                </span>
                <span className="inline-flex items-center rounded-full bg-surface px-3 py-1.5 text-[11.5px] font-extrabold text-fg-muted shadow-soft">
                  Spaced repetition
                </span>
                <span className="inline-flex items-center rounded-full bg-surface px-3 py-1.5 text-[11.5px] font-extrabold text-fg-muted shadow-soft">
                  Tanpa akun
                </span>
              </div>

              <h1 className="mt-5 max-w-[22ch] font-display text-[clamp(2.4rem,5.2vw,3.9rem)] font-extrabold leading-[1.04] tracking-[-0.035em] text-fg">
                Belajar bahasa Jepang dengan <span className="text-accent">arah yang jelas.</span>
              </h1>
              <p className="mt-5 max-w-[58ch] text-[15px] font-medium leading-relaxed text-fg-muted sm:text-base">
                Manabi（学び）menyusun huruf, kosakata, kanji, tata bahasa, dan latihan dalam
                satu jalur per level JLPT. Materi yang sudah dipelajari diulang otomatis, jadi
                tidak mudah hilang.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-2.5">
                <Link
                  href="/n5"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-6 text-sm font-extrabold text-accent-contrast shadow-soft transition-colors hover:bg-accent-strong"
                >
                  Mulai dari N5
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-5 text-sm font-extrabold text-fg shadow-soft transition-colors hover:border-accent/40"
                >
                  Buka Dasbor
                </Link>
                <Link
                  href="/n5/partikel"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-extrabold text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
                >
                  Lihat contoh Partikel
                </Link>
              </div>

              <p className="mt-4 text-[12px] font-bold text-fg-subtle">
                Progres tersimpan di browser ini · tanpa daftar akun · materi N5 lengkap
              </p>
            </div>

            {/* Contoh ringkasan — bukan data pengguna baru */}
            <div className="relative mx-auto w-full max-w-[420px]">
              <div className="relative rounded-[2rem] border border-border bg-surface p-7 shadow-[0_24px_60px_-30px_rgba(36,32,27,0.28)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="label-micro text-accent">Contoh ringkasan</p>
                    <p className="mt-1 font-display text-[30px] font-black leading-none text-fg">
                      24 kartu
                    </p>
                    <p className="mt-1 text-[12.5px] font-semibold text-fg-muted">
                      jatuh tempo hari ini
                    </p>
                  </div>
                  <Mascot size={92} />
                </div>

                <div className="mt-5 grid gap-2">
                  <div className="flex items-center justify-between rounded-2xl bg-coral-soft px-3.5 py-3">
                    <span className="text-[13px] font-extrabold text-coral-strong">
                      32 kartu baru
                    </span>
                    <span className="text-[11px] font-extrabold text-coral-strong/80">Antrean</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-accent-soft px-3.5 py-3">
                    <span className="text-[13px] font-extrabold text-accent">12 hari beruntun</span>
                    <span className="text-[11px] font-extrabold text-accent/80">Streak</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-sun-soft px-3.5 py-3">
                    <span className="text-[13px] font-extrabold text-sun">14/20 target hari ini</span>
                    <span className="text-[11px] font-extrabold text-sun/80">Harian</span>
                  </div>
                </div>

                {today ? (
                  <div className="mt-4 rounded-xl border border-border bg-surface-muted px-3.5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-fg-subtle">
                      Kartu hari ini · {today.moduleLabel}
                    </p>
                    <div className="mt-1.5 flex items-start gap-3">
                      <span
                        lang="ja"
                        className={
                          today.kind === "tata-bahasa"
                            ? "shrink-0 font-jp text-[28px] font-bold leading-none text-fg"
                            : "shrink-0 font-jp text-[32px] font-bold leading-none text-fg"
                        }
                      >
                        {today.kind === "tata-bahasa" ? "文" : today.glyph}
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 block text-[13px] font-bold text-fg">
                          {today.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] font-medium text-fg-muted">
                          {today.reading} {today.romaji ? `· ${today.romaji}` : ""}
                        </span>
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Angka ---------- */}
        <section className="border-b border-border">
          <div className="mx-auto grid w-full max-w-[1240px] grid-cols-2 divide-x divide-y divide-border px-4 sm:px-6 md:grid-cols-4 md:divide-y-0 lg:px-8">
            {[
              { value: fmt(vocab.length), label: "kosakata N5" },
              { value: fmt(kanji.length), label: "kanji N5" },
              { value: fmt(grammar.length), label: "pola tata bahasa" },
              { value: fmt(kana.length), label: "huruf kana" },
            ].map((item) => (
              <div key={item.label} className="px-4 py-5 first:pl-0 sm:px-6">
                <p className="tnum font-display text-[30px] font-extrabold leading-none text-fg">
                  {item.value}
                </p>
                <p className="mt-1.5 text-[12px] font-extrabold text-fg-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- Apa ini ---------- */}
        <section id="tentang" className="border-b border-border scroll-mt-20">
          <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
            <div className="max-w-[62ch]">
              <p className="label-micro text-accent">Tentang Manabi</p>
              <h2 className="mt-2 font-display text-[clamp(1.8rem,3.2vw,2.6rem)] font-extrabold leading-[1.12] tracking-[-0.03em] text-fg">
                Belajar terstruktur, bukan sekadar kumpulan materi.
              </h2>
              <p className="mt-3 text-[14.5px] font-medium leading-relaxed text-fg-muted">
                Manabi adalah ruang belajar mandiri untuk bahasa Jepang. Materinya mengikuti
                silabus JLPT, latihannya aktif, dan ulangannya dijadwalkan. Semua berjalan di
                browser — tanpa akun, tanpa pelacakan, dan progres tidak hilang saat tab ditutup.
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {[
                {
                  glyph: "道",
                  title: "Satu jalur per level",
                  body: "Materi N5 tersusun sebagai jalur yang jelas. N4–N1 menyusul dengan struktur yang sama.",
                  tone: "bg-accent-soft text-accent",
                },
                {
                  glyph: "復",
                  title: "Ulang otomatis",
                  body: "Setiap kartu punya jadwal. Yang hampir lupa muncul lagi; yang sudah kuat tidak mengganggu.",
                  tone: "bg-coral-soft text-coral-strong",
                },
                {
                  glyph: "問",
                  title: "Latihan yang menjelaskan",
                  body: "Setiap jawaban punya pembahasan. Bank Soal dipakai bersama oleh latihan dan simulasi ujian.",
                  tone: "bg-sun-soft text-sun",
                },
              ].map((feature) => (
                <article key={feature.title} className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
                  <span
                    lang="ja"
                    aria-hidden="true"
                    className={`grid h-12 w-12 place-items-center rounded-2xl text-lg font-extrabold ${feature.tone}`}
                  >
                    {feature.glyph}
                  </span>
                  <h3 className="mt-4 font-display text-[19px] font-extrabold text-fg">{feature.title}</h3>
                  <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-fg-muted">
                    {feature.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Untuk siapa + dibangun oleh siapa ---------- */}
        <section className="border-b border-border bg-surface-muted/40">
          <div className="mx-auto grid w-full max-w-[1240px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div>
              <p className="label-micro text-accent">Untuk siapa?</p>
              <h2 className="mt-2 font-display text-[clamp(1.7rem,3vw,2.3rem)] font-extrabold leading-[1.12] tracking-[-0.025em] text-fg">
                Dibuat untuk pembelajar yang ingin mulai, dan yang ingin bertahan.
              </h2>
              <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {PERSONAS.map((persona) => (
                  <div key={persona.title} className="rounded-2xl border border-border bg-surface p-4">
                    <span
                      lang="ja"
                      aria-hidden="true"
                      className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-extrabold ${persona.tone}`}
                    >
                      {persona.glyph}
                    </span>
                    <h3 className="mt-3 text-[14px] font-extrabold text-fg">{persona.title}</h3>
                    <p className="mt-1 text-[12.5px] font-semibold leading-relaxed text-fg-muted">
                      {persona.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <aside className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-6 shadow-soft">
              <div>
                <div className="flex items-center gap-3">
                  <Mascot size={56} />
                  <div>
                    <p className="label-micro text-accent">Dibangun oleh</p>
                    <p className="mt-0.5 font-display text-[22px] font-extrabold leading-tight text-fg">
                      Levi
                    </p>
                  </div>
                </div>
                <p className="mt-4 text-[13.5px] font-semibold leading-relaxed text-fg-muted">
                  Manabi adalah proyek belajar Jepang yang dikembangkan terbuka. Materi ditulis
                  dan dikurasi manual untuk pembelajar Indonesia; kredit data terbuka dicantumkan
                  di halaman Tentang.
                </p>
                <ul className="mt-4 space-y-2 text-[12.5px] font-bold text-fg-muted">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-accent" aria-hidden="true">✓</span>
                    Tanpa akun, tanpa iklan, tanpa pelacakan.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-accent" aria-hidden="true">✓</span>
                    Progres disimpan di browser; bisa direset kapan saja.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 text-accent" aria-hidden="true">✓</span>
                    Materi mengikuti JLPT; level baru ditambahkan bertahap.
                  </li>
                </ul>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href="/about"
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-accent px-4 text-[13px] font-extrabold text-accent-contrast shadow-soft hover:bg-accent-strong"
                >
                  Baca metodologi
                </Link>
                <Link
                  href="/n5"
                  className="inline-flex h-11 items-center justify-center rounded-2xl border border-border px-4 text-[13px] font-extrabold text-fg hover:bg-surface-muted"
                >
                  Coba N5
                </Link>
              </div>
            </aside>
          </div>
        </section>

        {/* ---------- Cara belajar ---------- */}
        <section id="cara" className="border-b border-border scroll-mt-20">
          <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="label-micro text-accent">Cara belajar</p>
                <h2 className="mt-2 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-fg">
                  Tiga langkah belajar.
                </h2>
              </div>
              <p className="max-w-[38ch] text-[13px] font-semibold leading-relaxed text-fg-muted">
                Tidak ada urutan yang dikunci. Mulai dari bagian yang dibutuhkan hari ini.
              </p>
            </div>

            <ol className="mt-8 grid gap-3 md:grid-cols-3">
              {STEPS.map((step) => (
                <li key={step.n} className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
                  <span className="tnum font-display text-[30px] font-extrabold leading-none text-accent">
                    {step.n}
                  </span>
                  <h3 className="mt-3 text-[16px] font-extrabold text-fg">{step.title}</h3>
                  <p className="mt-1.5 text-[13px] font-semibold leading-relaxed text-fg-muted">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- Level ---------- */}
        <section id="level" className="border-b border-border bg-surface-muted/40 scroll-mt-20">
          <div className="mx-auto w-full max-w-[1240px] px-4 py-14 sm:px-6 lg:px-8">
            <div className="max-w-[62ch]">
              <p className="label-micro text-accent">Level</p>
              <h2 className="mt-2 font-display text-[clamp(1.8rem,3vw,2.4rem)] font-extrabold leading-[1.1] tracking-[-0.03em] text-fg">
                Satu warna, satu jalur, satu progres.
              </h2>
              <p className="mt-2 text-[13.5px] font-semibold leading-relaxed text-fg-muted">
                N5 sudah lengkap. N4–N1 akan muncul otomatis begitu materinya siap — tanpa
                mengubah menu atau kehilangan progres.
              </p>
            </div>

            <div className="mt-6 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
              {LEVEL_ORDER.map((level) => {
                const meta = LEVEL_META[level];
                const ready = availableLevels.includes(level);
                return (
                  <Link
                    key={level}
                    href={levelHref(level)}
                    aria-disabled={!ready}
                    className={`flex flex-col rounded-2xl border p-4 transition-colors ${
                      ready
                        ? "border-border bg-surface shadow-soft hover:border-accent/40"
                        : "pointer-events-none border-dashed border-border bg-transparent opacity-70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="tnum font-display text-[24px] font-extrabold leading-none text-fg">
                        {level}
                      </span>
                      <span lang="ja" className="jp text-[12px] font-bold text-fg-subtle">
                        {meta.japanese}
                      </span>
                    </div>
                    <p className="mt-2 text-[13px] font-extrabold text-fg">{meta.name}</p>
                    <p className="mt-1 flex-1 text-[11.5px] font-semibold leading-relaxed text-fg-muted">
                      {ready ? meta.description : "Materi sedang disusun."}
                    </p>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-[11px] font-extrabold">
                      <span className="text-fg-subtle">{meta.hours}</span>
                      {ready ? (
                        <span className="text-accent">Buka →</span>
                      ) : (
                        <span className="text-fg-subtle">Segera</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 text-[12px] font-extrabold text-fg-muted">
              <Badge tone="accent">Isi N5 sekarang</Badge>
              <span>{fmt(counts.vocab)} kosakata</span>
              <span aria-hidden="true">·</span>
              <span>{fmt(counts.kanji)} kanji</span>
              <span aria-hidden="true">·</span>
              <span>{fmt(counts.grammar)} pola tata bahasa</span>
              <span aria-hidden="true">·</span>
              <span>{fmt(counts.reading)} bacaan</span>
              <span aria-hidden="true">·</span>
              <span>{fmt(counts.listening)} dialog</span>
            </div>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section>
          <div className="mx-auto flex w-full max-w-[1240px] flex-col items-start justify-between gap-6 px-4 py-12 sm:flex-row sm:items-center sm:px-6 lg:px-8">
            <div>
              <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.1rem)] font-extrabold leading-tight tracking-[-0.025em] text-fg">
                Mulai dari satu kartu.
              </h2>
              <p className="mt-1.5 text-[13px] font-semibold text-fg-muted">
                Tanpa akun, tanpa instalasi. Progres tumbuh di browser ini.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/n5"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-accent px-6 text-sm font-extrabold text-accent-contrast shadow-soft hover:bg-accent-strong"
              >
                Mulai belajar
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-border bg-surface px-5 text-sm font-extrabold text-fg shadow-soft hover:bg-surface-muted"
              >
                Lihat Dasbor
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div className="flex max-w-[52ch] items-start gap-3">
            <Mascot size={40} />
            <div>
              <p className="font-display text-[15px] font-extrabold text-fg">Manabi</p>
              <p className="mt-1 text-[11.5px] font-semibold leading-relaxed text-fg-subtle">
                Materi mengikuti silabus JLPT. Data terbuka yang direncanakan: JMDict,
                KANJIDIC2, KanjiVG, Tatoeba. Pelafalan memakai Web Speech API browser.
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-extrabold text-fg-muted" aria-label="Tautan footer">
            <Link href="/about" className="hover:text-fg">
              Kredit & lisensi
            </Link>
            <Link href="/dictionary" className="hover:text-fg">
              Kamus
            </Link>
            <Link href="/settings" className="hover:text-fg">
              Pengaturan
            </Link>
            <Link href="/dashboard" className="hover:text-fg">
              Dasbor
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
