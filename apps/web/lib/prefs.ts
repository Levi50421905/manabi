"use client";

/**
 * Preferensi pengguna (tema, target harian, kecepatan suara, furigana).
 * Disimpan terpisah dari progres belajar supaya reset progres tidak
 * menghapus pengaturan.
 */

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

export interface Prefs {
  theme: Theme;
  dailyGoal: number;
  ttsRate: number;
  furigana: boolean;
}

export const DEFAULT_PREFS: Prefs = {
  theme: "system",
  dailyGoal: 20,
  ttsRate: 0.9,
  furigana: true,
};

const STORAGE_KEY = "manabi:v1:prefs";

let prefs: Prefs = DEFAULT_PREFS;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      theme: parsed.theme ?? DEFAULT_PREFS.theme,
      dailyGoal: typeof parsed.dailyGoal === "number" ? parsed.dailyGoal : DEFAULT_PREFS.dailyGoal,
      ttsRate: typeof parsed.ttsRate === "number" ? parsed.ttsRate : DEFAULT_PREFS.ttsRate,
      furigana: typeof parsed.furigana === "boolean" ? parsed.furigana : DEFAULT_PREFS.furigana,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function persist(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // abaikan
  }
}

function emit(): void {
  for (const listener of listeners) listener();
}

function ensureHydrated(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  prefs = read();
  emit();
}

export function updatePrefs(patch: Partial<Prefs>): void {
  ensureHydrated();
  prefs = { ...prefs, ...patch };
  persist();
  emit();
}

export function resetPrefs(): void {
  prefs = DEFAULT_PREFS;
  persist();
  emit();
}

function subscribe(listener: () => void): () => void {
  ensureHydrated();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Prefs {
  return prefs;
}

function getServerSnapshot(): Prefs {
  return DEFAULT_PREFS;
}

/** Hook: [prefs, updatePrefs]. Tanpa argumen; pakai `updatePrefs` untuk mengubah. */
export function usePrefs(): [Prefs, (patch: Partial<Prefs>) => void] {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return [snapshot, updatePrefs];
}

/** Apakah tema sedang gelap (menghormati setting "system"). */
export function isDark(theme: Theme): boolean {
  if (typeof window === "undefined") return false;
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
