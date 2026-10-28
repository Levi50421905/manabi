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

export interface ExamSection {
  key: string;
  label: string;
  /** Poin maksimum seksi ini (mengikuti skala resmi). */
  maxPoints: number;
  questions: Question[];
}

export interface ExamSpec {
  kind: ExamKind;
  title: string;
  description: string;
  minutes: number;
  passTotal: number;
  /** Ambang minimum per seksi (JLPT mewajibkan 19/60 & 19/120-skalanya). */
  minSectionPoints?: number;
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
}

const LISTENING_TYPE_ORDER: ExamListeningType[] = ["task", "point", "expression", "response"];

/** Soal 聴解 N5: 4 tipe resmi, total 24 soal. */
function buildListening(): Question[] {
  return LISTENING_TYPE_ORDER.flatMap((type) => {
    const items = examListeningN5.filter((item) => item.type === type);

    return shuffle(items).map((item) => {
      const speakerNames = Array.from(new Set(item.script.map((line) => line.speaker)));

      return {
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
    });
  });
}

/** Tempelkan identitas seksi agar layar ujian bisa menampilkan konteksnya. */
function tagSection(questions: Question[], key: string, label: string): Question[] {
  return questions.map((question) => ({ ...question, sectionKey: key, sectionLabel: label }));
}

/** Soal pemahaman bacaan. */
function buildReading(): Question[] {
  const questions: Question[] = [];

  for (const passage of reading) {
    passage.questions.forEach((question, index) => {
      questions.push({
        id: `${passage.id}:${index}`,
        kind: "bacaan",
        prompt: question.question,
        subPrompt: passage.title,
        options: question.options,
        answer: question.answer,
        explanation: `Bacaan: ${passage.title}`,
      });
    });
  }

  return shuffle(questions);
}

/**
 * Bangun paket ujian.
 * JLPT N5: seksi Bahasa & Membaca 120 poin + Mendengar 60 poin (total 180).
 * JFT-Basic: 4 seksi, total 250 poin.
 */
export function buildExam(kind: ExamKind): ExamSpec {
  if (kind === "jlpt-n5") {
    const language = tagSection(
      shuffle([
        ...buildKanjiReadingQuestions(8),
        ...buildKanjiWritingQuestions(4),
        ...buildContextQuestions(4),
        ...buildGrammarQuestions(grammar, 4),
        ...buildSentenceOrderQuestions(5),
      ]),
      "language",
      "Bahasa & Membaca",
    );

    return {
      kind,
      title: "JLPT N5 — Simulasi",
      description:
        "2 seksi: Bahasa & Membaca (120 poin) dan Mendengar (60 poin). Lulus bila total ≥ 80 dan setiap seksi ≥ 19.",
      minutes: 45,
      passTotal: 80,
      minSectionPoints: 19,
      sections: [
        { key: "language", label: "Bahasa & Membaca", maxPoints: 120, questions: language },
        { key: "listening", label: "Mendengar", maxPoints: 60, questions: buildListening() },
      ],
    };
  }

  return {
    kind,
    title: "JFT-Basic — Simulasi",
    description:
      "4 seksi, total 250 poin. Lulus bila skor ≥ 200 (80%). Tidak ada pengurangan nilai untuk jawaban salah.",
    minutes: 40,
    passTotal: 200,
    sections: [
      {
        key: "moji-goi",
        label: "文字・語彙 (Huruf & Kosakata)",
        maxPoints: 63,
        questions: tagSection(
          shuffle([
            ...buildKanjiReadingQuestions(6),
            ...buildKanjiWritingQuestions(6),
            ...buildVocabQuestions(vocab, 4, { withKana: false }),
          ]),
          "moji-goi",
          "文字・語彙",
        ),
      },
      {
        key: "kaiwa-hyougen",
        label: "会話・表現 (Percakapan & Ungkapan)",
        maxPoints: 63,
        questions: tagSection(
          buildGrammarQuestions(grammar, 8),
          "kaiwa-hyougen",
          "会話・表現",
        ),
      },
      {
        key: "choukai",
        label: "聴解 (Pemahaman Mendengar)",
        maxPoints: 62,
        questions: tagSection(buildListening(), "choukai", "聴解"),
      },
      {
        key: "dokkai",
        label: "読解 (Pemahaman Membaca)",
        maxPoints: 62,
        questions: tagSection(buildReading(), "dokkai", "読解"),
      },
    ],
  };
}

export function allQuestions(spec: ExamSpec): Question[] {
  return spec.sections.flatMap((section) => section.questions);
}

/** Hitung skor per seksi memakai skala resmi, lalu tentukan lulus/tidak. */
export function scoreExam(spec: ExamSpec, answers: Record<string, number>): ExamResult {
  const sections: SectionResult[] = spec.sections.map((section) => {
    const total = section.questions.length;
    const correct = section.questions.filter((question) => answers[question.id] === question.answer).length;
    const score = total === 0 ? 0 : Math.round((correct / total) * section.maxPoints);
    const passedSection =
      spec.minSectionPoints === undefined ? true : score >= spec.minSectionPoints;

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

  const total = sections.reduce((sum, section) => sum + section.score, 0);
  const maxTotal = spec.sections.reduce((sum, section) => sum + section.maxPoints, 0);
  const passed = total >= spec.passTotal && sections.every((section) => section.passedSection);

  return { total, maxTotal, sections, passed };
}

export function formatClock(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const rest = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
