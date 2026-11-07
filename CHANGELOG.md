# Changelog

Semua perubahan penting pada Manabi dicatat di sini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan
versi mengikuti [Semantic Versioning](https://semver.org/lang/id/). Catatan
pembaruan lintas project tidak tinggal di sini — itu ada di situs pribadi.

## [2.3.0] — 2026-11-07

Rilis ini menjawab pertanyaan yang paling sering muncul di awal belajar: **kenapa bacaan kanji
berubah** ketika bertemu kata lain.

### Ditambahkan

- **Modul Bacaan Kanji** (`/[level]/bacaan-kanji`) dengan **aturan cepat** untuk empat kanji yang
  bacaannya paling sering membingungkan:
  - 何 — なに saat berdiri sendiri, なん di depan bunyi d/t/n dan kata satuan (何時, 何日, 何歳)
  - 今 — いま sendiri, こん dalam gabungan, dengan 今日 (きょう) dan 今年 (ことし) sebagai pengecualian
  - 日 — ひ, にち, か, dan び tergantung konteks (日曜日, 二日, 誕生日)
  - 人 — ひと, じん, にん, dengan 一人 (ひとり) dan 二人 (ふたり) sebagai jukujikun
- **24 entri perubahan bacaan** berlabel jenisnya: jukujikun (今日, 明日, 一人, 大人, 眼鏡),
  rendaku (花火, 手袋, 心配, 誕生日), gabungan on'yomi (学校, 電車, 日本), dan gabungan kun'yomi
  (手紙, 花見, 食べ物).
- **Latihan membaca** (`/[level]/bacaan-kanji/latihan`) dengan dua mode — *pilih bacaan* dan
  *bedakan bacaan* — sebanyak **59 soal**, lengkap dengan alasan dan catatan pengecualian.
- **Bagian "Bacaan & Konteks"** pada detail kanji di halaman Kanji, sehingga 何/今/日/人 langsung
  menampilkan aturan dan contohnya.
- Modul bacaan kanji muncul di navigasi, hub level, dan dasbor.

### Catatan kejujuran materi

Aturan bacaan diberi label **"hampir selalu"** atau **"kecenderungan"**, dan setiap aturan
menyertakan pengecualiannya — misalnya 何色 (なにいろ) dan 何語 (なにご) yang tidak mengikuti pola
"なん di depan bunyi tertentu", serta 何で yang bisa dibaca なんで (kenapa) atau なにで (dengan apa).
Materi disusun sebagai pegangan belajar, bukan hukum mutlak.

### Diubah

- Versi proyek naik ke `2.3.0`.

## [2.2.0] — 2026-11-07

Rilis ini menambah modul **partikel (助詞)**, mengunci sesi latihan/ujian,
dan membuat beranda berubah setiap hari.

### Ditambahkan

- **Modul Partikel** (`/[level]/partikel`): 18 partikel N5 (は が を に で へ の と
  も か から まで や ね よ より ほど だけ) dengan fungsi, penjelasan, contoh
  berpelafalan, 6 kartu **pasangan yang sering tertukar** (は/が, に/で, に/へ,
  は/も, を/が, と/や), dan 4 **jebakan khusus** (好き・分かる memakai が,
  keberadaan memakai に, meninggalkan tempat memakai を, に/へ saling
  menggantikan).
- **Latihan Partikel** (`/[level]/partikel/latihan`) dengan lima mode yang bisa
  dikombinasikan: isi celah, ketik jawaban, cocokkan fungsi, bedakan pasangan,
  dan lengkapi teks. Bank soal **186 item** dibangkitkan dari data partikel,
  lengkap dengan alasan jawaban benar dan alasan pilihan lain salah.
- **Kunci sesi**: selama latihan atau ujian berjalan, navigasi aplikasi
  disembunyikan dan pengguna tidak bisa pindah menu. Keluar hanya lewat dialog
  konfirmasi — *selesaikan sesi*, *lanjut mengerjakan*, atau *keluar & buang
  jawaban*. Menutup tab atau memuat ulang memunculkan konfirmasi browser.
- **Tombol layar hasil**: *Selesai* (kembali ke layar penyiapan untuk ganti
  soal/mode), *Ulangi*, *Kembali ke modul*, dan *Ke dasbor*.
- **Kartu hari ini** di beranda kini berganti setiap hari: satu item
  deterministik dari tanggal (kanji, kosakata, tata bahasa, atau kana), stabil
  sepanjang hari, dengan tombol acak dan tautan ke modul asalnya.
- **Menu navigasi beranda di layar kecil**, yang sebelumnya hilang di mobile.
- Partikel muncul di navigasi samping, hub level, dasbor, dan layar penyiapan
  Latihan.

### Diubah

- Kontras teks sekunder (`--fg-subtle`) dinaikkan agar memenuhi ambang WCAG
  4.5:1: tema terang dari 3.04:1 menjadi 4.72:1, tema gelap dari 3.78:1 menjadi
  4.72:1. Seluruh pasangan warna level N5–N1 sudah lolos tanpa perubahan.
- Versi proyek naik ke `2.2.0`.

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
