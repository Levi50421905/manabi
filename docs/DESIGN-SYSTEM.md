# Manabi Design System — 「和モダン」 Editorial Warm

Dokumen ini adalah **kontrak** untuk semua orang (manusia maupun agen) yang menulis UI di
repo ini. Setiap halaman wajib mengikuti aturan di sini. Kalau butuh sesuatu yang belum ada,
tambahkan ke `packages/ui` — **jangan** membuat varian lokal di dalam halaman.

---

## 1. Konsep

Manabi bukan aplikasi game, tapi **buku teks Jepang modern yang hidup**. Materi terbesarnya
adalah teks Jepang (708 kosakata, 111 kanji, bacaan), jadi tipografi dan ruang kosong adalah
produk utamanya.

Tiga prinsip:

1. **Konten Jepang adalah bintang.** Teks Jepang selalu lebih besar, lebih gelap, dan lebih
   "bernyawa" daripada terjemahan Indonesianya.
2. **Tenang, bukan ramai.** Satu aksen warna per layar. Garis rambut (hairline) lebih sering
   dipakai daripada bayangan. Tidak ada animasi dekoratif yang menutupi teks.
3. **Siap bertingkat.** Setiap permukaan tahu level JLPT-nya. Menambah N4 = menambah data +
   satu entri metadata, **bukan** menyunting layout.

---

## 2. Tipografi

| Peran | Token kelas | Font | Pemakaian |
|---|---|---|---|
| Display | `font-display` | Newsreader (serif) | `h1`, `h2`, angka besar, judul kartu |
| UI | `font-sans` | Inter | label, tombol, paragraf Indonesia |
| Jepang UI | `font-jp` | Noto Sans JP | teks Jepang ukuran kecil–sedang |
| Jepang display | `font-jp-serif` | Noto Serif JP | kanji besar, kata di flashcard, judul bacaan |
| Mikro-label | `label-micro` | sistem mono | eyebrow, kolom tabel, metadata |

### Skala teks

Pakai kelas ini; jangan mengarang ukuran baru.

```
text-display  40/44px  serif   → h1 halaman marketing
text-h1       30/36px  serif   → h1 halaman aplikasi
text-h2       21/28px  serif   → judul seksi besar
text-h3       16/24px  sans 600 → judul kartu
text-body     14/22px  sans    → paragraf
text-sm       13/20px  sans    → teks sekunder
text-xs       12/17px  sans    → metadata
label-micro   11/16px  mono 500, uppercase, tracking 0.12em
```

**Batas keras:** tidak ada teks di bawah **12px**. Teks mikro lama (`text-[10px]`,
`text-[11px]`) wajib dinaikkan.

Teks Jepang panjang (`font-jp`) minimal `15px`. Kanji di flashcard minimal `40px`.

---

## 3. Warna

Semua warna lewat token semantik (CSS variable → Tailwind). **Tidak boleh** ada hex langsung
di dalam komponen halaman.

### Netral (hangat, bukan abu-biru)

| Token | Terang | Gelap | Pakai untuk |
|---|---|---|---|
| `bg-paper` | `#FAF8F4` | `#121110` | latar halaman |
| `bg-surface` | `#FFFFFF` | `#1A1918` | kartu, panel |
| `bg-surface-muted` | `#F5F2EB` | `#232120` | header tabel, chip pasif |
| `border-border` | `#E5E0D5` | `#302D2A` | garis rambut |
| `text-fg` | `#1A1815` | `#F2EFE9` | teks utama |
| `text-fg-muted` | `#6E685C` | `#A8A296` | teks sekunder |
| `text-fg-subtle` | `#948F82` | `#7A7466` | metadata paling lemah |

### Aksen per level (kunci ekstensibilitas)

Setiap level JLPT punya satu warna. Shell men-set variabel `--level*` pada wrapper sesuai
level aktif, sehingga satu komponen yang sama otomatis berwarna benar di N5 maupun N4.

| Level | Terang | Gelap | Kesan |
|---|---|---|---|
| N5 | `#B04A6B` rose | `#E88BA9` | pemula, hangat |
| N4 | `#2F6E5E` pine | `#6FC2A8` | berkembang |
| N3 | `#3F4E8C` indigo | `#93A3E8` | menengah |
| N2 | `#8A5A16` ochre | `#E0B36A` | mahir |
| N1 | `#6B3A78` plum | `#C79BD6` | ahli |

Token: `text-level`, `bg-level`, `bg-level-soft`, `border-level`, `text-level-contrast`.

Aksen brand (`accent`) = rose N5. Dipakai **hanya** untuk CTA utama, link, dan status aktif.
Maksimal **satu** tombol `variant="primary"` per layar.

### Semantik

`success` (matcha), `warning` (amber), `danger` (red) — hanya untuk status, tidak untuk dekorasi.

---

## 4. Bentuk & ruang

- **Radius:** `rounded-md` 8px (chip kecil), `rounded-lg` 12px (tombol, input), `rounded-xl` 16px
  (kartu), `rounded-2xl` 20px (panel besar, modal). Tidak ada `rounded-full` kecuali avatar/pill.
- **Garis rambut:** `border border-border`. Bayangan hanya untuk elemen mengambang
  (`shadow-soft`, `shadow-lifted`, `shadow-overlay`). Kartu biasa **tidak** pakai bayangan.
- **Spasi:** skala 4px. Jarak antar-seksi `space-y-8` (mobile) / `space-y-10` (desktop).
  Padding kartu `p-4` (mobile) / `p-5`–`p-6` (desktop).
- **Lebar baca:** paragraf maksimum `max-w-[68ch]`. Kontainer halaman `max-w-[1120px]`.
- **Tekstur:** `bg-paper` memakai noise halus (`bg-grain`) — sudah dipasang di `body`, jangan
  ditambah lagi per kartu.

---

## 5. Shell & navigasi

### Desktop ≥1024px

```
┌────────────┬──────────────────────────────────────────┐
│ Rail 264px │ Konten max-w 1120px, padding 32–40px     │
│ · brand    │                                          │
│ · level    │                                          │
│ · nav      │                                          │
│ · progres  │                                          │
└────────────┴──────────────────────────────────────────┘
```

Rail berisi: brand + level switcher, nav **terkelompok** (BELAJAR / LATIHAN / REFERENSI),
lalu kartu progres di dasar rail. Nav item aktif = `bg-level-soft text-level` dengan indikator
garis kiri 2px.

### Mobile <1024px

- **Top bar** lengket (48–56px): logo kecil · level switcher chip · streak/XP ringkas.
- **Bottom nav** 5 tab: Dasbor · Belajar · Ulang · Latihan · Lainnya.
  - Tab "Belajar" membuka sheet berisi modul belajar (kana, tulis, kosakata, kanji, tata
    bahasa, listening, membaca) dalam grid 2 kolom.
  - Tab "Lainnya" membuka sheet berisi ujian, kamus, pengaturan, tentang.
- Semua sheet/dialog: `role="dialog"`, tutup dengan Esc dan klik latar, `aria-modal`.
- Target sentuh minimal **44×44px**. Bottom nav punya `pb-[env(safe-area-inset-bottom)]`.

### Level switcher

Selalu terlihat. Desktop: di dalam rail, bentuk baris 5 tombol level. Mobile: chip di top bar →
sheet. Level tanpa materi dirender nonaktif dengan label "Segera".

---

## 6. Anatomi halaman

Setiap halaman modul memakai urutan yang sama — ini yang membuat aplikasi terasa satu produk:

```
<PageShell>
  <PageHeader eyebrow="N5 · Kosakata" title="Kosakata" description="…" actions={<…/>} />
  <Toolbar>filter, pencarian, mode</Toolbar>   ← opsional, sticky di mobile
  <Section>…</Section>
</PageShell>
```

`PageHeader` memakai `font-display` untuk judul dan selalu punya `eyebrow`
berisi level + nama modul.

### Keadaan wajib

Setiap halaman yang memuat daftar wajib menangani: **memuat**, **kosong**, **tidak ada hasil**.
Gunakan `EmptyState` (ikon/glyph kanji, judul, deskripsi, satu aksi). Jangan biarkan layar
kosong tanpa penjelasan.

---

## 7. Aturan mobile-first

1. Tulis kelas untuk mobile dulu, lalu `sm:` / `md:` / `lg:`.
2. **Dilarang** `overflow-x-auto` untuk struktur utama; hanya untuk chip filter.
3. Tabel → ubah jadi daftar kartu di bawah `md`.
4. Aksi utama harus bisa dijangkau ibu jari: tombol utama di kanan bawah atau lebar penuh.
5. Tidak ada teks terpotong (`truncate`) untuk informasi penting; boleh untuk judul sekunder.
6. Uji di 390×844 dan 360×800.

---

## 8. Gerak

- Durasi `150ms` (hover/press), `200ms` (masuk), easing `cubic-bezier(0.22, 1, 0.36, 1)`.
- Hanya `opacity`/`transform`. Tidak ada animasi tak berujung kecuali indikator loading.
- Semua wajib menghormati `prefers-reduced-motion` (sudah global di `globals.css`).
- **Dihapus:** hujan kelopak sakura, pohon sakura beranimasi. Penggantinya ornamen statis
  (teks vertikal Jepang, garis tipis).

---

## 9. Aksesibilitas

- Kontras teks minimal **4.5:1**; `text-fg-subtle` hanya untuk teks non-esensial.
- Semua elemen interaktif punya `:focus-visible` ring (`ring-2 ring-accent ring-offset-2`).
- `aria-current="page"` pada nav aktif; `aria-live="polite"` untuk hasil kuis.
- Glyph kanji sebagai ikon selalu berpasangan dengan label teks atau `aria-label`.
- Bahasa: `lang="ja"` untuk teks Jepang, `lang="id"` (root) untuk sisanya.

---

## 10. Komponen yang tersedia (`@manabi/ui`)

| Komponen | Gunanya |
|---|---|
| `Button` | 5 varian × 3 ukuran, dukungan ikon |
| `IconButton` | tombol persegi untuk ikon saja (wajib `aria-label`) |
| `Card`, `CardHeader`, `CardTitle`, `CardBody`, `CardFooter` | permukaan dasar |
| `Badge` | pil status, termasuk `tone="level"` yang ikut level aktif |
| `Pill` | chip filter yang bisa ditekan |
| `ProgressBar` | progres linear |
| `ProgressRing` | progres melingkar untuk statistik |
| `SegmentedControl` | pilihan mode 2–4 opsi |
| `PageHeader` | judul halaman standar |
| `Section` | judul seksi + deskripsi + aksi kanan |
| `StatTile` | angka besar + label + catatan |
| `Toolbar` | baris filter/aksi, sticky opsional |
| `EmptyState` | keadaan kosong |
| `Callout` | catatan/informasi (`tone`: info, warning, success) |
| `ListRow` | baris daftar standar (glyph, judul, subjudul, aksi) |
| `Skeleton` | placeholder memuat |
| `Pagination` | navigasi halaman daftar |
| `LevelBadge` | badge level (membaca metadata level) |

Kalau ragu, lihat halaman `/[level]` (hub) sebagai referensi pemakaian.
