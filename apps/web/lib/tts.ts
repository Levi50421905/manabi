/** Utilitas text-to-speech memakai Web Speech API bawaan browser. */

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
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

  const synth = window.speechSynthesis;
  synth.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch = 1;

  const voices = synth.getVoices();
  const japanese = voices.find((voice) => voice.lang.toLowerCase().startsWith("ja"));
  if (japanese) utterance.voice = japanese;

  synth.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}
