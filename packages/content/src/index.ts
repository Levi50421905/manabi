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
import { kanjiN5 } from "./data/kanji-n5";
import { grammarN5 } from "./data/grammar-n5";
import { listeningN5 } from "./data/listening-n5";
import { readingN5 } from "./data/reading-n5";

export * from "./types";
export { hiragana, katakana, kana, kanaRows, kanaRowLabels } from "./data/kana";
export { vocabN5 } from "./data/vocab-n5";
export { kanjiN5 } from "./data/kanji-n5";
export { grammarN5 } from "./data/grammar-n5";
export { listeningN5 } from "./data/listening-n5";
export { readingN5 } from "./data/reading-n5";

/**
 * Kumpulan materi. Saat menambah level baru (N4, N3, …), cukup import
 * datanya di sini dan spread ke array — semua halaman otomatis ikut.
 */
export const vocab: Vocab[] = [...vocabN5];
export const kanji: Kanji[] = [...kanjiN5];
export const grammar: GrammarPoint[] = [...grammarN5];
export const listening: ListeningTrack[] = [...listeningN5];
export const reading: ReadingPassage[] = [...readingN5];

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
