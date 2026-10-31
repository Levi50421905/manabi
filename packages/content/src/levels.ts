import type { JlptLevel } from "./types";

/**
 * Metadata kurikulum per level JLPT.
 *
 * Ini satu-satunya tempat yang perlu disentuh saat menambah level baru
 * (selain data materi). Shell, level switcher, badge, dan judul halaman
 * membacanya dari sini — jadi tidak ada layout yang perlu disunting.
 */
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
