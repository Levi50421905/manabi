# Cetak Biru Bank Soal & Arsitektur Konten Manabi-Rouge

> **Versi** 1.0 · **Tanggal** 8 November 2026 · **Status** acuan produksi konten
> **Cakupan** JLPT N5–N4, JFT-Basic (A1–A2.2), fondasi N3–N1
> **Pemilik** Tim Kurikulum & Asesmen Manabi-Rouge
> **Produk** <https://manabi-rouge.vercel.app/> · **Repo** `manabi` (aplikasi web `apps/web`, paket konten `packages/content`)

Dokumen ini adalah cetak biru, bukan katalog soal. Isinya menetapkan **apa yang
dibangun, dalam urutan apa, dengan mutu seperti apa**, agar bank soal
Manabi-Rouge tumbuh dari kumpulan latihan menjadi aset asesmen yang valid,
terkalibrasi, dan aman diperluas sampai N1. Semua angka target di sini adalah
**keputusan desain Manabi-Rouge**; angka yang berasal dari JLPT/JFT ditandai
secara eksplisit beserta tautan sumber resminya.

---

## Ringkasan eksekutif

| Keputusan | Isi |
|---|---|
| **Satu bank, banyak ujian** | Satu skema butir soal, satu taksonomi, dengan *crosswalk* JLPT ↔ JFT. Tidak ada bank terpisah yang menduplikasi konten. |
| **Tiga lapis konten** | (1) atom pengetahuan (kana, kanji, kosakata, pola, fungsi), (2) objek belajar (pelajaran, dialog, bacaan, drill), (3) butir asesmen terkalibrasi. Form ujian adalah lapis keempat yang dirakit dari lapis 3. |
| **Target bank Fase 1** | **6.000 butir unik**: N5 2.000, N4 2.400, JFT-Basic 1.680, jembatan/diagnostik 520; 600 butir JFT *dual-tag* dengan N5/N4 sehingga total unik tetap 6.000. |
| **Bentuk simulasi** | N5 75 butir/90 menit; N4 98 butir/115 menit; JFT 50 butir/60 menit. Mengikuti waktu dan tipe soal resmi; jumlah butir adalah desain form Manabi karena JLPT hanya mempublikasikan perkiraan. |
| **Skor** | JLPT: dua seksi penilaian 120 + 60, lulus N5 ≥ 80 dan N4 ≥ 90, ambang seksi **38** (seksi 120) dan **19** (seksi 60). JFT: skala 10–250 hasil *equating*, pita A1/A2.1/A2.2; Manabi hanya menampilkan **estimasi pita**, bukan skor resmi. |
| **Temuan kritis** | (a) JFT-Basic berubah sejak **Agustus 2026**: ~50 soal, 60 menit, skor 10–250, tiga pita CEFR, audio bisa diputar dua kali, instruksi tersedia dalam bahasa Indonesia. (b) Simulasi N5 di repo memakai ambang seksi 19 untuk kedua seksi; seharusnya **38** untuk seksi Bahasa & Membaca. (c) Bank saat ini dihasilkan prosedural saat runtime, belum merupakan bank butir terkurasi. |
| **Urutan eksekusi** | Fondasi & koreksi (Q4 2026) → N5 lengkap (Q1 2027) → N4 + JFT (Q2 2027) → kalibrasi & N3 (Q3–Q4 2027) → N2–N1 (2028). Tiap transisi level dikunci oleh *gate* konten, psikometri, dan operasi. |

**Mengapa ini penting.** Pengguna N5/N4 di Indonesia adalah pasar gerbang: pelajar
mandiri, peserta *Ginou Jisshuusei*, dan pekerja *Tokutei Ginou*. Mereka tidak
hanya butuh "banyak soal", tetapi bukti bahwa latihan mereka berkorelasi dengan
ujian sebenarnya. Bank yang tidak terkalibrasi akan terasa seperti kuis biasa;
bank yang terkalibrasi memungkinkan Manabi-Rouge menjual **kesiapan**, bukan
sekadar akses materi.

---

## 1. Strategi Arsitektur Konten

### 1.1 Masalah yang harus diselesaikan

Bank soal Manabi-Rouge saat ini tumbuh dari kebutuhan MVP: soal dibuat saat
runtime dari array kosakata, kanji, dan tata bahasa (`apps/web/lib/quiz.ts`).
Pendekatan itu cepat dan cukup untuk latihan ringan, tetapi menyimpan empat
masalah struktural:

1. **Tidak ada identitas butir yang stabil.** Satu soal yang sama dapat muncul
   dengan susunan pilihan berbeda, sehingga sulit dilacak, dikalibrasi, atau
   dilaporkan.
2. **Tidak ada jaminan mutu per butir.** Distraktor dibuat acak, pembahasan
   sering hanya menyebut kunci, dan ambiguitas tidak terdeteksi otomatis.
3. **Tidak ada kendali paparan.** Form ujian merakit soal dengan `shuffle`,
   sehingga dua peserta bisa mendapat komposisi kesulitan yang sangat berbeda.
4. **Tidak ada data respons per butir.** `quiz_attempts` hanya menyimpan
   benar/total; tidak ada dasar untuk menghitung tingkat kesulitan, daya beda,
   atau kesiapan ujian.

Blueprint ini memisahkan **mesin latihan prosedural** (tetap dipertahankan untuk
drill ringan) dari **bank butir terkurasi** (baru, untuk asesmen). Keduanya
memakai taksonomi yang sama agar pengguna tidak merasakan dua produk berbeda.

### 1.2 Tiga lapis konten dan satu lapis form

```text
LAPIS 4  FORM / MOCK EXAM
         dirakit dari butir terpilih oleh form_blueprint + aturan exposure
              ▲
LAPIS 3  BUTIR ASESMEN (item)
         stem + opsi + kunci + pembahasan berlapis + metadata + kalibrasi
              ▲
LAPIS 2  OBJEK BELAJAR (learning object)
         pelajaran kosakata, pola grammar, dialog, bacaan, drill partikel
              ▲
LAPIS 1  ATOM PENGETAHUAN (knowledge node)
         kana · kanji · kata · pola · fungsi komunikatif · skenario
```

**Aturan pemisahan:**

- **Lapis 1 tidak boleh berisi soal.** Atom hanya menyimpan fakta yang dapat
  dirujuk: `vocab:n5:eiga`, `kanji:n5:gaku`, `grammar:n4:tara`, `func:request`.
- **Lapis 2 boleh menghasilkan latihan prosedural**, tetapi setiap latihan yang
  diklaim sebagai "persiapan ujian" harus merujuk ke butir Lapis 3.
- **Lapis 3 adalah satu-satunya sumber untuk mock exam.** Tidak ada form ujian
  yang dirakit langsung dari array materi.
- **Lapis 4 tidak menyimpan konten baru.** Form hanya menyimpan referensi butir,
  urutan, waktu, dan profil penilaian; ini yang membuat form dapat dibekukan,
  diaudit, dan dirakit ulang tanpa menduplikasi soal.

**Manfaat langsung:** satu butir dapat dipakai di latihan harian, drill seksi,
dan mock exam tanpa salinan; statistik respons terkumpul di satu tempat; dan
menambah level baru tidak mengubah skema inti.

### 1.3 Fakta resmi yang menjadi jangkar (JLPT 2026)

JLPT 2026 diselenggarakan 5 Juli dan 6 Desember. Struktur seksi dan waktunya
adalah sebagai berikut (sumber: [JLPT — Composition of Test Sections and
Items](https://www.jlpt.jp/e/guideline/testsections.html)):

| Level | Seksi uji | Waktu | Seksi penilaian | Skor |
|---|---|---:|---|---|
| **N5** | 言語知識（文字・語彙） | 20 menit | 言語知識（文字・語彙・文法）・読解 | 0–120 |
| | 言語知識（文法）・読解 | 40 menit | 〃 | 〃 |
| | 聴解 | 30 menit | 聴解 | 0–60 |
| **N4** | 言語知識（文字・語彙） | 25 menit | 言語知識（文字・語彙・文法）・読解 | 0–120 |
| | 言語知識（文法）・読解 | 55 menit | 〃 | 〃 |
| | 聴解 | 35 menit | 聴解 | 0–60 |

Aturan lulus (sumber: [JLPT — Scoring Sections, Pass or
Fail](https://www.jlpt.jp/e/guideline/results.html)):

| Level | Total | Lulus total | Ambang seksi 120 | Ambang seksi 60 |
|---|---:|---:|---:|---:|
| N5 | 180 | **80** | **38** | **19** |
| N4 | 180 | **90** | **38** | **19** |

> **Konsekuensi untuk Manabi-Rouge.** Lulus tidak cukup dengan total tinggi:
> jika salah satu seksi penilaian di bawah ambang, peserta gagal. Karena itu
> readiness meter harus menampilkan **dua dimensi**: total dan ambang seksi.
> Angka 38/19 inilah yang wajib dipakai, bukan 19/19.

CEFR sebagai referensi resmi (mulai Desember 2025): total N5 ≥ 80 dipetakan ke
**A1**, total N4 ≥ 90 ke **A2** (sumber: [JLPT — Indication of the CEFR
Level](https://www.jlpt.jp/e/about/cefr_reference.html)). Ini penting untuk
menyambungkan jalur N5/N4 dengan JFT-Basic yang juga memakai CEFR.

**Tipe soal resmi N5 dan N4** (dari tabel komposisi JLPT; N5 tidak menguji
`用法`, N4 menguji):

| Seksi | Tipe soal resmi | N5 | N4 |
|---|---|:---:|:---:|
| 文字・語彙 | 漢字読み (cara baca kanji) | ✓ | ✓ |
| | 表記 (penulisan kanji) | ✓ | ✓ |
| | 文脈規定 (kata sesuai konteks) | ✓ | ✓ |
| | 言い換え類義 (parafrasa) | ✓ | ✓ |
| | 用法 (penggunaan kata) | — | ✓ |
| 文法 | 文法形式の判断 (pilih bentuk grammar) | ✓ | ✓ |
| | 文の組み立て (susun kalimat) | ✓ | ✓ |
| | 文章の文法 (grammar dalam teks) | ✓ | ✓ |
| 読解 | 内容理解（短文） | ✓ | ✓ |
| | 内容理解（中文） | ✓ | ✓ |
| | 情報検索 (cari informasi) | ✓ | ✓ |
| 聴解 | 課題理解 (pahami tugas) | ✓ | ✓ |
| | ポイント理解 (pahami poin) | ✓ | ✓ |
| | 発話表現 (ungkapan yang tepat) | ✓ | ✓ |
| | 即時応答 (respons cepat) | ✓ | ✓ |

Catatan: N5/N4 **tidak** menguji 長文, 統合理解, 主張理解, 概要理解 — tipe itu
baru muncul di N3 ke atas. Ini batas penting agar bank N5/N4 tidak "kelewat
sulit" dan form tetap otentik.

**Jumlah butir.** JLPT hanya mempublikasikan *perkiraan* jumlah butir dan
menegaskan bahwa jumlah aktual dapat berbeda tiap sesi (sumber: [JLPT — Changes
in test time and approximate number of test items for N4 and
N5](https://www.jlpt.jp/e/topics/202009091599642827.html)). Karena itu
blueprint ini menetapkan **form Manabi** dengan jumlah butir yang masuk akal
terhadap waktu resmi, bukan mengklaim angka resmi:

| Form | Butir | Menit | Komposisi |
|---|---:|---:|---|
| JLPT N5 | 75 | 90 | 文字・語彙 25 · 文法・読解 26 · 聴解 24 |
| JLPT N4 | 98 | 115 | 文字・語彙 35 · 文法・読解 35 · 聴解 28 |
| JFT-Basic | 50 | 60 | 4 seksi × 12–13 butir |

### 1.4 JFT-Basic 2026: perubahan yang tidak boleh dilewatkan

Sejak **Agustus 2026**, JFT-Basic tidak lagi hanya mengukur A2.2. Berdasarkan
[About the JFT-Basic](https://www.jpf.go.jp/jft-basic/e/about/), fakta yang
berlaku sekarang:

| Aspek | Fakta resmi | Implikasi produk |
|---|---|---|
| Format | CBT, 4 seksi, **~50 soal**, **60 menit** | Timer 60 menit; tidak ada timer per seksi |
| Seksi | Script & Vocabulary, Conversation & Expression, Listening Comprehension, Reading Comprehension | Empat seksi, masing-masing ~12 soal |
| Navigasi | Boleh meninjau ulang dalam seksi yang sama; **tidak boleh kembali ke seksi sebelumnya**; Listening tidak bisa mundur/maju | Mode CBT harus mengunci seksi dan menyembunyikan navigasi mundur |
| Audio | Dapat diputar **maksimal dua kali** | Tombol putar dengan penghitung 2×; tidak ada autoplay tanpa batas |
| Bahasa | Soal tampil dalam bahasa Inggris + pop-up **bahasa lokal**, termasuk **Indonesia** | Toggle instruksi ID/EN; ini pembeda besar dari JLPT |
| Skor | Skala **10–250** hasil *equating*; A1 145–174, A2.1 175–199, A2.2 200–250; < 145 tidak menampilkan level | Tampilkan estimasi pita + persentase benar per seksi, bukan "lulus/gagal" mentah |
| Tanpa penalti | Tidak ada pengurangan nilai untuk jawaban salah | Strategi menjawab semua soal |
| Tujuan | Komunikasi kehidupan sehari-hari di Jepang; digunakan untuk SSW, Ginou Jisshuusei, dan student visa tertentu | Konten harus berbasis skenario, bukan hanya kosakata/grammar akademik |

Struktur kategori resmi JFT (11 kategori) menjadi dasar taksonomi:

| Seksi | Kategori resmi | Tujuan |
|---|---|---|
| Script & Vocabulary (~12) | Word meaning | Menguji makna kata |
| | Word usage | Menguji penggunaan kata |
| | Kanji reading | Menguji cara baca kata berkanji |
| | Kanji meaning and usage | Menguji makna/penggunaan kata berkanji |
| Conversation & Expression (~12) | Grammar | Grammar sesuai konteks |
| | Expression | Ungkapan sesuai konteks |
| Listening (~12) | Comprehending content (conversation) | Memahami pertukaran informasi/percakapan |
| | Comprehending content (shops/public places) | Memahami percakapan di toko/tempat publik |
| | Comprehending content (announcements/instructions) | Memahami pengumuman/instruksi |
| Reading (~12) | Comprehending content | Memahami surat/pesan pendek |
| | Information search | Menemukan informasi dari papan pengumuman/brosur |

**Jangkar kurikulum JFT.** JF Can-do for Life in Japan berisi **381 Can-do**
A1–A2; Irodori (Starter A1, Elementary 1–2 A2, Pre-Intermediate A2/B1) menetapkan
**341 Can-do** sebagai tujuan belajar (sumber: [JFT-Basic — Hint for
Learning](https://www.jpf.go.jp/jft-basic/e/support/index.html), [What is
Irodori?](https://www.irodori.jpf.go.jp/en/about.html)). Manabi-Rouge tidak
perlu menyalin Irodori, tetapi **peta domain kehidupan** dan tingkat kesulitan
Can-do-nya harus menjadi acuan agar latihan terasa relevan dengan ujian.

> **Peringatan metodologis.** JLPT Can-do Self-Evaluation List **bukan silabus**.
> Halaman resminya menyatakan daftar itu adalah hasil survei persepsi, bukan
> garis besar soal ([JLPT Can-do
> List](https://www.jlpt.jp/e/about/candolist.html)). Karena itu Manabi-Rouge
> memakai Can-do sebagai **alat komunikasi tujuan belajar**, bukan sebagai
> pengganti taksonomi item type resmi.

### 1.5 Taksonomi kanonik dan crosswalk JLPT ↔ JFT

Satu butir tidak boleh diberi label ganda hanya karena "mirip". Label ganda
hanya diberikan setelah **construct review**: apakah konstruk yang diukur benar-
benar sama?

| Kode kanonik | Nama Jepang | JLPT N5 | JLPT N4 | JFT-Basic | Catatan |
|---|---|:---:|:---:|---|---|
| `MG.KR` | 漢字読み | ✓ | ✓ | `SV.KR` | Konstruk sama: baca kata berkanji dalam kalimat |
| `MG.OR` | 表記 | ✓ | ✓ | `SV.KMU` (parsial) | JFT menguji makna/penggunaan kanji, bukan hanya ejaan |
| `MG.CD` | 文脈規定 | ✓ | ✓ | `SV.WM`, `SV.WU` | JFT memecah makna dan penggunaan |
| `MG.PP` | 言い換え類義 | ✓ | ✓ | `SV.WM` (parsial) | Hanya jika parafrasa tetap pada level A2 |
| `MG.US` | 用法 | — | ✓ | `SV.WU` | N4 lebih dekat ke JFT |
| `B.GF` | 文法形式の判断 | ✓ | ✓ | `CE.GR` | Sama-sama grammar dalam konteks |
| `B.SC` | 文の組み立て | ✓ | ✓ | — | JFT tidak punya tipe susun kalimat |
| `B.TG` | 文章の文法 | ✓ | ✓ | `CE.GR` | JFT menguji cohesion lewat dialog/teks pendek |
| `R.SH` | 内容理解（短文） | ✓ | ✓ | `R.CT` | Panjang teks berbeda; level ditandai |
| `R.MD` | 内容理解（中文） | ✓ | ✓ | `R.CT` | 〃 |
| `R.IR` | 情報検索 | ✓ | ✓ | `R.IS` | Konstruk sangat dekat |
| `L.TB` | 課題理解 | ✓ | ✓ | `L.CV`, `L.SH`, `L.AN` | JFT memecah menurut skenario |
| `L.KP` | ポイント理解 | ✓ | ✓ | `L.CV`, `L.SH`, `L.AN` | 〃 |
| `L.VE` | 発話表現 | ✓ | ✓ | `CE.EX` (parsial) | JFT menguji ungkapan tertulis/dialog, bukan produksi lisan |
| `L.QR` | 即時応答 | ✓ | ✓ | `CE.EX` (parsial) | 〃 |

**Aturan dual-tag:** sebuah butir boleh berlabel `jlpt` dan `jft` hanya jika
(a) level leksikal/gramatikalnya berada di irisan A2–N4, (b) skenarionya relevan
dengan kehidupan di Jepang, dan (c) reviewer JFT menyetujui. Target 600 butir
dual-tag bukan target administratif; itu konsekuensi dari 40% tumpang tindih
konstruk yang wajar.

### 1.6 Dimensi metadata: lima keluarga, tiga belas sumbu

Metadata bukan hiasan. Setiap sumbu harus punya **kegunaan operasional** yang
jelas: untuk perakitan form, rekomendasi, analitik, atau audit.

| Keluarga | Sumbu | Nilai contoh | Dipakai untuk |
|---|---|---|---|
| **Keselarasan ujian** | `exam_family` | `jlpt`, `jft` | filter bank, form |
| | `level` | `N5`, `N4`, `A2.2` | progresi, target |
| | `test_section` | `moji-goi`, `bunpou`, `dokkai`, `choukai`, `kaiwa-hyougen` | form, laporan |
| | `item_type` | `MG.KR`, `B.SC`, `L.QR` | blueprint, analitik |
| **Konstruk** | `knowledge_domain` | `kanji`, `vocab`, `grammar`, `pragmatics`, `reading`, `listening` | mastery, rekomendasi |
| | `cognitive_operation` | `recognize`, `recall`, `apply`, `infer`, `integrate` | distribusi kognitif |
| | `skill_tag` | `long-vowel`, `particle-ni-de`, `keigo-request` | error clustering |
| **Konten** | `scenario` | `workplace`, `shop`, `transport`, `health`, `city-hall`, `disaster` | JFT, kontekstualisasi |
| | `media` | `text`, `audio`, `image`, `table` | rendering, aksesibilitas |
| **Psikometri** | `difficulty_band` | 1–5 | perakitan form |
| | `calibration` | `p_value`, `b`, `a`, `fit` | readiness, rotasi |
| **Operasional** | `status` | `draft` → `published` → `retired` | workflow |
| | `provenance` | penulis, reviewer, lisensi, AI-assisted | audit, legal |

### 1.7 Konvensi ID, versi, dan deduplikasi

**ID butir** harus stabil, human-readable, dan tidak bergantung pada isi:

```text
MR-{LEVEL}-{SECTION}-{TYPE}-{SEQ}
MR-N5-MG-KR-0001
MR-N4-B-SC-0142
MR-JFT-SV-WM-0007
```

- `MR` = Manabi-Rouge.
- `LEVEL` = `N5`, `N4`, `N3`, `N2`, `N1`, atau `JFT`.
- `SECTION` = `MG` (文字・語彙), `B` (文法), `R` (読解), `L` (聴解), `SV`, `CE`, `JFT-R`.
- `TYPE` = kode tipe pada tabel 1.5.
- `SEQ` = nomor urut 4 digit, tidak pernah dipakai ulang.

**ID stimulus** terpisah: `ST-{LEVEL}-{KIND}-{SEQ}` (mis. `ST-N5-RD-0003`,
`ST-N4-LS-0011`). Satu stimulus dapat dirujuk banyak butir (terutama 文章の文法
dan 読解).

**Versi.** Butir yang sudah `published` tidak boleh diedit in-place. Perubahan
membuat versi baru (`version + 1`) dan versi lama berstatus `superseded`. Form
yang sudah dibekukan selalu merujuk versi butir tertentu, sehingga skor historis
tetap dapat direproduksi.

**Deduplikasi.** Dua butir dianggap duplikat jika (a) `stem` identik setelah
normalisasi spasi/furigana, atau (b) pasangan `knowledge_tags` + `item_type`
sama dan opsi benar sama. Untuk reading/listening, kemiripan dihitung pada
tingkat stimulus, bukan hanya stem.

### 1.8 Tata kelola sumber dan keaslian

| Jenis konten | Sumber yang diizinkan | Aturan |
|---|---|---|
| Butir asesmen | **Original**, ditulis tim Manabi-Rouge | Dilarang menyalin/mereproduksi soal JLPT/JFT resmi, buku latihan berbayar, atau bank soal pihak ketiga. |
| Data kebahasaan | JMDict, KANJIDIC2, KanjiVG, Tatoeba | Wajib mencantumkan lisensi/atribusi di `/about` dan metadata butir. |
| Audio | Rekaman manusia untuk mock; TTS untuk latihan | Script audio wajib direview penutur asli; TTS ditandai di metadata. |
| Gambar/ilustrasi | Original atau lisensi jelas | Alt text wajib; hindari gambar yang membocorkan jawaban. |
| Bantuan AI | Draft, variasi distraktor, klasifikasi tag | Wajib **human review**; AI tidak boleh menjadi satu-satunya reviewer. |

Kebijakan ini bukan hanya soal legal. Soal yang disalin dari ujian asli akan
menggelembungkan skor latihan (pengguna mengenali soal) dan merusak validitas
readiness meter.

### 1.9 Audit celah implementasi saat ini (repo v2.6.1)

| Temuan | Bukti | Dampak | Rekomendasi | Prioritas |
|---|---|---|---|---|
| Ambang seksi N5 salah | `apps/web/lib/exam.ts` memakai `minSectionPoints: 19` untuk seksi 120 dan 60 | Peserta dengan skor seksi Bahasa 30/120 tetap dinyatakan lulus jika total ≥ 80 | Pisahkan ambang per seksi: 38 (120) dan 19 (60); ubah tipe `ExamSpec` | **P0** |
| Model JFT-Basic kedaluwarsa | `exam.ts`: 40 menit, 4 seksi, total 250, "lulus ≥ 200", tanpa pita A1/A2.1 | Simulasi tidak mencerminkan format Agustus 2026; pengguna salah memahami target | Profil JFT 2026: 60 menit, ~50 butir, skor 10–250, pita A1/A2.1/A2.2, audio 2×, section lock | **P0** |
| Simulasi N5 hanya 45 menit | `minutes: 45` | Tidak melatih daya tahan dan manajemen waktu ujian 90 menit | Form 75 butir/90 menit; mode "quick" terpisah | **P1** |
| Bank dirakit runtime | `buildExam()` memanggil `build*Questions()` | Tidak ada butir tetap, sulit diaudit/dikalibrasi | Mock hanya dari bank Lapis 3; generator tetap untuk drill | **P1** |
| Tidak ada respons per butir | `quiz_attempts` hanya `label/correct/total` | Tidak bisa hitung p-value, daya beda, readiness | Tabel `attempt_items` + telemetry | **P1** |
| N4 belum ada | `availableLevels` hanya N5 | Pasar N4 belum terlayani | Fase 2: bank N4 + rute otomatis | **P1** |
| Materi N5 belum lengkap | 708 kata, 111 kanji, 48 pola; target ~800/100/80 | Latihan belum menutup seluruh cakupan | Tambah 92 kata, audit 11 kanji, tambah 32 pola | **P2** |
| Pembahasan belum berlapis | Banyak `explanation` satu kalimat | Feedback loop lemah; pengguna tahu salah tetapi tidak tahu polanya | Skema `explanation` 4 lapis (lihat §3.5) | **P1** |
| Kunci jawaban ada di bundle klien | Quiz berjalan di klien | Mock exam bisa dibocorkan; validitas rendah | Skor mock di server; jangan kirim `answer_key` sebelum submit | **P1** |
| Label "Lulus (simulasi)" untuk JFT | `ujian/page.tsx` | JFT tidak memakai lulus/gagal, tetapi pita CEFR | Ganti dengan "Estimasi pita A2.2" + penjelasan | **P2** |

> **Catatan penting.** P0 di atas adalah koreksi kebenaran, bukan peningkatan
> fitur. Keduanya dapat diselesaikan dalam satu sprint pendek sebelum konten
> baru ditambahkan, dan harus menjadi bagian dari *definition of done* Fase 0.

> **Status implementasi 8 November 2026.** P0 ambang seksi (38/19) dan profil
> JFT-Basic 2026 sudah diperbaiki di `apps/web/lib/exam.ts` + halaman ujian;
> simulasi N5 kini 75 butir/90 menit dan JFT 50 butir/60 menit dengan pita
> estimasi. Halaman **Bank Soal (beta)** ditambahkan di `/[level]/bank` dengan
> 23 butir terkurasi (N5 + JFT). Yang belum: telemetri respons per butir,
> skor mock di server, N4, dan kalibrasi butir.

---

## 2. Matriks Kurikulum N5 & N4

### 2.1 Dasar penyusunan

Kurikulum Manabi-Rouge disusun dari tiga sumber yang tidak boleh dicampur:

1. **Deskripsi resmi level** — apa yang "bisa dilakukan" pada N5/N4.
2. **Tipe soal resmi** — bagaimana kemampuan itu diukur.
3. **Keputusan kurikulum Manabi** — urutan belajar, jumlah pola, kedalaman
   penjelasan, dan bobot latihan.

Deskripsi resmi JLPT (diterjemahkan ringkas dari [Summary of Linguistic
Competence Required for Each
Level](https://www.jlpt.jp/e/about/levelsummary.html)):

| Level | Kemampuan resmi | CEFR acuan | Konsekuensi desain |
|---|---|---|---|
| **N5** | Memahami beberapa bahasa Jepang dasar: membaca ekspresi dan kalimat yang ditulis dengan hiragana, katakana, dan kanji dasar; mendengarkan percakapan sehari-hari/kelas yang diucapkan lambat dan mengambil informasi yang diperlukan. | **A1** (total ≥ 80) | Kalimat pendek, kosakata konkret, audio lambat, distraktor tidak boleh menuntut inferensi berlapis. |
| **N4** | Memahami bahasa Jepang dasar: membaca teks tentang topik sehari-hari dengan kosakata dan kanji dasar; mendengarkan percakapan sehari-hari yang diucapkan lambat dan mengikuti isinya secara umum. | **A2** (total ≥ 90) | Teks lebih panjang, hubungan antar-kalimat, grammar majemuk, audio mendekati natural tetapi tetap lambat. |

**Perkiraan jumlah kanji dan kosakata** yang lazim dirujuk dari materi resmi
JLPT: N5 sekitar **100 kanji / 800 kata**; N4 sekitar **300 kanji / 1.500 kata**
(kumulatif). Angka ini adalah perkiraan, bukan daftar tertutup. Untuk grammar,
JLPT tidak memakai daftar tertutup sebagai silabus soal; karena itu angka pola
di bawah adalah **kurikulum Manabi**, bukan klaim resmi.

| Dimensi | N5 | N4 |
|---|---|---|
| Kanji (kumulatif) | ~100 | ~300 |
| Kosakata (kumulatif) | ~800 | ~1.500 |
| Pola grammar inti (Manabi) | ~80 | ~140 |
| Panjang bacaan | 80–250 karakter | 150–500 karakter |
| Kecepatan audio | Lambat, jeda jelas | Lambat–mendekati natural |
| Waktu ujian | 90 menit | 115 menit |
| Skor lulus | 80 (38 + 19) | 90 (38 + 19) |
| Pengguna utama | Pemula total, pelajar mandiri, calon peserta JFT | Peserta N4, pekerja dengan kebutuhan komunikasi lebih luas |

### 2.2 Peta cakupan N5

Sepuluh domain komunikatif berikut menjadi "peta jalan" materi. Kolom tipe soal
menunjukkan di mana domain ini muncul di ujian, bukan satu-satunya tempat
latihan.

| # | Domain | Can-do inti | Kosakata | Kanji | Grammar kunci | Tipe soal dominan |
|---|---|---|---:|---:|---|---|
| 1 | Diri & sapaan | Memperkenalkan diri, menyapa, berterima kasih, meminta maaf | 60 | 12 | です/じゃない, か, も, の | MG.CD, B.GF, L.QR |
| 2 | Keluarga & orang | Menyebut anggota keluarga, menjelaskan hubungan, mendeskripsikan orang | 70 | 15 | の, がいます/あります, は/が | MG.KR, R.SH, L.KP |
| 3 | Angka, waktu, kalender | Menyebut jam, tanggal, hari, harga, jumlah | 80 | 20 | に/から/まで, ごろ, くらい, counter | MG.KR, L.TB, R.IR |
| 4 | Rumah & rutinitas | Menjelaskan kegiatan harian, lokasi benda, ajakan | 90 | 18 | て-form, ています, ましょう, ませんか | B.GF, B.SC, L.TB |
| 5 | Makanan & minuman | Memesan, menyatakan suka/tidak suka, menjelaskan rasa | 80 | 15 | を, がすき, たい, てください | MG.CD, L.TB, L.QR |
| 6 | Belanja & uang | Bertanya harga, memilih, meminta, membayar | 80 | 12 | は/が, をください, いくら, より | MG.CD, L.TB, R.IR |
| 7 | Tempat, arah, transportasi | Bertanya arah, menjelaskan cara pergi, membaca papan | 90 | 20 | に/で/へ, から/まで, のほうが | MG.KR, R.IR, L.KP |
| 8 | Sekolah & pekerjaan dasar | Menjelaskan jadwal, tugas, aturan sederhana | 80 | 18 | てください, てもいい, てはいけない | B.TG, R.MD, L.TB |
| 9 | Cuaca, musim, alam | Membicarakan cuaca, suhu, kegiatan musiman | 50 | 10 | い/な-adjective, でしょう, そうです | MG.PP, R.SH, L.KP |
| 10 | Tubuh & kesehatan dasar | Menyatakan kondisi, meminta bantuan, memahami instruksi | 50 | 10 | がいたい, てください, ないでください | MG.CD, L.VE, L.QR |

**Total kosakata domain:** 730 kata inti. Sisanya (~70 kata) adalah kata
frekuensi tinggi lintas domain (kata tunjuk, kata sambung, adverbia dasar),
sehingga target ~800 tercapai.

**Pola grammar N5 (peta fungsional, ~80 pola):**

| Fungsi | Pola inti |
|---|---|
| Identitas & negasi | です/じゃない, ですか, も, の |
| Kata tunjuk | これ/それ/あれ, この/その/あの, ここ/そこ/あそこ |
| Partikel inti | は, が, を, に, で, へ, と, も, の, から, まで, より, や, か |
| Bentuk kata kerja | ます/ません/ました, て-form, た-form, ない-form, kamus |
| Aspek & keadaan | ています |
| Permintaan & izin | てください, てもいいです, てはいけません, ませんか, ましょう |
| Keinginan & kemampuan | たい, がほしい, できます (pengenalan) |
| Keberadaan | あります, います, がいます/があります |
| Perbandingan | より, のほうが, 一番 |
| Waktu & urutan | に, から, まで, まえに, あとで, とき |
| Sebab & alasan | から, ので |
| Kata sifat | い/な sekarang/lampau/negatif, く/に, すぎます |

### 2.3 Peta cakupan N4

N4 bukan "N5 dengan lebih banyak kata". Ada lompatan konstruk: hubungan
antar-kalimat, modalitas, memberi-menerima, pasif/kausatif, dan teks yang
menuntut pembaca menyimpulkan.

| # | Domain | Can-do inti | Kosakata baru | Kanji baru | Grammar kunci | Tipe soal dominan |
|---|---|---|---:|---:|---|---|
| 1 | Perjalanan & transportasi | Merencanakan perjalanan, bertanya rute, mengubah rencana | 90 | 25 | たら, なら, ても, ておく, までに | MG.CD, R.IR, L.KP |
| 2 | Belanja & layanan | Menjelaskan kebutuhan, membandingkan, menangani masalah | 80 | 20 | てみる, てしまう, のに, ので | MG.US, L.TB, R.SH |
| 3 | Pekerjaan & kantor | Memahami instruksi, melaporkan, meminta izin, meminta tolong | 100 | 30 | ていただけませんか, てくれます | MG.US, B.TG, L.CV |
| 4 | Sekolah & belajar | Menjelaskan alasan, tujuan, rencana, pengalaman | 80 | 20 | ために, ように, たことがある, つもり | B.GF, R.MD, L.KP |
| 5 | Kesehatan & rumah sakit | Menjelaskan gejala, memahami instruksi medis, memberi saran | 70 | 18 | なければなりません, てもいい, たら, そうです | MG.CD, L.SH, R.SH |
| 6 | Perumahan & lingkungan | Membaca aturan, menjelaskan kondisi, mengajukan permintaan | 70 | 18 | てある, ておく, のに, ば | MG.CD, R.IR, B.TG |
| 7 | Makan di luar | Memesan, meminta rekomendasi, menangani alergi/preferensi | 60 | 12 | てください, が, より, そうです | MG.CD, L.SH, L.QR |
| 8 | Waktu luang & hobi | Menceritakan pengalaman, menjelaskan alasan, mengajak | 70 | 15 | ながら, し, たり, たことがある | MG.PP, R.SH, L.KP |
| 9 | Komunikasi (telepon, email, janji) | Menelepon, meninggalkan pesan, mengubah janji | 70 | 15 | んです, かもしれません, でしょう, たら | B.TG, R.SH, L.CV |
| 10 | Hubungan sosial & kesopanan | Meminta dengan sopan, menolak halus, memuji, berterima kasih | 50 | 10 | ていただけませんか, お/ご, てくれてありがとう | MG.US, L.VE, B.GF |
| 11 | Informasi publik & pengumuman | Membaca brosur, jadwal, pengumuman; memahami instruksi | 40 | 10 | ために, ように, までに | R.IR, L.AN, MG.KR |
| 12 | Alam & cuaca | Menjelaskan sebab-akibat cuaca, memprediksi, memberi saran | 30 | 7 | そうです, らしい, でしょう, ので | MG.PP, R.SH, L.KP |

**Total kosakata baru domain:** ~810 kata; setelah dikurangi tumpang tindih
dengan N5, target kumulatif ~1.500. **Kanji baru:** ~200; kumulatif ~300.

**Pola grammar N4 (peta fungsional, ~140 pola termasuk varian):**

| Fungsi | Pola inti |
|---|---|
| Kondisional | と, たら, ば, なら, ても |
| Sebab & kontras | ので, のに, から, が, けれども, し |
| Tujuan & cara | ために, ように, ために (sasaran), ながら |
| Pengalaman & rencana | たことがある, つもり, 予定, でしょう, かもしれません |
| Memberi & menerima | あげる, くれる, もらう, てあげる, てくれる, てもらう |
| Pasif & kausatif | 受身, 使役, 使役受身 (pengenalan) |
| Modalitas | そうです, らしい, ようです, はず |
| Permintaan sopan | ていただけませんか, てくださいませんか, お/ご～ください |
| Aspek lanjutan | てある, ておく, てしまう, てみる, ていく, てくる |
| Tingkat & batas | すぎる, やすい/にくい, しか～ない, ばかり, おきに |
| Penjelasan | んです, から, ので, という |
| Waktu & rentang | あいだ, あいだに, までに, うちに, ところ |

### 2.4 Matriks keterampilan: dari kalimat ke teks

| Keterampilan | N5 | N4 | Cara mengukur di Manabi |
|---|---|---|---|
| **Membaca** | Kalimat tunggal; teks 80–250 karakter; informasi eksplisit; papan pengumuman sederhana | Teks 150–500 karakter; hubungan sebab-akibat; maksud penulis sederhana; brosur/jadwal | Butir R.SH/R.MD/R.IR + waktu baca + pelacakan salah per tipe |
| **Mendengar** | Dialog 15–40 detik; 2 pembicara; informasi eksplisit; respons cepat | Dialog 30–70 detik; 2–3 pembicara; poin utama; inferensi ringan | Butir L.TB/L.KP/L.VE/L.QR + audio 1×/2× + kecepatan |
| **Menulis** | Kana, kanji dasar, kalimat pendek | Kalimat majemuk, pesan pendek, formulir | Modul menulis + umpan balik goresan (bukan bagian JLPT) |
| **Berbicara** | Sapaan, perkenalan, permintaan sederhana | Meminta izin, menolak halus, menjelaskan alasan | Modul speaking (peta jalan v2), shadowing, role-play |
| **Literasi ujian** | Instruksi, lembar jawaban, manajemen 90 menit | Manajemen 115 menit, strategi seksi, menandai ragu | Mock exam + review waktu per butir |

### 2.5 Matriks JFT-Basic (A1–A2.2)

JFT-Basic tidak memakai level N5/N4, tetapi pita CEFR. Matriks ini memetakan
kategori resmi ke deskriptor yang dapat ditulis menjadi butir.

| Seksi | Kategori resmi | A1 (145–174) | A2.1 (175–199) | A2.2 (200–250) | Skenario khas | Target butir |
|---|---|---|---|---|---|---:|
| Script & Vocabulary | Word meaning | Mengenali kata konkret harian | Membedakan kata serumpun | Memilih kata sesuai konteks kalimat | Keluarga, makanan, tempat | 160 |
| | Word usage | Memakai kata dalam frasa pendek | Memakai kata dalam kalimat | Memakai kata dalam percakapan | Kerja, belanja, transportasi | 120 |
| | Kanji reading | Membaca kanji dasar | Membaca kata berkanji sehari-hari | Membaca kanji dalam konteks | Nama tempat, papan | 100 |
| | Kanji meaning and usage | Mengenali arti kanji dasar | Memilih kanji untuk kata | Memahami kanji dalam teks pendek | Formulir, brosur | 100 |
| Conversation & Expression | Grammar | Pola kalimat dasar | Pola majemuk sederhana | Grammar sesuai konteks sosial | Meminta, menolak, mengubah | 240 |
| | Expression | Sapaan/ungkapan rutin | Ungkapan sesuai situasi | Ungkapan sopan dan tepat | Kantor, toko, telepon | 200 |
| Listening | Comprehending content (conversation) | Memahami instruksi pendek | Memahami poin percakapan | Memahami alasan/rencana | Rekan kerja, atasan | 160 |
| | Comprehending content (shops/public places) | Memahami harga/jam | Memahami syarat layanan | Memahami percakapan transaksi | Toko, restoran, apotek | 120 |
| | Comprehending content (announcements/instructions) | Memahami kata kunci | Memahami urutan instruksi | Memahami pengumuman lengkap | Stasiun, pabrik, fasilitas | 100 |
| Reading | Comprehending content | Memahami pesan pendek | Memahami surat/pesan | Memahami maksud dan detail | Kerja, sekolah, lingkungan | 260 |
| | Information search | Menemukan satu informasi | Membandingkan dua informasi | Menemukan informasi bersyarat | Papan, brosur, jadwal | 120 |
| | **Total** | | | | | **1.680** |

**Domain kehidupan JFT (prioritas untuk pekerja migran):**

| Domain | Contoh Can-do | Tipe soal terkait |
|---|---|---|
| Pekerjaan | Memahami instruksi atasan, melapor keterlambatan, membaca jadwal shift, memahami aturan keselamatan | SV.WU, CE.GR, L.CV, L.AN, R.CT |
| Belanja | Menanyakan harga, membandingkan produk, meminta bungkus, membayar | SV.WM, L.SH, R.IR |
| Transportasi | Membaca jadwal, bertanya rute, membeli tiket, memahami pengumuman | SV.KR, L.AN, R.IS |
| Kesehatan | Menjelaskan gejala, memahami instruksi obat, membuat janji | CE.EX, L.SH, R.CT |
| Balai kota/administrasi | Membaca formulir, memahami prosedur, membawa dokumen | SV.KMU, R.CT, R.IS |
| Perumahan | Memahami aturan apartemen, membuang sampah, kontrak sederhana | R.CT, CE.GR |
| Makanan | Memesan, menjelaskan preferensi/alergi, memahami menu | SV.WM, L.SH, CE.EX |
| Sekolah/anak | Berkomunikasi dengan guru, membaca pengumuman sekolah | R.CT, L.AN |
| Bencana & keselamatan | Memahami instruksi evakuasi, pengumuman darurat | L.AN, R.IS |
| Waktu luang | Membaca brosur, membuat reservasi, mengajak | R.IS, CE.EX |
| Telepon/email | Meninggalkan pesan, mengubah janji, menulis pesan kerja | CE.EX, R.CT |
| Etiket sosial | Menolak halus, meminta izin, berterima kasih | CE.EX, L.QR (adaptasi) |

### 2.6 Matriks target bank per tipe soal

Angka berikut adalah **target butir terkurasi yang already published and
reviewed**, bukan jumlah soal yang dibuat saat runtime. Setiap sel harus punya
minimal satu form-worth butir dengan tingkat kesulitan yang tersebar.

#### N5 — target 2.000 butir

| Kode | Tipe soal | Pilihan | Target bank | Per form | Catatan produksi |
|---|---|:---:|---:|---:|---|
| MG.KR | 漢字読み | 4 | 240 | 7 | 1 butir per kata kanji inti + variasi kalimat |
| MG.OR | 表記 | 4 | 140 | 5 | Fokus homofon dan okurigana |
| MG.CD | 文脈規定 | 4 | 230 | 7 | Distraktor satu kelas kata, konteks jelas |
| MG.PP | 言い換え類義 | 4 | 130 | 6 | Sinonim level N5, bukan tebakan |
| B.GF | 文法形式の判断 | 4 | 250 | 8 | Satu konstruk per butir; distraktor pola tertukar |
| B.SC | 文の組み立て | 4 | 170 | 5 | Empat fragmen, bintang di posisi ketiga |
| B.TG | 文章の文法 | 4 | 180 | 5 | Satu stimulus 3–5 celah; butir per celah |
| R.SH | 内容理解（短文） | 4 | 180 | 4 | 1 stimulus = 1–2 butir |
| R.MD | 内容理解（中文） | 4 | 90 | 3 | 1 stimulus = 2–3 butir |
| R.IR | 情報検索 | 4 | 50 | 1 | Brosur/jadwal; informasi eksplisit |
| L.TB | 課題理解 | 4 | 100 | 6 | Audio 15–30 detik; tindakan berikutnya |
| L.KP | ポイント理解 | 4 | 100 | 6 | Audio 20–35 detik; poin kunci |
| L.VE | 発話表現 | 3 | 70 | 5 | Situasi + 3 ungkapan |
| L.QR | 即時応答 | 3 | 70 | 7 | Ujaran pendek + 3 respons |
| | **Total N5** | | **2.000** | **75** | |

#### N4 — target 2.400 butir

| Kode | Tipe soal | Pilihan | Target bank | Per form | Catatan produksi |
|---|---|:---:|---:|---:|---|
| MG.KR | 漢字読み | 4 | 280 | 9 | Kanji baru + kata majemuk |
| MG.OR | 表記 | 4 | 150 | 6 | Homofon level N4 |
| MG.CD | 文脈規定 | 4 | 280 | 10 | Konteks lebih panjang, kolokasi |
| MG.PP | 言い換え類義 | 4 | 140 | 5 | Parafrasa kalimat, bukan kata |
| MG.US | 用法 | 4 | 110 | 5 | Empat kalimat; satu penggunaan benar |
| B.GF | 文法形式の判断 | 4 | 280 | 10 | Pola majemuk, modalitas |
| B.SC | 文の組み立て | 4 | 180 | 6 | Modifikasi nomina, urutan adverbia |
| B.TG | 文章の文法 | 4 | 160 | 5 | Kohesi antar-kalimat |
| R.SH | 内容理解（短文） | 4 | 190 | 5 | 150–250 karakter |
| R.MD | 内容理解（中文） | 4 | 130 | 7 | 250–500 karakter |
| R.IR | 情報検索 | 4 | 60 | 2 | Tabel/brosur dengan syarat |
| L.TB | 課題理解 | 4 | 120 | 8 | Audio 25–45 detik |
| L.KP | ポイント理解 | 4 | 120 | 8 | Audio 30–60 detik |
| L.VE | 発話表現 | 3 | 100 | 6 | Situasi sosial, kesopanan |
| L.QR | 即時応答 | 3 | 100 | 6 | Respons cepat, nuansa |
| | **Total N4** | | **2.400** | **98** | |

#### JFT-Basic — target 1.680 butir

| Kode | Kategori | Pilihan | Target bank | Per form | Catatan |
|---|---|:---:|---:|---:|---|
| SV.WM | Word meaning | 3 | 160 | 4 | Kata konkret + konteks kalimat |
| SV.WU | Word usage | 3 | 120 | 3 | Penggunaan dalam kalimat |
| SV.KR | Kanji reading | 3 | 100 | 3 | Kanji sehari-hari |
| SV.KMU | Kanji meaning and usage | 3 | 100 | 3 | Kanji dalam teks pendek |
| CE.GR | Grammar | 3 | 240 | 7 | Grammar sesuai konteks |
| CE.EX | Expression | 3 | 200 | 6 | Ungkapan situasional |
| L.CV | Comprehending content (conversation) | 3 | 160 | 5 | Audio 2×, percakapan kerja |
| L.SH | Comprehending content (shops/public places) | 3 | 120 | 4 | Transaksi |
| L.AN | Comprehending content (announcements/instructions) | 3 | 100 | 3 | Pengumuman/instruksi |
| R.CT | Comprehending content | 3 | 260 | 9 | Pesan/surat pendek |
| R.IS | Information search | 3 | 120 | 3 | Papan/brosur |
| | **Total JFT** | | **1.680** | **50** | |

#### Butir jembatan & diagnostik — 520 butir

| Kelompok | Target | Fungsi |
|---|---:|---|
| Kana & ortografi dasar | 120 | Diagnostik awal; bukan tipe JLPT, tetapi prasyarat N5 |
| Partikel & micro-grammar | 160 | Menambal kesalahan spesifik pembelajar Indonesia |
| Produksi kanji & bacaan | 120 | Menghubungkan input dan output (menulis/membaca) |
| Skenario kehidupan (performance task) | 120 | JFT/SSW: memahami instruksi, formulir, pengumuman |

**Rekonsiliasi jumlah:**

| Komponen | Butir |
|---|---:|
| N5 | 2.000 |
| N4 | 2.400 |
| JFT-Basic | 1.680 |
| Jembatan/diagnostik | 520 |
| **Bruto** | **6.600** |
| Dikurangi butir JFT yang dual-tag dengan N5/N4 | −600 |
| **Unik Fase 1** | **6.000** |

### 2.7 Distribusi kesulitan dan kognitif

**Distribusi bank (target jangka panjang):**

| Band | Label | Proporsi bank | Perilaku yang diharapkan |
|---:|---|---:|---|
| 1 | Sangat mudah | 15% | Bisa dijawab pemula setelah 1–2 pelajaran |
| 2 | Mudah | 30% | Butir pemanasan; retensi dasar |
| 3 | Sedang | 35% | Butir inti level; mayoritas form |
| 4 | Sulit | 15% | Butir pembeda; menuntut inferensi/kolokasi |
| 5 | Sangat sulit | 5% | Simulasi tekanan; hanya untuk bank, bukan mayoritas form |

**Distribusi form ujian:** 10% band 1, 30% band 2, 40% band 3, 15% band 4, 5%
band 5. Form tidak boleh didominasi band 1–2 karena tidak mengukur kesiapan,
dan tidak boleh didominasi band 4–5 karena membuat pengguna putus asa.

**Khusus JFT**, form CBT memakai campuran 15/35/35/12/3 karena jumlah butir per
seksi lebih kecil dan butir skenario mudah/menengah perlu lebih banyak untuk
pengguna A1–A2.1; bank JFT tetap memakai distribusi bank 15/30/35/15/5.

**Distribusi kognitif:**

| Operasi | N5 | N4 | JFT | Contoh |
|---|---:|---:|---:|---|
| Mengenali | 30% | 20% | 25% | Memilih bacaan kanji yang benar |
| Mengingat | 25% | 20% | 20% | Memilih kata sesuai arti |
| Menerapkan | 30% | 35% | 35% | Memilih pola grammar dalam konteks |
| Menyimpulkan | 12% | 20% | 15% | Memahami maksud penutur |
| Mengintegrasikan | 3% | 5% | 5% | Membandingkan dua informasi |

**Keseimbangan kunci jawaban:**

- Butir 4 pilihan: posisi kunci 25% ± 3% per form.
- Butir 3 pilihan: posisi kunci 33% ± 4% per form.
- Tidak boleh ada lebih dari 3 butir berturut-turut dengan posisi kunci sama.
- Validator otomatis menolak form yang melanggar aturan ini.

### 2.8 Keseimbangan skenario JFT

| Skenario | Proporsi butir JFT |
|---|---:|
| Pekerjaan | 25% |
| Belanja | 15% |
| Transportasi | 10% |
| Kesehatan | 10% |
| Balai kota/administrasi | 10% |
| Perumahan | 10% |
| Makanan | 8% |
| Sekolah/anak | 5% |
| Bencana & keselamatan | 4% |
| Waktu luang | 3% |

Skenario "pekerjaan" lebih besar karena segmen *Tokutei Ginou* dan *Ginou
Jisshuusei* adalah pengguna utama JFT, dan karena instruksi kerja adalah sumber
kesulitan komunikasi yang paling sering dilaporkan.

### 2.9 Kesiapan bank vs repo saat ini

Perbandingan ini memakai angka README v2.6.1 dan target blueprint. "Gap" bukan
kekurangan fatal; ini antrean produksi.

| Modul | Saat ini (N5) | Target N5 | Gap N5 | Target N4 | Aksi prioritas |
|---|---:|---:|---:|---:|---|
| Kosakata | 708 | ~800 | ~92 | ~700 baru (kumulatif 1.500) | Tambah kata domain 8–10, tag POS/level, contoh kalimat |
| Kanji | 111 | ~100 | audit 11 | ~200 baru | Audit kanji di luar daftar N5; lengkapi on/kun dan kata contoh |
| Grammar | 48 pola | ~80 | ~32 | ~140 kumulatif | Tambah pola fungsional yang belum ada; hubungkan ke butir |
| Bacaan | 10 passage | ~24 passage | ~14 | ~24 passage | Tambah teks pendek, brosur, email, jadwal |
| Listening | 12 dialog + 24 butir ujian | ~340 butir | ~304 | ~440 butir | Produksi audio + script; 4 tipe per level |
| 文の組み立て | 12 butir | ~170 butir | ~158 | ~180 butir | Perbanyak fragmen dan distraktor urutan |
| Partikel | 18 partikel | jembatan | — | jembatan N4 | Pertahankan sebagai modul diagnosa |
| Form mock | 2 (N5 & JFT) | 8 form N5 | 6 | 8 form N4 | Bekukan form dari bank, bukan generator |
| Butir terkurasi | 0 (prosedural) | 2.000 | 2.000 | 2.400 | Mulai dari 300 butir pilot di Fase 0 |

**Catatan tentang 111 kanji N5.** Angka ini lebih tinggi dari perkiraan resmi
~100. Sebagian mungkin kanji N4 atau varian yang belum diaudit. Sebelum
menambah konten, lakukan audit: cocokkan dengan daftar kanji N5 yang dipakai
buku teks, tandai kanji yang sebenarnya N4, dan pastikan tidak ada kanji yang
salah level. Kualitas daftar lebih penting daripada kuantitas.

### 2.10 Aturan progresi dan gerbang penguasaan

**Mastery per tag.** Sebuah tag (mis. `particle-ni-de`, `kanji:n5:gaku`)
dianggap dikuasai jika pengguna menjawab benar **3 kali dalam interval
berjeda** (1 hari, 3 hari, 7 hari) dan minimal **1 kali dalam konteks ujian**
(bukan hanya flashcard). Ini mencegah ilusi kompetensi dari pengulangan
jangka pendek.

**Gerbang naik level:**

| Gerbang | Syarat |
|---|---|
| N5 → N4 | Mock N5 ≥ 80 dengan kedua seksi ≥ 38/19; ≥ 70% tag N5 mastery; diagnostic N4 ≥ 50% |
| N4 → N3 | Mock N4 ≥ 90 dengan kedua seksi ≥ 38/19; ≥ 75% tag N4 mastery; tidak ada kelemahan kritis pada `B.TG` dan `R.MD` |
| JFT A2.1 → A2.2 | Estimasi pita A2.1 stabil 3 sesi; section percentage ≥ 70%; mock JFT ≥ 200 estimasi |
| Siap ujian | 2 mock terakhir di atas ambang; variansi skor antar-mock < 10 poin; waktu selesai < durasi resmi |

**Aturan remedial.** Jika pengguna gagal di satu seksi, jalur remedial harus
menyasar **tipe soal**, bukan seluruh level: mis. "6 dari 8 salah di `L.KP` →
kerjakan 10 butir `L.KP` + 1 dialog dengan pertanyaan poin + ulangi 3 butir
serupa setelah 24 jam".

---

## 3. Spesifikasi Bank Soal

### 3.1 Model data kanonik

Satu butir adalah **objek imutabel** setelah dipublikasikan. Semua yang berubah
setelah publikasi (pembahasan, tingkat kesulitan, tag) disimpan sebagai versi
baru atau sebagai catatan kalibrasi terpisah, bukan sebagai suntingan langsung.

| Field | Tipe | Wajib | Keterangan |
|---|---|:---:|---|
| `id` | string | ✓ | Kode unik `MR-...`; stabil selamanya |
| `schema_version` | string | ✓ | Versi skema, mis. `1.0.0` |
| `status` | enum | ✓ | `draft`, `content_review`, `native_review`, `pilot`, `published`, `superseded`, `retired` |
| `exam_family` | enum | ✓ | `jlpt` atau `jft` |
| `level` | enum/null | ✓ | `N5`–`N1`; `null` untuk JFT yang tidak memakai N-level |
| `cefr` | enum/null | — | `A1`, `A2`, `B1`, `B2`, `C1`; untuk JFT |
| `test_section` | enum | ✓ | `moji-goi`, `bunpou`, `dokkai`, `choukai`, `kaiwa-hyougen`, `script-vocab`, `conversation-expression`, `listening`, `reading` |
| `scoring_section` | enum | ✓ | `language-reading`, `listening`, `jft-sv`, `jft-ce`, `jft-lc`, `jft-rc` |
| `item_type` | string | ✓ | Kode kanonik, mis. `MG.KR`, `B.TG`, `L.QR`, `SV.WM` |
| `instruction` | object | ✓ | `{ id, en }`; instruksi pendek, bukan terjemahan penuh |
| `stem` | string | ✓ | Teks soal; gunakan `＿＿` untuk celah dan `★` untuk bintang |
| `stem_furigana` | array | — | Segmen `{ text, reading }` untuk furigana selektif |
| `options` | array | ✓ | 3–4 opsi; setiap opsi punya `key`, `text`, `is_correct`, `rationale` |
| `answer_key` | array | ✓ | Kunci; satu elemen untuk MCQ tunggal |
| `explanation` | object | ✓ | `short`, `rule`, `contrast`, `transfer`, `refs` |
| `stimulus_refs` | array | — | ID stimulus; wajib untuk reading/listening/text grammar |
| `knowledge_tags` | array | ✓ | Rujukan ke atom: `vocab:n5:eiga`, `grammar:n4:tara`, dll. |
| `skill_tags` | array | ✓ | Tag kesalahan/spesifik: `long-vowel`, `particle-ni-de` |
| `scenario` | array | — | `workplace`, `shop`, `transport`, `health`, `city-hall`, `disaster`, dll. |
| `difficulty` | object | ✓ | `band` 1–5, `prior_logit`, `features`, `calibration` |
| `media` | object | — | `{ audio, image, table }`; audio wajib untuk listening |
| `accessibility` | object | ✓ | `furigana_policy`, `alt_text`, `audio_transcript`, `extended_time_ok` |
| `exposure` | object | ✓ | `form_eligible`, `max_exposure_per_user_days`, `enemy_ids` |
| `provenance` | object | ✓ | Penulis, reviewer, native review, lisensi, AI-assisted |
| `time_estimate_sec` | number | ✓ | Estimasi waktu pengerjaan; dasar perakitan form |
| `version` | number | ✓ | Mulai 1; naik saat revisi |
| `also_valid_for` | array | — | Label silang JLPT ↔ JFT (mis. butir JFT yang juga valid sebagai `B.GF` N5); hanya setelah construct review |
| `created_at` / `updated_at` | string | ✓ | ISO 8601 |

**Aturan `stem`.** Jangan mencampur instruksi dengan soal. Instruksi ada di
`instruction`; stem hanya berisi kalimat/teks yang dinilai. Ini memungkinkan
satu stem dipakai untuk beberapa bentuk instruksi (mis. "pilih bacaan" vs
"pilih kanji") tanpa duplikasi.

### 3.2 Contoh butir lengkap

Contoh nyata ada di [`bank-soal/contoh-bank.json`](./bank-soal/contoh-bank.json).
Berikut satu butir representatif (diringkas):

```json
{
  "id": "MR-N5-MG-KR-0001",
  "schema_version": "1.0.0",
  "status": "pilot",
  "exam_family": "jlpt",
  "level": "N5",
  "test_section": "moji-goi",
  "scoring_section": "language-reading",
  "item_type": "MG.KR",
  "instruction": {
    "id": "Pilih cara baca kata di dalam 「 」.",
    "en": "Choose the correct reading for the word in 「 」."
  },
  "stem": "毎朝、パンを 「学校」 の 近くで 買います。",
  "options": [
    { "key": "a", "text": "がっこう", "is_correct": true,
      "rationale": "学校 dibaca がっこう; がっ + こう." },
    { "key": "b", "text": "がこう", "is_correct": false,
      "rationale": "Menghilangkan 小さいっ; bentuk ini tidak ada." },
    { "key": "c", "text": "かっこう", "is_correct": false,
      "rationale": "Konsonan awal salah; かっこう bukan bacaan 学校." },
    { "key": "d", "text": "がっこ", "is_correct": false,
      "rationale": "Vokal akhir hilang; こう menjadi こ." }
  ],
  "answer_key": ["a"],
  "explanation": {
    "short": "学校 = がっこう (sekolah).",
    "rule": "Kanji 学 dibaca がく, 校 dibaca こう; gabungan menjadi がっこう.",
    "contrast": "がこう/かっこう/がっこ adalah distraktor yang mengubah satu bunyi.",
    "transfer": "Latih pola yang sama pada 高校 (こうこう) dan 小学校 (しょうがっこう).",
    "refs": ["kanji:n5:gaku", "kanji:n5:kou", "vocab:n5:gakkou"]
  },
  "knowledge_tags": [
    { "type": "vocab", "id": "vocab:n5:gakkou" },
    { "type": "kanji", "id": "kanji:n5:gaku" }
  ],
  "skill_tags": ["kanji-reading", "small-tsu", "long-vowel"],
  "scenario": ["daily-life"],
  "difficulty": {
    "band": 2,
    "prior_logit": -1.4,
    "features": { "lexical_rarity": 0, "kanji_load": 1, "syntax_depth": 1,
                  "inference": 0, "distractor_similarity": 2, "processing": 0,
                  "register": 0 },
    "calibration": { "n": 0, "p_value": null, "b": null, "a": null }
  },
  "media": {},
  "accessibility": {
    "furigana_policy": "on-demand",
    "alt_text": null,
    "audio_transcript": null,
    "extended_time_ok": true
  },
  "exposure": {
    "form_eligible": true,
    "max_exposure_per_user_days": 30,
    "enemy_ids": []
  },
  "provenance": {
    "author": "tim-konten-manabi",
    "reviewer": "native-reviewer-01",
    "native_review": true,
    "source": "original",
    "license": "proprietary",
    "ai_assisted": true,
    "created_at": "2026-11-08"
  },
  "time_estimate_sec": 25,
  "version": 1,
  "created_at": "2026-11-08T00:00:00+07:00",
  "updated_at": "2026-11-08T00:00:00+07:00"
}
```

### 3.3 Stimulus: teks, audio, gambar, tabel

Stimulus adalah objek terpisah agar satu bacaan/dialog dapat menghasilkan
beberapa butir dan agar audio tidak diduplikasi.

| Field | Tipe | Keterangan |
|---|---|---|
| `id` | string | `ST-N5-RD-0001` |
| `kind` | enum | `passage`, `dialogue`, `notice`, `email`, `table`, `image`, `announcement`, `utterance` |
| `level` | enum | Level target |
| `title` | string | Judul internal, bukan selalu ditampilkan |
| `body` | string | Teks utama (untuk bacaan/pengumuman) |
| `segments` | array | `{ text, reading? }` untuk furigana |
| `translation` | object | `{ id, en }` untuk pembahasan, bukan ditampilkan sebelum menjawab |
| `script` | array | Untuk audio: `{ speaker, jp, kana?, id }` |
| `audio` | object | `url`, `duration_sec`, `play_limit`, `speed`, `voice` |
| `image` | object | `url`, `alt`, `width`, `height` |
| `table` | object | `headers`, `rows` untuk 情報検索 |
| `source` | object | Lisensi/atribusi jika mengadaptasi data terbuka |

**Aturan audio:**

- JLPT: audio diputar **satu kali** dalam mode ujian; latihan boleh mengulang.
- JFT: audio maksimal **dua kali**, sesuai format resmi.
- Script audio wajib disimpan di bank, tetapi **tidak boleh dikirim ke klien
  sebelum submit** pada mode ujian.
- Untuk butir `L.VE`/`L.QR`, audio berisi situasi/ujaran; opsi tetap tertulis.
- Untuk butir `L.TB`/`L.KP`, audio berisi dialog; pertanyaan dan opsi tertulis.

**Aturan gambar:**

- Gambar tidak boleh mengandung teks yang menjadi kunci jawaban (kecuali
  memang tipe soal informasi visual).
- Alt text wajib, dan tidak boleh menyebut jawaban.
- Ilustrasi untuk `L.VE` sebaiknya dibuat sebagai set yang konsisten agar
  pengguna tidak bingung membedakan situasi.

### 3.4 Opsi dan distraktor

Kualitas distraktor menentukan kualitas butir. Distraktor acak membuat butir
terasa mudah dan tidak mendiagnosis kesalahan.

| Aturan | Detail |
|---|---|
| Jumlah opsi | JLPT: 4 untuk `MG.*`, `B.*`, `R.*`, `L.TB`, `L.KP`; 3 untuk `L.VE`, `L.QR`. JFT: 3 untuk semua tipe. |
| Satu kunci | Tepat satu `is_correct: true`; validator menolak selain itu. |
| Rasional per opsi | Setiap opsi wajib punya `rationale`, termasuk kunci. Ini bahan pembahasan. |
| Distraktor masuk akal | Berasal dari kesalahan umum, bukan kata acak: salah baca kanji, partikel tertukar, bentuk grammar mirip, makna berdekatan. |
| Paralelisme | Panjang dan bentuk opsi sejajar; jangan membuat kunci lebih panjang/menonjol. |
| Tidak ada "semua benar" | Hindari opsi meta yang bisa dijawab tanpa pengetahuan. |
| Tidak ada negatif ganda | Hindari "kecuali" berlapis pada N5/N4. |
| Keseimbangan posisi | Lihat §2.7; validator memeriksa per form. |
| Distraktor tidak menjebak secara tidak adil | Jika opsi benar-benar ambigu, perbaiki stem/konteks, bukan menambah penjelasan. |

**Peta kesalahan pembelajar Indonesia** yang harus menjadi sumber distraktor:

| Area | Kesalahan umum | Contoh distraktor |
|---|---|---|
| Bunyi panjang/pendek | おばさん vs おばあさん; ゆき vs ゆうき | Opsi dengan panjang vokal berbeda |
| 小さいっ | きって vs きて; がっこう vs がこう | Opsi tanpa っ |
| ん | せんせい vs せいせい | Opsi yang menghilangkan ん |
| Partikel に/で | 学校に行く vs 学校で行く | Tukar に/で |
| は/が | Topik vs subjek | Opsi は/が pada konteks yang sama |
| Kata kerja transitif/intransitif | 開ける/開く, 閉める/閉まる | Opsi dengan pasangan transitif salah |
| Giving/receiving | あげる/くれる/もらう | Arah pemberian terbalik |
| Keigo | いただく/くださる/召し上がる | Tingkat kesopanan salah |
| Katakana loanword | パン/パーティー | Panjang vokal |
| Kanji homofon | 学校/がっこう vs 各校/かくこう | Kanji mirip bunyi |

### 3.5 Pembahasan berlapis (feedback loop)

Pembahasan satu kalimat tidak cukup untuk retensi. Setiap butir wajib punya
empat lapis:

| Lapis | Pertanyaan yang dijawab | Panjang | Contoh |
|---|---|---|---|
| `short` | Apa jawabannya? | 1 kalimat | "学校 = がっこう." |
| `rule` | Aturan apa yang dipakai? | 1–3 kalimat | "学 = がく, 校 = こう; gabungan jadi がっこう." |
| `contrast` | Mengapa opsi lain salah? | 2–4 kalimat | "がこう kehilangan っ; かっこう mengubah konsonan awal." |
| `transfer` | Bagaimana menerapkannya di soal lain? | 1–2 kalimat + rujukan | "Coba pola yang sama pada 高校 dan 小学校." |

**Aturan penulisan pembahasan:**

- Bahasa Indonesia untuk `id`; Inggris untuk `en` (opsional pada Fase 1,
  wajib saat ekspansi internasional).
- Jangan mengulang stem; fokus pada **mengapa**.
- Jangan menyalahkan pengguna; jelaskan kesalahannya sebagai pola.
- Jika butir menguji kosakata, sertakan contoh kalimat baru (bukan contoh yang
  sudah ada di stem).
- Jika butir menguji listening, sertakan transkrip audio di pembahasan
  (setelah submit) dan tandai bagian yang menjadi kunci.
- Rujuk ke pelajaran/atom yang relevan (`refs`) agar pengguna bisa langsung
  belajar ulang.

### 3.6 Model kesulitan: dari perkiraan ke kalibrasi

**Tahap 1 — perkiraan a priori (sebelum pilot).** Setiap penulis memberi skor
0–3 pada tujuh fitur; jumlah berbobot memetakan ke band 1–5.

| Fitur | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| Beban leksikal | Semua N5 dasar | 1 kata baru | 2–3 kata baru | Di atas level |
| Beban kanji | Tidak ada kanji baru | 1 kanji baru | 2–3 kanji baru | Di atas level |
| Kompleksitas sintaksis | Kalimat tunggal | 1 klausa tambahan | 2 klausa/embedding | 3+ klausa |
| Jarak inferensi | Literal | Sedikit implisit | Perlu simpulan | Perlu integrasi |
| Kemiripan distraktor | Jelas berbeda | Cukup berbeda | Mirip | Sangat mirip |
| Beban pemrosesan | Pendek, langsung | Sedang | Panjang | Panjang + cepat |
| Register | Netral | Sedikit konteks | Konteks sosial | Register kompleks |

Rumus: `skor = 0.20*leksikal + 0.15*kanji + 0.20*sintaksis + 0.20*inferensi +
0.15*distraktor + 0.05*pemrosesan + 0.05*register` (0–3). Pemetaan: 0–0,6 band
1; 0,61–1,2 band 2; 1,21–1,8 band 3; 1,81–2,4 band 4; >2,4 band 5.

**Tahap 2 — kalibrasi empiris.** Setelah ≥200 respons per butir (≥500 untuk
2PL), hitung:

| Statistik | Rumus/alat | Ambang sehat | Tindakan jika keluar |
|---|---|---|---|
| `p_value` | proporsi benar | 0,25–0,90 | <0,15: audit ambiguitas; >0,95: terlalu mudah, turunkan prioritas |
| Point-biserial | korelasi skor butir–total | ≥0,20 | <0,15: butir tidak mengukur konstruk yang sama |
| Daya beda `a` | 2PL | 0,5–2,5 | <0,4: distraktor lemah/ambigu |
| Kesulitan `b` | 2PL | −3 s.d. +3 | Ekstrem: tandai untuk revisi |
| Infit/outfit | Rasch | 0,7–1,3 | Di luar: periksa keberadaan dua konstruk |
| DIF | grup JLPT vs JFT, gender, bahasa ibu | <0,1 logit | Audit bias/keadilan |

**Tahap 3 — penghubung antar-form.** Gunakan **anchor items** (10–15% butir
yang sama antar-form) untuk menyetarakan skala. Tanpa anchor, skor form A dan
form B tidak dapat dibandingkan, dan readiness meter akan menyesatkan.

**Aturan pensiun butir:**

- `p < 0,15` dan penyebabnya bukan "sulit tapi valid" → revisi.
- Daya beda negatif → segera tarik.
- DIF besar tanpa alasan kurikuler → tarik.
- Butir yang muncul terlalu sering (exposure tinggi) → rotasi keluar dari form.

### 3.7 Skema penilaian

#### JLPT (N5/N4)

**Fakta resmi:** dua seksi penilaian, skor 0–120 dan 0–60; total 180; lulus
total 80 (N5)/90 (N4); ambang seksi 38 dan 19; tidak ada pengurangan nilai
untuk jawaban salah. Skor resmi JLPT adalah skor berskala, bukan jumlah benar
mentah.

**Model Manabi v0 (MVP, jujur):**

```text
skor_seksi = round((benar_seksi / total_seksi) * max_seksi)
lulus = total >= ambang_total AND setiap skor_seksi >= ambang_seksi
label = "Estimasi latihan" (bukan skor resmi)
```

**Model Manabi v1 (setelah kalibrasi):**

```text
θ = ability estimate (2PL/EAP) dari respons pengguna
skor_seksi = ∫ P(θ) atas distribusi butir form referensi × max_seksi
CI = 80% credible interval dari posterior θ
lulus_estimasi = P(total ≥ ambang AND semua seksi ≥ ambang) via Monte Carlo
```

**Aturan tampilan:**

- Selalu tampilkan kedua seksi dan ambangnya; jangan hanya total.
- Jika salah satu seksi di bawah ambang, tampilkan "belum memenuhi ambang
  seksi" meskipun total tinggi.
- Tampilkan `n` butir dan waktu; skor dari 10 butir tidak boleh diberi label
  "kesiapan ujian".
- Jangan menampilkan "skor resmi" atau "sertifikat".

#### JFT-Basic (2026)

**Fakta resmi:** skor total 10–250 hasil *equating*; pita A1 145–174, A2.1
175–199, A2.2 200–250; <145 tidak menampilkan level; persentase benar per seksi
ditampilkan; audio 2×; tidak ada penalti.

**Model Manabi:**

```text
θ = ability estimate dari respons (butir JFT terkalibrasi)
persentase_seksi = benar / total per seksi
estimasi_skala = map(θ) ke 10–250 memakai skala bayangan yang dikalibrasi
pita = A1 | A2.1 | A2.2 berdasarkan cut score bayangan
tampilkan: "Estimasi pita A2.2 (200–250); bukan skor resmi"
```

**Mengapa tidak menjumlahkan benar × 5?** Karena skor resmi memakai
*equating*, bukan jumlah benar linear. Menampilkan "200/250" dari persentase
mentah akan memberi rasa aman palsu. Manabi boleh menampilkan estimasi, tetapi
harus: (a) memberi rentang, (b) menyebut ketidakpastian, (c) tidak menjanjikan
kelulusan.

**Tabel keputusan tampilan JFT:**

| Kondisi data | Yang ditampilkan |
|---|---|
| < 20 butir dikerjakan | "Belum cukup data; kerjakan minimal 20 butir" |
| 20–49 butir | Persentase per seksi + rentang pita lebar |
| ≥ 50 butir (1 form penuh) | Estimasi pita + CI + rekomendasi 3 terlemah |
| ≥ 3 form penuh | Tren pita + prediksi stabilitas |

#### Metrik internal (bukan skor ujian)

| Metrik | Definisi | Digunakan untuk |
|---|---|---|
| `mastery_rate` | % tag yang mastery | Progres kurikulum |
| `accuracy_by_type` | Akurasi per item_type | Weakness radar |
| `speed_index` | Waktu/butir vs target | Latihan kecepatan |
| `retention_7d` | Akurasi ulang setelah 7 hari | Efektivitas SRS |
| `readiness` | P(lulus) dari simulasi Monte Carlo | Gerbang mock |
| `confidence` | Lebar CI readiness | Kapan boleh menampilkan prediksi |

### 3.8 Perakitan form (form blueprint)

Form tidak dirakit dengan `shuffle`. Form dirakit oleh **blueprint** yang
menentukan jumlah, tipe, kesulitan, dan larangan.

```json
{
  "id": "FORM-JLPT-N5-v1",
  "exam_family": "jlpt",
  "level": "N5",
  "version": 1,
  "minutes": 90,
  "total_items": 75,
  "sections": [
    {
      "key": "moji-goi",
      "label": "文字・語彙",
      "minutes": 20,
      "items": 25,
      "distribution": {
        "MG.KR": 7, "MG.OR": 5, "MG.CD": 7, "MG.PP": 6
      }
    },
    {
      "key": "bunpou-dokkai",
      "label": "文法・読解",
      "minutes": 40,
      "items": 26,
      "distribution": {
        "B.GF": 8, "B.SC": 5, "B.TG": 5,
        "R.SH": 4, "R.MD": 3, "R.IR": 1
      }
    },
    {
      "key": "choukai",
      "label": "聴解",
      "minutes": 30,
      "items": 24,
      "distribution": {
        "L.TB": 6, "L.KP": 6, "L.VE": 5, "L.QR": 7
      }
    }
  ],
  "constraints": {
    "difficulty_mix": { "1": 0.10, "2": 0.30, "3": 0.40, "4": 0.15, "5": 0.05 },
    "answer_position_balance": true,
    "max_same_position_streak": 2,
    "max_items_per_stimulus": 3,
    "exposure_window_days": 30,
    "enemy_items": true,
    "anchor_ratio": 0.12
  },
  "scoring": {
    "profile": "JLPT-N5-2026",
    "sections": [
      { "key": "language-reading", "max": 120, "min_pass": 38 },
      { "key": "listening", "max": 60, "min_pass": 19 }
    ],
    "overall_pass": 80
  }
}
```

**Aturan perakitan:**

1. **Ketersediaan:** setiap sel distribusi harus punya ≥3× jumlah yang diminta
   dalam bank; jika tidak, form tidak boleh dibekukan.
2. **Kesulitan:** gunakan *greedy with backtracking* untuk memenuhi campuran
   band; jangan mengorbankan campuran demi kecepatan.
3. **Paparan:** butir dengan `max_exposure` terlampaui tidak boleh dipakai.
4. **Enemy items:** butir yang berbagi stimulus atau membocorkan jawaban tidak
   boleh berada dalam form yang sama.
5. **Anchor:** 10–15% butir anchor dari form sebelumnya untuk penyetaraan.
6. **Kunci jawaban:** validasi keseimbangan posisi setelah form selesai.
7. **Bekukan:** setelah form `frozen`, isi tidak berubah; revisi membuat form
   versi baru.

### 3.9 Validasi otomatis dan manual

**Validator otomatis (wajib, di CI):**

- Skema JSON valid; ID unik; referensi stimulus ada.
- Tepat satu kunci; jumlah opsi sesuai tipe.
- Semua opsi punya `rationale`; `explanation` punya 4 lapis.
- `item_type` ada di taksonomi; `level`/`section` konsisten.
- Butir listening punya audio/script; butir reading punya stimulus.
- Furigana tidak membocorkan kunci; alt text tidak menyebut jawaban.
- Tag pengetahuan minimal 1; tag skill minimal 1.
- Distribusi form menjumlah tepat; keseimbangan kunci lulus.
- Deteksi duplikat (stem normalisasi, stimulus, pasangan tag).
- Butir `published` tidak boleh diedit in-place.

Implementasi awal validator: [`tools/validate-bank.mjs`](../tools/validate-bank.mjs).
Jalankan `node tools/validate-bank.mjs docs/bank-soal/contoh-bank.json` dari root
repo; error menggagalkan CI, warning tidak.

**Review manusia (wajib, sebelum publish):**

| Peran | Memeriksa | Kriteria lulus |
|---|---|---|
| Content editor | Kejelasan stem, instruksi, konsistensi istilah | Tidak ada ambiguitas; satu konstruk |
| Japanese native reviewer | Kealamian bahasa, furigana, register, audio script | 100% natural; tidak ada kesalahan gramatikal |
| Pedagogy reviewer | Kesesuaian level, kognitif, distraktor | Sesuai band dan tipe soal |
| Psychometric reviewer | Difficulty prior, exposure, anchor | Tidak ada pelanggaran form |
| Legal/license | Sumber, atribusi, keaslian | Original atau lisensi jelas |

**Pilot:** 30–50 pengguna per sel butir, minimal 200 respons untuk butir
berisiko tinggi. Jangan mempublikasikan butir yang belum melewati pilot ke
dalam mock exam; boleh untuk latihan dengan label "beta".

### 3.10 Skema database

DDL lengkap ada di [`bank-soal/sql/2026-11_bank_soal.sql`](./bank-soal/sql/2026-11_bank_soal.sql).
Ringkasan relasi:

```text
exam_families ─┐
levels ────────┼──< items >── item_options
item_types ────┘      │
                      ├──< item_stimuli >── stimuli
                      ├──< item_tags >── knowledge_nodes
                      └──< item_statistics

form_blueprints ──< forms ──< form_sections
                         └──< form_items >── items

users ──< attempts ──< attempt_items >── items
                    └──< attempt_sections

items ──< item_versions (snapshot)
```

**Prinsip skema:**

- **Taksonomi sebagai data**, bukan enum kode. Menambah tipe N3/N2/N1 cukup
  menambah baris, bukan migrasi kolom.
- **Butir dan stimulus terpisah**; satu stimulus dapat dipakai banyak butir.
- **Form membekukan versi butir**, sehingga skor historis reproducible.
- **Respons per butir** disimpan terpisah dari attempt, agar analitik tidak
  memindai JSON besar.
- **Jawaban tidak pernah dikirim ke klien sebelum submit**; gunakan view
  `public_items` dan RPC penilaian di server.

### 3.11 Pipeline produksi konten

```text
Riset & blueprint
   ↓
Draft (penulis) ──► Lint otomatis ──► Review konten ──► Review native
   ↓                                                        │
Revisi ◄───────────────────────────────────────────────────┘
   ↓
Pilot (30–50 pengguna) ──► Kalibrasi ──► Publish ──► Monitoring
   ↓
Retire / revisi
```

| Tahap | SLA | Output | Gerbang |
|---|---|---|---|
| Draft | 2–3 hari per 40 butir | NDJSON/CSV terisi | Lint 0 error |
| Review konten | 2 hari | Catatan + status | 100% butir diperiksa |
| Review native | 3 hari | Persetujuan/penolakan | 100% butir berbahasa Jepang |
| Pilot | 7–14 hari | 200+ respons/butir | p-value & daya beda awal |
| Publish | 1 hari | Butir `published` | Semua gerbang lulus |
| Monitoring | Bulanan | Laporan kesehatan bank | Tidak ada butir negatif |

**Peran dan throughput (estimasi perencanaan):**

| Peran | Fokus | Throughput |
|---|---|---|
| Content lead | Blueprint, standar, keputusan akhir | 1 orang |
| Item writer (3) | Menulis butir N5/N4/JFT | 20–30 butir/hari (MG/B), 8–12 (R/L) |
| Japanese native reviewer (2) | Kealamian, furigana, audio | 40–60 butir/jam |
| Psychometrician (0,5) | Kalibrasi, form, DIF | 1 laporan/bulan |
| Audio producer | Rekaman + QC | 20–30 script/hari |
| Content ops | Workflow, metadata, validator | 1 orang |

**Anggaran waktu Fase 1 (2.000 butir N5):** dengan 3 penulis, ~10–12 minggu
menulis, 4–5 minggu review, 2–3 minggu pilot. Ini bukan proyek satu bulan;
menjanjikan "ribuan soal" tanpa tim review adalah cara tercepat menghasilkan
bank yang tidak valid.

### 3.12 Keamanan, privasi, dan keadilan

| Risiko | Mitigasi |
|---|---|
| Kebocoran soal mock | Skor di server; `items` tidak selectable publik; `public_items` tanpa kunci; rotasi form |
| Screenshot/berbagi soal | Deteksi anomali akses, watermark ID, rotasi butir; terima risiko residual |
| Data pengguna | RLS per user; retensi terbatas; agregasi anonim untuk kalibrasi |
| Bias budaya | Review keadilan, DIF, skenario beragam, hindari asumsi di luar kurikulum |
| AI halusinasi | Human review wajib; AI-assisted ditandai; audio diverifikasi |
| Lisensi | Registri sumber, atribusi, audit sebelum publish |

---

## 4. Roadmap Pengembangan Jangka Panjang

### 4.1 Arah dan prinsip

**North star:** pada akhir 2028, Manabi-Rouge memiliki bank butir terkurasi
untuk **N5–N1** yang cukup untuk 8 form per level, dengan skor simulasi yang
terkalibrasi, pembahasan berlapis, dan jalur belajar yang mengubah latihan
harian menjadi kesiapan ujian yang terukur.

Empat prinsip yang tidak boleh dilanggar saat ekspansi:

1. **Additive, bukan breaking.** Menambah level/tipe soal berarti menambah baris
   taksonomi dan profil, bukan mengubah skema inti.
2. **Kualitas mendahului kuantitas.** 300 butir terkalibrasi lebih bernilai
   daripada 3.000 butir tanpa review.
3. **Satu bank, banyak tampilan.** Latihan, drill, dan mock memakai butir yang
   sama; yang berbeda adalah perakitan dan umpan balik.
4. **Gate sebelum level baru.** Level berikutnya tidak dimulai sebelum level
   sebelumnya lulus gate konten, psikometri, dan operasi.

### 4.2 Fase pengembangan

| Fase | Periode | Fokus | Deliverable bank | Form | Gate keluar |
|---|---|---|---|---|---|
| **F0 — Fondasi & koreksi** | Nov–Des 2026 (6 minggu) | Skema, taksonomi, validator, perbaikan P0, pilot | 300 butir seed (N5/JFT) | 2 mini form | Validator 0 error; 300 butir reviewed; P0 selesai; 5.000 respons pilot |
| **F1 — N5 lengkap** | Jan–Mar 2027 | N5 2.000 butir, 8 form, daily loop, readiness v0.5 | N5 2.000 | 8 N5 | 90% sel terisi; reliabilitas ≥0,80; readiness error <10%; 8 form beku |
| **F2 — N4 + JFT** | Apr–Jun 2027 | N4 2.400, JFT 1.680, CBT mode, cohort beta | N4 2.400; JFT 1.680 | 8 N4; 6 JFT | N4 readiness; JFT band akurasi; 3 mitra B2B pilot |
| **F3 — Kalibrasi & N3 seed** | Jul–Sep 2027 | Kalibrasi gelombang 2, adaptive, N3 taxonomy + 800 seed | N3 seed 800 | 3 N3 | Item health index ≥0,85; N3 blueprint disetujui |
| **F4 — N3 lengkap** | Okt 2027–Mar 2028 | N3 2.600, 8 form, N2 taxonomy + 800 seed | N3 2.600 | 8 N3 | N3 mock reliability ≥0,85; survey hasil ujian |
| **F5 — N2 & N1** | Apr–Des 2028 | N2 3.000; N1 3.200; 8 form masing-masing | N2 3.000; N1 3.200 | 8 + 8 | Gate psikometri & operasi level lanjut |

**Catatan jadwal ujian.** Konten untuk gelombang JLPT Juli harus dibekukan
paling lambat 6 minggu sebelum ujian; gelombang Desember dibekukan paling
lambat akhir Oktober. Ini berarti F1 dan F2 harus selesai sebelum jendela
pembekuan, bukan setelahnya.

### 4.3 Transisi N4 → N3: perubahan yang nyata

N3 bukan "N4 lebih banyak". Ada tiga lompatan yang harus direncanakan:

| Dimensi | N4 | N3 | Konsekuensi bank |
|---|---|---|---|
| Seksi penilaian | 2 (120 + 60) | **3** (60 + 60 + 60) | Profil skor baru; laporan per reading/listening terpisah |
| Tipe reading | 短文, 中文, 情報検索 | + **内容理解（長文）** | Butir `R.LG`; stimulus 500–800+ karakter |
| Tipe listening | 課題, ポイント, 発話表現, 即時応答 | + **概要理解** | Butir `L.GO`; audio lebih panjang, menuntut ringkasan |
| Kosakata/kanji | ~1.500 / ~300 | ~3.750 / ~650 | ~2.250 kata baru, ~350 kanji baru |
| Kecepatan audio | Lambat | Mendekati natural | Produksi audio lebih mahal; QC lebih ketat |
| Panjang teks | 150–500 karakter | 500–800+ karakter | Penulis reading khusus; waktu review lebih lama |
| Skor lulus | 90, ambang 38/19 | **95, ambang 19/19/19** | Readiness meter 3 seksi; tidak ada ambang 38 |

**Langkah transisi N3 (urutan kerja):**

1. **Taksonomi (minggu 1–2).** Tambah baris `R.LG`, `L.GO`, dan profil skor
   `JLPT-N3-2026` (3 seksi × 60, lulus 95, ambang 19). Tidak ada perubahan
   skema butir.
2. **Blueprint form (minggu 2–3).** Form N3 mengikuti waktu resmi 140 menit
   (30 + 70 + 40). Jumlah butir ditetapkan berdasarkan waktu dan tipe; jangan
   menyalin N4.
3. **Seed 800 butir (minggu 3–10).** Fokus pada tipe baru dan teks panjang;
   60% butir berasal dari adaptasi N4 yang dinaikkan kesulitannya, 40% baru.
4. **Pilot & kalibrasi (minggu 10–14).** Anchor 10–15% butir N4/N3 untuk
   penyetaraan vertikal.
5. **Gate N3 (minggu 14).** Reliabilitas ≥0,85; tidak ada DIF besar; form
   beku; review native 100%.

**Yang tidak boleh berubah:** skema `items`, `options`, `stimulus`,
`explanation`, `attempt_items`. Yang berubah hanya isi taksonomi, blueprint,
profil skor, dan metadata panjang/kecepatan (additive JSON).

### 4.4 Transisi N3 → N2 → N1

| Level | Tipe baru | Perubahan konten | Target bank | Form |
|---|---|---|---:|---:|
| **N3** | `R.LG` (長文), `L.GO` (概要理解) | Teks 500–800+; audio near-natural; 3 seksi skor | 2.600 | 8 |
| **N2** | `R.IN` (統合理解), `R.TH` (主張理解), `L.IN` (統合理解); `L.VE` dihapus | Dua teks dibandingkan; opini penulis; abstract news; audio natural | 3.000 | 8 |
| **N1** | Varian `R.TH`/`R.IN` lanjutan; teks editorial/esei | Teks abstrak, logika kompleks, inferensi tingkat tinggi; audio natural penuh | 3.200 | 8 |

**Aturan khusus level lanjut:**

- **Vertical scaling:** simpan 10–15% anchor items lintas level (N4/N3, N3/N2,
  N2/N1) agar skor dapat dibandingkan dan readiness tidak "melompat" saat naik
  level.
- **Cognitive load:** N2/N1 tidak boleh menambah jumlah butir per form secara
  proporsional; yang bertambah adalah **kedalaman teks**, bukan jumlah soal.
- **Audio:** N1/N2 mendekati kecepatan natural; produksi audio manusia wajib,
  TTS hanya untuk latihan tambahan.
- **Item type retirement:** saat tipe tidak lagi diuji (mis. `L.VE` di N2/N1),
  butir lama tetap disimpan untuk latihan, tetapi tidak masuk form level itu.

### 4.5 Strategi pengisian bank (production engine)

**Urutan prioritas produksi.** Gunakan skor prioritas:

```text
prioritas = (kebutuhan_form × gap_kelemahan × potensi_reuse) / biaya_produksi
```

| Prioritas | Kelompok butir | Alasan |
|---:|---|---|
| 1 | `MG.KR`, `MG.CD`, `B.GF`, `L.TB`, `L.KP` | Kebutuhan form tinggi, produksi lebih murah, reuse lintas latihan/mock |
| 2 | `B.TG`, `R.SH`, `R.MD`, `L.QR` | Menutup celah konstruk; sebagian butir berbagi stimulus |
| 3 | `MG.OR`, `MG.PP`, `MG.US`, `L.VE` | Volume form lebih kecil; distraktor menuntut riset kesalahan |
| 4 | `R.IR`, `R.LG`, `L.GO`, `L.IN`, `R.IN` | Produksi mahal (teks/audio), tetapi pembeda level |
| 5 | JFT `SV.WU`, `CE.EX`, `R.IS`, `L.AN` | Spesifik segmen SSW; nilai strategis tinggi |

**Sprint produksi 2 minggu (contoh F1):**

| Minggu | Aktivitas | Output |
|---|---|---|
| 1 | Draft 250 butir inti + 10 stimulus | NDJSON, lint 0 error |
| 1 | Review konten 150 butir | 150 `content_review` |
| 2 | Review native 150 butir; revisi | 150 `native_review` |
| 2 | Pilot 100 butir; analisis awal | 100 `pilot` |
| 2 | Bekukan 1 form; publikasi 120 butir | 1 form + 120 `published` |

**Daur ulang konten (content reuse):**

- Satu **bacaan** 300 karakter → 2 butir `R.SH` + 1 butir `R.MD` + 1 butir
  `B.TG` (dengan celah berbeda).
- Satu **dialog** 40 detik → 1 butir `L.TB` + 1 `L.KP` + 1 `L.QR` (dengan
  potongan audio berbeda).
- Satu **pola grammar** → 3 butir `B.GF` + 2 `B.SC` + 1 `B.TG`.
- Satu **skenario JFT** (mis. shift kerja) → 1 `CE.EX` + 1 `L.CV` + 1 `R.CT` +
  1 `R.IS`.
- Satu **butir N5/N4** yang valid untuk JFT → adaptasi instruksi + skenario →
  butir dual-tag baru (bukan mengedit butir asli).

**Target throughput vs kapasitas:**

| Bulan | Butir publish | Kapasitas tim (bertahap) | Catatan |
|---|---:|---:|---|
| F0 | 300 | 300 | Seed + validator |
| F1 | 1.700 | 1.800 | Sisa 2.000 dari seed |
| F2 | 4.080 | 4.200 | N4 + JFT; tambah 1 penulis |
| F3 | 1.500 | 1.800 | Kalibrasi + N3 seed |
| F4 | 2.300 | 2.400 | N3 lengkap + N2 seed |
| F5 | 5.700 | 6.000 | N2 + N1; tim 5 penulis |

Angka ini sengaja konservatif. Jika throughput melampaui kapasitas review,
**berhenti menulis** dan tambah reviewer; menumpuk draft tanpa review adalah
utang kualitas.

> **Catatan angka.** F2 dan F5 lebih tinggi karena peluncuran level baru dan
> sebagian butir JFT merupakan adaptasi dual-tag dari butir N5/N4, bukan tulisan
> dari nol. KPI bulanan di §4.8 adalah rata-rata organisasi, bukan target tiap
> fase.

### 4.6 Aturan skalabilitas teknis

| Lapisan | Boleh berubah | Tidak boleh berubah | Alasan |
|---|---|---|---|
| Identitas butir | Menambah field metadata | `id`, `code`, `version` | Analitik & audit historis |
| Opsi | Menambah `rationale_en` | `key`, `is_correct`, jumlah | Skor & pembahasan |
| Stimulus | Menambah format media | Referensi `stimulus_refs` | Reuse & dedup |
| Taksonomi | Menambah baris tipe/level | Struktur tabel | Form & filter |
| Skor | Menambah profil baru | Antarmuka `score(attempt)` | Perbandingan skor |
| Attempt | Menambah event | `attempt_items` per butir | Kalibrasi |
| Form | Menambah constraint | `form_items` immutable setelah freeze | Reproducibility |

**Migrasi yang diizinkan:** additive column, backfill, view baru, index baru.
**Migrasi yang dilarang:** mengubah arti `item_type`, menghapus field yang
sudah dipublikasikan, menormalkan ulang ID, mengubah kunci jawaban butir yang
sudah dipakai form beku.

### 4.7 Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Menyalin soal resmi | Legal, validitas, reputasi | Kebijakan original; audit; legal review |
| Reviewer bottleneck | Bank penuh draft, kualitas turun | Gate kapasitas; reviewer kontrak; sampling |
| Cold start kalibrasi | Readiness tidak akurat | Prior a priori; jangan tampilkan readiness sebelum data cukup |
| Perubahan kebijakan JFT | Skor/form salah | Profil skor berversi; monitor situs resmi; tanggal efektif |
| AI-generated error | Penjelasan salah, furigana salah | Human native review; larangan publish tanpa review |
| Biaya audio | Produksi melambat | TTS untuk latihan; manusia untuk mock; batch recording |
| Kebocoran bank | Validitas turun | Server scoring; exposure; rotasi; monitoring |
| Tim scaling | Inkonsistensi kualitas | Playbook, template, calibration session, rubric |
| Engagement mengalahkan learning | Pengguna mengejar XP, bukan mastery | Guardrail metric; desain mastery-based (lihat §5) |

### 4.8 KPI dan tata kelola

| Kategori | KPI | Target F1 | Target F5 |
|---|---|---:|---:|
| Konten | Butir publish/bulan | 550 | 850 |
| Konten | % butir native-reviewed | 100% | 100% |
| Konten | % sel tipe terisi ≥3× kebutuhan form | 90% | 95% |
| Psikometri | Marginal reliability form | ≥0,80 | ≥0,88 |
| Psikometri | Butir sehat (infit 0,7–1,3) | ≥85% | ≥92% |
| Pembelajaran | Kenaikan skor mock 4 minggu | +8 poin | +10 poin |
| Pembelajaran | Mastery rate N5 | 60% | 75% |
| Engagement | Mock completion rate | ≥55% | ≥65% |
| Engagement | D30 retention | ≥25% | ≥35% |
| Kepercayaan | Readiness calibration error | ≤10 poin | ≤5 poin |
| Operasi | Cycle time draft → publish | ≤21 hari | ≤14 hari |

**Ritme tata kelola:**

- **Mingguan:** content standup (blocker, kualitas, kapasitas).
- **Dua mingguan:** sprint review + item health sample.
- **Bulanan:** calibration report + form freeze review.
- **Kuartalan:** gate level berikutnya + audit sumber/lisensi.
- **Tahunan:** review taksonomi terhadap perubahan resmi JLPT/JFT.

---

## 5. Fitur Unggulan Rekomendasi

### 5.1 User journey: dari latihan harian ke simulasi akhir

Journey dirancang sebagai **loop**, bukan garis lurus: setiap mock menghasilkan
diagnosis yang masuk kembali ke latihan harian. Inilah yang membedakan
Manabi-Rouge dari kumpulan soal.

```text
Onboarding & diagnostik
        ↓
Latihan harian (SRS + 5 butir)
        ↓
Drill mingguan (tipe terlemah)
        ↓
Checkpoint seksi (2 minggu)
        ↓
Mock penuh (bulanan)
        ↓
Review & rencana baru ──────► kembali ke latihan harian
        ↓
Taper 2 minggu → ujian
        ↓
Pasca-ujian → level berikutnya
```

| Tahap | Trigger | Aksi pengguna | Permukaan produk | Konten | Metrik |
|---|---|---|---|---|---|
| **0. Onboarding** | Daftar pertama kali | Pilih tujuan (JLPT N5/N4, JFT, umum), tanggal ujian, waktu harian; kerjakan diagnostik 24 butir | `/onboarding` (baru) | Diagnostik adaptif: kana, kosakata, grammar, listening | Completion rate; akurasi diagnostik |
| **1. Latihan harian** | Buka aplikasi / notifikasi | 5 butir adaptif + kartu SRS jatuh tempo | `/dashboard`, `/ulasan` | Campuran 60% kelemahan + 25% review + 15% baru | Streak; butir/hari; akurasi |
| **2. Drill mingguan** | Senin / setelah 50 butir | 15 butir dari 1–2 tipe terlemah + pembahasan | `/latihan/fokus` (baru) | `accuracy_by_type` < 60% | Kenaikan akurasi tipe |
| **3. Checkpoint seksi** | 2 minggu sekali | Satu seksi berwaktu (mis. 20 menit 文字・語彙) | `/[level]/ujian?mode=section` | Form seksi dari bank | Waktu/butir; skor seksi |
| **4. Mock penuh** | Bulanan / H-30 | 75/98/50 butir, timer, section lock, audio 1×/2× | `/[level]/ujian` | Form beku | Completion; skor; readiness |
| **5. Review** | Setelah mock | Lihat salah per tipe, baca pembahasan, kerjakan 3 butir serupa | `/hasil/[attemptId]` (baru) | Butir salah + butir serupa | Review completion; retry accuracy |
| **6. Taper** | H-14 | 2 mock + review + checklist ujian | `/rencana` (baru) | Form mock + ringkasan aturan | Mock stability; anxiety self-report |
| **7. Pasca-ujian** | H+1 | Input hasil (self-report), dapat rencana level berikutnya | `/hasil-ujian` (baru) | Survei + placement | Self-report pass rate; lanjut level |

**Tiga persona, tiga ritme:**

| Persona | Tujuan | Ritme | Konten yang ditekankan | Fitur kunci |
|---|---|---|---|---|
| **Pelajar mandiri** | N5 → N4 dalam 6–9 bulan | 20–30 menit, 4–5×/minggu | Kosakata, grammar, reading pendek | Daily 5, error notebook, mock bulanan |
| **Peserta Ginou Jisshuusei** | JFT A2.2 / N4 dalam 3–4 bulan | 30 menit, 5×/minggu, sering malam | Skenario kerja, instruksi, listening | JFT scenario mode, listening lab, cohort |
| **Tokutei Ginou** | JFT A2.2 sebelum keberangkatan | 45–60 menit, 3×/minggu, intensif | Kerja, balai kota, kesehatan, darurat | JFT CBT mock, readiness, offline/PWA |

**Rute yang sudah ada vs yang perlu ditambah:**

| Kebutuhan | Rute saat ini | Rekomendasi |
|---|---|---|
| Latihan campuran | `/[level]/quiz` | Pertahankan; tambah `?type=` dan `?count=` |
| Mock ujian | `/[level]/ujian` | Pisahkan mode `practice`, `section`, `mock`, `cbt` |
| SRS | `/[level]/ulasan` | Tambah antrean "butir salah" |
| Dasbor | `/dashboard` | Tambah readiness card dan daily 5 |
| Error notebook | — | `/latihan/kesalahan` |
| Rencana belajar | — | `/rencana` |
| Hasil & review | — | `/hasil/[attemptId]` |
| Kelas/cohort | — | `/kelas/[code]` (B2B) |
| CMS konten | — | `/studio` (internal, terpisah dari app publik) |

### 5.2 Fitur unggulan

#### F1. Daily 5 — sesi mikro adaptif

- **Masalah:** pengguna tidak tahu harus mulai dari mana; sesi 30 menit terasa
  berat.
- **Mekanik:** 5 butir, 3 menit, dipilih oleh algoritma: 60% tipe terlemah,
  25% SRS jatuh tempo, 15% butir baru. Selesai → kartu "hari ini selesai".
- **Dasar pedagogi:** *testing effect* + *spaced retrieval*; dosis kecil
  meningkatkan konsistensi.
- **Ketergantungan data:** `accuracy_by_type`, `srs_cards`, `item_tags`.
- **Metrik:** completion rate, D7 retention, akurasi harian.
- **Effort/fase:** sedang; F1.

#### F2. Error Notebook 2.0 — dari salah ke aturan ke latihan

- **Masalah:** pengguna melihat jawaban salah, lalu lupa; tidak ada perbaikan
  sistematis.
- **Mekanik:** setiap butir salah masuk antrean. Alur 3 langkah: (1) baca
  pembahasan `rule` + `contrast`; (2) kerjakan 2 butir serupa; (3) ulangi butir
  asli setelah 24 jam. Jika benar, keluar dari antrean; jika salah, kembali
  dengan prioritas lebih tinggi.
- **Dasar pedagogi:** *errorful learning* yang dikoreksi + *spaced retry*.
- **Ketergantungan data:** `attempt_items`, `item_tags`, `review_queue`.
- **Metrik:** retry accuracy, penurunan pengulangan kesalahan, notebook
  completion.
- **Effort/fase:** sedang; F1.

#### F3. Readiness Meter — peluang lulus, bukan skor kosong

- **Masalah:** pengguna tidak tahu apakah siap ujian; skor mock tunggal
  menyesatkan.
- **Mekanik:** kartu di dasbor: estimasi skor total + kedua seksi + ambang +
  `P(lulus)` dengan rentang. Jika data belum cukup, tampilkan "butuh 1 mock
  lagi", bukan angka palsu.
- **Dasar pedagogi:** *formative assessment*; target yang jelas meningkatkan
  self-regulation.
- **Ketergantungan data:** kalibrasi butir, form beku, attempt history.
- **Metrik:** akurasi prediksi vs hasil mock berikutnya; kepercayaan pengguna.
- **Effort/fase:** tinggi; F1 v0.5, F3 v1.

#### F4. Full Mock Exam — kondisi ujian yang otentik

- **Masalah:** latihan tanpa tekanan waktu tidak melatih daya tahan dan
  manajemen waktu.
- **Mekanik:** N5 90 menit, N4 115 menit, JFT 60 menit; timer; section lock;
  audio 1× (JLPT) atau 2× (JFT); auto-submit; tidak ada pembahasan sampai
  selesai.
- **Dasar pedagogi:** *test-like practice* + *desirable difficulty*.
- **Ketergantungan data:** form beku, server scoring, `attempt_items`.
- **Metrik:** completion rate, time per section, skor stabil antar-mock.
- **Effort/fase:** tinggi; F1 (N5), F2 (N4/JFT).

#### F5. Section Sprint — latihan kecepatan per seksi

- **Masalah:** pengguna lambat di satu seksi, tetapi selalu latihan campuran.
- **Mekanik:** 10–15 menit, satu seksi, target waktu per butir; hasil
  menampilkan waktu vs target dan akurasi.
- **Dasar pedagogi:** *automaticity* untuk komponen dasar, bukan untuk
  pemahaman mendalam.
- **Ketergantungan data:** `time_estimate_sec`, attempt timing.
- **Metrik:** waktu/butir, akurasi di bawah tekanan.
- **Effort/fase:** rendah–sedang; F1.

#### F6. Listening Lab — telinga, bukan teks

- **Masalah:** pembelajar Indonesia sering bergantung pada teks; audio sekali
  putar terasa panik.
- **Mekanik:** kecepatan 0,75×/1,0×/1,25×; mode 1×/2×; shadowing; dictation;
  transkrip setelah menjawab; tandai kata yang tidak terdengar.
- **Dasar pedagogi:** *extensive listening* + *intensive listening*;
  *noticing*.
- **Ketergantungan data:** audio stimulus, `play_limit`, transkrip.
- **Metrik:** akurasi listening, jumlah putar ulang, waktu reaksi.
- **Effort/fase:** sedang; F1 (N5), F2 (JFT).

#### F7. Distractor Autopsy — mengapa opsi lain menjebak

- **Masalah:** pembahasan biasa hanya menjelaskan kunci; pengguna tidak belajar
  dari distraktor.
- **Mekanik:** setelah salah, tampilkan peta opsi: mengapa A menjebak, mengapa
  B salah, aturan apa yang dipakai. Untuk pola berulang, tampilkan "trap map"
  (mis. に vs で).
- **Dasar pedagogi:** *elaborative feedback*; *contrastive analysis*.
- **Ketergantungan data:** `rationale` per opsi, `skill_tags`.
- **Metrik:** penurunan salah pada distraktor yang sama; helpfulness rating.
- **Effort/fase:** rendah (jika rationale wajib); F1.

#### F8. Weakness Radar & laporan mingguan

- **Masalah:** pengguna tidak melihat pola kelemahan; hanya melihat skor total.
- **Mekanik:** radar per tipe soal (MG, B, R, L), daftar 3 kelemahan teratas,
  dan satu aksi konkret ("kerjakan 10 butir L.KP").
- **Dasar pedagogi:** *metacognition*; umpan balik yang spesifik lebih efektif
  daripada skor agregat.
- **Ketergantungan data:** `accuracy_by_type`, volume per tipe.
- **Metrik:** klik aksi, perbaikan akurasi tipe, laporan dibuka.
- **Effort/fase:** sedang; F1.

#### F9. Exam Countdown & Study Plan

- **Masalah:** pengguna menunda; tidak tahu kapan harus menyelesaikan apa.
- **Mekanik:** input tanggal ujian → rencana mundur: fase belajar, checkpoint,
  mock, taper. Pengingat yang bisa dimatikan.
- **Dasar pedagogi:** *implementation intentions*; mengurangi beban
  perencanaan.
- **Ketergantungan data:** tanggal ujian, progres mastery.
- **Metrik:** plan adherence, mock on-time, D30 retention.
- **Effort/fase:** rendah; F1.

#### F10. JFT Life-Scenario Mode

- **Masalah:** JFT menguji komunikasi kehidupan/kerja, bukan hanya grammar.
- **Mekanik:** mode CBT 4 seksi, 60 menit, 3 opsi, audio 2×, instruksi ID/EN,
  skenario kerja/balai kota/kesehatan/darurat; hasil berupa estimasi pita.
- **Dasar pedagogi:** *situated learning*; transfer ke konteks nyata.
- **Ketergantungan data:** butir JFT skenario, `play_limit`, skor pita.
- **Metrik:** pita A2.2 tercapai, completion, relevansi self-report.
- **Effort/fase:** tinggi; F2 (strategis untuk segmen SSW).

#### F11. Cohort/Class Mode (B2B)

- **Masalah:** lembaga pelatihan butuh memantau peserta, bukan hanya aplikasi
  individual.
- **Mekanik:** kode kelas; tugas mingguan; dasbor pengajar (progres, kelemahan
  kelas, butir sulit); ekspor laporan.
- **Dasar pedagogi:** *teacher dashboards* + *formative assessment*.
- **Ketergantungan data:** attempts agregat, RLS, peran pengajar.
- **Metrik:** jumlah kelas aktif, seat retention, hasil mock kelas.
- **Effort/fase:** tinggi; F2 beta, F4 penuh.

#### F12. Mock Review Replay — ulangi di waktu yang tepat

- **Masalah:** review langsung setelah mock hanya menguji memori jangka pendek.
- **Mekanik:** butir salah dijadwalkan ulang H+1, H+3, H+7; tampil sebagai
  "replay" singkat; setelah 3 benar, keluar.
- **Dasar pedagogi:** *spaced repetition* untuk kesalahan, bukan hanya
  kosakata.
- **Ketergantungan data:** review queue, attempt items.
- **Metrik:** retensi 7 hari, penurunan kesalahan berulang.
- **Effort/fase:** rendah–sedang; F1.

#### F13. Streak Freeze & mastery badges

- **Masalah:** gamifikasi agresif membuat pengguna mengejar XP dengan menebak.
- **Mekanik:** streak freeze 2×/bulan; badge berbasis mastery (mis. "50 tag N5
  dikuasai"), bukan jumlah soal; tidak ada leaderboard global default.
- **Dasar pedagogi:** *mastery learning*; motivasi intrinsik.
- **Ketergantungan data:** mastery tags, streak.
- **Metrik:** D30 retention, mastery rate, penurunan guessing.
- **Effort/fase:** rendah; F1.

### 5.3 Prioritas fitur

| Fitur | Dampak belajar | Dampak engagement | Effort | Prioritas | Fase |
|---|---:|---:|---:|---|---|
| Daily 5 | 5 | 4 | 3 | **P0** | F1 |
| Error Notebook 2.0 | 5 | 4 | 3 | **P0** | F1 |
| Full Mock Exam | 5 | 3 | 5 | **P0** | F1/F2 |
| Readiness Meter | 4 | 5 | 5 | **P1** | F1/F3 |
| Listening Lab | 5 | 4 | 3 | **P1** | F1/F2 |
| Distractor Autopsy | 4 | 3 | 1 | **P1** | F1 |
| Weakness Radar | 4 | 4 | 3 | **P1** | F1 |
| JFT Scenario Mode | 5 | 4 | 4 | **P1** | F2 |
| Mock Review Replay | 5 | 3 | 2 | **P1** | F1 |
| Exam Countdown | 3 | 3 | 1 | **P2** | F1 |
| Section Sprint | 3 | 3 | 2 | **P2** | F1 |
| Cohort/Class Mode | 4 | 3 | 5 | **P2** | F2/F4 |
| Streak Freeze | 2 | 3 | 1 | **P2** | F1 |

### 5.4 Anti-pola yang harus dihindari

| Anti-pola | Mengapa berbahaya | Alternatif |
|---|---|---|
| XP untuk kecepatan | Mendorong menebak, bukan memahami | XP untuk mastery dan konsistensi |
| Leaderboard global default | Menekan pemula; cheating | Leaderboard opt-in per kelas |
| Soal baru terus tanpa review | Tidak ada konsolidasi | Rasio 60% review / 40% baru |
| Pembahasan AI tanpa review | Menyebarkan kesalahan | Human native review |
| Menampilkan kunci sebelum menjawab | Menghancurkan validitas | Feedback setelah submit |
| "Lulus" palsu dari skor mentah | Kepercayaan rusak | Estimasi pita + rentang + disclaimer |
| Mock terlalu sering | Kelelahan, bukan belajar | 1×/bulan + section checkpoint |
| Streak tanpa freeze | Pengguna hilang karena satu hari | Freeze 2×/bulan |

### 5.5 Pengukuran dan eksperimen

**Funnel utama:**

```text
Landing → Onboarding → Diagnostik → Latihan pertama → Hari ke-7
→ Mock pertama → Review → Mock kedua → Level berikutnya
```

**Event minimum:**

| Event | Properti | Dipakai untuk |
|---|---|---|
| `diagnostic_completed` | level, akurasi, durasi | segmentasi |
| `item_answered` | item_id, type, correct, latency, confidence | kalibrasi |
| `session_completed` | durasi, jumlah butir, akurasi | habit |
| `mock_started` | form_id, mode | funnel |
| `mock_finished` | skor, seksi, waktu | readiness |
| `review_completed` | jumlah butir, akurasi ulang | retensi |
| `plan_viewed` | rekomendasi | engagement |
| `notebook_retry` | hasil | efektivitas error notebook |

**Eksperimen awal (A/B):**

1. Daily 5 adaptif vs pengguna memilih sendiri — retensi 7 hari.
2. Error notebook otomatis vs manual — retry accuracy.
3. Readiness meter dengan rentang vs angka tunggal — kepercayaan dan
   konversi mock.
4. Pembahasan 1 lapis vs 4 lapis — retry accuracy.

**Guardrail:** akurasi tidak boleh naik karena kebocoran kunci; waktu sesi
tidak boleh turun karena soal terlalu mudah; retensi tidak boleh naik karena
notifikasi berlebihan.

### 5.6 MVP fitur vs fase lanjut

| Fase | Fitur | Definisi selesai |
|---|---|---|
| **F0** | Mock scoring benar, error log dasar, event `item_answered` | Skor N5 memakai 38/19; JFT memakai model 2026; data per butir tersimpan |
| **F1** | Daily 5, Error Notebook 2.0, Listening Lab, Distractor Autopsy, Weakness Radar, Mock Review Replay | N5 2.000 butir; 8 form; retry accuracy terukur |
| **F2** | JFT Scenario Mode, Readiness v0.5, Cohort beta | JFT 1.680; 6 form; 3 mitra B2B |
| **F3** | Readiness v1, adaptive selection, study plan | Kalibrasi 2 gelombang; prediksi stabil |
| **F4–F5** | Cohort penuh, teacher dashboard, N3–N1 | Gate level & operasi |

---

## Lampiran

### A. Rujukan resmi

| Sumber | URL | Dipakai untuk |
|---|---|---|
| JLPT — Komposisi seksi & tipe soal | https://www.jlpt.jp/e/guideline/testsections.html | Waktu, tipe soal, level |
| JLPT — Skor & kelulusan | https://www.jlpt.jp/e/guideline/results.html | 120/60, 80/90, 38/19 |
| JLPT — Ringkasan kompetensi level | https://www.jlpt.jp/e/about/levelsummary.html | Deskripsi N5/N4 |
| JLPT — Referensi CEFR | https://www.jlpt.jp/e/about/cefr_reference.html | N5=A1, N4=A2 |
| JLPT — Can-do (bukan silabus) | https://www.jlpt.jp/e/about/candolist.html | Peringatan metodologis |
| JLPT — Perubahan jumlah butir N4/N5 | https://www.jlpt.jp/e/topics/202009091599642827.html | Perkiraan jumlah butir |
| JFT-Basic — Tentang tes | https://www.jpf.go.jp/jft-basic/e/about/ | Struktur 2026, skor, pita, CBT |
| JFT-Basic — Hint for Learning | https://www.jpf.go.jp/jft-basic/e/support/index.html | Irodori, 381 Can-do |
| Irodori — What is Irodori | https://www.irodori.jpf.go.jp/en/about.html | Level A1–B1, 341 Can-do |
| JLPT — Contoh soal | https://www.jlpt.jp/e/samples/forlearners.html | Bentuk soal |
| JFT-Basic — Contoh soal | https://www.jpf.go.jp/jft-basic/sample/q01.html | Format 3 opsi |
| Repo Manabi — README | `README.md` | Struktur & status aplikasi |
| Repo Manabi — Skema Supabase | `supabase/schema.sql` | Fondasi backend |

### B. Glosarium

| Istilah | Arti |
|---|---|
| **Moji-goi** (文字・語彙) | Seksi huruf & kosakata |
| **Bunpou** (文法) | Tata bahasa |
| **Dokkai** (読解) | Pemahaman bacaan |
| **Choukai** (聴解) | Pemahaman mendengarkan |
| **Kaiwa-hyougen** (会話・表現) | Percakapan & ungkapan (JFT) |
| **Item type** | Tipe soal resmi (mis. 漢字読み) |
| **Stimulus** | Teks/audio/gambar yang menjadi bahan soal |
| **Form** | Satu set soal ujian yang sudah dibekukan |
| **Blueprint** | Aturan komposisi form |
| **Anchor item** | Butir yang sama antar-form untuk menyetarakan skala |
| **p-value** | Proporsi jawaban benar |
| **Daya beda** | Kemampuan butir membedakan kemampuan peserta |
| **DIF** | Differential item functioning; indikasi bias |
| **Readiness** | Estimasi peluang lulus |

### C. Keputusan yang masih terbuka

| Pertanyaan | Dampak | Pemilik | Target keputusan |
|---|---|---|---|
| Apakah mock memakai server scoring sejak F0 atau F1? | Keamanan & biaya | Engineering + Content | F0 |
| Apakah audio mock memakai manusia sejak F1? | Biaya & otentisitas | Produksi | F1 |
| Apakah N4 diluncurkan sebelum JFT 2026 atau bersamaan? | Prioritas pasar | Product | F2 |
| Berapa harga/paket B2B cohort? | Monetisasi | Business | F2 |
| Apakah penjelasan Inggris wajib sejak F1? | Efort konten | Content | F1 |
| Apakah readiness ditampilkan gratis atau berbayar? | Kepercayaan & konversi | Product | F3 |

---

*Dokumen ini hidup. Setiap perubahan taksonomi, skema, atau target angka harus
melalui review content lead dan tercatat di changelog bank soal.*
