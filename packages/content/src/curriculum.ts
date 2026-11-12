import type { JlptLevel } from "./types";

/**
 * Satu sumber konfigurasi untuk kurikulum Manabi.
 *
 * File ini memuat **level** dan **menu** sekaligus. Menambah level baru cukup
 * menambah entri di `LEVEL_META` + data materi; menambah menu/modul cukup
 * menambah `NAV_SECTIONS`. Shell, dasbor, pemilih level, dan halaman modul
 * membaca dari sini — tidak ada komponen yang perlu disunting.
 */

/* ------------------------------------------------------------------ *
 * Level JLPT
 * ------------------------------------------------------------------ */

export interface LevelMeta {
  id: JlptLevel;
  /** urutan tampil, kecil → besar */
  order: number;
  /** "N5" */
  label: string;
  /** nama singkat bahasa Indonesia */
  name: string;
  /** sebutan Jepang */
  japanese: string;
  /** ringkasan kurikulum */
  description: string;
  /** perkiraan total jam belajar */
  hours: string;
  /** level berikutnya, untuk CTA "naik level" */
  next?: JlptLevel;
}

export const LEVEL_META: Record<JlptLevel, LevelMeta> = {
  N5: {
    id: "N5",
    order: 1,
    label: "N5",
    name: "Dasar",
    japanese: "初級",
    description:
      "Hiragana & katakana, 111 kanji dasar, 708 kosakata, dan pola kalimat sehari-hari.",
    hours: "±150 jam",
    next: "N4",
  },
  N4: {
    id: "N4",
    order: 2,
    label: "N4",
    name: "Dasar Lanjut",
    japanese: "初中級",
    description:
      "Percakapan sehari-hari, kanji bertambah, dan tata bahasa penghubung kalimat.",
    hours: "±300 jam",
    next: "N3",
  },
  N3: {
    id: "N3",
    order: 3,
    label: "N3",
    name: "Menengah",
    japanese: "中級",
    description: "Bacaan bertema, bahasa formal dasar, dan kosakata dunia kerja.",
    hours: "±450 jam",
    next: "N2",
  },
  N2: {
    id: "N2",
    order: 4,
    label: "N2",
    name: "Menengah Atas",
    japanese: "中上級",
    description: "Berita, dokumen kerja, dan kepekaan terhadap nuansa bahasa.",
    hours: "±600 jam",
    next: "N1",
  },
  N1: {
    id: "N1",
    order: 5,
    label: "N1",
    name: "Mahir",
    japanese: "上級",
    description: "Teks akademis, idiom, dan bahasa formal tingkat lanjut.",
    hours: "±900 jam",
  },
};

/** Semua level, urut dari yang paling dasar. */
export const LEVEL_ORDER: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];

/** Metadata level yang siap dipetakan di UI. */
export const LEVELS: LevelMeta[] = LEVEL_ORDER.map((level) => LEVEL_META[level]);

export function levelMeta(level: JlptLevel): LevelMeta {
  return LEVEL_META[level];
}

/** Type guard untuk segmen URL `/[level]`. */
export function isJlptLevel(value: string | undefined | null): value is JlptLevel {
  return Boolean(value) && LEVEL_ORDER.includes(value as JlptLevel);
}

/** Kelas CSS yang memasang variabel warna level aktif (`level-n5` dst). */
export function levelClassName(level: JlptLevel): string {
  return `level-${level.toLowerCase()}`;
}

/** Level berikutnya yang punya materi, atau undefined di level terakhir. */
export function nextAvailableLevel(
  level: JlptLevel,
  available: readonly JlptLevel[],
): JlptLevel | undefined {
  const index = LEVEL_ORDER.indexOf(level);
  if (index < 0) return undefined;
  return LEVEL_ORDER.slice(index + 1).find((candidate) => available.includes(candidate));
}

/** Rute modul untuk sebuah level: `levelHref("N4", "vocab")` → `/n4/vocab`. */
export function levelHref(level: JlptLevel, path = ""): string {
  const base = `/${level.toLowerCase()}`;
  return path ? `${base}/${path.replace(/^\//, "")}` : base;
}

/* ------------------------------------------------------------------ *
 * Menu & modul
 * ------------------------------------------------------------------ */

export type NavSectionId = "utama" | "materi" | "latihan" | "referensi";

export interface NavSubItem {
  label: string;
  /** Path relatif terhadap level, mis. "write". */
  path: string;
  description?: string;
}

export interface NavItem {
  id: string;
  label: string;
  /** Glyph Jepang untuk ikon. */
  glyph: string;
  /** Path relatif terhadap level, atau path global bila `global` true. */
  path: string;
  /** Deskripsi singkat untuk dasbor/level hub. */
  description: string;
  /** Path absolut, tidak ikut level (dasbor, kamus, pengaturan, tentang). */
  global?: boolean;
  /** Sub-halaman yang digabung di bawah menu ini (tab di halaman). */
  sub?: NavSubItem[];
  /** Segmen path yang membuat menu ini aktif (untuk grup gabungan). */
  match?: string[];
  /** Penanda kecil di menu, mis. "Beta". */
  badge?: string;
}

export interface NavSection {
  id: NavSectionId;
  label: string;
  japanese: string;
  items: NavItem[];
  /** Render sebagai baris tautan ringkas (referensi), bukan daftar penuh. */
  compact?: boolean;
}

/**
 * Struktur menu Arah 3.
 *
 * Catatan desain:
 * - Kana + Menulis digabung; Kanji + Bacaan Kanji digabung. Sub-halaman tampil
 *   sebagai tab di halaman, bukan baris terpisah di sidebar — ini yang membuat
 *   sidebar muat tanpa scroll panjang.
 * - Bank Soal tidak ada di menu: ia lapisan data untuk Latihan Soal & Ujian.
 * - Referensi tampil ringkas di kaki sidebar.
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    id: "utama",
    label: "",
    japanese: "",
    items: [
      {
        id: "dasbor",
        label: "Dasbor",
        glyph: "学",
        path: "/dashboard",
        global: true,
        description: "Ringkasan hari ini: ulasan, progres, dan aktivitas.",
      },
    ],
  },
  {
    id: "materi",
    label: "Materi",
    japanese: "学び",
    items: [
      {
        id: "kana",
        label: "Kana & Menulis",
        glyph: "あ",
        path: "kana",
        match: ["kana", "write"],
        description: "Hiragana, katakana, dan latihan menggores aksara.",
        sub: [
          { label: "Tabel Kana", path: "kana", description: "Hiragana & katakana lengkap." },
          { label: "Latihan Menulis", path: "write", description: "Kanvas dengan garis bantu." },
        ],
      },
      {
        id: "kosakata",
        label: "Kosakata",
        glyph: "語",
        path: "vocab",
        description: "708 kata dengan flashcard dan ulangan berjadwal.",
      },
      {
        id: "kanji",
        label: "Kanji & Bacaan",
        glyph: "漢",
        path: "kanji",
        match: ["kanji", "bacaan-kanji"],
        description: "111 kanji N5, radikal, goresan, dan perubahan bacaan.",
        sub: [
          { label: "Kanji", path: "kanji", description: "Bentuk, arti, dan bacaan." },
          {
            label: "Perubahan Bacaan",
            path: "bacaan-kanji",
            description: "Rendaku, jukujikun, dan aturan bacaan.",
          },
        ],
      },
      {
        id: "tata-bahasa",
        label: "Tata Bahasa",
        glyph: "文",
        path: "grammar",
        description: "48 pola kalimat dengan contoh yang bisa diputar.",
      },
      {
        id: "partikel",
        label: "Partikel",
        glyph: "助",
        path: "partikel",
        description: "18 partikel N5 dan pasangan yang sering tertukar.",
      },
      {
        id: "mendengar",
        label: "Mendengar",
        glyph: "聴",
        path: "listening",
        description: "12 dialog dengan tiga kecepatan.",
      },
      {
        id: "membaca",
        label: "Membaca",
        glyph: "読",
        path: "reading",
        description: "10 bacaan berfurigana dengan pertanyaan pemahaman.",
      },
      {
        id: "konteks",
        label: "Konteks & Etiket",
        glyph: "敬",
        path: "konteks",
        description: "Tingkat bicara, keigo, dan kebiasaan Jepang.",
      },
    ],
  },
  {
    id: "latihan",
    label: "Latihan",
    japanese: "練習",
    items: [
      {
        id: "ulasan",
        label: "Ulasan",
        glyph: "復",
        path: "ulasan",
        description: "Antrean kartu SRS yang jatuh tempo hari ini.",
      },
      {
        id: "latihan-soal",
        label: "Latihan Soal",
        glyph: "問",
        path: "quiz",
        description: "Soal acak dari Bank Soal, dengan pembahasan.",
      },
      {
        id: "ujian",
        label: "Simulasi Ujian",
        glyph: "試",
        path: "ujian",
        description: "Simulasi JLPT N5 dan JFT-Basic berdurasi.",
      },
    ],
  },
  {
    id: "referensi",
    label: "Referensi",
    japanese: "資料",
    compact: true,
    items: [
      {
        id: "kamus",
        label: "Kamus",
        glyph: "辞",
        path: "/dictionary",
        global: true,
        description: "Pencarian lintas materi.",
      },
      {
        id: "pengaturan",
        label: "Pengaturan",
        glyph: "設",
        path: "/settings",
        global: true,
        description: "Tema, target harian, suara, dan furigana.",
      },
      {
        id: "tentang",
        label: "Tentang",
        glyph: "情",
        path: "/about",
        global: true,
        description: "Metodologi, kredit data, dan lisensi.",
      },
    ],
  },
];

/** Semua item menu, rata (dipakai untuk mencari modul berdasarkan id/path). */
export const NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((section) => section.items);

export const MATERI_ITEMS: NavItem[] = NAV_SECTIONS.find(
  (section) => section.id === "materi",
)?.items ?? [];

export function navItemHref(level: JlptLevel, item: NavItem): string {
  return item.global ? item.path : levelHref(level, item.path);
}

export function navSubHref(level: JlptLevel, sub: NavSubItem): string {
  return levelHref(level, sub.path);
}

/** Apakah item menu aktif untuk pathname saat ini. */
export function navItemActive(pathname: string, level: JlptLevel, item: NavItem): boolean {
  if (item.global) {
    return pathname === item.path || pathname.startsWith(`${item.path}/`);
  }
  const keys = item.match ?? [item.path];
  return keys.some((key) => {
    const href = levelHref(level, key);
    return pathname === href || pathname.startsWith(`${href}/`);
  });
}

/** Cari item menu berdasarkan path relatif (mis. "partikel"). */
export function navItemByPath(path: string): NavItem | undefined {
  return NAV_ITEMS.find((item) => item.path === path || item.match?.includes(path));
}
