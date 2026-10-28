# Manabi (学び) — Desain Produk

> Dokumen ini adalah acuan konsep. Untuk status implementasi lihat
> [ROADMAP.md](./ROADMAP.md) dan [README.md](../README.md).

## 1. Konsep & positioning

| Aspek | Isi |
|---|---|
| Nama | **Manabi (学び)** — "belajar / pembelajaran" |
| Tagline | *Belajar Bahasa Jepang dari Nol sampai Lancar* |
| Visi | Platform belajar Jepang yang **terstruktur, interaktif, dan terukur** |
| Pembeda | Kurikulum JLPT + **SRS bawaan** + latihan yang aktif (bukan sekadar video) |

**Prinsip desain pembelajaran**

1. **Scaffolding** — materi maju bertahap; tiap level membangun level sebelumnya.
2. **Active recall + spaced repetition** — ingatan dipertahankan lewat ulasan terjadwal.
3. **Input & output seimbang** — listening, reading, writing, speaking semuanya dilatih.
4. **Gamifikasi ringan** — streak & XP untuk konsistensi, bukan kompetisi yang menekan.
5. **Beban kognitif rendah** — satu layar satu fokus; furigana & romaji bisa dimatikan.

## 2. Persona

1. **Pemula total** — belum kenal hiragana; target bisa baca & percakapan dasar.
2. **Peserta JLPT** — butuh silabus jelas, latihan soal per level.
3. **Otodidak** — butuh jalur belajar & progres yang terlihat.
4. **Penggemar budaya Jepang** — ingin memahami anime/manga/J-pop tanpa subtitle.

## 3. Fitur

### Inti (MVP — sudah ada di repo)

- **Kana Trainer** — hiragana & katakana, grid per baris, kuis dua arah (huruf → romaji, romaji → huruf), klik untuk mendengar.
- **Latihan Menulis** — kanvas menulis kana & kanji dengan panduan samar, undo, dan grid bantu (mouse, stylus, layar sentuh).
- **Kanji N5** — 111 kanji: grid, detail On'yomi / Kun'yomi / radikal / goresan / mnemonic / contoh kata, kuis arti.
- **Kosakata + SRS** — 708 kata; flashcard 4 tombol (Lupa/Sulit/Biasa/Mudah), jadwal ulang otomatis, kartu "Lupa" diulang di akhir sesi, filter jenis kata & pencarian.
- **Tata Bahasa N5** — 39 pola, penjelasan bahasa Indonesia, contoh yang bisa diputar, catatan penting.
- **Listening** — 12 dialog dengan pelafalan Jepang, tiga kecepatan, toggle kana & terjemahan, putar semua berurutan.
- **Membaca** — 10 bacaan berfurigana (bisa disembunyikan), terjemahan, pertanyaan pemahaman.
- **Latihan (Quiz)** — mode campuran, kosakata, kanji, kana, tata bahasa; pembahasan tiap soal; shortcut 1–4 & Enter.
- **Dasbor** — XP, level, streak, ulasan tertunda, grafik aktivitas 7 hari, riwayat latihan.
- **Kamus** — pencarian lintas kosakata/kanji/tata bahasa/bacaan.
- **Pengaturan** — tema terang/gelap/sistem, target harian, kecepatan suara, furigana default, reset data.

### Pendukung (v0.2+)

- Auth + sinkronisasi progres (Supabase).
- Penilaian kemiripan goresan kanji (data KanjiVG).
- Pengingat harian, PWA/offline.
- Gamifikasi lanjutan: badge, leaderboard.

### Lanjutan (v1+)

- Speaking practice (rekam & bandingkan).
- Komunitas/forum tanya-jawab.
- AI tutor untuk koreksi kalimat.
- Jalur belajar personal per tujuan (JLPT / travel / anime).

## 4. Kurikulum

Struktur mengikuti **JLPT** sebagai standar acuan.

| Level | Kanji | Kosakata | Target |
|---|---|---|---|
| N5 | ~100 | ~800 | percakapan harian sederhana |
| N4 | ~300 | ~1.500 | kalimat kompleks ringan |
| N3 | ~650 | ~3.750 | memahami konten harian |
| N2 | ~1.000 | ~6.000 | bisnis & media |
| N1 | ~2.000 | ~10.000 | kemahiran penuh |

**Anatomi satu pelajaran**

1. Kosakata baru (audio + contoh kalimat)
2. Pola tata bahasa (penjelasan + rumus + 3 contoh)
3. Latihan pola (quiz)
4. Listening (dialog pendek)
5. Reading (paragraf sesuai level)
6. Ulasan SRS terjadwal

## 5. Sumber data terbuka

| Konten | Sumber | Lisensi |
|---|---|---|
| Kamus | JMDict / KANJIDIC2 | CC BY-SA 3.0 |
| Kanji (goresan) | KanjiVG | CC BY-SA 3.0 |
| Contoh kalimat | Tatoeba | CC BY 2.0 FR |
| Audio | Web Speech API → TTS berbayar saat produksi | — |

> Untuk MVP, dataset ditulis manual demi kontrol kualitas & ukuran bundel.
> Saat dataset lengkap dipasang, wajib mencantumkan kredit (lihat `/about`).

## 6. Arsitektur teknis

```
manabi/
├── apps/web/                 Next.js 15 (App Router)
│   ├── app/                  rute: /, /dashboard, /kana, /vocab, /kanji,
│   │                         /grammar, /listening, /reading, /quiz,
│   │                         /dictionary, /about
│   ├── components/           Sidebar, QuizRunner, SpeakButton
│   └── lib/                  store (progres+SRS), quiz, tts
├── packages/content/         data materi + tipe + pencarian
├── packages/srs/             algoritma SM-2
├── packages/ui/              Button, Card, Badge, ProgressBar
└── supabase/                 schema + catatan integrasi
```

**Alasan pemisahan paket**: menambah level baru (N4, N3, …) cukup menambah file
data di `packages/content`, logika SRS bisa diganti (SM-2 → FSRS) tanpa
menyentuh UI, dan `packages/ui` memastikan tampilan konsisten.

## 7. Model data progres

```ts
ProgressState = {
  xp: number,
  streak: number,
  lastStudyDate: string | null,   // YYYY-MM-DD (lokal)
  cards: Record<string, SrsCard>, // id materi → jadwal
  quizzes: QuizRecord[],
  activity: Record<string, number> // YYYY-MM-DD → jumlah aksi
}
```

`SrsCard` menyimpan `ease`, `interval`, `repetitions`, `due`, `lapses`,
`reviews`. Nama kolom tabel Supabase dibuat identik agar migrasi mudah.

## 8. Prinsip UX

- **Satu fokus per layar** — daftar materi vs sesi review adalah dua mode terpisah.
- **Jawaban selalu bisa diperiksa** — setiap soal punya pembahasan singkat.
- **Progres terlihat** — XP, level, streak, bar progres per modul.
- **Ramah pemula** — furigana & romaji opsional, pelafalan bisa diperlambat.
- **Tanpa friksi** — MVP tidak memaksa daftar akun; progres langsung tersimpan lokal.
