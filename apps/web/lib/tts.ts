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

/** Jumlah percobaan polling (@250 ms) sebelum deteksi dianggap selesai: ~10 detik. */
const VOICE_POLL_LIMIT = 40;

export interface VoiceWatchState {  voices: SpeechSynthesisVoice[];
  /**
   * true bila deteksi sudah selesai: daftar voice terisi, atau waktu tunggu
   * habis. Sebelum `settled`, UI tidak boleh menyimpulkan bahwa voice tidak ada —
   * Chrome memang mengosongkan daftar di awal.
   */
  settled: boolean;
}

/**
 * Pantau voice Jepang sampai daftar benar-benar termuat.
 *
 * Kenapa tidak cukup `voiceschanged`: di beberapa versi Chrome event itu tidak
 * pernah dipancarkan (atau terlewat sebelum komponen React terpasang), sehingga
 * `getVoices()` tetap kosong selamanya dan UI salah menyimpulkan "tidak ada voice
 * Jepang" padahal voice-nya terpasang. Karena itu kita pakai tiga lapis:
 *
 *   1. baca langsung saat berlangganan,
 *   2. event `voiceschanged` (jalur resmi),
 *   3. polling pendek 250 ms sampai ~5 detik, plus sekali lagi pada interaksi
 *      pertama pengguna (sebagian browser baru mengisi daftar setelah gesture).
 */
export function watchJapaneseVoices(
  onChange: (state: VoiceWatchState) => void,
): () => void {
  if (!isSpeechSupported()) {
    onChange({ voices: [], settled: true });
    return () => {};
  }

  const synth = window.speechSynthesis;
  let stopped = false;
  let pollTimer: number | undefined;
  let attempts = 0;

  const read = (): SpeechSynthesisVoice[] => {
    refreshVoices();
    return japaneseVoices();
  };

  const finish = (voices: SpeechSynthesisVoice[]) => {
    if (stopped) return;
    if (pollTimer !== undefined) {
      window.clearTimeout(pollTimer);
      pollTimer = undefined;
    }
    onChange({ voices, settled: true });
  };

  const tick = () => {
    if (stopped) return;
    const voices = read();
    if (voices.length > 0) {
      finish(voices);
      return;
    }
    attempts += 1;
    onChange({ voices, settled: attempts >= VOICE_POLL_LIMIT });
    if (attempts >= VOICE_POLL_LIMIT) return;
    pollTimer = window.setTimeout(tick, 250);
  };

  // 1. pembacaan awal — jangan langsung menyimpulkan "tidak ada"
  const initial = read();
  if (initial.length > 0) {
    finish(initial);
  } else {
    onChange({ voices: initial, settled: false });
    pollTimer = window.setTimeout(tick, 250);
  }

  // 2. jalur resmi
  const onVoicesChanged = () => {
    if (stopped) return;
    const voices = read();
    if (voices.length > 0) finish(voices);
  };
  synth.addEventListener("voiceschanged", onVoicesChanged);

  // 3. interaksi pertama pengguna — kesempatan terakhir yang murah
  const onFirstGesture = () => {
    if (stopped) return;
    const voices = read();
    if (voices.length > 0) {
      finish(voices);
    } else if (attempts < 20) {
      attempts = 0;
      tick();
    }
  };
  window.addEventListener("pointerdown", onFirstGesture, { once: true });
  window.addEventListener("keydown", onFirstGesture, { once: true });

  return () => {
    stopped = true;
    if (pollTimer !== undefined) window.clearTimeout(pollTimer);
    synth.removeEventListener("voiceschanged", onVoicesChanged);
    window.removeEventListener("pointerdown", onFirstGesture);
    window.removeEventListener("keydown", onFirstGesture);
  };
}

/** Semua voice Jepang yang tersedia di perangkat. */
export function japaneseVoices(): SpeechSynthesisVoice[] {
  refreshVoices();
  return cachedVoices.filter((voice) => voice.lang.toLowerCase().startsWith("ja"));
}

/** Jumlah seluruh voice yang terlihat browser — untuk pesan diagnosis. */
export function totalVoiceCount(): number {
  refreshVoices();
  return cachedVoices.length;
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
    /(female|女性|haruka|ayumi|nanami|kyoko|yumi|misaki|sayaka|mei-?jia|sakura|o-?ren|xiaoxiao)/.test(
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

const FEMALE_ROTATION = 1.02;
const MALE_ROTATION = 0.86;

/**
 * Voice untuk giliran bicara ke-`speakerIndex` dalam satu dialog.
 *
 * Urutan prioritas (diverifikasi terhadap voice yang benar-benar dipasang di
 * Windows/Chrome: Ayumi, Haruka, Sayaka = perempuan; Ichiro = laki-laki;
 * Google 日本語 = tidak jelas):
 *
 *  1. Ada voice cowok → pembicara bergantian cowok/cewek memakai voice asli.
 *  2. Semua voice cewek (kasus paling umum, mis. hanya Ayumi + Haruka) →
 *     pembicara ganjil memakai voice berbeda DENGAN nada lebih rendah, karena
 *     dua suara cewek tanpa beda nada nyaris tak terbedakan.
 *  3. Hanya satu voice → cukup dibedakan nadanya, tanpa efek serak.
 */
export function voiceForSpeaker(speakerIndex: number): {
  voice?: SpeechSynthesisVoice;
  pitch: number;
} {
  const voices = japaneseVoices();
  if (voices.length === 0) return { pitch: 1 };

  const wantFemale = speakerIndex % 2 === 0;
  const females = voices.filter((voice) => classifyVoice(voice) === "female");
  const males = voices.filter((voice) => classifyVoice(voice) === "male");
  const unknown = voices.filter((voice) => classifyVoice(voice) === "unknown");
  const turn = Math.floor(speakerIndex / 2);

  // 1. Ada voice laki-laki asli — pakai bergantian.
  if (males.length > 0) {
    const femalePool = females.length > 0 ? females : unknown;
    if (wantFemale) {
      const pool = femalePool.length > 0 ? femalePool : unknown;
      if (pool.length > 0) return { voice: pool[turn % pool.length], pitch: 1 };
    } else {
      return { voice: males[turn % males.length], pitch: 1 };
    }
  }

  // 2 & 3. Semua voice sama jenisnya — bedakan lewat nada.
  const pool = females.length > 0 ? females : voices;
  const voice = pool[turn % pool.length];
  return { voice, pitch: wantFemale ? 1 : MALE_ROTATION };
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
