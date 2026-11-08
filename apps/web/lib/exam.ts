import {
  EXAM_LISTENING_HINT,
  EXAM_LISTENING_LABEL,
  examListeningN5,
  grammar,
  reading,
  vocab,
  type ExamListeningType,
} from "@manabi/content";
import {
  buildContextQuestions,
  buildGrammarQuestions,
  buildKanjiReadingQuestions,
  buildKanjiWritingQuestions,
  buildSentenceOrderQuestions,
  buildVocabQuestions,
  shuffle,
  type Question,
} from "./quiz";

export type ExamKind = "jlpt-n5" | "jft-basic";

/** Pita CEFR untuk simulasi JFT-Basic (skor 10–250). */
export interface ExamBand {
  label: "A1" | "A2.1" | "A2.2";
  min: number;
  max: number;
}

export interface ExamSection {
  key: string;
  label: string;
  /** Poin maksimum seksi ini (mengikuti skala resmi). */
  maxPoints: number;
  /** Ambang minimum seksi; kosong untuk JFT yang tidak punya ambang seksi. */
  minPoints?: number;
  questions: Question[];
}

export interface ExamSpec {
  kind: ExamKind;
  title: string;
  description: string;
  minutes: number;
  passTotal: number;
  /** Hanya dipakai JFT: pita estimasi CEFR, bukan skor resmi. */
  bands?: ExamBand[];
  sections: ExamSection[];
}

export interface SectionResult {
  key: string;
  label: string;
  score: number;
  maxPoints: number;
  correct: number;
  total: number;
  passedSection: boolean;
}

export interface ExamResult {
  total: number;
  maxTotal: number;
  sections: SectionResult[];
  passed: boolean;
  /** Pita estimasi JFT; undefined untuk JLPT atau skor di bawah A1. */
  band?: ExamBand;
}

const LISTENING_TYPE_ORDER: ExamListeningType[] = ["task", "point", "expression", "response"];

/**
 * Kurangi jumlah opsi tanpa menghilangkan kunci. Dipakai untuk format resmi:
 * JLPT 発話表現/即時応答 = 3 opsi; JFT = 3 opsi untuk semua tipe.
 */
function trimOptions(question: Question, count: number): Question {
  if (question.options.length <= count) return question;
  const correct = question.options[question.answer];
  if (correct === undefined) return question;
  const wrong = question.options
    .filter((_, index) => index !== question.answer)
    .slice(0, count - 1);
  const options = shuffle([correct, ...wrong]);
  return { ...question, options, answer: options.indexOf(correct) };
}

/** Soal 聴解: 4 tipe resmi. `perType` membatasi jumlah per tipe. */
function buildListening(options: {
  perType?: number;
  forceOptionCount?: number;
} = {}): Question[] {
  return LISTENING_TYPE_ORDER.flatMap((type) => {
    const items = examListeningN5.filter((item) => item.type === type);
    const picked = options.perType ? shuffle(items).slice(0, options.perType) : shuffle(items);

    return picked.map((item) => {
      const speakerNames = Array.from(new Set(item.script.map((line) => line.speaker)));
      const question: Question = {
        id: item.id,
        kind: "dengar" as const,
        prompt: item.prompt,
        subPrompt: `${EXAM_LISTENING_LABEL[type]} — ${EXAM_LISTENING_HINT[type]}`,
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        audioText: item.script.map((line) => line.jp).join(" "),
        audioLines: item.script.map((line) => ({
          jp: line.jp,
          speakerIndex: Math.max(0, speakerNames.indexOf(line.speaker)),
        })),
        audioLabel:
          type === "expression"
            ? "Putar situasi"
            : type === "response"
              ? "Putar ucapan"
              : "Putar dialog",
        sectionKey: "listening",
        sectionLabel: "Mendengar",
      };

      const optionCount =
        options.forceOptionCount ?? (type === "expression" || type === "response" ? 3 : 4);
      return trimOptions(question, optionCount);
    });
  });
}

/** Tempelkan identitas seksi agar layar ujian bisa menampilkan konteksnya. */
function tagSection(questions: Question[], key: string, label: string): Question[] {
  return questions.map((question) => ({ ...question, sectionKey: key, sectionLabel: label }));
}

/** Soal pemahaman bacaan; `count` membatasi jumlah butir yang diambil. */
function buildReading(count = Number.MAX_SAFE_INTEGER): Question[] {
  const questions: Question[] = [];

  for (const passage of reading) {
    const passageText = passage.segments.map((segment) => segment.text).join("");
    passage.questions.forEach((question, index) => {
      questions.push({
        id: `${passage.id}:${index}`,
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

  return shuffle(questions).slice(0, count);
}

/** JFT memakai 3 opsi untuk semua tipe. */
function toJftOptions(questions: Question[]): Question[] {
  return questions.map((question) => trimOptions(question, 3));
}

/**
 * Bangun paket ujian.
 *
 * JLPT N5: 2 seksi penilaian (Bahasa & Membaca 120 poin; Mendengar 60 poin),
 * 75 butir/90 menit. Ambang seksi 38 dan 19; total lulus 80.
 *
 * JFT-Basic 2026: 4 seksi, ~50 butir/60 menit, 3 opsi, skor estimasi 10–250
 * dengan pita A1/A2.1/A2.2. Skor resmi memakai equating; angka di sini hanya
 * estimasi latihan.
 */
export function buildExam(kind: ExamKind): ExamSpec {
  if (kind === "jlpt-n5") {
    const language = tagSection(
      shuffle([
        ...buildKanjiReadingQuestions(8),
        ...buildKanjiWritingQuestions(4),
        ...buildContextQuestions(8),
        ...buildVocabQuestions(vocab, 5),
        ...buildGrammarQuestions(grammar, 8),
        ...buildSentenceOrderQuestions(5),
        ...buildReading(13),
      ]),
      "language",
      "Bahasa & Membaca",
    );

    return {
      kind,
      title: "JLPT N5 — Simulasi",
      description:
        "2 seksi penilaian: Bahasa & Membaca (120 poin) dan Mendengar (60 poin). Lulus bila total ≥ 80, Bahasa & Membaca ≥ 38, dan Mendengar ≥ 19.",
      minutes: 90,
      passTotal: 80,
      sections: [
        {
          key: "language",
          label: "Bahasa & Membaca",
          maxPoints: 120,
          minPoints: 38,
          questions: language,
        },
        {
          key: "listening",
          label: "Mendengar",
          maxPoints: 60,
          minPoints: 19,
          questions: buildListening(),
        },
      ],
    };
  }

  return {
    kind,
    title: "JFT-Basic — Simulasi",
    description:
      "4 seksi, 50 butir, 60 menit. Skor resmi JFT-Basic memakai equating 10–250; simulasi ini menampilkan estimasi pita CEFR, bukan skor resmi.",
    minutes: 60,
    passTotal: 200,
    bands: [
      { label: "A1", min: 145, max: 174 },
      { label: "A2.1", min: 175, max: 199 },
      { label: "A2.2", min: 200, max: 250 },
    ],
    sections: [
      {
        key: "moji-goi",
        label: "文字・語彙 (Huruf & Kosakata)",
        maxPoints: 62.5,
        questions: tagSection(
          toJftOptions(
            shuffle([
              ...buildKanjiReadingQuestions(4),
              ...buildKanjiWritingQuestions(4),
              ...buildVocabQuestions(vocab, 5),
            ]),
          ),
          "moji-goi",
          "文字・語彙",
        ),
      },
      {
        key: "kaiwa-hyougen",
        label: "会話・表現 (Percakapan & Ungkapan)",
        maxPoints: 62.5,
        questions: tagSection(
          toJftOptions(buildGrammarQuestions(grammar, 13)),
          "kaiwa-hyougen",
          "会話・表現",
        ),
      },
      {
        key: "choukai",
        label: "聴解 (Pemahaman Mendengar)",
        maxPoints: 62.5,
        questions: tagSection(
          buildListening({ perType: 3, forceOptionCount: 3 }),
          "choukai",
          "聴解",
        ),
      },
      {
        key: "dokkai",
        label: "読解 (Pemahaman Membaca)",
        maxPoints: 62.5,
        questions: tagSection(
          toJftOptions(buildReading(12)),
          "dokkai",
          "読解",
        ),
      },
    ],
  };
}

export function allQuestions(spec: ExamSpec): Question[] {
  return spec.sections.flatMap((section) => section.questions);
}

/** Hitung skor per seksi memakai ambang per seksi, lalu tentukan lulus/pita. */
export function scoreExam(spec: ExamSpec, answers: Record<string, number>): ExamResult {
  const sections: SectionResult[] = spec.sections.map((section) => {
    const total = section.questions.length;
    const correct = section.questions.filter(
      (question) => answers[question.id] === question.answer,
    ).length;
    const rawScore = total === 0 ? 0 : (correct / total) * section.maxPoints;
    // JLPT memakai skor seksi bulat; JFT memakai 4 × 62,5 sehingga perlu 1 desimal.
    const score =
      spec.kind === "jft-basic" ? Math.round(rawScore * 10) / 10 : Math.round(rawScore);
    const passedSection =
      section.minPoints === undefined ? true : score >= section.minPoints;

    return {
      key: section.key,
      label: section.label,
      score,
      maxPoints: section.maxPoints,
      correct,
      total,
      passedSection,
    };
  });

  const total = Math.round(sections.reduce((sum, section) => sum + section.score, 0) * 10) / 10;
  const maxTotal = Math.round(
    spec.sections.reduce((sum, section) => sum + section.maxPoints, 0) * 10,
  ) / 10;
  const passed =
    total >= spec.passTotal && sections.every((section) => section.passedSection);
  const band = spec.bands?.find((candidate) => total >= candidate.min && total <= candidate.max);

  return { total, maxTotal, sections, passed, band };
}

/** Format skor agar 120 tetap "120", tetapi 62,5 tampil "62,5". */
export function formatScore(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(".", ",");
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
