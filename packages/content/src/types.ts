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
