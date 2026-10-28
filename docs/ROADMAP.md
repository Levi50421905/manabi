# Roadmap

## ✅ MVP (v0.1) — selesai

- [x] Monorepo pnpm: `apps/web`, `packages/{content,srs,ui}`
- [x] Next.js 15 App Router + TypeScript + Tailwind
- [x] Design system dasar (Button, Card, Badge, ProgressBar)
- [x] Kana trainer: grid hiragana/katakana + kuis dua arah + TTS
- [x] Kanji N5: 111 kanji + detail bacaan/radikal/mnemonic + kuis
- [x] Kosakata N5: 708 kata, filter, pencarian, sesi SRS 4 tombol
- [x] Tata bahasa N5: 48 pola, contoh + catatan
- [x] Ujian: 文の組み立て (12 soal) + 聴解 4 tipe (24 soal)
- [x] Listening: 12 dialog, 3 kecepatan, putar berurutan
- [x] Reading: 10 bacaan berfurigana + pertanyaan pemahaman
- [x] Latihan campuran & per modul dengan pembahasan
- [x] Dasbor: XP, level, streak, aktivitas 7 hari, riwayat latihan
- [x] Kamus lintas materi
- [x] Progres persisten via localStorage
- [x] Skema Supabase disiapkan (belum aktif)
- [x] Latihan menulis kana & kanji di kanvas (mouse/stylus/sentuh)
- [x] Target harian + progress bar di sidebar
- [x] Halaman pengaturan (tema, target, kecepatan suara, furigana)
- [x] Mode gelap (CSS variables, anti-flicker)
- [x] Re-queue kartu "Lupa" + shortcut keyboard di quiz

## v0.2 — akun & penyempurnaan

- [ ] Supabase Auth (Google + email), sinkron progres
- [ ] Penilaian kemiripan goresan (data KanjiVG) — saat ini menulis masih bebas tanpa skor
- [ ] Pengingat harian (notifikasi browser)
- [ ] Unit test untuk `@manabi/srs` (batas interval, lapse, ease)
- [ ] Optimasi bundle: data materi dipecah per rute (~175 kB First Load JS karena 708 kata ikut ter-bundle)

## v1.0 — kurikulum N4–N3

- [ ] Materi N4 lengkap (kanji, kosakata, tata bahasa, reading, listening audio asli)
- [ ] Jalur belajar personal berdasarkan tujuan pengguna
- [ ] Gamifikasi: badge, target mingguan, leaderboard opt-in
- [ ] Statistik per keterampilan (reading vs listening vs kanji)
- [ ] Aksesibilitas: navigasi keyboard penuh, aria-label audit

## v2.0 — sosial & AI

- [ ] Speaking practice (MediaRecorder + penilaian pelafalan)
- [ ] Forum/komunitas tanya-jawab
- [ ] PWA + mode offline (cache materi & audio)
- [ ] AI tutor: koreksi kalimat & penjelasan adaptif
- [ ] Materi N2–N1

## Definition of done (tiap fitur)

1. Berjalan di `pnpm dev` tanpa error konsol.
2. `pnpm typecheck` bersih.
3. Ada empty state, state memuat, dan pesan error.
4. Responsif di 375 px dan 1440 px.
5. Menambah/mengubah materi tidak merusak modul lain.
