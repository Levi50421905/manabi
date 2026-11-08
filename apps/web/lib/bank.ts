import rawBank from "@/data/bank-practice.json";
import { QUESTION_KIND_LABEL, type Question, type QuestionKind } from "./quiz";

/**
 * Data bank soal terkurasi (34 butir contoh dari blueprint) yang dipakai
 * halaman latihan bank. Data ini sengaja dipisah dari generator runtime:
 * butir di sini punya kunci, pembahasan empat lapis, dan metadata level.
 */

interface RawOption {
  key: string;
  text: string;
  is_correct: boolean;
  rationale: string;
}

interface RawExplanation {
  short: string;
  rule: string;
  contrast: string;
  transfer: string;
  refs?: string[];
}

interface RawItem {
  id: string;
  exam_family: "jlpt" | "jft";
  level: string | null;
  test_section: string;
  item_type: string;
  instruction: { id: string; en?: string };
  stem: string;
  options: RawOption[];
  answer_key: string[];
  explanation: RawExplanation;
  stimulus_refs?: string[];
  accessibility?: { audio_transcript?: string | null };
}

interface RawStimulus {
  id: string;
  kind: string;
  level: string;
  title: string;
  body?: string;
  script?: Array<{ speaker: string; jp: string; kana?: string; id?: string }>;
  table?: { headers: string[]; rows: string[][] };
  audio?: { duration_sec?: number; play_limit?: number; speed?: string };
  translation?: { id?: string; en?: string };
}

interface RawBank {
  version: string;
  n5: RawItem[];
  jft: RawItem[];
  stimuli: RawStimulus[];
}

export interface BankDeck {
  id: "n5" | "jft";
  label: string;
  japanese: string;
  description: string;
  questions: Question[];
  sectionCounts: Array<{ label: string; count: number }>;
}

const bank = rawBank as unknown as RawBank;
const stimuli = new Map(bank.stimuli.map((stimulus) => [stimulus.id, stimulus]));

/** Jenis soal internal yang dipakai QuestionKind. */
function questionKind(item: RawItem): QuestionKind {
  const code = item.item_type;
  if (code.startsWith("L.")) return "dengar";
  if (code.startsWith("R.")) return "bacaan";
  if (code === "B.SC") return "susun";
  if (code.startsWith("B.")) return "tata-bahasa";
  if (code === "CE.EX") return "ungkapan";
  if (code === "CE.GR") return "tata-bahasa";
  if (code.startsWith("MG.") || code.startsWith("SV.")) return "kosakata";
  return "kosakata";
}

/** Label seksi untuk ringkasan deck. */
function sectionLabel(section: string): string {
  const labels: Record<string, string> = {
    "moji-goi": "文字・語彙",
    bunpou: "文法",
    dokkai: "読解",
    choukai: "聴解",
    "script-vocab": "Script & Vocabulary",
    "conversation-expression": "Conversation & Expression",
    listening: "Listening",
    reading: "Reading",
  };
  return labels[section] ?? section;
}

/** Teks stimulus yang aman ditampilkan sebelum menjawab. */
function stimulusText(stimulus: RawStimulus | undefined): string | undefined {
  if (!stimulus) return undefined;
  if (stimulus.body) return stimulus.body;
  if (stimulus.table) {
    const rows = [stimulus.table.headers, ...stimulus.table.rows].map((row) => row.join(" / "));
    return rows.join("\n");
  }
  return undefined;
}

function audioOf(item: RawItem): { text: string; lines: Array<{ jp: string; speakerIndex: number }> } {
  const stimulus = item.stimulus_refs?.[0] ? stimuli.get(item.stimulus_refs[0]) : undefined;
  const script = stimulus?.script ?? [];
  const speakers = Array.from(new Set(script.map((line) => line.speaker)));
  return {
    text: script.map((line) => line.jp).join(" "),
    lines: script.map((line) => ({
      jp: line.jp,
      speakerIndex: Math.max(0, speakers.indexOf(line.speaker)),
    })),
  };
}

function audioLabel(item: RawItem): string {
  if (item.item_type === "L.VE") return "Putar situasi";
  if (item.item_type === "L.QR") return "Putar ucapan";
  return "Putar dialog";
}

function explanationText(explanation: RawExplanation): string {
  return [explanation.short, explanation.rule, explanation.contrast, explanation.transfer]
    .filter(Boolean)
    .join("\n");
}

/** Ubah satu butir bank menjadi `Question` yang bisa dijalankan QuizRunner. */
function toQuestion(item: RawItem): Question | null {
  const answerKey = item.answer_key[0];
  const answer = item.options.findIndex((option) => option.key === answerKey);
  if (answer < 0) return null;

  const stimulus = item.stimulus_refs?.[0] ? stimuli.get(item.stimulus_refs[0]) : undefined;
  const kind = questionKind(item);
  const isListening = kind === "dengar";
  const audio = isListening ? audioOf(item) : undefined;
  const passage =
    kind === "bacaan" || item.item_type === "B.TG" ? stimulusText(stimulus) : undefined;

  return {
    id: item.id,
    kind,
    prompt: item.stem,
    subPrompt: item.instruction.id,
    passage,
    options: item.options.map((option) => option.text),
    answer,
    explanation: explanationText(item.explanation),
    audioText: audio?.text || undefined,
    audioLines: audio?.lines.length ? audio.lines : undefined,
    audioLabel: isListening ? audioLabel(item) : undefined,
    sectionKey: item.test_section,
    sectionLabel: sectionLabel(item.test_section),
  };
}

function makeDeck(
  id: BankDeck["id"],
  label: string,
  japanese: string,
  description: string,
  items: RawItem[],
): BankDeck {
  const questions = items
    .map(toQuestion)
    .filter((question): question is Question => question !== null);
  const countBySection = new Map<string, number>();
  for (const question of questions) {
    const sectionName = question.sectionLabel ?? "Lainnya";
    countBySection.set(sectionName, (countBySection.get(sectionName) ?? 0) + 1);
  }

  return {
    id,
    label,
    japanese,
    description,
    questions,
    sectionCounts: Array.from(countBySection.entries()).map(([label, count]) => ({
      label,
      count,
    })),
  };
}

export const bankDecks: BankDeck[] = [
  makeDeck(
    "n5",
    "JLPT N5",
    "基礎",
    "12 butir terkurasi: 文字・語彙, 文法, 読解, dan 聴解.",
    bank.n5,
  ),
  makeDeck(
    "jft",
    "JFT-Basic",
    "生活",
    "11 butir terkurasi: kosakata, ungkapan, listening, dan reading kehidupan.",
    bank.jft,
  ),
];

/** Label jenis soal untuk ditampilkan di kartu butir. */
export const BANK_KIND_LABEL = QUESTION_KIND_LABEL;
