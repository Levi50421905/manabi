/** Tipe data bersama untuk seluruh materi Manabi. */

export type JlptLevel = "N5" | "N4" | "N3" | "N2" | "N1";

export type KanaType = "hiragana" | "katakana";

export interface Kana {
  id: string;
  char: string;
  romaji: string;
  type: KanaType;
  /** baris/kelompok, contoh: "a", "ka", "sa" */
  row: string;
}

export type PartOfSpeech =
  | "kata-benda"
  | "kata-kerja"
  | "kata-sifat-i"
  | "kata-sifat-na"
  | "kata-keterangan"
  | "lainnya";

export interface Example {
  jp: string;
  id: string;
}

export interface Vocab {
  id: string;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  pos: PartOfSpeech;
  level: JlptLevel;
  example: Example;
}

export interface Kanji {
  id: string;
  character: string;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  strokes: number;
  radical: string;
  level: JlptLevel;
  mnemonic: string;
  /** contoh kata yang memakai kanji ini */
  words: string[];
}

export interface GrammarPoint {
  id: string;
  title: string;
  pattern: string;
  level: JlptLevel;
  explanation: string;
  examples: Example[];
  notes?: string[];
}

export interface ListeningLine {
  speaker: string;
  jp: string;
  kana?: string;
  id: string;
}

export interface ListeningTrack {
  id: string;
  title: string;
  level: JlptLevel;
  description: string;
  lines: ListeningLine[];
}

/** Potongan teks untuk membaca; `reading` jika ada akan dirender sebagai furigana. */
export interface ReadingSegment {
  text: string;
  reading?: string;
}

export interface ReadingQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface ReadingPassage {
  id: string;
  title: string;
  level: JlptLevel;
  segments: ReadingSegment[];
  translation: string;
  questions: ReadingQuestion[];
}

/* ------------------------------------------------------------------ *
 * Partikel (助詞)
 * ------------------------------------------------------------------ */

/** Pengelompokan materi partikel menurut tingkat kesulitan pemakaian. */
export type ParticleTier = "dasar" | "inti" | "menengah";

export interface ParticleExample {
  /** Kalimat Jepang lengkap. */
  jp: string;
  /** Terjemahan Indonesia. */
  id: string;
  /**
   * Potongan kalimat yang berakhir dengan partikel yang dibahas,
   * mis. "学校で" pada "学校で勉強します。". Dipakai untuk membuat soal isi celah
   * secara otomatis: potongan ini diganti menjadi "学校 ___".
   */
  target: string;
  /** Catatan singkat kenapa partikel ini yang dipakai. */
  note?: string;
}

export interface Particle {
  id: string;
  /** Karakter partikel, mis. "は". */
  char: string;
  /** Cara baca, mis. "wa". */
  romaji: string;
  level: JlptLevel;
  tier: ParticleTier;
  /** Fungsi ringkas, mis. "penanda topik". */
  role: string;
  /** Penjelasan satu paragraf. */
  explanation: string;
  examples: ParticleExample[];
  /** Jebakan singkat yang sering dialami pembelajar. */
  cautions?: string[];
}

export interface ParticleComparisonSide {
  particleId: string;
  char: string;
  summary: string;
  examples: ParticleExample[];
}

export interface ParticleComparison {
  id: string;
  /** Judul, mis. "は vs が". */
  title: string;
  /** Pertanyaan yang dijawab perbandingan ini. */
  question: string;
  left: ParticleComparisonSide;
  right: ParticleComparisonSide;
  /** Satu kalimat penutup sebagai pegangan. */
  takeaway: string;
}

export interface ParticlePitfall {
  id: string;
  title: string;
  /** Partikel yang terlibat, mis. ["が", "を"]. */
  particles: string[];
  summary: string;
  wrong: { jp: string; id: string };
  right: { jp: string; id: string };
  note: string;
}

/** Bentuk soal partikel yang didukung. */
export type ParticleQuizMode =
  | "isi-celah"
  | "ketik"
  | "fungsi"
  | "pasangan"
  | "lengkapi-teks";

export interface ParticleQuestion {
  id: string;
  mode: ParticleQuizMode;
  /** Kalimat soal; gunakan "___" sebagai tempat kosong. */
  prompt: string;
  /** Instruksi khusus; bila kosong dipakai instruksi dari peran partikel. */
  ask?: string;
  /** Terjemahan kalimat, untuk pembahasan. */
  promptId?: string;
  /** Jawaban benar. */
  answer: string;
  options: string[];
  explanation: string;
  /** Alasan tiap pilihan salah, dipakai di pembahasan. */
  wrongNotes?: Record<string, string>;
}

/* ------------------------------------------------------------------ *
 * Perubahan bacaan kanji (読み方)
 * ------------------------------------------------------------------ */

/**
 * Jenis hubungan antara tulisan dan bacaannya:
 * - standar       : bacaan biasa, apa adanya
 * - rendaku       : konsonan awal kata kedua menjadi bersuara (は→ば, か→が, ひ→び)
 * - onyomi        : gabungan bacaan Tionghoa (音読み)
 * - kunyomi-gabung: gabungan bacaan Jepang asli (訓読み)
 * - jukujikun     : bacaan khusus yang tidak mengikuti bacaan tiap kanji
 */
export type ReadingChangeKind =
  | "standar"
  | "rendaku"
  | "onyomi"
  | "kunyomi-gabung"
  | "jukujikun";

export interface ReadingEntry {
  id: string;
  /** Bentuk tertulis, mis. "今日". */
  word: string;
  /** Bacaan dalam kana, mis. "きょう". */
  kana: string;
  romaji: string;
  meaning: string;
  kind: ReadingChangeKind;
  /** Kanji yang terlibat, mis. ["今", "日"]. */
  kanji: string[];
  /** Kenapa bacaannya begitu. */
  note: string;
  /** Kapan bentuk ini dipakai. */
  context?: string;
}

export interface ReadingRuleExample {
  word: string;
  kana: string;
  romaji: string;
  meaning: string;
  /** Pemicu perubahan, mis. "sebelum 時". */
  context: string;
}

export interface ReadingRuleException {
  word: string;
  kana: string;
  note: string;
}

export interface ReadingRule {
  id: string;
  /** Kanji yang dijelaskan, mis. "何". */
  kanji: string;
  title: string;
  /** Aturan ringkas yang bisa langsung dihafal. */
  rule: string;
  /**
   * "kuat" = hampir selalu berlaku; "kecenderungan" = ada pengecualian.
   * Materi wajib jujur soal ini agar tidak menyesatkan pemula.
   */
  strength: "kuat" | "kecenderungan";
  examples: ReadingRuleExample[];
  exceptions?: ReadingRuleException[];
  /** Bentuk dasar saat kanji berdiri sendiri. */
  standalone: ReadingRuleExample;
}

export interface ReadingQuizItem {
  id: string;
  /** "pilih-bacaan" atau "bedakan". */
  mode: "pilih-bacaan" | "bedakan";
  prompt: string;
  promptId?: string;
  answer: string;
  options: string[];
  explanation: string;
  wrongNotes?: Record<string, string>;
  /** Kata atau kanji yang diuji, untuk statistik. */
  target: string;
}

/* ------------------------------------------------------------------ *
 * Konteks & etiket (敬語とマナー)
 * ------------------------------------------------------------------ */

/** Siapa yang diajak bicara. */
export type Audience = "akrab" | "teman" | "atasan" | "asing";

export interface RegisterLine {
  audience: Audience;
  /** Kalimat Jepang. */
  jp: string;
  /** Terjemahan dan nuansa. */
  id: string;
  note?: string;
}

/** Satu situasi, dibandingkan pada empat tingkat lawan bicara. */
export interface RegisterScenario {
  id: string;
  title: string;
  situation: string;
  lines: RegisterLine[];
}

/**
 * Tiga lapis kesopanan untuk satu kata kerja:
 * 丁寧 (bentuk ます), 尊敬 (untuk orang lain), 謙譲 (untuk diri sendiri).
 */
export interface KeigoVerb {
  id: string;
  /** Bentuk kamus, mis. 行く. */
  dictionary: string;
  meaning: string;
  teinei: string;
  sonkeigo: string;
  kenjougo: string;
  note?: string;
}

export type ContextCategory = "kebiasaan" | "unik";

export interface ContextCard {
  id: string;
  category: ContextCategory;
  title: string;
  /** Bentuk Jepang yang dibahas. */
  japanese: string;
  romaji?: string;
  summary: string;
  points: string[];
  /**
   * "kuat" = berlaku umum; "tergantung-situasi" = berbeda menurut daerah,
   * hubungan, atau sumber. Materi wajib jujur soal ini.
   */
  confidence: "kuat" | "tergantung-situasi";
  caution?: string;
}
