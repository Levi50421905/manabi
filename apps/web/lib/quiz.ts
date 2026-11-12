import {
  examListeningN5,
  grammar,
  kana,
  kanji,
  reading,
  sentenceOrderN5,
  vocab,
} from "@manabi/content";
import type {
  ExamListeningItem,
  GrammarPoint,
  Kana,
  Kanji,
  ReadingPassage,
  SentenceOrderItem,
  Vocab,
} from "@manabi/content";

export type QuestionKind =
  | "kana"
  | "kosakata"
  | "kanji"
  | "tata-bahasa"
  | "susun"
  | "dengar"
  | "bacaan"
  | "ungkapan";

export interface Question {
  id: string;
  kind: QuestionKind;
  prompt: string;
  subPrompt?: string;
  /** Teks bacaan yang menyertai soal (khusus dokkai/uJian). */
  passage?: string;
  options: string[];
  answer: number;
  explanation: string;
  /** Teks yang bisa diputar (khusus soal mendengar/ujian). */
  audioText?: string;
  /** Dialog per baris + indeks pembicara, agar tiap orang bersuara berbeda. */
  audioLines?: Array<{ jp: string; speakerIndex: number }>;
  /** Label tombol audio: dialog, situasi, atau ucapan pendek. */
  audioLabel?: string;
  /** Pengelompokan seksi saat ditampilkan di ujian. */
  sectionKey?: string;
  sectionLabel?: string;
}

export const QUESTION_KIND_LABEL: Record<QuestionKind, string> = {
  kana: "Kana",
  kosakata: "Kosakata",
  kanji: "Kanji",
  "tata-bahasa": "Tata bahasa",
  susun: "文の組み立て",
  dengar: "Mendengar",
  bacaan: "Membaca",
  ungkapan: "Ungkapan",
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
  options: { withKana?: boolean; answerType?: AnswerType } = {},
): Question[] {
  const withKana = options.withKana ?? true;
  const answerType = options.answerType ?? "meaning";
  const picks = take(pool, count);
  const answerPool = pool.map((item) => answerOfVocab(item, answerType));

  return picks.map((item, index) => {
    const correct = answerOfVocab(item, answerType);
    const { options: built, answer } = buildOptions(correct, answerPool);
    // Petunjuk kana hanya aman saat yang ditanya artinya — kalau jawabannya
    // kana atau romaji, menampilkan kana sama saja membocorkan jawaban.
    const showKanaHint = withKana && answerType === "meaning";
    return {
      id: `vocab:${item.id}:${index}`,
      kind: "kosakata",
      prompt: item.kanji || item.kana,
      subPrompt: showKanaHint ? item.kana : subPromptFor(answerType, "kata"),
      options: built,
      answer,
      explanation: `${item.kanji || item.kana} (${item.kana}) berarti "${item.meaning}". Contoh: ${item.example.jp}`,
    };
  });
}

export function buildKanjiQuestions(
  pool: Kanji[],
  count = 8,
  answerType: AnswerType = "meaning",
): Question[] {
  const picks = take(pool, count);
  const answerPool = pool.map((item) => answerOfKanji(item, answerType));

  return picks.map((item, index) => {
    const correct = answerOfKanji(item, answerType);
    const { options, answer } = buildOptions(correct, answerPool);
    return {
      id: `kanji:${item.id}:${index}`,
      kind: "kanji",
      prompt: item.character,
      // Saat menjawab arti, info goresan jadi petunjuk yang membantu; saat
      // menjawab bacaan, info itu tidak relevan sehingga diganti pertanyaan.
      subPrompt:
        answerType === "meaning"
          ? `${item.strokes} goresan · radikal ${item.radical} — apa arti kanji ini?`
          : subPromptFor(answerType, "kanji"),
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
      subPrompt: example?.id
        ? `“${example.id}” — pola tata bahasa mana yang dipakai kalimat ini?`
        : "Pola tata bahasa mana yang dipakai kalimat ini?",
      options,
      answer,
      explanation: `${item.title} — ${item.explanation}`,
    };
  });
}

/**
 * Format JLPT 文の組み立て: empat celah, celah ketiga ditandai ★.
 * Pilihan diacak setiap sesi, lalu posisi ★ dihitung ulang.
 */
export function buildSentenceOrderQuestions(
  count = 5,
  pool: SentenceOrderItem[] = sentenceOrderN5,
): Question[] {
  const picks = take(pool, count);

  return picks.map((item) => {
    const starOriginal = item.order[2];
    const shuffled = shuffle(
      item.fragments.map((text, original) => ({ text, original })),
    );
    const answer = shuffled.findIndex((fragment) => fragment.original === starOriginal);
    const correctOrder = item.order.map((fragmentIndex) => item.fragments[fragmentIndex]);

    return {
      id: item.id,
      kind: "susun",
      prompt: item.prompt,
      subPrompt: "Pilih kata yang masuk ke ★ (celah ketiga)",
      options: shuffled.map((fragment) => fragment.text),
      answer: Math.max(0, answer),
      explanation: `Urutan benar: ${correctOrder.join(" → ")}. ${item.full} (${item.translation})`,
    };
  });
}

/**
 * Soal pemahaman bacaan untuk latihan (bukan ujian). Passage ikut dibawa
 * agar bisa dirender bersama pertanyaan.
 */
export function buildReadingQuizQuestions(
  pool: ReadingPassage[],
  count = 6,
): Question[] {
  const questions: Question[] = [];

  for (const passage of pool) {
    const passageText = passage.segments.map((segment) => segment.text).join("");
    passage.questions.forEach((question, index) => {
      questions.push({
        id: `read-quiz:${passage.id}:${index}`,
        kind: "bacaan",
        prompt: question.question,
        subPrompt: passage.title,
        passage: passageText,
        options: question.options,
        answer: question.answer,
        explanation: `Bacaan: ${passage.title}. ${passage.translation}`,
      });
    });
  }

  return take(questions, count);
}

/** Soal mendengar dari dialog yang tersedia. */
export function buildListeningQuizQuestions(
  pool: ExamListeningItem[],
  count = 6,
): Question[] {
  return take(pool, count).map((item) => {
    const speakers = Array.from(new Set(item.script.map((line) => line.speaker)));
    return {
      id: `listen-quiz:${item.id}`,
      kind: "dengar",
      prompt: item.prompt,
      subPrompt: "Dengarkan audio, lalu pilih jawaban yang tepat.",
      options: item.options,
      answer: item.answer,
      explanation: item.explanation,
      audioText: item.script.map((line) => line.jp).join(" "),
      audioLines: item.script.map((line) => ({
        jp: line.jp,
        speakerIndex: Math.max(0, speakers.indexOf(line.speaker)),
      })),
      audioLabel:
        item.type === "expression"
          ? "Putar situasi"
          : item.type === "response"
            ? "Putar ucapan"
            : "Putar dialog",
    };
  });
}

/**
 * Sesi variasi: mencampur kana, kosakata, kanji, grammar, bacaan, mendengar,
 * dan susun kalimat. Komposisinya diacak tiap sesi agar latihan tidak monoton.
 */
export function buildVarietyQuestions(
  count = 12,
  options: {
    answerType?: AnswerType;
    vocabPool?: Vocab[];
    kanjiPool?: Kanji[];
    grammarPool?: GrammarPoint[];
    readingPool?: ReadingPassage[];
    listeningPool?: ExamListeningItem[];
    sentencePool?: SentenceOrderItem[];
  } = {},
): Question[] {
  const answerType = options.answerType ?? "meaning";
  const vocabPool = options.vocabPool ?? vocab;
  const kanjiPool = options.kanjiPool ?? kanji;
  const grammarPool = options.grammarPool ?? grammar;
  const readingPool = options.readingPool ?? reading;
  const listeningPool = options.listeningPool ?? examListeningN5;
  const sentencePool = options.sentencePool ?? sentenceOrderN5;

  const kanaCount = Math.min(2, Math.max(1, Math.round(count * 0.1)));
  const kanjiCount = Math.max(1, Math.round(count * 0.15));
  const grammarCount = Math.max(1, Math.round(count * 0.15));
  const readingCount = Math.max(1, Math.round(count * 0.15));
  const listeningCount = Math.max(1, Math.round(count * 0.1));
  const susunCount = Math.max(1, Math.round(count * 0.05));
  const vocabCount = Math.max(
    1,
    count - (kanaCount + kanjiCount + grammarCount + readingCount + listeningCount + susunCount),
  );

  const questions: Question[] = [
    ...buildKanaQuestions(kana, kanaCount),
    ...buildVocabQuestions(vocabPool, vocabCount, { answerType }),
    ...buildKanjiQuestions(kanjiPool, kanjiCount, answerType),
    ...buildGrammarQuestions(grammarPool, grammarCount),
    ...buildReadingQuizQuestions(readingPool, readingCount),
    ...buildListeningQuizQuestions(listeningPool, listeningCount),
    ...buildSentenceOrderQuestions(susunCount, sentencePool),
  ];

  // Jika salah satu pool kosong, lengkapi dari kosakata agar jumlah soal tetap.
  while (questions.length < count) {
    const topUp = buildVocabQuestions(vocabPool, count - questions.length, { answerType });
    if (topUp.length === 0) break;
    questions.push(...topUp);
  }

  return shuffle(questions).slice(0, count);
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

export const ANSWER_TYPE_LABEL: Record<AnswerType, string> = {
  meaning: "Terjemahan",
  romaji: "Romaji",
  kana: "Kana",
};

export const ANSWER_TYPE_HINT: Record<AnswerType, string> = {
  meaning: "arti dalam bahasa Indonesia",
  romaji: "cara baca dengan huruf Latin",
  kana: "cara baca dalam huruf kana",
};

/** Peta huruf kana → romaji, memakai data kana yang sudah ada di paket konten. */
const KANA_ROMAJI = new Map<string, string>(kana.map((item) => [item.char, item.romaji]));

/**
 * Ubah teks kana menjadi romaji, mis. "ひ" → "hi", "きょう" → "kyou".
 * Pasangan yōon dicoba lebih dulu supaya "きゃ" tidak dipecah jadi dua suku.
 */
export function toRomaji(text: string): string {
  let result = "";
  let index = 0;
  while (index < text.length) {
    const pair = text.slice(index, index + 2);
    const pairRomaji = KANA_ROMAJI.get(pair);
    if (pairRomaji) {
      result += pairRomaji;
      index += 2;
      continue;
    }
    const single = text[index] ?? "";
    result += KANA_ROMAJI.get(single) ?? single;
    index += 1;
  }
  return result;
}

/** Bacaan kanji tanpa okurigana, mis. "た.べる" → "た". */
function kanjiReading(item: Kanji): string {
  const raw = item.kunyomi[0] ?? item.onyomi[0] ?? "";
  return raw.split(".")[0] ?? raw;
}

/** Jawaban kanji sesuai bentuk yang dipilih peserta. */
function answerOfKanji(item: Kanji, answerType: AnswerType): string {
  if (answerType === "meaning") return item.meanings.join(", ");
  const reading = kanjiReading(item);
  return answerType === "romaji" ? toRomaji(reading) : reading;
}

/** Jawaban kosakata sesuai bentuk yang dipilih peserta. */
function answerOfVocab(item: Vocab, answerType: AnswerType): string {
  if (answerType === "romaji") return item.romaji;
  if (answerType === "kana") return item.kana;
  return item.meaning;
}

/** Pertanyaan yang ditampilkan untuk tiap bentuk jawaban. */
function subPromptFor(answerType: AnswerType, subject: "kata" | "kanji"): string {
  if (answerType === "romaji") return `Bagaimana romaji ${subject} ini?`;
  if (answerType === "kana") return `Bagaimana cara membacanya (kana)?`;
  return `Apa arti ${subject} ini?`;
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

/**
 * Format JLPT 文脈規定: kalimat dengan bagian kosong (＿＿)
 * → pilih kata yang paling tepat mengisi bagian itu.
 */
export function buildContextQuestions(count = 6): Question[] {
  const pool = vocab.filter(
    (item) => item.example.jp.length > 6 && item.example.jp.includes(item.kanji || item.kana),
  );
  const picks = take(pool, count);
  const fallbackPool = vocab.map((item) => item.kanji || item.kana);

  return picks.map((item, index) => {
    const word = item.kanji || item.kana;
    const sentence = item.example.jp.replace(word, "＿＿");
    const samePos = vocab
      .filter((other) => other.pos === item.pos && (other.kanji || other.kana) !== word)
      .map((other) => other.kanji || other.kana);
    const distractors = samePos.length >= 3 ? samePos : fallbackPool;
    const { options, answer } = buildOptions(word, distractors);

    return {
      id: `context:${item.id}:${index}`,
      kind: "kosakata",
      prompt: sentence,
      subPrompt: "Pilih kata yang tepat untuk mengisi ＿＿",
      options,
      answer,
      explanation: `${word} (${item.kana}) = ${item.meaning}.`,
    };
  });
}

/**
 * Acak urutan soal sekaligus posisi opsinya tanpa mengubah kunci jawaban.
 *
 * Dipakai sesi dari Bank Soal: butir terkurasi punya kunci tetap, jadi yang
 * boleh diacak hanya urutan soal dan letak opsi — bukan jawabannya.
 */
export function randomizeQuestions(questions: Question[]): Question[] {
  return shuffle(questions).map((question) => {
    const correct = question.options[question.answer];
    if (correct === undefined) return question;
    const options = shuffle(question.options);
    return { ...question, options, answer: options.indexOf(correct) };
  });
}

/**
 * Ambil `count` butir dari bank secara acak **tanpa pengulangan**.
 *
 * Butir bank diambil dari satu deck yang sudah unik per `id`; pengaman Map
 * menjaga kalau data bank suatu saat memuat id kembar. Bila `count` melebihi
 * isi deck, seluruh butir yang ada dipakai.
 */
export function drawBankQuestions(pool: Question[], count = 10): Question[] {
  const unique = Array.from(new Map(pool.map((question) => [question.id, question])).values());
  const takeCount = Math.min(Math.max(0, count), unique.length);
  return randomizeQuestions(shuffle(unique).slice(0, takeCount));
}

export function scoreMessage(correct: number, total: number): string {
  const ratio = total === 0 ? 0 : correct / total;
  if (ratio === 1) return "Sempurna. Semua jawaban benar.";
  if (ratio >= 0.8) return "Sangat baik. Pertahankan.";
  if (ratio >= 0.6) return "Cukup. Ulangi bagian yang belum tepat.";
  if (ratio >= 0.4) return "Perlu diulang. Baca pembahasan, lalu coba lagi.";
  return "Mulai dari pembahasan, lalu ulangi sesi ini.";
}
