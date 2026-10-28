import type { JlptLevel } from "../types";

export interface ListeningQuestion {
  id: string;
  level: JlptLevel;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

/**
 * Soal pemahaman untuk setiap dialog listening.
 * Kuncinya = id track di `listening-n5.ts` / `listening-n5-extra.ts`.
 * Pertanyaan memakai bahasa Indonesia agar yang diuji benar-benar
 * pemahaman isi, bukan kemampuan membaca soal.
 */
export const listeningQuestions: Record<string, ListeningQuestion[]> = {
  "listen:n5:aisatsu": [
    {
      id: "listen-q:n5:aisatsu:1",
      level: "N5",
      prompt: "Bagaimana cuaca menurut pembicara?",
      options: ["いい天気ですね", "雨ですね", "寒いですね", "曇りですね"],
      answer: 0,
      explanation: "田中 mengatakan 「いい天気ですね」 = cuacanya bagus, ya.",
    },
  ],
  "listen:n5:cafe": [
    {
      id: "listen-q:n5:cafe:1",
      level: "N5",
      prompt: "Apa saja yang dipesan pelanggan?",
      options: ["コーヒーとケーキ", "お茶だけ", "ジュースとパン", "コーヒーだけ"],
      answer: 0,
      explanation: "Pelanggan memesan コーヒー (kopi) lalu menambahkan チーズケーキ (cheesecake).",
    },
  ],
  "listen:n5:michi": [
    {
      id: "listen-q:n5:michi:1",
      level: "N5",
      prompt: "Bagaimana cara menuju stasiun?",
      options: ["この道をまっすぐ行く", "右に曲がる", "バスに乗る", "橋を渡る"],
      answer: 0,
      explanation: "「この道をまっすぐ行ってください」 = ikuti jalan ini lurus terus.",
    },
  ],
  "listen:n5:jikoshoukai": [
    {
      id: "listen-q:n5:jikoshoukai:1",
      level: "N5",
      prompt: "Apa pekerjaan Tuan Smith?",
      options: ["エンジニア", "先生", "学生", "医者"],
      answer: 0,
      explanation: "「エンジニアです」 = (saya) seorang insinyur/engineer.",
    },
  ],
  "listen:n5:shokudou": [
    {
      id: "listen-q:n5:shokudou:1",
      level: "N5",
      prompt: "Apa menu set hari ini?",
      options: ["焼き魚の定食", "カレーライス", "ラーメン", "うどん"],
      answer: 0,
      explanation: "「焼き魚の定食です」 = set makanan dengan ikan bakar.",
    },
  ],
  "listen:n5:kaidana": [
    {
      id: "listen-q:n5:kaidana:1",
      level: "N5",
      prompt: "Sepatu dijual di lantai berapa?",
      options: ["三階", "一階", "二階", "地下"],
      answer: 0,
      explanation: "「三階です」 = lantai tiga.",
    },
  ],
  "listen:n5:denwa": [
    {
      id: "listen-q:n5:denwa:1",
      level: "N5",
      prompt: "Kapan Tanaka akan menelepon lagi?",
      options: ["六時", "七時", "八時", "九時"],
      answer: 0,
      explanation: "「六時にまたかけます」 = saya telepon lagi jam enam.",
    },
  ],
  "listen:n5:tenki": [
    {
      id: "listen-q:n5:tenki:1",
      level: "N5",
      prompt: "Menurut ramalan, apa yang turun mulai sore?",
      options: ["雨", "雪", "風", "雷"],
      answer: 0,
      explanation: "「夕方から雨が降るそうですよ」 = katanya sore mulai hujan.",
    },
  ],
  "listen:n5:shuumatsu": [
    {
      id: "listen-q:n5:shuumatsu:1",
      level: "N5",
      prompt: "Di mana dan jam berapa mereka akan bertemu?",
      options: ["八時に駅", "七時に学校", "九時に公園", "十時に家"],
      answer: 0,
      explanation: "「朝八時に駅で会いましょう」 = mari bertemu jam delapan pagi di stasiun.",
    },
  ],
  "listen:n5:byouin": [
    {
      id: "listen-q:n5:byouin:1",
      level: "N5",
      prompt: "Sejak kapan pasien merasa sakit kepala?",
      options: ["昨日の夜", "今朝", "一週間前", "昨年の冬"],
      answer: 0,
      explanation: "「昨日の夜からです」 = sejak tadi malam.",
    },
  ],
  "listen:n5:kippu": [
    {
      id: "listen-q:n5:kippu:1",
      level: "N5",
      prompt: "Tiket apa yang dibeli pelanggan?",
      options: ["往復", "片道", "回数券", "特急券"],
      answer: 0,
      explanation: "「往復でお願いします」 = tiket pulang-pergi.",
    },
  ],
  "listen:n5:homestay": [
    {
      id: "listen-q:n5:homestay:1",
      level: "N5",
      prompt: "Jam berapa sarapan di rumah itu?",
      options: ["七時", "六時", "八時", "八時半"],
      answer: 0,
      explanation: "「朝ご飯は七時です」 = sarapan jam tujuh.",
    },
  ],
};
