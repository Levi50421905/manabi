import { grammar, kanji, listening, listeningQuestions, reading, vocab } from "@manabi/content";
import {
  buildGrammarQuestions,
  buildKanjiQuestions,
  buildKanjiReadingQuestions,
  buildKanjiWritingQuestions,
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

/** Soal listening (dialog Jepang → pertanyaan pemahaman). */
function buildListening(): Question[] {
  const questions: Question[] = [];
  const tracks = new Map(listening.map((track) => [track.id, track]));

  for (const [trackId, items] of Object.entries(listeningQuestions)) {
    const track = tracks.get(trackId);
    const audioText = track?.lines.map((line) => line.jp).join(" ") ?? undefined;

    for (const item of items) {
      questions.push({
        id: `${trackId}:${item.id}`,
        kind: "dengar",
        prompt: item.prompt,
        subPrompt: "Putar dialog terlebih dahulu",
        options: item.options,
        answer: item.answer,
        explanation: item.explanation,
        audioText,
      });
    }
  }

  return shuffle(questions);
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
    const language = shuffle([
      ...buildKanjiReadingQuestions(8),
      ...buildKanjiWritingQuestions(6),
      ...buildGrammarQuestions(grammar, 6),
    ]);

    return {
      kind,
      title: "JLPT N5 — Simulasi",
      description:
        "2 seksi: Bahasa & Membaca (120 poin) dan Mendengar (60 poin). Lulus bila total ≥ 80 dan setiap seksi ≥ 19.",
      minutes: 30,
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
        questions: shuffle([
          ...buildKanjiReadingQuestions(6),
          ...buildKanjiWritingQuestions(6),
          ...buildVocabQuestions(vocab, 4, { withKana: false }),
        ]),
      },
      {
        key: "kaiwa-hyougen",
        label: "会話・表現 (Percakapan & Ungkapan)",
        maxPoints: 63,
        questions: buildGrammarQuestions(grammar, 8),
      },
      {
        key: "choukai",
        label: "聴解 (Pemahaman Mendengar)",
        maxPoints: 62,
        questions: buildListening(),
      },
      {
        key: "dokkai",
        label: "読解 (Pemahaman Membaca)",
        maxPoints: 62,
        questions: buildReading(),
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
