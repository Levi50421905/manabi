# Bank Soal Manabi-Rouge

Direktori ini berisi spesifikasi teknis dan contoh implementasi bank soal yang
menjadi acuan produksi konten JLPT N5–N4 dan JFT-Basic. Cetak biru lengkapnya
ada di [`../BLUEPRINT-BANK-SOAL.md`](../BLUEPRINT-BANK-SOAL.md).

## Isi direktori

| File | Fungsi |
|---|---|
| [`skema-butir-soal.json`](./skema-butir-soal.json) | JSON Schema 2020-12 untuk bank, stimulus, butir, opsi, taksonomi, dan form blueprint. |
| [`contoh-bank.json`](./contoh-bank.json) | Bank contoh 34 butir + 15 stimulus + 3 form blueprint. Semua tipe soal aktif terwakili. |
| [`matriks-kurikulum.csv`](./matriks-kurikulum.csv) | Target butir per level × seksi × tipe, jumlah per form, dan catatan produksi. Total 6.600 bruto / 6.000 unik. |
| [`sql/2026-11_bank_soal.sql`](./sql/2026-11_bank_soal.sql) | DDL Supabase/Postgres: taksonomi, stimulus, butir, form, attempt, statistik, RLS, view publik, RPC penilaian. |
| [`../../tools/validate-bank.mjs`](../../tools/validate-bank.mjs) | Validator zero-dependency untuk skema, referensi, kunci, dan form blueprint. |

## Mulai cepat

```bash
# dari root repo
node tools/validate-bank.mjs docs/bank-soal/contoh-bank.json
```

Keluaran yang diharapkan:

```text
Bank: .../docs/bank-soal/contoh-bank.json
Butir: 34 · Stimulus: 15 · Form blueprint: 3
...
OK: tidak ada error.
```

Validator memeriksa:

- ID unik dan sesuai konvensi `MR-{LEVEL}-{SECTION}-{TYPE}-{SEQ}`.
- Tipe soal ada di taksonomi; seksi dan level konsisten.
- Tepat satu kunci jawaban; jumlah opsi sesuai tipe (3/4).
- Setiap opsi punya `rationale`; pembahasan punya 4 lapis.
- Butir reading/listening merujuk stimulus yang sesuai.
- Butir `B.TG` punya `blank_index`.
- Referensi stimulus tidak menggantung; stimulus audio punya script.
- Distribusi form menjumlah tepat; profil skor cocok.
- Tag pengetahuan dan skill minimal satu.
- Deteksi stem duplikat per stimulus.

## Konvensi penulisan

**ID butir**

```text
MR-N5-MG-KR-0001     JLPT N5, 文字・語彙, 漢字読み, nomor 0001
MR-N4-B-SC-0142      JLPT N4, 文法, 文の組み立て, nomor 0142
MR-JFT-SV-WM-0007    JFT-Basic, Script & Vocabulary, Word meaning, nomor 0007
```

**ID stimulus**

```text
ST-N5-RD-0001        N5, reading/passage
ST-N4-LS-0011        N4, listening/dialogue
ST-JFT-RD-0002       JFT, reading/table
```

**Status butir**

`draft` → `content_review` → `native_review` → `pilot` → `published`
→ (`superseded` / `retired`)

Butir `published` tidak boleh diedit in-place. Perubahan membuat `version + 1`;
form yang sudah dibekukan tetap merujuk versi lama agar skor historis
reproduksibel.

**Kunci dan opsi**

- JLPT: 4 opsi untuk `MG.*`, `B.*`, `R.*`, `L.TB`, `L.KP`; 3 opsi untuk
  `L.VE`, `L.QR`.
- JFT: 3 opsi untuk semua tipe.
- Setiap opsi wajib punya `rationale`, termasuk kunci.
- Jangan memakai opsi meta seperti "semua benar" atau "tidak ada jawaban".

**Pembahasan**

Setiap butir wajib punya empat lapis: `short` (jawaban), `rule` (aturan),
`contrast` (mengapa opsi lain salah), `transfer` (pola untuk soal lain), dan
`refs` (rujukan ke atom pengetahuan).

## Cakupan contoh bank

| Kelompok | Butir | Fokus |
|---|---:|---|
| N5 | 12 | Empat tipe 文字・語彙, tiga tipe 文法, reading pendek, empat tipe 聴解 |
| N4 | 11 | Termasuk `MG.US` (用法), reading menengah, informasi, listening poin |
| JFT | 11 | Script & Vocabulary, Conversation & Expression, Listening, Reading |
| **Total** | **34** | Semua 26 tipe soal aktif; 2 butir dual-tag sebagai contoh |

Contoh butir adalah **pilot**, bukan bank produksi. Target jumlah sebenarnya ada
di [`matriks-kurikulum.csv`](./matriks-kurikulum.csv) dan §2.6 cetak biru.

**Integrasi web:** halaman `/[level]/bank` memakai 23 dari 34 butir tersebut
(12 N5 + 11 JFT-Basic) sebagai paket latihan beta. Datanya ada di
`apps/web/data/bank-practice.json`; konversi ke `Question` ada di
`apps/web/lib/bank.ts`.

## Menambah butir

1. Tambahkan stimulus lebih dulu jika butir membaca/mendengar membutuhkannya.
2. Tambahkan butir ke `items` dengan `stimulus_refs` yang benar.
3. Isi `difficulty.features` 0–3; validator menghitung band dan memberi
   peringatan jika tidak cocok.
4. Jalankan validator.
5. Untuk produksi, lanjutkan ke review konten, review native, pilot, lalu
   `published`.

## Catatan implementasi

- **Jangan kirim kunci jawaban ke klien sebelum submit.** Gunakan view
  `public_items` / `public_item_options` dan RPC `submit_attempt` di DDL.
- **Mock exam hanya dari butir `published`.** Generator prosedural tetap boleh
  dipakai untuk drill ringan, bukan untuk form ujian.
- **JFT bukan "JLPT versi mudah".** Format CBT, 3 opsi, audio 2×, dan pita CEFR
  harus tercermin di UI dan penilaian.
- **Jangan menyalin soal JLPT/JFT resmi.** Contoh di sini ditulis original.

## Rujukan

- Cetak biru: [`../BLUEPRINT-BANK-SOAL.md`](../BLUEPRINT-BANK-SOAL.md)
- Spesifikasi JLPT: <https://www.jlpt.jp/e/guideline/testsections.html>
- Skor JLPT: <https://www.jlpt.jp/e/guideline/results.html>
- JFT-Basic: <https://www.jpf.go.jp/jft-basic/e/about/>
- Irodori: <https://www.irodori.jpf.go.jp/en/about.html>
