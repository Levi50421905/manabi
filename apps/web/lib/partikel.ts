import {
  particleComparisonsByLevel,
  particleComparisonsN5,
  particleQuestionsN5,
  particlesByLevel,
  type JlptLevel,
  type Particle,
  type ParticleComparison,
  type ParticleQuizMode,
} from "@manabi/content";

/**
 * Pembuat soal partikel untuk lima mode latihan.
 *
 * Sebagian besar soal dibangkitkan dari `examples[].target` pada data partikel,
 * jadi menambah contoh di `packages/content/src/data/particles-n5.ts` otomatis
 * menambah bank soal tanpa mengubah kode ini.
 */

export const PARTICLE_MODE_LABEL: Record<ParticleQuizMode, string> = {
  "isi-celah": "Isi celah",
  ketik: "Ketik jawaban",
  fungsi: "Cocokkan fungsi",
  pasangan: "Bedakan pasangan",
  "lengkapi-teks": "Lengkapi teks",
};

export const PARTICLE_MODE_HINT: Record<ParticleQuizMode, string> = {
  "isi-celah": "Pilih partikel yang tepat untuk melengkapi kalimat.",
  ketik: "Tulis sendiri partikel yang tepat (kana atau romaji).",
  fungsi: "Hubungkan partikel dengan fungsinya.",
  pasangan: "Pilih di antara dua partikel yang sering tertukar.",
  "lengkapi-teks": "Isi beberapa celah dalam satu kalimat sekaligus.",
};

export interface ParticleQuizItem {
  id: string;
  mode: ParticleQuizMode;
  /** Kalimat/pertanyaan; "___" menandai tempat kosong. */
  prompt: string;
  /**
   * Instruksi spesifik: fungsi partikel yang dicari.
   *
   * Ini yang membuat soal tidak ambigu. Contoh: 「わたし ___ 学生です。」 bisa
   * diisi は maupun も, jadi soalnya harus berbunyi "Pilih partikel yang berarti
   * “juga”" agar hanya も yang benar.
   */
  ask: string;
  /** Terjemahan kalimat — ditampilkan sebagai pengunci maksud soal. */
  promptId?: string;
  answer: string;
  /** Kosong untuk mode ketik (jawaban ditulis pengguna). */
  options: string[];
  explanation: string;
  wrongNotes?: Record<string, string>;
  /** Untuk mode lengkapi-teks: dua celah atau lebih. */
  blanks?: Array<{ answer: string; options: string[] }>;
  /** Partikel yang dilibatkan, untuk statistik “sering tertukar”. */
  particles: string[];
}

/**
 * Terjemahan fungsi partikel menjadi instruksi soal.
 *
 * Dipakai untuk SEMUA soal yang jawabannya partikel, termasuk soal yang
 * dibangkitkan otomatis, supaya maksud soal selalu jelas dan tidak ada jawaban
 * lain yang sebenarnya sah secara tata bahasa.
 */
const ROLE_ASK: Record<string, string> = {
  "penanda topik": "yang menandai topik kalimat",
  "penanda subjek": "yang menandai subjek",
  "penanda objek langsung": "yang menandai objek langsung dari kata kerja",
  "waktu, tujuan, keberadaan": "yang menandai waktu, tujuan, atau keberadaan",
  "tempat aktivitas, alat": "yang menandai tempat berlangsungnya aktivitas atau alat yang dipakai",
  "arah tujuan": "yang menandai arah tujuan",
  "kepemilikan & penghubung": "yang menyatakan kepemilikan atau menghubungkan dua kata benda",
  "dan, bersama": "yang berarti “dan” atau “bersama”",
  juga: "yang berarti “juga”",
  "pertanyaan & pilihan": "yang membentuk pertanyaan atau menyatakan pilihan",
  "dari, karena": "yang berarti “dari” atau “karena”",
  sampai: "yang berarti “sampai”",
  "dan (antara lain)": "yang menyebutkan beberapa contoh dengan nuansa “antara lain”",
  "meminta persetujuan": "yang meminta persetujuan pendengar",
  "penegasan & informasi baru": "yang menegaskan atau memberi informasi baru",
  perbandingan: "yang menyatakan perbandingan",
  "sebatas, sejauh": "yang menyatakan “sebatas” atau “sejauh”",
  hanya: "yang berarti “hanya”",
};

/** Instruksi soal untuk satu partikel. */
export function askForParticle(particle: Particle): string {
  const phrase = ROLE_ASK[particle.role] ?? `yang berfungsi sebagai ${particle.role}`;
  return `Pilih partikel ${phrase}.`;
}

/* ------------------------------------------------------------------ *
 * Utilitas
 * ------------------------------------------------------------------ */

function shuffle<T>(input: T[]): T[] {
  const list = [...input];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = list[i] as T;
    list[i] = list[j] as T;
    list[j] = tmp;
  }
  return list;
}

function take<T>(input: T[], count: number): T[] {
  return shuffle(input).slice(0, Math.max(0, count));
}

/** Partikel pengganggu: utamakan dari pasangan yang sering tertukar. */
function distractorParticles(
  pool: Particle[],
  answer: string,
  count: number,
  relatedChars: string[] = [],
): string[] {
  const others = pool.map((item) => item.char).filter((char) => char !== answer);
  const related = relatedChars.filter((char) => char !== answer && others.includes(char));
  const rest = others.filter((char) => !related.includes(char));
  return [...take(related, count), ...take(rest, count)].slice(0, count);
}

/**
 * Ubah contoh kalimat menjadi soal isi celah.
 * `target` selalu berakhir dengan partikel yang dibahas.
 */
function blankExample(example: { jp: string; target: string }): string | null {
  const index = example.jp.indexOf(example.target);
  if (index < 0) return null;
  const head = example.jp.slice(0, index + example.target.length - 1);
  const tail = example.jp.slice(index + example.target.length);
  return `${head} ___${tail}`;
}

/** Semua pasangan partikel yang melibatkan partikel tertentu. */
function partnerChars(pool: Particle[], char: string): string[] {
  const partners: string[] = [];
  for (const pair of particleComparisonsN5) {
    if (pair.left.char === char) partners.push(pair.right.char);
    if (pair.right.char === char) partners.push(pair.left.char);
  }
  return partners;
}

/* ------------------------------------------------------------------ *
 * Soal yang dibangkitkan dari data partikel
 * ------------------------------------------------------------------ */

function buildFromExamples(
  pool: Particle[],
  mode: "isi-celah" | "ketik",
): ParticleQuizItem[] {
  const items: ParticleQuizItem[] = [];

  for (const particle of pool) {
    particle.examples.forEach((example, index) => {
      const prompt = blankExample(example);
      if (!prompt) return;

      const related = partnerChars(pool, particle.char);
      items.push({
        id: `partikel:${mode}:${particle.id}:${index}`,
        mode,
        ask: askForParticle(particle),
        prompt,
        promptId: example.id,
        answer: particle.char,
        options:
          mode === "ketik"
            ? []
            : shuffle([particle.char, ...distractorParticles(pool, particle.char, 2, related)]),
        explanation: example.note
          ? `${example.jp} — ${example.id} ${example.note}`
          : `${example.jp} — ${example.id} Partikel ${particle.char} (${particle.romaji}) ${particle.role}.`,
        particles: [particle.char],
      });
    });
  }

  return items;
}

function buildFungsiQuestions(pool: Particle[]): ParticleQuizItem[] {
  const items: ParticleQuizItem[] = [];
  const roles = Array.from(new Set(pool.map((item) => item.role)));

  for (const particle of pool) {
    const example = particle.examples[0];
    // Arah 1: partikel → fungsi.
    const wrongRoles = take(
      roles.filter((role) => role !== particle.role),
      2,
    );
    items.push({
      id: `partikel:fungsi:a:${particle.id}`,
      mode: "fungsi",
      ask: "Pilih fungsi partikel berikut.",
      prompt: `Partikel ${particle.char} (${particle.romaji}) berfungsi sebagai…`,
      promptId: example ? `${example.jp} — ${example.id}` : undefined,
      answer: particle.role,
      options: shuffle([particle.role, ...wrongRoles]),
      explanation: `${particle.char} menandai ${particle.role}. Contoh: ${example ? example.jp : "—"}`,
      particles: [particle.char],
    });

    // Arah 2: contoh kalimat → partikel.
    if (example) {
      const prompt = blankExample(example);
      if (prompt) {
        items.push({
          id: `partikel:fungsi:b:${particle.id}`,
          mode: "fungsi",
          ask: askForParticle(particle),
          prompt,
          promptId: example.id,
          answer: particle.char,
          options: shuffle([
            particle.char,
            ...distractorParticles(pool, particle.char, 2, partnerChars(pool, particle.char)),
          ]),
          explanation: `Di sini ${particle.char} berfungsi sebagai ${particle.role}. ${example.jp} — ${example.id}`,
          particles: [particle.char],
        });
      }
    }
  }

  return items;
}

function buildPasanganQuestions(
  pool: Particle[],
  comparisons: ParticleComparison[],
): ParticleQuizItem[] {
  const items: ParticleQuizItem[] = [];
  const byChar = new Map(pool.map((item) => [item.char, item]));

  for (const pair of comparisons) {
    const candidates = [pair.left, pair.right];

    for (const side of candidates) {
      const otherSide = side === pair.left ? pair.right : pair.left;
      const particle = byChar.get(side.char);
      if (!particle) continue;

      for (const [index, example] of side.examples.entries()) {
        const prompt = blankExample(example);
        if (!prompt) continue;

        items.push({
          id: `partikel:pasangan:${pair.id}:${side.char}:${index}`,
          mode: "pasangan",
          ask: "Pilih partikel yang sesuai dengan terjemahan kalimat ini.",
          prompt,
          promptId: example.id,
          answer: side.char,
          options: shuffle([side.char, otherSide.char, ...distractorParticles(pool, side.char, 1, [otherSide.char])]),
          explanation: `${example.jp} — ${example.id}\n${pair.left.char}: ${pair.left.summary}\n${pair.right.char}: ${pair.right.summary}\n${pair.takeaway}`,
          wrongNotes: {
            [otherSide.char]: `${otherSide.char} dipakai untuk ${otherSide.summary.toLowerCase()}`,
          },
          particles: [pair.left.char, pair.right.char],
        });
      }
    }
  }

  return items;
}

/**
 * Kalimat dengan dua celah. Ditulis tangan karena menyusun otomatis dari satu
 * contoh berisiko menghasilkan soal yang ambigu.
 */
const MULTI_BLANK_SENTENCES: Array<{
  jp: string;
  id: string;
  blanks: Array<{ answer: string; particles: string[] }>;
}> = [
  {
    jp: "わたし ___ 毎朝七時 ___ 起きます。",
    id: "Saya bangun jam tujuh setiap pagi.",
    blanks: [
      { answer: "は", particles: ["は", "が", "も"] },
      { answer: "に", particles: ["で", "に", "を"] },
    ],
  },
  {
    jp: "学校 ___ 友だち ___ 日本語を勉強します。",
    id: "Di sekolah saya belajar bahasa Jepang bersama teman.",
    blanks: [
      { answer: "で", particles: ["で", "に", "へ"] },
      { answer: "と", particles: ["と", "の", "も"] },
    ],
  },
  {
    jp: "日本 ___ 行きたいです。東京 ___ 友だちがいます。",
    id: "Saya ingin pergi ke Jepang. Di Tokyo ada teman.",
    blanks: [
      { answer: "へ", particles: ["へ", "を", "で"] },
      { answer: "に", particles: ["に", "で", "を"] },
    ],
  },
  {
    jp: "わたし ___ コーヒー ___ 紅茶を飲みます。",
    id: "Saya minum kopi atau teh.",
    blanks: [
      { answer: "は", particles: ["は", "が", "を"] },
      { answer: "か", particles: ["か", "と", "や"] },
    ],
  },
  {
    jp: "九時 ___ 五時 ___ 働きます。",
    id: "Saya bekerja dari jam sembilan sampai jam lima.",
    blanks: [
      { answer: "から", particles: ["から", "まで", "より"] },
      { answer: "まで", particles: ["まで", "から", "ほど"] },
    ],
  },
  {
    jp: "これは田中さん ___ 本です。わたし ___ 好きです。",
    id: "Ini buku Tanaka. Saya menyukainya.",
    blanks: [
      { answer: "の", particles: ["の", "が", "に"] },
      { answer: "も", particles: ["も", "を", "で"] },
    ],
  },
];

function buildLengkapiTeks(pool: Particle[]): ParticleQuizItem[] {
  const available = new Set(pool.map((item) => item.char));

  return MULTI_BLANK_SENTENCES.filter((sentence) =>
    sentence.blanks.every((blank) => available.has(blank.answer)),
  ).map((sentence, index) => ({
    id: `partikel:teks:${index}`,
    mode: "lengkapi-teks" as const,
    prompt: sentence.jp,
    promptId: sentence.id,
    ask: "Pilih partikel yang tepat untuk setiap celah, sesuai fungsinya.",
    answer: sentence.blanks.map((blank) => blank.answer).join(" · "),
    options: [],
    explanation: `Jawaban berurutan: ${sentence.blanks.map((blank) => blank.answer).join(", ")}.`,
    blanks: sentence.blanks.map((blank) => ({
      answer: blank.answer,
      options: blank.particles,
    })),
    particles: sentence.blanks.map((blank) => blank.answer),
  }));
}

/* ------------------------------------------------------------------ *
 * API publik
 * ------------------------------------------------------------------ */

/** Seluruh soal untuk satu level, semua mode. */
export function allParticleQuestions(level: JlptLevel): ParticleQuizItem[] {
  const pool = particlesByLevel(level);
  if (pool.length === 0) return [];

  const byChar = new Map(pool.map((item) => [item.char, item]));

  const curated: ParticleQuizItem[] = particleQuestionsN5
    .filter((question) => question.mode === "isi-celah")
    .map((question) => {
      const particle = byChar.get(question.answer);
      return {
        ...question,
        // Instruksi menyebut fungsi partikel jawabannya, supaya tidak ada
        // partikel lain yang sebenarnya sah secara tata bahasa. Soal boleh
        // menimpa instruksi ini bila fungsinya khusus (mis. を untuk 出ます).
        ask:
          question.ask ??
          (particle
            ? askForParticle(particle)
            : "Pilih partikel yang tepat untuk melengkapi kalimat."),
        particles: [question.answer],
      };
    });

  return [
    ...curated,
    ...buildFromExamples(pool, "isi-celah"),
    ...buildFromExamples(pool, "ketik"),
    ...buildFungsiQuestions(pool),
    ...buildPasanganQuestions(pool, particleComparisonsByLevel(level)),
    ...buildLengkapiTeks(pool),
  ];
}

/**
 * Ambil soal untuk mode tertentu. `count` soal diacak namun tidak mengulang
 * soal yang sama dalam satu sesi.
 */
export function buildParticleQuestions(
  level: JlptLevel,
  modes: ParticleQuizMode[],
  count = 10,
): ParticleQuizItem[] {
  const all = allParticleQuestions(level);
  const selected = modes.length > 0 ? all.filter((item) => modes.includes(item.mode)) : all;
  if (selected.length === 0) return [];
  return take(selected, Math.min(count, selected.length));
}

/** Jumlah soal per mode — untuk menampilkan angka di layar penyiapan. */
export function particleQuestionCounts(level: JlptLevel): Record<ParticleQuizMode, number> {
  const all = allParticleQuestions(level);
  return {
    "isi-celah": all.filter((item) => item.mode === "isi-celah").length,
    ketik: all.filter((item) => item.mode === "ketik").length,
    fungsi: all.filter((item) => item.mode === "fungsi").length,
    pasangan: all.filter((item) => item.mode === "pasangan").length,
    "lengkapi-teks": all.filter((item) => item.mode === "lengkapi-teks").length,
  };
}

/** Jawaban mode ketik: terima kana maupun romaji. */
export function isTypedAnswerCorrect(
  item: ParticleQuizItem,
  input: string,
  pool: Particle[],
): boolean {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return false;
  if (normalized === item.answer) return true;
  const particle = pool.find((entry) => entry.char === item.answer);
  return Boolean(particle && normalized === particle.romaji.toLowerCase());
}
