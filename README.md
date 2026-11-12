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

Semua modul berada di bawah segmen level: `/[level]/<modul>`, mis. `/n5/vocab`.
Menambah level baru otomatis menambah rute (lihat **Level & kurikulum** di bawah).
Struktur menu (grup, label, glyph, path, sub-tab) dibaca dari
`packages/content/src/curriculum.ts`.

| Rute | Isi |
|---|---|
| `/` | Beranda: penjelasan produk, untuk siapa, cara belajar, peta level, CTA |
| `/dashboard` | XP, level, streak, kartu jatuh tempo, aktivitas 7 hari, riwayat latihan |
| `/[level]` | Ringkasan level: jumlah materi, progres per modul, aktivitas minggu ini |
| `/[level]/kana` | Hiragana & katakana + kuis dua arah (tab **Kana & Menulis**) |
| `/[level]/write` | Latihan menulis kana & kanji di kanvas (tab pasangan Kana) |
| `/[level]/vocab` | 708 kosakata N5 + sesi SRS + re-queue otomatis saat "Lupa" |
| `/[level]/kanji` | 111 kanji N5: bacaan, radikal, goresan, mnemonic, kuis (tab **Kanji & Bacaan**) |
| `/[level]/bacaan-kanji` | Aturan perubahan bacaan, jukujikun, rendaku (tab pasangan Kanji) |
| `/[level]/bacaan-kanji/latihan` | Latihan membaca kanji: pilih bacaan & bedakan bacaan |
| `/[level]/grammar` | 48 pola tata bahasa N5 dengan contoh + latihan 文の組み立て |
| `/[level]/partikel` | 18 partikel N5: fungsi, contoh, pasangan tertukar, jebakan khusus |
| `/[level]/partikel/latihan` | Latihan partikel 5 mode (isi celah, ketik, fungsi, pasangan, lengkapi teks) |
| `/[level]/konteks` | Konteks & etiket: tingkat bicara, 敬語 tiga lapis, kebiasaan, hal unik |
| `/[level]/konteks/latihan` | Latihan memilih tingkat bicara dan bentuk sopan |
| `/[level]/ulasan` | Ulasan SRS berbasis konteks: bacaan, partikel, situasi |
| `/[level]/listening` | 12 dialog, 3 kecepatan, toggle kana & terjemahan |
| `/[level]/reading` | 10 bacaan berfurigana + pertanyaan pemahaman |
| `/[level]/quiz` | Latihan: 9 mode + **Bentuk jawaban** (Terjemahan/Romaji/Kana) + sumber Bank Soal N5/JFT-Basic |
| `/[level]/ujian` | Simulasi JLPT N5 dan JFT-Basic |
| `/dictionary` | Pencarian lintas level: kosakata, kanji, tata bahasa, bacaan (global) |
| `/settings` | Tema, target harian, kecepatan suara, furigana, reset data (global) |
| `/about` | Metodologi, kredit data terbuka, lisensi, peta level |

**Bank Soal bukan halaman/menu.** Ia lapisan data (`apps/web/lib/bank.ts`) yang
memasok butir untuk Latihan Soal dan Simulasi Ujian. Rute `/[level]/bank`
dialihkan permanen ke `/[level]/quiz`.

Rute lama (`/vocab`, `/kanji`, `/partikel`, `/bacaan-kanji`, `/bank`, …)
dialihkan permanen ke `/n5/…` lewat `next.config.mjs`.

## Level & kurikulum

Metadata setiap level JLPT **dan struktur menu** ada di satu tempat:
`packages/content/src/curriculum.ts` (`LEVEL_META`, `LEVEL_ORDER`, `LEVELS`,
`NAV_SECTIONS`, `NAV_ITEMS`, `navItemHref`, `navItemActive`). Yang dibaca dari
sana adalah warna aksen, nama, deskripsi, jam belajar, grup menu, label, glyph,
path, dan sub-tab.

**Menambah level baru (mis. N4):**

1. Buat file data dengan bentuk yang sama, mis. `data/vocab-n4.ts` (`level: "N4"`).
2. Import & spread di `packages/content/src/index.ts` seperti batch N5.
3. Selesai. `availableLevels` mendeteksi materi baru, sehingga:
   - level N4 otomatis aktif di pemilih level (sebelumnya berlabel "Segera"),
   - rute `/[level]/…` langsung melayani `/n4/vocab`, `/n4/kanji`, dst.,
   - warna aksen N4 (`--level` per level, lihat `globals.css`) otomatis terpakai,
   - dasbor, hub level, dan kamus ikut menghitung materi baru.

**Menambah menu/modul baru:** tambahkan satu `NavItem` ke grup yang sesuai di
`NAV_SECTIONS` — shell, bottom nav, sheet mobile, dan level hub membacanya
otomatis.

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

Lihat bagian [Level & kurikulum](#level--kurikulum) — cukup tambah data, tanpa
menyunting komponen.

## Design system

Tampilan memakai arah 「なかま」Nakama: krem hangat, matcha, coral, kartu
membulat, bayangan lembut, dan tipografi Nunito + Noto Sans JP. Fokusnya ramah
pemula dan nyaman di ponsel.

- Kontrak lengkap: [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md) — catatan:
  dokumen itu masih memuat arah visual lama; token dan komponen aktual ada di
  `apps/web/app/globals.css` + `packages/ui`. **Baca keduanya sebelum menulis UI baru.**
- Token: `apps/web/app/globals.css` (variabel CSS + varian gelap + `--level` per level)
  dan `apps/web/tailwind.config.ts` (pemetaan ke kelas Tailwind).
- Komponen: `packages/ui/src/` — `Button`, `Card`, `Badge`, `Pill`, `ProgressBar`,
  `ProgressRing`, `SegmentedControl`, `PageHeader`, `Section`, `StatTile`,
  `Toolbar`, `SearchField`, `EmptyState`, `Callout`, `ListRow`, `Skeleton`, `Pagination`.
- Kerangka aplikasi: `apps/web/components/app-shell.tsx` (sidebar ringkas tanpa
  scroll di desktop, top bar + bottom nav mobile, sheet) dan
  `apps/web/components/level-switcher.tsx`.
- Maskot: `apps/web/components/mascot.tsx` (bentuk CSS, sementara).

## QA visual

`tools/shots.ps1` mengambil screenshot halaman lewat Chrome headless.

```powershell
# desktop
pwsh -File tools/shots.ps1 -Prefix qa -Pages "/dashboard","/n5/vocab" -Viewport desktop
# mobile (viewport 390x844 jujur, lewat iframe) + mode terang
pwsh -File tools/shots.ps1 -Prefix qa -Pages "/n5/vocab" -Frames "390x844,834x1112" -Scheme light
```

Catatan: Chrome di Windows menolak window lebih sempit dari ~500 CSS px, jadi mode
`-Frames` me-render halaman di dalam `<iframe>` selebar yang diminta. Viewer-nya
ditulis sementara ke `public/_qa/` lalu dihapus lagi pada akhir skrip.


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

**Halaman error 500 dengan `Cannot find module './vendor-chunks/....js'`**

`next dev` dan `next build` memakai folder `.next` yang sama, jadi menjalankan
`next build` saat dev server aktif akan menimpa artefak dev dan merusaknya
(gejalanya: halaman 500, chunk hilang, atau UI tampil dengan data lama).

Perbaikannya: hentikan dev server, hapus cache, lalu jalankan lagi.

```bash
pnpm clean          # hapus apps/web/.next
pnpm dev
```

Sebaiknya jangan menjalankan `build` selama `dev` hidup.

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

- [Changelog](CHANGELOG.md) — riwayat rilis per versi (versi terbaru: 2.5.1)
- [Cetak biru bank soal](docs/BLUEPRINT-BANK-SOAL.md) — taksonomi N5/N4/JFT, skema butir, form, penilaian, roadmap N3–N1
- [Bank soal](docs/bank-soal/README.md) — JSON Schema, 34 butir contoh, matriks target, DDL Supabase, validator
- [Design system](docs/DESIGN-SYSTEM.md) — arah visual, token, tipografi, aturan mobile
- [Supabase](supabase/README.md) — langkah mengaktifkan backend

## Kredit data

Materi MVP ditulis manual. Untuk dataset lengkap, sumber yang direncanakan:
JMDict, KANJIDIC2, KanjiVG, Tatoeba (semua CC BY-SA / CC BY). Detail ada di
halaman `/about` dan `packages/content/src/credits.ts`.
