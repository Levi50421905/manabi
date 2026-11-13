# Changelog

Semua perubahan penting pada Manabi dicatat di sini.

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id-ID/1.1.0/) dan
versi mengikuti [Semantic Versioning](https://semver.org/lang/id/). Catatan
pembaruan lintas project tidak tinggal di sini — itu ada di situs pribadi.

## [2.8.0] — 2026-11-13

Rilis ini menerapkan **Arah 3 "Nakama"** — arah desain baru — ke hampir seluruh aplikasi, lalu
menambahkan animasi transisi dan umpan balik interaksi di atasnya.

### Diubah

- **Beranda baru** dengan susunan dan warna mengikuti arah Nakama, termasuk maskot dan brand mark
  baru (`components/mascot.tsx`, `components/brand-mark.tsx`) serta ikon situs.
- **Menu berbasis data** — navigasi samping dan menu seluler dibangun dari data, bukan daftar
  manual, sehingga menambah modul baru tidak perlu menyunting beberapa tempat.
- **Dasbor, Latihan, Bank soal, Partikel, Kanji, Kana, Menulis, dan Bacaan Kanji** disesuaikan ke
  sistem visual baru: token warna, tipografi, dan jarak yang konsisten.

### Ditambahkan

- **Transisi halaman halus** (`components/page-transition.tsx`) — perpindahan antar halaman tidak
  lagi terasa berkedip.
- **Bilah progres navigasi** (`components/route-progress.tsx`) — penanda halus saat halaman
  berikutnya sedang dimuat.
- **Umpan balik interaksi** pada kuis dan navigasi, termasuk sinkronisasi tema.

## [2.7.0] — 2026-11-08

Rilis ini menambahkan **bank soal terkurasi (beta)** dan memperbarui ujian.

### Ditambahkan

- **Bank soal** (`/[level]/bank`) — butir soal tetap dengan pembahasan berlapis, paket N5 dan
  JFT-Basic. Berbeda dari latihan acak, butir di sini tidak dibangkitkan ulang setiap sesi.
- **Skor ujian 2026** — pembobotan dan ambang kelulusan mengikuti format terbaru.
- Perintah `pnpm validate:bank` untuk memeriksa berkas bank soal.
- Dokumen skema: `docs/BLUEPRINT-BANK-SOAL.md`, `docs/bank-soal/skema-butir-soal.json`, matriks
  kurikulum, dan SQL pendukung.
- Tambahan materi konteks & etiket beserta data romaji.

### Diubah

- **Latihan** kini punya 9 mode: campuran, variasi, kosakata, kana, kanji, tata bahasa, membaca,
  mendengar, dan susun.
- Navigasi, layar hasil, dan halaman ujian diperbarui mengikuti bank soal.

## [2.6.1] — 2026-11-07

### Ditambahkan

- **Fade-up saat scroll** — bagian setelah hero muncul halus ketika masuk viewport
  (IntersectionObserver, dipasang sekali untuk seluruh halaman utama).
- **Tekstur grain** halus di halaman utama agar latar tidak terasa kosong.
- **Efek tekan** pada tombol dan tautan sebagai umpan balik saat diklik.

Semua animasi dinonaktifkan otomatis oleh `prefers-reduced-motion`.

## [2.6.0] — 2026-11-07

### Diubah

- **Judul hero memakai ink reveal** (sumi-e): muncul seperti disapu kuas dari kiri.
- **Latar kanji mengambang dihapus** — sesuai arah desain yang tenang, tidak ada gerakan latar.

## [2.5.2] — 2026-11-07

### Ditambahkan

- Animasi pertama halaman utama: latar kanji mengambang, garis aksen tumbuh, kilau tombol utama,
  dan kartu harian masuk bertahap.

## [2.5.1] — 2026-11-07

Perapian tampilan: navigasi samping dan halaman utama.

### Diubah

- **Sidebar lebih ringkas dan rapi.** Baris navigasi dipadatkan (32px), item aktif ditandai batang
  tipis di kiri alih-alih blok warna penuh, dan bagian Referensi disusun dua kolom. Seluruh menu
  kini muat tanpa scroll pada layar 720p ke atas — sebelumnya daftar 15 item memaksa scroll.
- **Halaman utama lebih mengarahkan ke belajar.** Tombol utama menjadi **"Mulai Belajar →"** menuju
  hub level, dengan **"Lihat progres"** sebagai aksi sekunder. Tombol di bilah atas juga berubah
  dari "Buka dasbor" menjadi "Mulai Belajar →".
- **Dua pintu masuk cepat** di hero untuk pengunjung baru: "Belum kenal huruf? → Kana" dan
  "Sudah bisa kana? → Kosakata".
- Judul hero memakai ukuran adaptif agar tidak meluap di layar sempit.

## [2.5.0] — 2026-11-07

Rilis ini melengkapi Konteks & Etiket dengan **kategori praktis** dan menambahkan **ulasan berbasis
konteks** — dua hal yang sebelumnya hanya direncanakan.

### Ditambahkan

- **D · Praktis untuk hidup di Jepang**, enam kartu yang memang harus dilakukan dengan benar:
  - **Sampah** — 燃える／燃えない／資源ゴミ, jadwal per daerah, ゴミ置き場, 粗大ゴミ
  - **Memesan makan** — 券売機 dan 食券, 「これお願いします」
  - **店内 atau お持ち帰り** — pertanyaan kasir yang harus dijawab tepat
  - **自販機** — uang tunai, kartu IC, つめた〜い／あたたか〜い
  - **Gempa** — 安全確保, 非常口, matikan api, ikuti informasi resmi
  - **Evakuasi** — 避難所, 津波警報, tanda bahaya di dekat pantai
- **Ulasan Konteks** (`/[level]/ulasan`) — kartu ulangan SRS yang menyimpan **pola konteks**,
  bukan arti lepas. Tiga jenis kartu:
  - *Bacaan*: depan 「何で」 → belakang 「なんで — kenapa」
  - *Partikel*: depan makna ("juga") → belakang partikel + contoh kalimat
  - *Situasi*: depan situasi + lawan bicara → belakang kalimat yang pas
- Ulasan memakai penjadwalan SRS yang sudah ada: kartu jatuh tempo, kartu baru, dan tombol nilai
  Lupa／Sulit／Bagus／Mudah. Total 54 kartu untuk N5.

### Diubah

- Halaman Konteks & Etiket kini punya empat bagian: A (tingkat bicara), B (keigo tiga lapis),
  C (kebiasaan & hal unik), dan D (praktis).
- Menu **Ulasan** ditambahkan ke navigasi bagian Latihan.
- Versi proyek naik ke `2.5.0`.

## [2.4.2] — 2026-11-07

Melanjutkan perbaikan 2.4.1. Pendekatan sebelumnya — menyebut fungsi partikel di instruksi — memang
menghilangkan ambiguitas, tetapi **membocorkan jawabannya**: kalau soal berbunyi *"pilih partikel
yang berarti juga"*, jawabannya tinggal dicari, bukan dipahami.

### Diubah

- **Soal partikel kini memakai kalimat pengantar (konteks), bukan petunjuk.** Contoh:
  > 授業は九時に始まります。
  > 九時 ___ 勉強します。

  Konteks itulah yang memaksa jawaban から, sehingga まで tidak lagi mungkin — tanpa memberi tahu
  fungsi partikelnya.
- **Instruksi dibuat netral**: "Lengkapi kalimat berikut." / "Tulis partikel yang tepat."
  Petunjuk yang menyebut fungsi partikel dihapus.
- **Terjemahan tidak lagi ditampilkan saat menjawab** — hanya muncul setelah jawaban diperiksa,
  sebagai bagian dari pembahasan.
- **Soal isi celah otomatis dibatasi** pada partikel yang memang dipaksa struktur kalimatnya
  (を, の, だけ, ほど, より, か). Partikel seperti は, が, も, と, や, に, で, へ tidak lagi
  dibangkitkan otomatis karena kalimat tunggalnya bisa punya lebih dari satu jawaban sah.
- **Soal 家を出ます diganti** karena を dan から sama-sama sah untuk 出ます.

### Catatan

Jumlah soal turun dari 186 menjadi **114** — ini disengaja: soal yang ambigu lebih buruk daripada
bank soal yang lebih kecil tetapi setiap jawabannya benar-benar tunggal.

## [2.4.1] — 2026-11-07

Perbaikan penting: beberapa soal latihan punya lebih dari satu jawaban yang sah, sehingga jawaban
benar terasa dipaksakan.

### Diperbaiki

- **Soal partikel kini menyebut fungsi yang dicari.** Contoh kasus: 「わたし ___ 学生です。」 bisa
  diisi は maupun も. Sekarang soalnya berbunyi *"Pilih partikel yang berarti “juga”."* untuk
  jawaban も, dan *"Pilih partikel yang menandai topik kalimat."* untuk jawaban は — sehingga hanya
  satu jawaban yang benar-benar tepat.
- **Terjemahan kalimat ditampilkan** pada semua soal partikel sebagai pengunci maksud soal.
- **Soal 家を出ます** memakai instruksi khusus ("menandai tempat yang ditinggalkan"), karena を di
  sana bukan penanda objek langsung.
- **Soal tata bahasa menampilkan terjemahan** kalimat contoh agar pola yang dimaksud jelas.
- **Soal kanji** menyatakan pertanyaannya secara eksplisit ("… — apa arti kanji ini?").

Aturan baru untuk kontributor: soal baru **wajib** menyatakan apa yang dicari, bukan hanya
menampilkan kalimat rumpang.

## [2.4.0] — 2026-11-07

Rilis ini menambahkan **Konteks & Etiket (敬語とマナー)** — tiga kelompok materi yang biasanya
tidak masuk buku tata bahasa, padahal justru paling sering bikin pembelajar terdengar canggung.

### Ditambahkan

- **A · Menyesuaikan ucapan dengan lawan bicara.** Tiga situasi (menanyakan nama, menawarkan
  makanan, menanyakan jam) ditampilkan pada empat tingkat: akrab/keluarga, teman, atasan/klien,
  dan orang baru dikenal — masing-masing dengan kalimat, terjemahan, dan catatan kapan dipakai.
- **B · Tiga lapis kesopanan (敬語).** Sepuluh kata kerja disajikan dalam tiga bentuk:
  丁寧 (sopan), 尊敬 (untuk orang lain), dan 謙譲 (untuk diri sendiri) — termasuk 行く, 来る, いる,
  言う, 見る, 食べる, する, 会う, 聞く, dan 知る.
- **C1 · Biasa bagi orang Jepang, asing bagi kita.** Tujuh kartu: ragam tawa (はは・ふふ・ぐふふ・
  w・草), いってきます／いってらっしゃい, ただいま／おかえりなさい, いただきます／ごちそうさま,
  すみません yang bermakna tiga, はい yang belum tentu setuju, もしもし di telepon, serta aturan
  awalan お／ご.
- **C2 · Hal unik yang membingungkan.** Lima kartu: nama kanji yang tak terduga, 大丈夫 sebagai
  penolakan halus, 空気を読む／そろえる, お疲れ様です sebagai sapaan kerja, dan onomatope seperti
  ぽかぽか, ドキドキ, きらきら.
- **Latihan konteks** (`/[level]/konteks/latihan`) dengan dua mode: *pilih tingkat bicara* dan
  *pilih bentuk sopan*, dilengkapi kunci sesi seperti modul lain.
- Modul konteks muncul di navigasi, hub level, dan dasbor.

### Catatan kejujuran materi

Setiap kartu diberi label **"Berlaku umum"** atau **"Tergantung situasi"**. Yang bertanda
*tergantung situasi* (mis. 大丈夫 sebagai penolakan, そろえる, aturan お／ご) memang berbeda menurut
daerah, hubungan, atau kebiasaan setempat — disajikan sebagai kecenderungan, bukan hukum mutlak.

### Diubah

- Versi proyek naik ke `2.4.0`.

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
