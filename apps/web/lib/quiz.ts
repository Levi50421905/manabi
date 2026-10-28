import { grammar, kana, kanji, vocab } from "@manabi/content";
import type { GrammarPoint, Kana, Kanji, Vocab } from "@manabi/content";

export type QuestionKind = "kana" | "kosakata" | "kanji" | "tata-bahasa" | "dengar" | "bacaan";

export interface Question {
  id: string;
  kind: QuestionKind;
  prompt: string;
  subPrompt?: string;
  options: string[];
  answer: number;
  explanation: string;
  /** Teks yang bisa diputar (khusus soal mendengar/ujian). */
  audioText?: string;
}

export const QUESTION_KIND_LABEL: Record<QuestionKind, string> = {
  kana: "Kana",
  kosakata: "Kosakata",
  kanji: "Kanji",
  "tata-bahasa": "Tata bahasa",
  dengar: "Mendengar",
  bacaan: "Membaca",
};

export function shuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i] as T;
    arr[i] = arr[j] as T;
    arr[j] = tmp;
  }
  return arr;
}

function take<T>(arr: T[], count: number): T[] {
  return shuffle(arr).slice(0, Math.max(0, count));
}

function buildOptions(
  correct: string,
  pool: string[],
  count = 4,
): { options: string[]; answer: number } {
  const unique = Array.from(new Set(pool)).filter((item) => item !== correct);
  const distractors = take(unique, count - 1);
  const options = shuffle([correct, ...distractors]);
  return { options, answer: options.indexOf(correct) };
}

export function buildKanaQuestions(pool: Kana[], count = 10): Question[] {
  const picks = take(pool, count);
  const romajiPool = pool.map((item) => item.romaji);
  const charPool = pool.map((item) => item.char);

  return picks.map((item, index) => {
    const askRomaji = index % 3 !== 0;

    if (askRomaji) {
      const { options, answer } = buildOptions(item.romaji, romajiPool);
      return {
        id: `kana:${item.id}:${index}`,
        kind: "kana",
        prompt: item.char,
        subPrompt: "Apa bacaan huruf ini?",
        options,
        answer,
        explanation: `${item.char} dibaca "${item.romaji}".`,
      };
    }

    const { options, answer } = buildOptions(item.char, charPool);
    return {
      id: `kana:${item.id}:${index}`,
      kind: "kana",
      prompt: item.romaji,
      subPrompt: "Huruf mana untuk bunyi ini?",
      options,
      answer,
      explanation: `"${item.romaji}" ditulis ${item.char}.`,
    };
  });
}

export function buildVocabQuestions(
  pool: Vocab[],
  count = 10,
  options: { withKana?: boolean } = {},
): Question[] {
  const withKana = options.withKana ?? true;
  const picks = take(pool, count);
  const meaningPool = pool.map((item) => item.meaning);

  return picks.map((item, index) => {
    const { options: built, answer } = buildOptions(item.meaning, meaningPool);
    return {
      id: `vocab:${item.id}:${index}`,
      kind: "kosakata",
      prompt: item.kanji || item.kana,
      // Di ujian bacaan kana disembunyikan — itu contekan untuk level yang sama.
      subPrompt: withKana ? item.kana : `Kosakata ${item.level}`,
      options: built,
      answer,
      explanation: `${item.kanji || item.kana} (${item.kana}) berarti "${item.meaning}". Contoh: ${item.example.jp}`,
    };
  });
}

export function buildKanjiQuestions(pool: Kanji[], count = 8): Question[] {
  const picks = take(pool, count);
  const meaningPool = pool.map((item) => item.meanings[0] ?? "");

  return picks.map((item, index) => {
    const meaning = item.meanings[0] ?? "";
    const { options, answer } = buildOptions(meaning, meaningPool);
    return {
      id: `kanji:${item.id}:${index}`,
      kind: "kanji",
      prompt: item.character,
      subPrompt: `${item.strokes} goresan · radikal ${item.radical}`,
      options,
      answer,
      explanation: `${item.character} berarti ${item.meanings.join(", ")}. On'yomi: ${item.onyomi.join("、") || "—"}; Kun'yomi: ${item.kunyomi.join("、") || "—"}.`,
    };
  });
}

export function buildGrammarQuestions(pool: GrammarPoint[], count = 6): Question[] {
  const picks = take(pool, count);
  const patternPool = pool.map((item) => item.pattern);

  return picks.map((item, index) => {
    const example = item.examples[0];
    const { options, answer } = buildOptions(item.pattern, patternPool);
    return {
      id: `grammar:${item.id}:${index}`,
      kind: "tata-bahasa",
      prompt: example?.jp ?? item.pattern,
      subPrompt: "Pola tata bahasa mana yang dipakai kalimat ini?",
      options,
      answer,
      explanation: `${item.title} — ${item.explanation}`,
    };
  });
}

/** Quiz campuran: kana + kosakata + kanji + tata bahasa (total tepat = `count`). */
export function buildMixedQuestions(count = 12): Question[] {
  const kanaCount = Math.min(2, count);
  const rest = count - kanaCount;
  const vocabCount = Math.max(1, Math.round(rest * 0.4));
  const kanjiCount = Math.max(1, Math.round(rest * 0.3));
  const grammarCount = Math.max(1, count - kanaCount - vocabCount - kanjiCount);

  return shuffle([
    ...buildKanaQuestions(kana, kanaCount),
    ...buildVocabQuestions(vocab, vocabCount),
    ...buildKanjiQuestions(kanji, kanjiCount),
    ...buildGrammarQuestions(grammar, grammarCount),
  ]);
}

export type AnswerType = "meaning" | "romaji" | "kana";
export type QuizSource = "kanji-recognize" | "kanji-recall" | "vocab";

/** Ambil jawaban sesuai tipe yang dipilih peserta. */
function answerOfKanji(item: Kanji, answerType: AnswerType): string {
  if (answerType === "kana") return item.kunyomi[0] ?? item.onyomi[0] ?? "";
  return item.meanings.join(", ");
}

function answerOfVocab(item: Vocab, answerType: AnswerType): string {
  if (answerType === "romaji") return item.romaji;
  if (answerType === "kana") return item.kana;
  return item.meaning;
}

/**
 * Builder untuk latihan yang bisa dikonfigurasi:
 * - kanji-recognize : kanji → jawaban (arti / bacaan kana)
 * - kanji-recall    : jawaban (arti / kana) → kanji
 * - vocab           : kosakata → arti / romaji / kana
 */
export function buildTypedQuestions(
  source: QuizSource,
  answerType: AnswerType,
  count = 10,
): Question[] {
  if (source === "vocab") {
    const picks = take(vocab, count);
    const pool = vocab.map((item) => answerOfVocab(item, answerType));

    return picks.map((item, index) => {
      const correct = answerOfVocab(item, answerType);
      const { options, answer } = buildOptions(correct, pool);
      return {
        id: `typed:vocab:${item.id}:${index}`,
        kind: "kosakata",
        prompt: item.kanji || item.kana,
        subPrompt:
          answerType === "meaning"
            ? "Apa arti kata ini?"
            : answerType === "romaji"
              ? "Bagaimana romaji kata ini?"
              : "Bagaimana cara membacanya (kana)?",
        options,
        answer,
        explanation: `${item.kanji || item.kana} (${item.kana}) = ${item.meaning}`,
      };
    });
  }

  const picks = take(kanji, count);
  const recall = source === "kanji-recall";
  const pool = kanji.map((item) => (recall ? item.character : answerOfKanji(item, answerType)));

  return picks.map((item, index) => {
    const prompt = recall ? answerOfKanji(item, answerType) : item.character;
    const correct = recall ? item.character : answerOfKanji(item, answerType);
    const { options, answer } = buildOptions(correct, pool);

    return {
      id: `typed:${source}:${item.id}:${index}`,
      kind: "kanji",
      prompt,
      subPrompt: recall
        ? "Kanji mana yang sesuai?"
        : answerType === "kana"
          ? "Bagaimana bacaan kanji ini?"
          : "Apa arti kanji ini?",
      options,
      answer,
      explanation: `${item.character} — ${item.meanings.join(", ")} · kana: ${item.onyomi[0] ?? ""}${item.kunyomi[0] ? ` / ${item.kunyomi[0]}` : ""}`,
    };
  });
}

/** Tandai kata target dalam kalimat dengan 「」 agar jelas mana yang ditanyakan. */
function markWord(sentence: string, word: string): string {
  if (!word || !sentence.includes(word)) return sentence;
  return sentence.replace(word, `「${word}」`);
}

/**
 * Format JLPT 漢字の読み方: kalimat dengan kata bergaris bawah (ditandai 「」)
 * → pilih cara bacanya dalam kana.
 */
export function buildKanjiReadingQuestions(count = 8): Question[] {
  const pool = vocab.filter((item) => item.kanji && item.example.jp.includes(item.kanji));
  const picks = take(pool, count);
  const kanaPool = vocab.map((item) => item.kana);

  return picks.map((item, index) => {
    const { options, answer } = buildOptions(item.kana, kanaPool);
    return {
      id: `kanji-reading:${item.id}:${index}`,
      kind: "kanji",
      prompt: markWord(item.example.jp, item.kanji),
      subPrompt: "Bagaimana cara membaca kata di dalam 「」?",
      options,
      answer,
      explanation: `${item.kanji} dibaca ${item.kana} (${item.meaning}).`,
    };
  });
}

/**
 * Format JLPT 漢字の書き方: kalimat dengan kata ditulis kana
 * → pilih kanji yang benar.
 */
export function buildKanjiWritingQuestions(count = 8): Question[] {
  const pool = vocab.filter((item) => item.kanji && item.example.jp.includes(item.kanji));
  const picks = take(pool, count);
  const kanjiPool = vocab.filter((item) => item.kanji).map((item) => item.kanji);

  return picks.map((item, index) => {
    const kanaSentence = item.example.jp.replace(item.kanji, item.kana);
    const { options, answer } = buildOptions(item.kanji, kanjiPool);
    return {
      id: `kanji-writing:${item.id}:${index}`,
      kind: "kanji",
      prompt: markWord(kanaSentence, item.kana),
      subPrompt: "Kanji mana yang tepat untuk kata di dalam 「」?",
      options,
      answer,
      explanation: `${item.kana} = ${item.kanji} (${item.meaning}).`,
    };
  });
}

export function scoreMessage(correct: number, total: number): string {
  const ratio = total === 0 ? 0 : correct / total;
  if (ratio === 1) return "完璧！ Sempurna, semua benar!";
  if (ratio >= 0.8) return "素晴らしい！ Sangat bagus!";
  if (ratio >= 0.6) return "いいね！ Terus berlatih.";
  if (ratio >= 0.4) return "もう一度！ Coba ulangi materi ini.";
  return "頑張って！ Jangan menyerah, mulai dari dasar lagi.";
}
