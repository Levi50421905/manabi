/** Tipe data bersama untuk seluruh materi Manabi. */

export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type KanaType = "hiragana" | "katakana";

export interface Kana {
  id: string;
  char: string;
  romaji: string;
  type: KanaType;
  /** baris/kelompok, contoh: "a", "ka", "sa" */
  row: string;
}

export type PartOfSpeech =
  | "kata-benda"
  | "kata-kerja"
  | "kata-sifat-i"
  | "kata-sifat-na"
  | "kata-keterangan"
  | "lainnya";

export interface Example {
  jp: string;
  id: string;
}

export interface Vocab {
  id: string;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  pos: PartOfSpeech;
  level: JlptLevel;
  example: Example;
}

export interface Kanji {
  id: string;
  character: string;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  strokes: number;
  radical: string;
  level: JlptLevel;
  mnemonic: string;
  /** contoh kata yang memakai kanji ini */
  words: string[];
}

export interface GrammarPoint {
  id: string;
  title: string;
  pattern: string;
  level: JlptLevel;
  explanation: string;
  examples: Example[];
  notes?: string[];
}

export interface ListeningLine {
  speaker: string;
  jp: string;
  kana?: string;
  id: string;
}

export interface ListeningTrack {
  id: string;
  title: string;
  level: JlptLevel;
  description: string;
  lines: ListeningLine[];
}

/** Potongan teks untuk membaca; `reading` jika ada akan dirender sebagai furigana. */
export interface ReadingSegment {
  text: string;
  reading?: string;
}

export interface ReadingQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface ReadingPassage {
  id: string;
  title: string;
  level: JlptLevel;
  segments: ReadingSegment[];
  translation: string;
  questions: ReadingQuestion[];
}

/* ------------------------------------------------------------------ *
 * Partikel (助詞)
 * ------------------------------------------------------------------ */

/** Pengelompokan materi partikel menurut tingkat kesulitan pemakaian. */
export type ParticleTier = "dasar" | "inti" | "menengah";

export interface ParticleExample {
  /** Kalimat Jepang lengkap. */
  jp: string;
  /** Terjemahan Indonesia. */
  id: string;
  /**
   * Potongan kalimat yang berakhir dengan partikel yang dibahas,
   * mis. "学校で" pada "学校で勉強します。". Dipakai untuk membuat soal isi celah
   * secara otomatis: potongan ini diganti menjadi "学校 ___".
   */
  target: string;
  /** Catatan singkat kenapa partikel ini yang dipakai. */
  note?: string;
}

export interface Particle {
  id: string;
  /** Karakter partikel, mis. "は". */
  char: string;
  /** Cara baca, mis. "wa". */
  romaji: string;
  level: JlptLevel;
  tier: ParticleTier;
  /** Fungsi ringkas, mis. "penanda topik". */
  role: string;
  /** Penjelasan satu paragraf. */
  explanation: string;
  examples: ParticleExample[];
  /** Jebakan singkat yang sering dialami pembelajar. */
  cautions?: string[];
}

export interface ParticleComparisonSide {
  particleId: string;
  char: string;
  summary: string;
  examples: ParticleExample[];
}

export interface ParticleComparison {
  id: string;
  /** Judul, mis. "は vs が". */
  title: string;
  /** Pertanyaan yang dijawab perbandingan ini. */
  question: string;
  left: ParticleComparisonSide;
  right: ParticleComparisonSide;
  /** Satu kalimat penutup sebagai pegangan. */
  takeaway: string;
}

export interface ParticlePitfall {
  id: string;
  title: string;
  /** Partikel yang terlibat, mis. ["が", "を"]. */
  particles: string[];
  summary: string;
  wrong: { jp: string; id: string };
  right: { jp: string; id: string };
  note: string;
}

/** Bentuk soal partikel yang didukung. */
export type ParticleQuizMode =
  | "isi-celah"
  | "ketik"
  | "fungsi"
  | "pasangan"
  | "lengkapi-teks";

export interface ParticleQuestion {
  id: string;
  mode: ParticleQuizMode;
  /** Kalimat soal; gunakan "___" sebagai tempat kosong. */
  prompt: string;
  /** Terjemahan kalimat, untuk pembahasan. */
  promptId?: string;
  /** Jawaban benar. */
  answer: string;
  options: string[];
  explanation: string;
  /** Alasan tiap pilihan salah, dipakai di pembahasan. */
  wrongNotes?: Record<string, string>;
}
