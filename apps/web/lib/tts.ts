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

/** Semua voice Jepang yang tersedia di perangkat. */
export function japaneseVoices(): SpeechSynthesisVoice[] {
  refreshVoices();
  return cachedVoices.filter((voice) => voice.lang.toLowerCase().startsWith("ja"));
}

/**
 * Buat utterance Jepang dengan voice & kecepatan yang benar.
 * `speakerIndex` membedakan pembicara dalam satu dialog: kalau perangkat punya
 * beberapa voice Jepang, voice-nya berganti; kalau hanya satu, nadanya (pitch)
 * yang dibedakan supaya pengguna tetap tahu giliran bicara sudah berganti.
 */
export function createUtterance(
  text: string,
  rate?: number,
  speakerIndex = 0,
): SpeechSynthesisUtterance | null {
  if (!isSpeechSupported()) return null;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = rate ?? 0.9;

  const { voice, pitch } = voiceForSpeaker(speakerIndex);
  if (voice) utterance.voice = voice;
  utterance.pitch = pitch;

  return utterance;
}

/** Tebak gender voice dari namanya (banyak voice OS memakai nama orang). */
function classifyVoice(voice: SpeechSynthesisVoice): "male" | "female" | "unknown" {
  const name = voice.name.toLowerCase();
  if (
    /(female|女性|haruka|ayumi|nanami|kyoko|yumi|misaki|sayaka|mei-?jia|sakura|o-?ren|xiaoxiao|nanami)/.test(
      name,
    )
  ) {
    return "female";
  }
  if (
    /(male|男性|ichiro|otoya|hattori|kenta|takumi|daichi|keita|naoki|takeshi|hiroshi|satoshi)/.test(
      name,
    )
  ) {
    return "male";
  }
  return "unknown";
}

/**
 * Voice cowok/cewek bergantian sesuai urutan pembicara.
 * Pembicara 0 = cewek, 1 = cowok, 2 = cewek, … agar jelas siapa yang bicara.
 */
export function voiceForSpeaker(speakerIndex: number): {
  voice?: SpeechSynthesisVoice;
  pitch: number;
} {
  const voices = japaneseVoices();
  if (voices.length === 0) return { pitch: 1 };

  const females = voices.filter((voice) => classifyVoice(voice) === "female");
  const males = voices.filter((voice) => classifyVoice(voice) === "male");
  const unknown = voices.filter((voice) => classifyVoice(voice) === "unknown");

  const wantFemale = speakerIndex % 2 === 0;
  const femalePool = females.length > 0 ? females : unknown;
  const malePool = males.length > 0 ? males : unknown;
  const pool = wantFemale ? femalePool : malePool;

  if (pool.length > 0) {
    return { voice: pool[Math.floor(speakerIndex / 2) % pool.length], pitch: 1 };
  }

  // Hanya satu voice Jepang: bedakan seminimal mungkin (tanpa efek "serak")
  return { voice: voices[0], pitch: wantFemale ? 1.06 : 0.94 };
}

interface SpeakOptions {
  rate?: number;
  speakerIndex?: number;
}

/**
 * Ucapkan teks Jepang. Mengembalikan false jika browser tidak mendukung.
 * Catatan: suara Jepang hanya tersedia jika OS/browser punya voice `ja-JP`.
 */
export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSupported()) return false;

  const utterance = createUtterance(text, options.rate, options.speakerIndex ?? 0);
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
