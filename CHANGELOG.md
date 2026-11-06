# Changelog

Semua perubahan penting pada Manabi dicatat di sini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan
versi mengikuti [Semantic Versioning](https://semver.org/lang/id/). Catatan
pembaruan lintas project tidak tinggal di sini — itu ada di situs pribadi.

## [2.1.0] — 2026-11-06

Rilis ini membuat bentuk jawaban latihan bisa dipilih, tidak lagi selalu
terjemahan.

### Ditambahkan

- **Pilihan bentuk jawaban** di halaman Latihan: *Terjemahan*, *Romaji*, atau
  *Kana*. Berlaku untuk soal kosakata dan kanji, termasuk yang muncul di mode
  Campuran. Sebelumnya setiap soal selalu meminta arti.
- Kartu **contoh soal** di layar penyiapan, berubah mengikuti pilihan bentuk
  jawaban supaya tidak ada kejutan setelah sesi dimulai.
- `CHANGELOG.md` sebagai riwayat rilis yang bisa dirujuk.

### Diubah

- `buildVocabQuestions()` dan `buildKanjiQuestions()` menerima `answerType`,
  sehingga jawaban yang ditanyakan bisa diganti tanpa membuat builder baru.
- Untuk bentuk jawaban *Romaji* pada soal kanji, bacaan kana diubah ke romaji
  lewat peta huruf kana yang sudah ada di `packages/content`.
- `SegmentedControl` memakai isian warna tinta pada opsi aktif supaya pilihan
  terbaca jelas di tema terang maupun gelap.
- Versi proyek naik ke `2.1.0`.

## [2.0.0] — 2026-10-31

Rilis besar pertama: tampilan dan struktur aplikasi disusun ulang.

### Ditambahkan

- Arah visual 「和モダン」 Editorial Warm: netral hangat, judul serif, garis
  rambut, dan satu warna aksen per level JLPT.
- Design system baru di `packages/ui` (16 komponen) dengan dokumentasi kontrak
  di [`docs/DESIGN-SYSTEM.md`](docs/DESIGN-SYSTEM.md).
- Arsitektur multi-level: modul berpindah ke `/[level]/<modul>`, metadata
  kurikulum terpusat di `packages/content/src/levels.ts`, dan layar
  "segera hadir" untuk level yang belum punya materi.
- Kerangka aplikasi baru: rail desktop terkelompok, top bar + bottom nav mobile,
  sheet menu, dan level switcher.
- Halaman ringkasan level `/[level]`.

### Diubah

- Seluruh halaman ditulis ulang: landing, dasbor, sembilan modul, kamus,
  pengaturan, tentang, dan 404.
- Rute lama (`/vocab`, `/kanji`, …) dialihkan permanen ke `/n5/…`.
- Grafik aktivitas 7 hari diperbaiki (tinggi px, bukan persen).
- Status "jatuh tempo" dipisah dari "kartu baru" agar angka tidak menyesatkan.

### Dihapus

- Animasi hujan kelopak sakura dan pohon sakura yang menutupi teks.
- Komponen `Sidebar` lama, digantikan `AppShell`.

[2.1.0]: https://github.com/Levi50421905/manabi/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/Levi50421905/manabi/releases/tag/v2.0.0
