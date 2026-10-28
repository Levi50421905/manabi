/**
 * Manabi SRS — implementasi ringan berbasis SM-2.
 *
 * Kenapa SM-2? Sederhana, deterministik, mudah dites, dan sudah terbukti
 * dipakai banyak aplikasi flashcard. Kalau nanti butuh lebih presisi,
 * tinggal ganti isi `review()` dengan FSRS tanpa mengubah API publik.
 *
 * Semua tanggal disimpan sebagai ISO string agar aman untuk localStorage.
 */

export type Rating = "again" | "hard" | "good" | "easy";

export interface SrsCard {
  /** id unik materi, contoh: "vocab:n5:gakusei" */
  id: string;
  /** ease factor, 1.3 – 2.8 */
  ease: number;
  /** interval dalam hari */
  interval: number;
  /** berapa kali berhasil diulang berturut-turut */
  repetitions: number;
  /** tanggal jatuh tempo berikutnya (ISO) */
  due: string;
  /** total kali lupa */
  lapses: number;
  /** total review */
  reviews: number;
  /** terakhir direview (ISO) */
  lastReviewed: string | null;
}

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const DAY_MS = 24 * 60 * 60 * 1000;

const EASE_DELTA: Record<Rating, number> = {
  again: -0.2,
  hard: -0.15,
  good: 0,
  easy: 0.15,
};

const QUALITY: Record<Rating, number> = {
  again: 0,
  hard: 3,
  good: 4,
  easy: 5,
};

export function createCard(id: string, now: Date = new Date()): SrsCard {
  return {
    id,
    ease: 2.5,
    interval: 0,
    repetitions: 0,
    due: now.toISOString(),
    lapses: 0,
    reviews: 0,
    lastReviewed: null,
  };
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime() + days * DAY_MS);
  return next;
}

export function isDue(card: SrsCard, now: Date = new Date()): boolean {
  return new Date(card.due).getTime() <= now.getTime();
}

export function dueCards(cards: SrsCard[], now: Date = new Date()): SrsCard[] {
  return cards.filter((card) => isDue(card, now));
}

/**
 * Jadwalkan ulang sebuah kartu setelah user memberi rating.
 */
export function review(
  card: SrsCard,
  rating: Rating,
  now: Date = new Date(),
): SrsCard {
  const quality = QUALITY[rating];
  const ease = clamp(card.ease + EASE_DELTA[rating], MIN_EASE, MAX_EASE);

  let interval: number;
  let repetitions: number;
  let lapses = card.lapses;

  if (quality < 3) {
    // lupa → ulangi segera (10 menit) dan reset hitungan
    repetitions = 0;
    lapses = card.lapses + 1;
    interval = 0;
    const due = new Date(now.getTime() + 10 * 60 * 1000);
    return {
      ...card,
      ease,
      interval,
      repetitions,
      lapses,
      reviews: card.reviews + 1,
      lastReviewed: now.toISOString(),
      due: due.toISOString(),
    };
  }

  repetitions = card.repetitions + 1;

  if (repetitions === 1) {
    interval = rating === "easy" ? 2 : 1;
  } else if (repetitions === 2) {
    interval = rating === "hard" ? 3 : 6;
  } else {
    const multiplier = rating === "hard" ? 1.2 : ease;
    interval = Math.round(card.interval * multiplier) || 1;
  }

  interval = Math.max(1, Math.min(interval, 365));

  return {
    ...card,
    ease,
    interval,
    repetitions,
    lapses,
    reviews: card.reviews + 1,
    lastReviewed: now.toISOString(),
    due: addDays(now, interval).toISOString(),
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Label manusiawi untuk jarak jatuh tempo, contoh: "3 hari lagi". */
export function dueLabel(due: string, now: Date = new Date()): string {
  const diff = new Date(due).getTime() - now.getTime();
  if (diff <= 0) return "siap direview";

  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `${minutes} menit lagi`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lagi`;

  const days = Math.round(hours / 24);
  return `${days} hari lagi`;
}

export interface DeckSummary {
  total: number;
  due: number;
  learned: number;
  mature: number;
  accuracy: number;
}

/** Ringkasan progres sebuah deck untuk dashboard. */
export function summarize(cards: SrsCard[], now: Date = new Date()): DeckSummary {
  const total = cards.length;
  const due = cards.filter((c) => isDue(c, now)).length;
  const learned = cards.filter((c) => c.repetitions > 0).length;
  const mature = cards.filter((c) => c.interval >= 21).length;
  const reviews = cards.reduce((sum, c) => sum + c.reviews, 0);
  const lapses = cards.reduce((sum, c) => sum + c.lapses, 0);
  const accuracy = reviews === 0 ? 0 : (reviews - lapses) / reviews;

  return { total, due, learned, mature, accuracy: Math.round(accuracy * 100) };
}
