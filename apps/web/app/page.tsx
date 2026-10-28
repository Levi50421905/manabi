import Link from "next/link";
import { Badge, Button, Card, CardContent } from "@manabi/ui";
import { grammar, kana, kanji, vocab } from "@manabi/content";
import { SakuraRain } from "@/components/sakura-rain";
import { SakuraTree } from "@/components/sakura-tree";

const FEATURES = [
  {
    glyph: "あ",
    title: "Kana Trainer",
    description:
      "Hiragana & katakana lengkap dengan latihan baca dan kuis dua arah.",
    href: "/kana",
  },
  {
    glyph: "漢",
    title: "Kanji N5",
    description:
      "On'yomi, kun'yomi, radikal, jumlah goresan, dan jembatan ingatan (mnemonic).",
    href: "/kanji",
  },
  {
    glyph: "語",
    title: "Kosakata + SRS",
    description:
      "Flashcard dengan algoritma spaced repetition — ulasan muncul tepat saat hampir lupa.",
    href: "/vocab",
  },
  {
    glyph: "文",
    title: "Tata Bahasa",
    description:
      "Pola kalimat dengan penjelasan bahasa Indonesia dan contoh yang bisa diputar.",
    href: "/grammar",
  },
  {
    glyph: "聴",
    title: "Listening",
    description:
      "Dialog sehari-hari dengan pelafalan Jepang dan kecepatan yang bisa diatur.",
    href: "/listening",
  },
  {
    glyph: "読",
    title: "Membaca",
    description:
      "Bacaan pendek berfurigana, terjemahan, dan pertanyaan pemahaman.",
    href: "/reading",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Kenali hurufnya",
    description: "Mulai dari hiragana & katakana sampai lancar membaca.",
  },
  {
    number: "02",
    title: "Bangun kosakata",
    description: "Hafalkan kata dengan flashcard dan ulasan terjadwal.",
  },
  {
    number: "03",
    title: "Pakai dalam kalimat",
    description: "Latih tata bahasa, listening, dan membaca dalam konteks.",
  },
];

function formatCount(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function HomePage() {
  const stats = [
    { label: "Huruf kana", value: formatCount(kana.length) },
    { label: "Kanji N5", value: formatCount(kanji.length) },
    { label: "Kosakata N5", value: formatCount(vocab.length) },
    { label: "Pola tata bahasa", value: formatCount(grammar.length) },
  ];

  return (
    <div className="relative isolate space-y-14 pb-6">
      {/* Ilustrasi pohon (mode gelap) — di belakang konten */}
      <SakuraTree />
      <SakuraRain />
      {/* ---------- Hero ---------- */}
      <section className="grid items-center gap-8 pt-6 lg:grid-cols-[1.15fr_0.85fr] lg:pt-10">
        <div className="animate-fade-up">
          <Badge tone="sakura">MVP · JLPT N5</Badge>
          <h1 className="mt-4 text-4xl font-bold leading-[1.15] tracking-tight text-ink-900 sm:text-5xl">
            Belajar bahasa Jepang
            <span className="mt-1 block text-sakura-600">satu langkah setiap hari.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-500">
            <strong className="font-semibold text-ink-700">Manabi (学び)</strong> menyusun
            huruf, kosakata, kanji, dan tata bahasa dalam satu jalur belajar. Materi
            diulang otomatis lewat spaced repetition, jadi yang sudah dipelajari tidak
            mudah hilang.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button size="lg">Mulai belajar</Button>
            </Link>
            <Link href="/quiz">
              <Button size="lg" variant="outline">
                Coba latihan singkat
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink-400">
            Progres tersimpan di browser · tanpa perlu daftar akun
          </p>
        </div>

        <Card className="animate-fade-up overflow-hidden">
          <div className="flex items-center justify-between border-b border-ink-100 bg-sakura-50/60 px-5 py-3">
            <span className="text-xs font-medium text-ink-600">Kartu hari ini</span>
            <Badge tone="matcha">N5</Badge>
          </div>
          <CardContent className="p-5">
            <div className="flex items-center justify-center rounded-2xl bg-white py-8">
              <span className="jp text-7xl font-semibold text-ink-900">学</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <div>
                <p className="text-sm font-medium text-ink-800">まなぶ · manabu</p>
                <p className="text-xs text-ink-500">belajar · 8 goresan</p>
              </div>
              <span className="text-xs text-ink-400">radikal 子</span>
            </div>
            <p className="mt-3 rounded-xl bg-ink-50 p-3 text-xs leading-relaxed text-ink-600">
              Mnemonic: anak (子) di bawah atap sekolah — sedang menimba ilmu.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-ink-100 bg-white px-4 py-4 text-center"
          >
            <p className="text-2xl font-bold text-ink-900">{item.value}</p>
            <p className="mt-0.5 text-xs text-ink-500">{item.label}</p>
          </div>
        ))}
      </section>

      {/* ---------- Features ---------- */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-ink-900">Isi Manabi</h2>
          <p className="mt-1 text-sm text-ink-500">
            Tujuh modul yang saling terhubung, semuanya bisa dibuka langsung.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link key={feature.href} href={feature.href} className="group">
              <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-sakura-200 group-hover:shadow-lg">
                <CardContent className="p-5">
                  <span className="jp grid h-10 w-10 place-items-center rounded-xl bg-sakura-50 text-lg font-semibold text-sakura-700">
                    {feature.glyph}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-ink-900">{feature.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------- Steps ---------- */}
      <section className="rounded-3xl border border-ink-100 bg-white p-6 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-ink-900">Cara belajar</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.number}>
              <span className="text-xs font-semibold tracking-widest text-sakura-500">
                {step.number}
              </span>
              <h3 className="mt-1 text-sm font-semibold text-ink-900">{step.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">{step.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-ink-100 pt-5">
          <Link href="/dashboard">
            <Button>Buka dasbor</Button>
          </Link>
          <Link href="/dictionary">
            <Button variant="ghost">Cari kata di kamus</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-100 pt-5 text-xs leading-relaxed text-ink-400">
        <p>
          Manabi MVP · Materi disusun mengikuti silabus JLPT N5. Data terbuka yang dipakai:
          JMDict, KANJIDIC2, KanjiVG, Tatoeba. Pelafalan memakai Web Speech API browser.
        </p>
        <p className="mt-1">
          <Link href="/about" className="underline underline-offset-2 hover:text-ink-600">
            Lihat kredit & lisensi
          </Link>
        </p>
      </footer>
    </div>
  );
}
