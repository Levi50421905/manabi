import type { Metadata } from "next";
import Link from "next/link";
import {
  LEVEL_META,
  LEVEL_ORDER,
  SOURCE_CREDITS,
  availableLevels,
  grammar,
  kanji,
  levelClassName,
  levelHref,
  vocab,
} from "@manabi/content";
import { Badge, Callout, PageHeader, Section, cn } from "@manabi/ui";

export const metadata: Metadata = {
  title: "Tentang",
  description:
    "Catatan metodologi, peta level JLPT N5–N1, sumber data terbuka, dan teknologi yang dipakai Manabi.",
};

const STACK = [
  { name: "Next.js 15 (App Router)", role: "Framework & routing" },
  { name: "React 19 + TypeScript", role: "UI & tipe aman" },
  { name: "Tailwind CSS 3", role: "Styling dan token desain" },
  { name: "pnpm workspace", role: "Monorepo aplikasi, konten, UI, dan SRS" },
  { name: "SM-2 SRS (@manabi/srs)", role: "Penjadwalan ulasan kartu" },
  { name: "Web Speech API", role: "Pelafalan (TTS) di browser" },
  { name: "Supabase", role: "Rencana backend jangka panjang" },
  { name: "Vercel", role: "Rencana deployment" },
];

const ROADMAP = [
  {
    phase: "MVP (sekarang)",
    detail:
      "Kana, 111 kanji N5, 708 kosakata + SRS, tata bahasa, listening, reading, kuis, ujian, dan kamus.",
  },
  {
    phase: "v0.2",
    detail:
      "Latihan goresan kanji (KanjiVG), akun, dan sinkronisasi progres ke Supabase.",
  },
  {
    phase: "v1.0",
    detail: "Materi N4–N3, jalur belajar personal, dan gamifikasi yang lebih lengkap.",
  },
  {
    phase: "v2.0",
    detail: "Latihan berbicara, komunitas, mode offline (PWA), dan AI tutor.",
  },
];

export default function AboutPage() {
  const firstLevel = availableLevels[0] ?? LEVEL_ORDER[0];

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-12 md:space-y-10">
      <PageHeader
        title="Tentang Manabi"
        japanese="学び"
        eyebrow={<span className="label-micro">Tentang</span>}
        description="Catatan proyek: cara materi disusun, peta level JLPT, sumber data terbuka, dan arah pengembangan."
      />

      {/* ---------- Pembuka ---------- */}
      <div className="max-w-[68ch] space-y-4 text-body leading-relaxed text-fg-muted">
        <p>
          Manabi (<span lang="ja" className="font-jp">学び</span>, “belajar”) adalah buku teks
          Jepang modern yang hidup: materi mengikuti silabus JLPT, latihan memakai spaced
          repetition, dan pelafalan tersedia langsung di browser.
        </p>
        <p>
          Versi MVP ini berjalan tanpa server. Seluruh materi statis, progres belajar disimpan di{" "}
          <code className="rounded bg-surface-muted px-1 py-0.5 text-caption text-fg">
            localStorage
          </code>
          , dan suara memakai Web Speech API. Tidak ada akun, tidak ada pelacakan.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-5 border-y border-border py-5 sm:grid-cols-4">
        <div>
          <dt className="label-micro">Kosakata N5</dt>
          <dd className="tnum mt-1.5 font-display text-h2 font-semibold text-fg">{vocab.length}</dd>
        </div>
        <div>
          <dt className="label-micro">Kanji N5</dt>
          <dd className="tnum mt-1.5 font-display text-h2 font-semibold text-fg">{kanji.length}</dd>
        </div>
        <div>
          <dt className="label-micro">Pola tata bahasa</dt>
          <dd className="tnum mt-1.5 font-display text-h2 font-semibold text-fg">{grammar.length}</dd>
        </div>
        <div>
          <dt className="label-micro">Level tersedia</dt>
          <dd className="tnum mt-1.5 font-display text-h2 font-semibold text-fg">
            {availableLevels.length}
            <span className="text-caption font-normal text-fg-subtle"> / {LEVEL_ORDER.length}</span>
          </dd>
        </div>
      </dl>

      {/* ---------- 01 Metodologi ---------- */}
      <Section
        className="border-t border-border pt-8"
        title={
          <span className="flex items-baseline gap-3">
            <span className="label-micro tnum">01</span>
            Catatan metodologi
          </span>
        }
      >
        <div className="max-w-[68ch] space-y-4 text-body leading-relaxed text-fg-muted">
          <p>
            Materi disusun mengikuti urutan silabus JLPT N5: kana lebih dulu, lalu kosakata dan
            kanji yang paling sering muncul, kemudian pola kalimat yang menyusun percakapan
            sehari-hari. Setiap entri punya satu tempat tinggal di{" "}
            <code className="rounded bg-surface-muted px-1 py-0.5 text-caption text-fg">
              packages/content
            </code>
            , sehingga menambah level berarti menambah data — bukan menyunting tata letak.
          </p>
          <p>
            <span className="font-medium text-fg">Spaced repetition.</span> Ulasan kartu memakai
            algoritma SM-2 dengan rating Lupa, Sulit, Baik, dan Mudah. Kartu yang lupa dikembalikan
            ke antrean sesi yang sama, sehingga satu sesi belajar selalu tuntas sampai kartu
            terakhir.
          </p>
          <p>
            <span className="font-medium text-fg">Furigana dan bacaan.</span> Teks Jepang tampil
            dengan bacaan kana di atas kanji bila diperlukan, dan bisa disembunyikan untuk melatih
            membaca tanpa bantuan.
          </p>
          <p>
            <span className="font-medium text-fg">Pelafalan.</span> Suara memakai voice Jepang yang
            tersedia di sistem operasi. Bila belum ada voice <code>ja-JP</code>, aplikasi tetap
            memuat teks dialog agar pelafalan bisa dilatih dengan membaca.
          </p>
        </div>

        <Callout className="mt-5" tone="info" title="Materi MVP ditulis manual">
          Seluruh data pada versi ini ditulis ulang secara manual untuk demo, bukan salinan dataset
          resmi. Ketika dataset terbuka dipasang, kredit di bagian 03 wajib dipertahankan sesuai
          lisensi masing-masing sumber.
        </Callout>
      </Section>

      {/* ---------- 02 Peta level ---------- */}
      <Section
        className="border-t border-border pt-8"
        title={
          <span className="flex items-baseline gap-3">
            <span className="label-micro tnum">02</span>
            Peta level N5 → N1
          </span>
        }
        description="Kurikulum berjenjang. Level dengan materi aktif bisa dibuka sekarang; sisanya sedang disusun."
      >
        <ul className="divide-y divide-border">
          {LEVEL_ORDER.map((level) => {
            const meta = LEVEL_META[level];
            const available = availableLevels.includes(level);

            return (
              <li key={level} className={cn(levelClassName(level))}>
                <div className="flex flex-wrap items-start gap-x-4 gap-y-2 py-4 sm:flex-nowrap">
                  <span className="tnum grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-level-soft text-caption font-bold text-level">
                    {level}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-h3 font-semibold text-fg">
                      {meta.name}
                      <span
                        lang="ja"
                        className="font-jp text-caption font-normal text-fg-subtle"
                      >
                        {meta.japanese}
                      </span>
                      <span className="text-caption font-normal text-fg-subtle">{meta.hours}</span>
                    </p>
                    <p className="mt-0.5 text-sm leading-relaxed text-fg-muted">{meta.description}</p>
                  </div>
                  <div className="shrink-0">
                    {available ? (
                      <Link
                        href={levelHref(level)}
                        className="inline-flex min-h-8 items-center rounded-lg px-2 text-caption font-semibold text-level underline-offset-4 transition-colors hover:underline"
                      >
                        Buka {level} →
                      </Link>
                    ) : (
                      <Badge tone="neutral">Segera</Badge>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-caption leading-relaxed text-fg-subtle">
          Setiap level punya aksen warna sendiri. Level baru otomatis memakai warna dan metadata
          yang sama di seluruh aplikasi.
        </p>
      </Section>

      {/* ---------- 03 Sumber data ---------- */}
      <Section
        className="border-t border-border pt-8"
        title={
          <span className="flex items-baseline gap-3">
            <span className="label-micro tnum">03</span>
            Sumber data &amp; lisensi
          </span>
        }
        description="Data terbuka yang menjadi rujukan materi. Atribusi wajib dipertahankan saat dataset lengkap dipasang."
      >
        <ul className="divide-y divide-border">
          {SOURCE_CREDITS.map((credit) => (
            <li
              key={credit.name}
              className="flex flex-col gap-1 py-3.5 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <a
                href={credit.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-fg underline decoration-border-strong underline-offset-4 transition-colors hover:text-accent sm:w-40 sm:shrink-0"
              >
                {credit.name}
                <span aria-hidden="true"> ↗</span>
              </a>
              <span className="min-w-0 flex-1 text-sm leading-relaxed text-fg-muted">
                {credit.usage}
              </span>
              <span className="text-caption text-fg-subtle sm:shrink-0 sm:text-right">
                {credit.license}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-caption leading-relaxed text-fg-subtle">
          Lisensi BY-SA mewajibkan atribusi dan berbagi dengan lisensi yang sama bila data diubah.
          Detail lengkap ada di dokumentasi masing-masing proyek.
        </p>
      </Section>

      {/* ---------- 04 Teknologi ---------- */}
      <Section
        className="border-t border-border pt-8"
        title={
          <span className="flex items-baseline gap-3">
            <span className="label-micro tnum">04</span>
            Teknologi
          </span>
        }
        description="Pilihan yang menjaga aplikasi tetap ringan dan mudah dikembangkan."
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {STACK.map((item) => (
            <li key={item.name} className="rounded-lg border border-border px-3.5 py-3">
              <p className="text-sm font-medium text-fg">{item.name}</p>
              <p className="mt-0.5 text-caption leading-relaxed text-fg-muted">{item.role}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* ---------- 05 Arah pengembangan ---------- */}
      <Section
        className="border-t border-border pt-8"
        title={
          <span className="flex items-baseline gap-3">
            <span className="label-micro tnum">05</span>
            Arah pengembangan
          </span>
        }
      >
        <ul className="divide-y divide-border">
          {ROADMAP.map((item) => (
            <li key={item.phase} className="flex flex-col gap-1 py-3.5 sm:flex-row sm:gap-5">
              <span className="label-micro sm:w-32 sm:shrink-0 sm:pt-0.5">{item.phase}</span>
              <span className="text-sm leading-relaxed text-fg-muted">{item.detail}</span>
            </li>
          ))}
        </ul>
      </Section>

      <p lang="ja" className="text-right font-jp-serif text-lg text-fg-subtle">
        学びは、続く。
      </p>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-6 text-caption text-fg-muted">
        <Link href="/dashboard" className="transition-colors hover:text-fg">
          ← Kembali ke dasbor
        </Link>
        <Link href="/settings" className="transition-colors hover:text-fg">
          Pengaturan
        </Link>
        <Link href={levelHref(firstLevel)} className="transition-colors hover:text-fg">
          Mulai belajar {firstLevel} →
        </Link>
      </footer>
    </div>
  );
}
