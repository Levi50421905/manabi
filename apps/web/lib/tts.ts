/** Utilitas text-to-speech memakai Web Speech API bawaan browser. */

let cachedVoices: SpeechSynthesisVoice[] = [];
let listenersBound = false;

function refreshVoices(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) cachedVoices = voices;
}

function bindVoiceListener(): void {
  if (listenersBound || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  listenersBound = true;
  refreshVoices();
  window.speechSynthesis.addEventListener("voiceschanged", refreshVoices);
}

bindVoiceListener();

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Suara Jepang terbaik yang tersedia (kalau ada). */
export function pickJapaneseVoice(): SpeechSynthesisVoice | undefined {
  refreshVoices();
  return cachedVoices.find((voice) => voice.lang.toLowerCase().startsWith("ja"));
}

export type VoiceStatus = "available" | "missing" | "unsupported";

/**
 * "missing" = browser jalan tapi tidak ada voice Jepang (tombol harus nonaktif).
 * Selama daftar voice belum termuat, kembalikan "available" agar tombol tidak
 * berkedip nonaktif saat halaman baru dibuka.
 */
export function voiceStatus(): VoiceStatus {
  if (!isSpeechSupported()) return "unsupported";
  refreshVoices();
  if (cachedVoices.length === 0) return "available";
  return pickJapaneseVoice() ? "available" : "missing";
}

/**
 * Buat utterance Jepang dengan voice & kecepatan yang benar.
 * Dipakai bersama oleh `speak()` dan pemutar dialog berurutan.
 */
export function createUtterance(
  text: string,
  rate?: number,
): SpeechSynthesisUtterance | null {
  if (!isSpeechSupported()) return null;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = rate ?? 0.9;
  utterance.pitch = 1;

  const voice = pickJapaneseVoice();
  if (voice) utterance.voice = voice;

  return utterance;
}

interface SpeakOptions {
  rate?: number;
}

/**
 * Ucapkan teks Jepang. Mengembalikan false jika browser tidak mendukung.
 * Catatan: suara Jepang hanya tersedia jika OS/browser punya voice `ja-JP`.
 */
export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSupported()) return false;

  const utterance = createUtterance(text, options.rate);
  if (!utterance) return false;

  const synth = window.speechSynthesis;
  synth.cancel();
  synth.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}
