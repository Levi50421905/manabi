import {
  readingEntriesN5,
  readingRulesN5,
  type ReadingChangeKind,
  type ReadingEntry,
  type ReadingQuizItem,
  type ReadingRule,
} from "@manabi/content";

/**
 * Pembuat soal untuk latihan membaca kanji.
 *
 * Dua mode:
 * - pilih-bacaan : menampilkan kata, pengguna memilih cara bacanya
 * - bedakan      : membaca kanji yang sama dalam konteks berbeda (何 vs 何時)
 *
 * Semua soal dibangkitkan dari data, jadi menambah entri di
 * `packages/content/src/data/reading-changes-n5.ts` otomatis menambah soal.
 */

export const READING_MODE_LABEL = {
  "pilih-bacaan": "Pilih bacaan",
  bedakan: "Bedakan bacaan",
} as const;

export const READING_KIND_LABEL: Record<ReadingChangeKind, string> = {
  standar: "Bacaan biasa",
  rendaku: "Rendaku",
  onyomi: "Gabungan on'yomi",
  "kunyomi-gabung": "Gabungan kun'yomi",
  jukujikun: "Jukujikun",
};

export const READING_KIND_HINT: Record<ReadingChangeKind, string> = {
  standar: "Bacaan apa adanya.",
  rendaku: "Bunyi awal kata kedua menjadi bersuara: ひ→び, は→ば, か→が.",
  onyomi: "Gabungan bacaan Tionghoa, kadang dengan penyusutan bunyi (がく+こう→がっこう).",
  "kunyomi-gabung": "Dua bacaan Jepang asli disambung.",
  jukujikun: "Bacaan khusus yang tidak mengikuti bacaan tiap kanji.",
};

function shuffle<T>(input: T[]): T[] {
  const list = [...input];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = list[i] as T;
    list[i] = list[j] as T;
    list[j] = tmp;
  }
  return list;
}

function take<T>(input: T[], count: number): T[] {
  return shuffle(input).slice(0, Math.max(0, count));
}

/** Bacaan pengganggu: utamakan kata dengan jenis perubahan yang sama. */
function distractorReadings(entry: ReadingEntry, count: number): string[] {
  const sameKind = readingEntriesN5.filter(
    (item) => item.id !== entry.id && item.kind === entry.kind,
  );
  const others = readingEntriesN5.filter((item) => item.id !== entry.id);
  const pool = [...take(sameKind, count), ...take(others, count)].map((item) => item.kana);
  return Array.from(new Set(pool)).filter((kana) => kana !== entry.kana).slice(0, count);
}

/** Soal “kata ini dibaca apa?” untuk setiap entri. */
function buildPilihBacaan(): ReadingQuizItem[] {
  return readingEntriesN5.map((entry) => ({
    id: `bacaan:pilih:${entry.id}`,
    mode: "pilih-bacaan" as const,
    prompt: entry.word,
    promptId: entry.meaning,
    answer: entry.kana,
    options: shuffle([entry.kana, ...distractorReadings(entry, 2)]),
    explanation: `${entry.word} dibaca ${entry.kana} (${entry.romaji}) — ${entry.meaning}. ${entry.note}`,
    wrongNotes: Object.fromEntries(
      distractorReadings(entry, 2).map((kana) => [
        kana,
        "Bacaan ini milik kata lain. Perhatikan jenis perubahan bacaannya.",
      ]),
    ),
    target: entry.word,
  }));
}

/**
 * Soal “bedakan”: membaca kanji yang sama pada konteks berbeda.
 * Dibangun dari aturan (何, 今, 日, 人) beserta contoh dan pengecualiannya.
 */
function buildBedakan(): ReadingQuizItem[] {
  const items: ReadingQuizItem[] = [];

  for (const rule of readingRulesN5) {
    const allReadings = [
      rule.standalone.kana,
      ...rule.examples.map((example) => example.kana),
      ...(rule.exceptions ?? []).map((exception) => exception.kana),
    ];

    const push = (
      word: string,
      kana: string,
      meaning: string,
      context: string,
      note: string,
      idSuffix: string,
    ) => {
      const wrong = Array.from(new Set(allReadings)).filter((item) => item !== kana).slice(0, 2);
      if (wrong.length === 0) return;
      items.push({
        id: `bacaan:bedakan:${rule.id}:${idSuffix}`,
        mode: "bedakan",
        prompt: `「${word}」 dibaca…`,
        promptId: `${meaning} — ${context}`,
        answer: kana,
        options: shuffle([kana, ...wrong]),
        explanation: `${word} = ${kana}. ${note}${rule.strength === "kecenderungan" ? " Pola ini kecenderungan, bukan hukum mutlak." : ""}`,
        wrongNotes: Object.fromEntries(
          wrong.map((item) => [item, `Bacaan ${item} dipakai pada konteks lain dari kanji ${rule.kanji}.`]),
        ),
        target: rule.kanji,
      });
    };

    push(
      rule.standalone.word,
      rule.standalone.kana,
      rule.standalone.meaning,
      rule.standalone.context,
      rule.rule,
      "dasar",
    );

    rule.examples.forEach((example, index) => {
      push(
        example.word,
        example.kana,
        example.meaning,
        example.context,
        `${rule.kanji} di sini berubah karena ${example.context}.`,
        `contoh${index}`,
      );
    });

    (rule.exceptions ?? []).forEach((exception, index) => {
      push(
        exception.word,
        exception.kana,
        exception.note,
        "pengecualian",
        `${exception.note}`,
        `kecuali${index}`,
      );
    });
  }

  return items;
}

export function allReadingQuestions(): ReadingQuizItem[] {
  return [...buildPilihBacaan(), ...buildBedakan()];
}

export function buildReadingQuestions(
  modes: Array<ReadingQuizItem["mode"]>,
  count = 10,
): ReadingQuizItem[] {
  const all = allReadingQuestions();
  const selected = modes.length > 0 ? all.filter((item) => modes.includes(item.mode)) : all;
  if (selected.length === 0) return [];
  return take(selected, Math.min(count, selected.length));
}

export function readingQuestionCounts(): Record<ReadingQuizItem["mode"], number> {
  const all = allReadingQuestions();
  return {
    "pilih-bacaan": all.filter((item) => item.mode === "pilih-bacaan").length,
    bedakan: all.filter((item) => item.mode === "bedakan").length,
  };
}

/** Semua aturan yang membahas satu kanji, untuk bagian konteks di halaman kanji. */
export function rulesForKanji(character: string): ReadingRule[] {
  return readingRulesN5.filter((rule) => rule.kanji === character);
}

/** Entri bacaan yang memuat satu kanji tertentu. */
export function entriesForKanji(character: string): ReadingEntry[] {
  return readingEntriesN5.filter((entry) => entry.kanji.includes(character));
}
