# Roadmap

## ✅ MVP (v0.1) — selesai

- [x] Monorepo pnpm: `apps/web`, `packages/{content,srs,ui}`
- [x] Next.js 15 App Router + TypeScript + Tailwind
- [x] Design system dasar (Button, Card, Badge, ProgressBar)
- [x] Kana trainer: grid hiragana/katakana + kuis dua arah + TTS
- [x] Kanji N5: 26 kanji + detail bacaan/radikal/mnemonic + kuis
- [x] Kosakata N5: 40 kata, filter, pencarian, sesi SRS 4 tombol
- [x] Tata bahasa N5: 13 pola, contoh + catatan
- [x] Listening: 4 dialog, 3 kecepatan, putar berurutan
- [x] Reading: 3 bacaan berfurigana + pertanyaan pemahaman
- [x] Latihan campuran & per modul dengan pembahasan
- [x] Dasbor: XP, level, streak, aktivitas 7 hari, riwayat latihan
- [x] Kamus lintas materi
- [x] Progres persisten via localStorage
- [x] Skema Supabase disiapkan (belum aktif)

## v0.2 — akun & konten lebih dalam

- [ ] Supabase Auth (Google + email), sinkron progres
- [ ] Latihan menulis goresan (KanjiVG, kanvas + penilaian kemiripan)
- [ ] Target harian & notifikasi pengingat
- [ ] Import dataset lengkap: N5 penuh (~100 kanji, ~800 kata)
- [ ] Halaman pengaturan (suara, furigana default, target level)
- [ ] Mode gelap
- [ ] Unit test untuk `@manabi/srs` (batas interval, lapse, ease)

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
