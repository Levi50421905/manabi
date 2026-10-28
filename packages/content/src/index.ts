import type {
  GrammarPoint,
  JlptLevel,
  Kana,
  Kanji,
  ListeningTrack,
  ReadingPassage,
  Vocab,
} from "./types";
import { hiragana, kana, kanaRowLabels, kanaRows, katakana } from "./data/kana";
import { vocabN5 } from "./data/vocab-n5";
import { vocabN5Batch1 } from "./data/vocab-n5-batch-1";
import { vocabN5Batch2 } from "./data/vocab-n5-batch-2";
import { vocabN5Batch3 } from "./data/vocab-n5-batch-3";
import { vocabN5Batch4 } from "./data/vocab-n5-batch-4";
import { vocabN5Batch5 } from "./data/vocab-n5-batch-5";
import { vocabN5Batch6 } from "./data/vocab-n5-batch-6";
import { kanjiN5 } from "./data/kanji-n5";
import { kanjiN5Extra } from "./data/kanji-n5-extra";
import { grammarN5 } from "./data/grammar-n5";
import { grammarN5Extra } from "./data/grammar-n5-extra";
import { listeningN5 } from "./data/listening-n5";
import { listeningN5Extra } from "./data/listening-n5-extra";
import { readingN5 } from "./data/reading-n5";
import { readingN5Extra } from "./data/reading-n5-extra";

export * from "./types";
export { hiragana, katakana, kana, kanaRows, kanaRowLabels } from "./data/kana";
export { vocabN5 } from "./data/vocab-n5";
export { vocabN5Batch1 } from "./data/vocab-n5-batch-1";
export { vocabN5Batch2 } from "./data/vocab-n5-batch-2";
export { vocabN5Batch3 } from "./data/vocab-n5-batch-3";
export { vocabN5Batch4 } from "./data/vocab-n5-batch-4";
export { vocabN5Batch5 } from "./data/vocab-n5-batch-5";
export { vocabN5Batch6 } from "./data/vocab-n5-batch-6";
export { kanjiN5 } from "./data/kanji-n5";
export { kanjiN5Extra } from "./data/kanji-n5-extra";
export { grammarN5 } from "./data/grammar-n5";
export { grammarN5Extra } from "./data/grammar-n5-extra";
export { listeningN5 } from "./data/listening-n5";
export { listeningN5Extra } from "./data/listening-n5-extra";
export { listeningQuestions } from "./data/listening-questions";
export type { ListeningQuestion } from "./data/listening-questions";
export { readingN5 } from "./data/reading-n5";
export { readingN5Extra } from "./data/reading-n5-extra";

/**
 * Kumpulan materi. Saat menambah level baru (N4, N3, …), cukup import
 * datanya di sini dan spread ke array — semua halaman otomatis ikut.
 */

/** Buang entri kembar berdasarkan kunci tertentu (pengaman saat data digabung). */
function dedupeBy<T>(items: T[], keyOf: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = keyOf(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

const collectedVocab: Vocab[] = [
  ...vocabN5,
  ...vocabN5Batch1,
  ...vocabN5Batch2,
  ...vocabN5Batch3,
  ...vocabN5Batch4,
  ...vocabN5Batch5,
  ...vocabN5Batch6,
];

/**
 * Kosakata: buang id ganda DAN kata ganda (kanji + kana sama). Batch ditulis
 * terpisah, jadi bisa ada kata yang sama muncul dua kali dengan id berbeda.
 */
const seenVocabIds = new Set<string>();
const seenVocabWords = new Set<string>();
export const vocab: Vocab[] = collectedVocab.filter((item) => {
  const word = `${item.kanji}|${item.kana}`;
  if (seenVocabIds.has(item.id) || seenVocabWords.has(word)) return false;
  seenVocabIds.add(item.id);
  seenVocabWords.add(word);
  return true;
});

export const kanji: Kanji[] = dedupeBy(
  [...kanjiN5, ...kanjiN5Extra],
  (item) => item.character,
);
export const grammar: GrammarPoint[] = dedupeBy(
  [...grammarN5, ...grammarN5Extra],
  (item) => item.id,
);
export const listening: ListeningTrack[] = dedupeBy(
  [...listeningN5, ...listeningN5Extra],
  (item) => item.id,
);
export const reading: ReadingPassage[] = dedupeBy(
  [...readingN5, ...readingN5Extra],
  (item) => item.id,
);

export const levels: JlptLevel[] = ["N5", "N4", "N3", "N2", "N1"];

export function vocabByLevel(level: JlptLevel): Vocab[] {
  return vocab.filter((item) => item.level === level);
}

export function kanjiByLevel(level: JlptLevel): Kanji[] {
  return kanji.filter((item) => item.level === level);
}

export function grammarByLevel(level: JlptLevel): GrammarPoint[] {
  return grammar.filter((item) => item.level === level);
}

export function listeningByLevel(level: JlptLevel): ListeningTrack[] {
  return listening.filter((item) => item.level === level);
}

export function readingByLevel(level: JlptLevel): ReadingPassage[] {
  return reading.filter((item) => item.level === level);
}

export interface SearchHit {
  kind: "kosakata" | "kanji" | "tata-bahasa" | "bacaan";
  id: string;
  title: string;
  subtitle: string;
  level: JlptLevel;
}

/** Pencarian sederhana lintas materi untuk halaman kamus. */
export function searchContent(query: string): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const hits: SearchHit[] = [];

  for (const item of vocab) {
    const haystack = `${item.kanji} ${item.kana} ${item.romaji} ${item.meaning}`.toLowerCase();
    if (haystack.includes(q)) {
      hits.push({
        kind: "kosakata",
        id: item.id,
        title: item.kanji || item.kana,
        subtitle: `${item.kana} · ${item.meaning}`,
        level: item.level,
      });
    }
  }

  for (const item of kanji) {
    const haystack = `${item.character} ${item.meanings.join(" ")} ${[
      ...item.onyomi,
      ...item.kunyomi,
    ].join(" ")}`.toLowerCase();
    if (haystack.includes(q)) {
      hits.push({
        kind: "kanji",
        id: item.id,
        title: item.character,
        subtitle: item.meanings.join(", "),
        level: item.level,
      });
    }
  }

  for (const item of grammar) {
    const haystack = `${item.title} ${item.pattern} ${item.explanation}`.toLowerCase();
    if (haystack.includes(q)) {
      hits.push({
        kind: "tata-bahasa",
        id: item.id,
        title: item.title,
        subtitle: item.pattern,
        level: item.level,
      });
    }
  }

  for (const item of reading) {
    const haystack = `${item.title} ${item.translation}`.toLowerCase();
    if (haystack.includes(q)) {
      hits.push({
        kind: "bacaan",
        id: item.id,
        title: item.title,
        subtitle: "Bacaan pendek",
        level: item.level,
      });
    }
  }

  return hits.slice(0, 40);
}

export { SOURCE_CREDITS } from "./credits";
export type { Kana };
