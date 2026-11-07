import {
  particlesByLevel,
  readingEntriesByLevel,
  registerScenariosByLevel,
  type JlptLevel,
} from "@manabi/content";
import { READING_KIND_LABEL } from "@/lib/bacaan-kanji";

/**
 * Deck ulangan berbasis KONTEKS.
 *
 * Inti idenya: yang diulang bukan "kanji = bacaan = arti", melainkan pola yang
 * berubah menurut konteks. Contoh kartu: depan 「何で」 → belakang 「なんで —
 * kenapa」; bukan kartu lepas 「何 = apa」.
 *
 * Id kartu memakai awalan `ctx:` supaya tidak bertabrakan dengan deck materi
 * lain (kanji, kosakata) di penyimpanan yang sama.
 */

export type ContextDeckKind = "bacaan" | "partikel" | "situasi";

export interface ContextDeckCard {
  id: string;
  kind: ContextDeckKind;
  /** Sisi depan: yang harus diingat. */
  front: string;
  /** Petunjuk kecil di atas/di bawah sisi depan. */
  hint: string;
  /** Sisi belakang: jawaban. */
  back: string;
  /** Rincian tambahan setelah jawaban dibuka. */
  note?: string;
}

export const CONTEXT_DECK_LABEL: Record<ContextDeckKind, string> = {
  bacaan: "Bacaan",
  partikel: "Partikel",
  situasi: "Situasi",
};

export const CONTEXT_DECK_HINT: Record<ContextDeckKind, string> = {
  bacaan: "Bagaimana bentuk ini dibaca?",
  partikel: "Partikel apa yang dipakai untuk makna ini?",
  situasi: "Kalimat apa yang pas untuk situasi ini?",
};

/** Susun seluruh kartu konteks untuk satu level. */
export function contextDeck(level: JlptLevel): ContextDeckCard[] {
  const cards: ContextDeckCard[] = [];

  // Bacaan: depan kata, belakang bacaan + arti.
  for (const entry of readingEntriesByLevel(level)) {
    cards.push({
      id: `ctx:bacaan:${entry.id}`,
      kind: "bacaan",
      front: entry.word,
      hint: "Bagaimana bentuk ini dibaca?",
      back: `${entry.kana} (${entry.romaji}) — ${entry.meaning}`,
      note: `${READING_KIND_LABEL[entry.kind]}. ${entry.note}`,
    });
  }

  // Partikel: depan makna, belakang partikel + contoh kalimat.
  for (const particle of particlesByLevel(level)) {
    const example = particle.examples[0];
    if (!example) continue;
    cards.push({
      id: `ctx:partikel:${particle.id}`,
      kind: "partikel",
      front: particle.role,
      hint: "Partikel apa yang menyatakan makna ini?",
      back: `${particle.char} (${particle.romaji})`,
      note: `Contoh: ${example.jp} — ${example.id}`,
    });
  }

  // Situasi: depan situasi + lawan bicara, belakang kalimat yang pas.
  for (const scenario of registerScenariosByLevel(level)) {
    for (const line of scenario.lines) {
      cards.push({
        id: `ctx:situasi:${scenario.id}:${line.audience}`,
        kind: "situasi",
        front: `${scenario.title} — ${audienceLabel(line.audience)}`,
        hint: "Kalimat apa yang pas untuk situasi ini?",
        back: line.jp,
        note: line.id,
      });
    }
  }

  return cards;
}

function audienceLabel(audience: string): string {
  switch (audience) {
    case "akrab":
      return "akrab / keluarga";
    case "teman":
      return "teman";
    case "atasan":
      return "atasan / klien";
    default:
      return "orang baru dikenal";
  }
}

export function contextDeckIds(level: JlptLevel): string[] {
  return contextDeck(level).map((card) => card.id);
}

export function contextCardById(level: JlptLevel, id: string): ContextDeckCard | undefined {
  return contextDeck(level).find((card) => card.id === id);
}
