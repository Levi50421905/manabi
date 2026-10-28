# Manabi (学び)

Aplikasi web untuk belajar bahasa Jepang: kana, kanji, kosakata (dengan **spaced
repetition**), tata bahasa, listening, membaca, latihan soal, dan kamus — semuanya
dalam satu jalur belajar bertingkat JLPT.

> Status: **MVP (v0.1)** — materi N5, progres disimpan di browser, tanpa akun.

## Mulai cepat

```bash
# dari folder manabi/
pnpm install
pnpm dev
```

Buka <http://localhost:3000>.

Butuh **Node.js ≥ 20** dan **pnpm** (repo ini memakai pnpm workspace).

```bash
npm install -g pnpm   # jika pnpm belum ada
```

## Struktur monorepo

```
manabi/
├── apps/
│   └── web/                  # aplikasi Next.js 15 (App Router)
│       ├── app/              # rute per modul
│       ├── components/       # Sidebar, QuizRunner, SpeakButton
│       └── lib/              # store (progres + SRS), quiz, tts
├── packages/
│   ├── content/              # data materi + tipe + pencarian
│   ├── srs/                  # algoritma spaced repetition (SM-2)
│   └── ui/                   # design system (Button, Card, Badge, ProgressBar)
├── supabase/                 # skema backend (opsional, untuk v0.2)
└── docs/                     # desain produk & roadmap
```

## Halaman

| Rute | Isi |
|---|---|
| `/` | Landing: ringkasan fitur & statistik materi |
| `/dashboard` | XP, level, streak, ulasan tertunda, aktivitas 7 hari, riwayat latihan |
| `/kana` | Hiragana & katakana + kuis dua arah |
| `/write` | Latihan menulis kana & kanji di kanvas (mouse/stylus/sentuh) |
| `/vocab` | 708 kosakata N5 + sesi SRS + re-queue otomatis saat "Lupa" |
| `/kanji` | 111 kanji N5: bacaan, radikal, goresan, mnemonic, kuis |
| `/grammar` | 48 pola tata bahasa N5 dengan contoh + latihan 文の組み立て |
| `/listening` | 12 dialog, 3 kecepatan, toggle kana & terjemahan |
| `/reading` | 10 bacaan berfurigana + pertanyaan pemahaman |
| `/quiz` | Latihan campuran / per modul + pembahasan + shortcut 1–4 & Enter |
| `/ujian` | Simulasi JLPT N5 (49 soal: 文の組み立て + 4 tipe 聴解) dan JFT-Basic |
| `/dictionary` | Pencarian lintas kosakata, kanji, tata bahasa, bacaan |
| `/settings` | Tema terang/gelap/sistem, target harian, kecepatan suara, reset data |
| `/about` | Kredit data terbuka & lisensi |

## Perintah

| Perintah | Fungsi |
|---|---|
| `pnpm dev` | Jalankan dev server di port 3000 |
| `pnpm build` | Build produksi |
| `pnpm start` | Jalankan hasil build |
| `pnpm typecheck` | Type-check semua paket |
| `pnpm clean` | Hapus cache build `.next` |
| `pnpm --filter @manabi/web dev` | Dev server khusus app web |

## Cara menambah materi

Semua isi materi ada di `packages/content/src/data/` dan dikumpulkan oleh
`packages/content/src/index.ts`.

**Menambah kosakata** — edit `data/vocab-n5.ts`:

```ts
{
  id: "vocab:n5:ringo",          // wajib unik, dipakai sebagai kunci SRS
  kanji: "林檎",
  kana: "りんご",
  romaji: "ringo",
  meaning: "apel",
  pos: "kata-benda",
  level: "N5",
  example: { jp: "林檎を一つください。", id: "Tolong satu apel." },
}
```

**Menambah level baru (mis. N4)**

1. Buat `data/vocab-n4.ts`, `data/kanji-n4.ts`, dst. dengan bentuk data yang sama.
2. Import & spread di `packages/content/src/index.ts`:

```ts
import { vocabN4 } from "./data/vocab-n4";
export const vocab: Vocab[] = [...vocabN5, ...vocabN4];
```

Semua halaman otomatis ikut menampilkan materi baru.

## Model progres & SRS

- Progres disimpan di `localStorage` dengan kunci `manabi:v1:progress`
  (lihat `apps/web/lib/store.ts`).
- Algoritma ulasan ada di `packages/srs` (SM-2): `ease`, `interval`,
  `repetitions`, `due`, `lapses`. Rating: `again | hard | good | easy`.
- Untuk pindah ke backend, ganti `read()`/`persist()` di `store.ts` — bentuk
  data tabel Supabase sengaja dibuat identik (lihat `supabase/schema.sql`).

## Pelafalan (TTS)

Memakai **Web Speech API** bawaan browser (`apps/web/lib/tts.ts`). Suara Jepang
hanya tersedia bila OS/browser memiliki voice `ja-JP`. Untuk kualitas produksi,
ganti dengan Google TTS / Amazon Polly / ElevenLabs di `lib/tts.ts`.

## Deploy ke Vercel

1. Push repo ke GitHub.
2. Import ke Vercel.
3. **Root Directory**: `apps/web` — dan aktifkan *Include files outside the root
   directory* agar `packages/*` ikut terpasang.
4. Build Command: `pnpm --filter @manabi/web build` (Vercel mendeteksi pnpm
   workspace otomatis).

Alternatif: set Root Directory ke akar repo, build command
`pnpm --filter @manabi/web build`, output `apps/web/.next`.

## Troubleshooting

**`Cannot find module 'styled-jsx/package.json'` saat `pnpm dev` / `pnpm build`**

Ini masalah resolusi junction pnpm di Windows. Pastikan `pnpm-workspace.yaml`
berisi `nodeLinker: hoisted` (sudah disetel di repo ini), lalu:

```bash
rmdir /s /q node_modules      # Windows
pnpm install
```

**Tidak ada suara saat klik tombol pelafalan**

Web Speech API hanya tersedia jika browser/OS punya voice `ja-JP`. Di Windows:
*Settings → Time & Language → Speech → Add voices → Japanese*. Setelah itu
restart browser. Untuk kualitas audio produksi, ganti implementasi di
`apps/web/lib/tts.ts` dengan layanan TTS (Google/Polly/ElevenLabs).

**Port 3000 sudah dipakai**

```bash
pnpm dev -- -p 3001
```

**Progres belajar hilang**

Progres disimpan di `localStorage` per browser & per origin. Mode incognito,
ganti browser, atau `localhost` vs `127.0.0.1` akan dianggap sesi berbeda.

## Dokumen

- [Desain produk](docs/DESAIN-MANABI.md) — konsep, fitur, kurikulum, arsitektur
- [Roadmap](docs/ROADMAP.md) — status MVP dan rencana v0.2 → v2.0
- [Supabase](supabase/README.md) — langkah mengaktifkan backend

## Kredit data

Materi MVP ditulis manual. Untuk dataset lengkap, sumber yang direncanakan:
JMDict, KANJIDIC2, KanjiVG, Tatoeba (semua CC BY-SA / CC BY). Detail ada di
halaman `/about` dan `packages/content/src/credits.ts`.
