import type { JlptLevel } from "../types";

/**
 * 文の組み立て (menyusun kalimat) khas JLPT N5.
 *
 * `prompt` selalu punya empat celah; celah ketiga ditandai ★.
 * `fragments` adalah pilihan yang ditampilkan (urutan bebas).
 * `order` adalah urutan benar sebagai indeks ke `fragments`.
 * Jawaban soal = fragmen yang jatuh di celah ★, yaitu `fragments[order[2]]`.
 */
export interface SentenceOrderItem {
  id: string;
  level: JlptLevel;
  prompt: string;
  fragments: string[];
  /** Urutan benar: empat indeks ke `fragments`. */
  order: [number, number, number, number];
  full: string;
  translation: string;
  note?: string;
}

export const sentenceOrderN5: SentenceOrderItem[] = [
  {
    id: "order:n5:photo",
    level: "N5",
    prompt: "これは きょねん わたし ＿＿ ＿＿ ★ ＿＿ ＿＿ しゃしんです。",
    fragments: ["が", "で", "海", "とった"],
    order: [0, 2, 1, 3],
    full: "これは きょねん わたしが 海で とった しゃしんです。",
    translation: "Ini foto yang saya ambil di laut tahun lalu.",
    note: "「わたしが」 menerangkan siapa yang mengambil; 「海で」 menerangkan tempat.",
  },
  {
    id: "order:n5:teacher",
    level: "N5",
    prompt: "わたしは ＿＿ ＿＿ ★ ＿＿ ＿＿ ノートに 書きました。",
    fragments: ["聞いた", "きのう", "先生に", "ことを"],
    order: [1, 2, 0, 3],
    full: "わたしは きのう 先生に 聞いた ことを ノートに 書きました。",
    translation: "Kemarin saya menulis hal yang saya dengar dari guru di buku catatan.",
    note: "「先生に聞いたこと」 = hal yang didengar dari guru.",
  },
  {
    id: "order:n5:cooking",
    level: "N5",
    prompt: "母は ＿＿ ＿＿ ★ ＿＿ ＿＿ 食べました。",
    fragments: ["全部", "料理を", "わたしが", "作った"],
    order: [2, 3, 1, 0],
    full: "母は わたしが 作った 料理を 全部 食べました。",
    translation: "Ibu menghabiskan semua masakan yang saya buat.",
    note: "「わたしが作った料理」 = masakan yang saya buat.",
  },
  {
    id: "order:n5:library",
    level: "N5",
    prompt: "きのう ＿＿ ＿＿ ★ ＿＿ ＿＿ 返しました。",
    fragments: ["本を", "図書館に", "友だちに", "借りた"],
    order: [2, 3, 0, 1],
    full: "きのう 友だちに 借りた 本を 図書館に 返しました。",
    translation: "Kemarin saya mengembalikan buku yang saya pinjam dari teman ke perpustakaan.",
    note: "「友だちに借りた本」 = buku yang dipinjam dari teman.",
  },
  {
    id: "order:n5:souvenir",
    level: "N5",
    prompt: "＿＿ ＿＿ ★ ＿＿ ＿＿ 友だちに あげました。",
    fragments: ["かわいい", "おみやげを", "日本で", "買った"],
    order: [2, 3, 0, 1],
    full: "日本で 買った かわいい おみやげを 友だちに あげました。",
    translation: "Saya memberikan oleh-oleh lucu yang dibeli di Jepang kepada teman.",
    note: "「日本で買った」 menerangkan 「おみやげ」.",
  },
  {
    id: "order:n5:rain",
    level: "N5",
    prompt: "きのうは ＿＿ ＿＿ ★ ＿＿ ＿＿ 出かけませんでした。",
    fragments: ["が", "ずっと", "雨", "ふったので"],
    order: [1, 2, 0, 3],
    full: "きのうは ずっと 雨が ふったので 出かけませんでした。",
    translation: "Kemarin tidak pergi keluar karena hujan turun terus.",
    note: "「雨がふったので」 = karena hujan turun.",
  },
  {
    id: "order:n5:ramen",
    level: "N5",
    prompt: "＿＿ ＿＿ ★ ＿＿ ＿＿ です。",
    fragments: ["安くて", "この店の", "おいしい", "ラーメンは"],
    order: [1, 3, 0, 2],
    full: "この店の ラーメンは 安くて おいしいです。",
    translation: "Ramen di toko ini murah dan enak.",
    note: "Kata sifat い dibentuk て: 安い → 安くて.",
  },
  {
    id: "order:n5:camera",
    level: "N5",
    prompt: "わたしは ＿＿ ＿＿ ★ ＿＿ ＿＿ ほしいです。",
    fragments: ["カメラ", "とても", "が", "新しい"],
    order: [1, 3, 0, 2],
    full: "わたしは とても 新しい カメラが ほしいです。",
    translation: "Saya sangat ingin kamera baru.",
    note: "Pola 「〜がほしいです」 = ingin benda.",
  },
  {
    id: "order:n5:form",
    level: "N5",
    prompt: "＿＿ ＿＿ ★ ＿＿ ＿＿ ください。",
    fragments: ["ここに", "名前と", "電話番号を", "書いて"],
    order: [0, 1, 2, 3],
    full: "ここに 名前と 電話番号を 書いて ください。",
    translation: "Tolong tulis nama dan nomor telepon di sini.",
    note: "「名前と電話番号を」 = nama dan nomor telepon (objek).",
  },
  {
    id: "order:n5:flowers",
    level: "N5",
    prompt: "わたしは ＿＿ ＿＿ ★ ＿＿ ＿＿ あげました。",
    fragments: ["母に", "きれいな", "花を", "たくさん"],
    order: [0, 1, 2, 3],
    full: "わたしは 母に きれいな 花を たくさん あげました。",
    translation: "Saya memberikan banyak bunga cantik kepada ibu.",
    note: "「母に」 = kepada ibu; 「花を」 = objek yang diberikan.",
  },
  {
    id: "order:n5:building",
    level: "N5",
    prompt: "あそこに ＿＿ ＿＿ ★ ＿＿ ＿＿ 学校です。",
    fragments: ["ある", "建物は", "わたしの", "古い"],
    order: [0, 3, 1, 2],
    full: "あそこに ある 古い 建物は わたしの 学校です。",
    translation: "Bangunan tua yang ada di sana adalah sekolah saya.",
    note: "「あそこにある古い建物」 = bangunan tua yang ada di sana.",
  },
  {
    id: "order:n5:morning",
    level: "N5",
    prompt: "わたしは 毎朝 ＿＿ ＿＿ ★ ＿＿ ＿＿ 学校へ 行きます。",
    fragments: ["ご飯を", "食べてから", "歯を", "みがいて"],
    order: [0, 1, 2, 3],
    full: "わたしは 毎朝 ご飯を 食べてから 歯を みがいて 学校へ 行きます。",
    translation: "Setiap pagi saya sarapan, lalu menyikat gigi, kemudian pergi ke sekolah.",
    note: "「〜てから」 = setelah melakukan ....",
  },
];
