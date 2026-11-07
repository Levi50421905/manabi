import {
  grammar,
  kana,
  kanji,
  levelHref,
  type GrammarPoint,
  type JlptLevel,
  type Kana,
  type Kanji,
  type PartOfSpeech,
  type Vocab,
  vocab,
} from "@manabi/content";

/**
 * Kartu hari ini — satu item materi yang dipilih secara deterministik dari
 * tanggal lokal (YYYY-MM-DD).
 *
 * Aturan main:
 * 1. **Stabil sepanjang hari.** Semua pilihan diturunkan dari string tanggal,
 *    jadi render server dan hidrasi klien menghasilkan kartu yang sama dan
 *    refresh tidak "mengacak" isi kartu.
 * 2. **Bergilir antar modul.** Hari ke-n memakai modul ke-`n % 4` mengikuti
 *    urutan kanji → kosakata → tata bahasa → kana, sehingga keempat modul
 *    kebagian panggung tanpa perlu menyimpan state di mana pun.
 * 3. **Tidak gampang ditebak.** Item di dalam modul dipilih lewat hash tanggal,
 *    bukan urutan indeks, jadi besok bukan berarti "item berikutnya".
 *
 * Modul ini sengaja bebas dari "use client": dipakai halaman server untuk
 * merender HTML pertama, dan fungsi murni yang sama bisa dipanggil ulang
 * (mis. di skrip uji) tanpa efek samping.
 */

export type DailyCardKind = "kanji" | "kosakata" | "tata-bahasa" | "kana";

export interface DailyCard {
  /** Jenis isi — menentukan format render (glyph besar, bacaan, pola, dst.). */
  kind: DailyCardKind;
  /** Level materi, dipakai untuk badge dan tautan modul. */
  level: JlptLevel;
  /** Label modul asal, mis. "Kanji". */
  moduleLabel: string;
  /** Rute modul asal item, mis. `/n5/kanji`. */
  href: string;
  /** Teks besar di area tampilan: kanji/kana/kata, atau pola tata bahasa. */
  glyph: string;
  /** Arti atau judul singkat dalam bahasa Indonesia. */
  title: string;
  /** Bacaan Jepang (kunyomi/onyomi/kana). Boleh kosong untuk tata bahasa. */
  reading: string;
  /** Transliterasi latin (romaji). Boleh kosong. */
  romaji: string;
  /** Metadata pendek: goresan, kelas kata, jumlah contoh. */
  meta: string;
  /** Catatan, contoh kalimat, atau penjelasan singkat. */
  note: string;
}

/* ------------------------------------------------------------------ *
 * Tanggal & hash
 * ------------------------------------------------------------------ */

/** Kunci tanggal lokal `YYYY-MM-DD`. */
export function dayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Nomor hari sejak epoch (UTC). Diminta dari komponen tanggal, bukan objek
 * `Date`, supaya hasilnya sama di zona waktu mana pun untuk tanggal yang sama.
 */
function dayNumber(key: string): number {
  const [year, month, day] = key.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

/**
 * Hash 32-bit (varian xmur3/murmur) — deterministik dan cukup tersebar untuk
 * memilih indeks item tanpa membuat pola "besok = item berikutnya".
 */
function hashString(input: string): number {
  let hash = 1779033703 ^ input.length;
  for (let index = 0; index < input.length; index += 1) {
    hash = Math.imul(hash ^ input.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
  hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
  return (hash ^ (hash >>> 16)) >>> 0;
}

/* ------------------------------------------------------------------ *
 * Siklus modul
 * ------------------------------------------------------------------ */

/** Urutan giliran modul: kanji → kosakata → tata bahasa → kana. */
const KIND_CYCLE: readonly DailyCardKind[] = ["kanji", "kosakata", "tata-bahasa", "kana"];

const KIND_LABEL: Record<DailyCardKind, string> = {
  kanji: "Kanji",
  kosakata: "Kosakata",
  "tata-bahasa": "Tata bahasa",
  kana: "Kana",
};

const KIND_PATH: Record<DailyCardKind, string> = {
  kanji: "kanji",
  kosakata: "vocab",
  "tata-bahasa": "grammar",
  kana: "kana",
};

/** Jenis modul untuk tanggal tertentu. Hari ke-0 = kanji. */
export function dailyKind(key: string): DailyCardKind {
  const count = KIND_CYCLE.length;
  const index = ((dayNumber(key) % count) + count) % count;
  return KIND_CYCLE[index];
}

/* ------------------------------------------------------------------ *
 * Normalisasi data → bentuk kartu
 * ------------------------------------------------------------------ */

const POS_LABEL: Record<PartOfSpeech, string> = {
  "kata-benda": "Kata benda",
  "kata-kerja": "Kata kerja",
  "kata-sifat-i": "Kata sifat-i",
  "kata-sifat-na": "Kata sifat-na",
  "kata-keterangan": "Keterangan",
  lainnya: "Lainnya",
};

function kanjiCard(item: Kanji): DailyCard {
  const kunyomi = item.kunyomi.join("・");
  const onyomi = item.onyomi.join("・");
  return {
    kind: "kanji",
    level: item.level,
    moduleLabel: KIND_LABEL.kanji,
    href: levelHref(item.level, KIND_PATH.kanji),
    glyph: item.character,
    title: item.meanings.join(" · "),
    reading: kunyomi || onyomi,
    romaji: "",
    meta: `${item.strokes} goresan · radikal ${item.radical}`,
    note: item.mnemonic,
  };
}

function vocabCard(item: Vocab): DailyCard {
  return {
    kind: "kosakata",
    level: item.level,
    moduleLabel: KIND_LABEL.kosakata,
    href: levelHref(item.level, KIND_PATH.kosakata),
    glyph: item.kanji || item.kana,
    title: item.meaning,
    reading: item.kana,
    romaji: item.romaji,
    meta: POS_LABEL[item.pos],
    note: `${item.example.jp} — ${item.example.id}`,
  };
}

function grammarCard(item: GrammarPoint): DailyCard {
  const firstExample = item.examples[0];
  return {
    kind: "tata-bahasa",
    level: item.level,
    moduleLabel: KIND_LABEL["tata-bahasa"],
    href: levelHref(item.level, KIND_PATH["tata-bahasa"]),
    glyph: item.pattern,
    title: item.title,
    reading: "",
    romaji: "",
    meta: `${item.examples.length} contoh`,
    note: firstExample ? `${firstExample.jp} — ${firstExample.id}` : item.explanation,
  };
}

function kanaCard(item: Kana): DailyCard {
  const typeLabel = item.type === "hiragana" ? "Hiragana" : "Katakana";
  // Huruf satu baris, dipakai sebagai konteks: "baris Vokal: あ い う え お".
  const rowChars = kana
    .filter((candidate) => candidate.type === item.type && candidate.row === item.row)
    .map((candidate) => candidate.char)
    .join(" ");

  return {
    kind: "kana",
    level: "N5",
    moduleLabel: KIND_LABEL.kana,
    // Kana tidak dibagi per level JLPT; tabelnya dibuka dari modul N5.
    href: levelHref("N5", KIND_PATH.kana),
    glyph: item.char,
    title: `Bunyi “${item.romaji}”`,
    reading: "",
    romaji: item.romaji,
    meta: `${typeLabel} · baris ${item.row}`,
    note: `Baris ${item.row}: ${rowChars}`,
  };
}

/** Kumpulan kartu per modul. Dibangun sekali saat modul dimuat. */
const POOLS: Record<DailyCardKind, DailyCard[]> = {
  kanji: kanji.map(kanjiCard),
  kosakata: vocab.map(vocabCard),
  "tata-bahasa": grammar.map(grammarCard),
  kana: kana.map(kanaCard),
};

/* ------------------------------------------------------------------ *
 * Pemilihan
 * ------------------------------------------------------------------ */

function gcd(a: number, b: number): number {
  let left = a;
  let right = b;
  while (right !== 0) {
    const rest = left % right;
    left = right;
    right = rest;
  }
  return left;
}

/**
 * Langkah "meloncat" yang koprima dengan panjang pool, supaya beberapa kartu
 * yang diambil untuk satu hari dijamin berbeda dan tersebar.
 */
function strideFor(length: number, seed: number): number {
  if (length <= 1) return 1;
  let stride = 1 + (seed % (length - 1));
  while (gcd(stride, length) !== 1) {
    stride = (stride % (length - 1)) + 1;
  }
  return stride;
}

/**
 * Beberapa kartu untuk satu tanggal: satu kartu utama (indeks 0) plus
 * kandidat lain dari modul yang sama pada hari itu — ini yang dipakai tombol
 * "Acak", bukan pemilihan acak bebas.
 */
export function dailyCards(key: string, count = 4): DailyCard[] {
  const kind = dailyKind(key);
  const pool = POOLS[kind];
  const total = pool.length;
  if (total === 0) return [];

  const seed = hashString(`${key}:${kind}`);
  const start = seed % total;
  const stride = strideFor(total, seed);
  const take = Math.max(1, Math.min(count, total));

  const picked: DailyCard[] = [];
  for (let offset = 0; offset < take; offset += 1) {
    picked.push(pool[(start + offset * stride) % total]);
  }
  return picked;
}

/** Satu kartu untuk tanggal tersebut. */
export function dailyCard(key: string): DailyCard | null {
  return dailyCards(key, 1)[0] ?? null;
}
