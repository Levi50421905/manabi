"use client";

/**
 * Store progres belajar — sumber kebenaran tunggal untuk XP, streak,
 * jadwal SRS, dan riwayat quiz.
 *
 * MVP memakai localStorage supaya bisa jalan tanpa backend. Ketika Supabase
 * dipasang, cukup ganti `read`/`persist` dengan query ke tabel `progress` —
 * API publik (hook + action) tidak perlu berubah.
 */

import { useEffect, useSyncExternalStore } from "react";
import {
  createCard,
  dueCards,
  review as scheduleReview,
  summarize,
  type DeckSummary,
  type Rating,
  type SrsCard,
} from "@manabi/srs";

export interface QuizRecord {
  id: string;
  date: string;
  label: string;
  correct: number;
  total: number;
}

export interface ProgressState {
  version: 1;
  xp: number;
  streak: number;
  lastStudyDate: string | null;
  cards: Record<string, SrsCard>;
  quizzes: QuizRecord[];
  /** jumlah aktivitas per hari, untuk grafik mingguan */
  activity: Record<string, number>;
}

const STORAGE_KEY = "manabi:v1:progress";

const INITIAL: ProgressState = {
  version: 1,
  xp: 0,
  streak: 0,
  lastStudyDate: null,
  cards: {},
  quizzes: [],
  activity: {},
};

let state: ProgressState = INITIAL;
let hydrated = false;
const listeners = new Set<() => void>();

export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function read(): ProgressState {
  if (typeof window === "undefined") return INITIAL;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      ...INITIAL,
      ...parsed,
      cards: parsed.cards ?? {},
      quizzes: parsed.quizzes ?? [],
      activity: parsed.activity ?? {},
      version: 1,
    };
  } catch {
    return INITIAL;
  }
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage penuh / diblokir — abaikan, progres tetap hidup di memori
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function ensureHydrated(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  state = read();
  emit();
}

function commit(next: ProgressState): void {
  state = next;
  persist();
  emit();
}

function bumpStudy(input: ProgressState, now: Date = new Date()): ProgressState {
  const today = dayKey(now);
  const yesterdayDate = new Date(now);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = dayKey(yesterdayDate);

  let streak = input.streak;
  if (input.lastStudyDate === today) {
    // sudah belajar hari ini
  } else if (input.lastStudyDate === yesterday) {
    streak = input.streak + 1;
  } else {
    streak = 1;
  }

  return {
    ...input,
    streak,
    lastStudyDate: today,
    activity: {
      ...input.activity,
      [today]: (input.activity[today] ?? 0) + 1,
    },
  };
}

/* ------------------------------------------------------------------ *
 * Actions
 * ------------------------------------------------------------------ */

export function rateCard(id: string, rating: Rating): void {
  ensureHydrated();
  const card = state.cards[id] ?? createCard(id);
  const updated = scheduleReview(card, rating);
  const xpGain = rating === "again" ? 2 : rating === "hard" ? 5 : 8;

  commit(
    bumpStudy({
      ...state,
      cards: { ...state.cards, [id]: updated },
      xp: state.xp + xpGain,
    }),
  );
}

export function recordQuiz(label: string, correct: number, total: number): void {
  ensureHydrated();
  const record: QuizRecord = {
    id: `${Date.now()}`,
    date: new Date().toISOString(),
    label,
    correct,
    total,
  };

  commit(
    bumpStudy({
      ...state,
      xp: state.xp + correct * 5,
      quizzes: [record, ...state.quizzes].slice(0, 30),
    }),
  );
}

/** Tandai sesi belajar tanpa review kartu (mis. membaca / listening). */
export function recordStudy(): void {
  ensureHydrated();
  commit(bumpStudy({ ...state, xp: state.xp + 3 }));
}

export function resetProgress(): void {
  commit(INITIAL);
}

/* ------------------------------------------------------------------ *
 * Selectors
 * ------------------------------------------------------------------ */

export function cardsFor(ids: string[]): SrsCard[] {
  return ids.map((id) => state.cards[id]).filter((card): card is SrsCard => Boolean(card));
}

export function summaryFor(ids: string[]): DeckSummary {
  const cards = ids
    .map((id) => state.cards[id])
    .filter((card): card is SrsCard => Boolean(card));
  return summarize(cards);
}

export function dueIds(ids: string[], now: Date = new Date()): string[] {
  const cards = ids
    .map((id) => state.cards[id])
    .filter((card): card is SrsCard => Boolean(card));
  const due = new Set(dueCards(cards, now).map((card) => card.id));
  // materi yang belum pernah dilihat juga dianggap due
  return ids.filter((id) => due.has(id) || !state.cards[id]);
}

export function levelFromXp(xp: number): { level: number; intoLevel: number; need: number } {
  const perLevel = 300;
  const level = Math.floor(xp / perLevel) + 1;
  const intoLevel = xp % perLevel;
  return { level, intoLevel, need: perLevel };
}

/* ------------------------------------------------------------------ *
 * Hook
 * ------------------------------------------------------------------ */

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ProgressState {
  return state;
}

function getServerSnapshot(): ProgressState {
  return INITIAL;
}

export function useProgress(): ProgressState {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    ensureHydrated();
  }, []);

  return snapshot;
}
