import type { Kana } from "../types";

/**
 * Tabel sumber kana: [romaji, hiragana, katakana, baris].
 * Satu sumber kebenaran untuk hiragana & katakana supaya tidak ada
 * kemungkinan tidak sinkron antar keduanya.
 */
const SOURCE: Array<[string, string, string, string]> = [
  ["a", "あ", "ア", "a"],
  ["i", "い", "イ", "a"],
  ["u", "う", "ウ", "a"],
  ["e", "え", "エ", "a"],
  ["o", "お", "オ", "a"],

  ["ka", "か", "カ", "ka"],
  ["ki", "き", "キ", "ka"],
  ["ku", "く", "ク", "ka"],
  ["ke", "け", "ケ", "ka"],
  ["ko", "こ", "コ", "ka"],

  ["sa", "さ", "サ", "sa"],
  ["shi", "し", "シ", "sa"],
  ["su", "す", "ス", "sa"],
  ["se", "せ", "セ", "sa"],
  ["so", "そ", "ソ", "sa"],

  ["ta", "た", "タ", "ta"],
  ["chi", "ち", "チ", "ta"],
  ["tsu", "つ", "ツ", "ta"],
  ["te", "て", "テ", "ta"],
  ["to", "と", "ト", "ta"],

  ["na", "な", "ナ", "na"],
  ["ni", "に", "ニ", "na"],
  ["nu", "ぬ", "ヌ", "na"],
  ["ne", "ね", "ネ", "na"],
  ["no", "の", "ノ", "na"],

  ["ha", "は", "ハ", "ha"],
  ["hi", "ひ", "ヒ", "ha"],
  ["fu", "ふ", "フ", "ha"],
  ["he", "へ", "ヘ", "ha"],
  ["ho", "ほ", "ホ", "ha"],

  ["ma", "ま", "マ", "ma"],
  ["mi", "み", "ミ", "ma"],
  ["mu", "む", "ム", "ma"],
  ["me", "め", "メ", "ma"],
  ["mo", "も", "モ", "ma"],

  ["ya", "や", "ヤ", "ya"],
  ["yu", "ゆ", "ユ", "ya"],
  ["yo", "よ", "ヨ", "ya"],

  ["ra", "ら", "ラ", "ra"],
  ["ri", "り", "リ", "ra"],
  ["ru", "る", "ル", "ra"],
  ["re", "れ", "レ", "ra"],
  ["ro", "ろ", "ロ", "ra"],

  ["wa", "わ", "ワ", "wa"],
  ["wo", "を", "ヲ", "wa"],
  ["n", "ん", "ン", "n"],

  // --- Dakuten (tenten) & handakuten (maru) ---
  ["ga", "が", "ガ", "ga"],
  ["gi", "ぎ", "ギ", "ga"],
  ["gu", "ぐ", "グ", "ga"],
  ["ge", "げ", "ゲ", "ga"],
  ["go", "ご", "ゴ", "ga"],

  ["za", "ざ", "ザ", "za"],
  ["ji", "じ", "ジ", "za"],
  ["zu", "ず", "ズ", "za"],
  ["ze", "ぜ", "ゼ", "za"],
  ["zo", "ぞ", "ゾ", "za"],

  ["da", "だ", "ダ", "da"],
  ["dji", "ぢ", "ヂ", "da"],
  ["dzu", "づ", "ヅ", "da"],
  ["de", "で", "デ", "da"],
  ["do", "ど", "ド", "da"],

  ["ba", "ば", "バ", "ba"],
  ["bi", "び", "ビ", "ba"],
  ["bu", "ぶ", "ブ", "ba"],
  ["be", "べ", "ベ", "ba"],
  ["bo", "ぼ", "ボ", "ba"],

  ["pa", "ぱ", "パ", "pa"],
  ["pi", "ぴ", "ピ", "pa"],
  ["pu", "ぷ", "プ", "pa"],
  ["pe", "ぺ", "ペ", "pa"],
  ["po", "ぽ", "ポ", "pa"],

  // --- Yōon (kana kecil ゃ ゅ ょ) ---
  ["kya", "きゃ", "キャ", "kya"],
  ["kyu", "きゅ", "キュ", "kya"],
  ["kyo", "きょ", "キョ", "kya"],

  ["sha", "しゃ", "シャ", "sha"],
  ["shu", "しゅ", "シュ", "sha"],
  ["sho", "しょ", "ショ", "sha"],

  ["cha", "ちゃ", "チャ", "cha"],
  ["chu", "ちゅ", "チュ", "cha"],
  ["cho", "ちょ", "チョ", "cha"],

  ["nya", "にゃ", "ニャ", "nya"],
  ["nyu", "にゅ", "ニュ", "nya"],
  ["nyo", "にょ", "ニョ", "nya"],

  ["hya", "ひゃ", "ヒャ", "hya"],
  ["hyu", "ひゅ", "ヒュ", "hya"],
  ["hyo", "ひょ", "ヒョ", "hya"],

  ["mya", "みゃ", "ミャ", "mya"],
  ["myu", "みゅ", "ミュ", "mya"],
  ["myo", "みょ", "ミョ", "mya"],

  ["rya", "りゃ", "リャ", "rya"],
  ["ryu", "りゅ", "リュ", "rya"],
  ["ryo", "りょ", "リョ", "rya"],

  ["gya", "ぎゃ", "ギャ", "gya"],
  ["gyu", "ぎゅ", "ギュ", "gya"],
  ["gyo", "ぎょ", "ギョ", "gya"],

  ["ja", "じゃ", "ジャ", "ja"],
  ["ju", "じゅ", "ジュ", "ja"],
  ["jo", "じょ", "ジョ", "ja"],

  ["bya", "びゃ", "ビャ", "bya"],
  ["byu", "びゅ", "ビュ", "bya"],
  ["byo", "びょ", "ビョ", "bya"],

  ["pya", "ぴゃ", "ピャ", "pya"],
  ["pyu", "ぴゅ", "ピュ", "pya"],
  ["pyo", "ぴょ", "ピョ", "pya"],
];

export const hiragana: Kana[] = SOURCE.map(([romaji, hira, , row]) => ({
  id: `hira:${romaji}`,
  char: hira,
  romaji,
  type: "hiragana",
  row,
}));

export const katakana: Kana[] = SOURCE.map(([romaji, , kata, row]) => ({
  id: `kata:${romaji}`,
  char: kata,
  romaji,
  type: "katakana",
  row,
}));

export const kana: Kana[] = [...hiragana, ...katakana];

/** Urutan baris untuk tampilan grid yang rapi. */
export const kanaRows: string[] = [
  "a",
  "ka",
  "sa",
  "ta",
  "na",
  "ha",
  "ma",
  "ya",
  "ra",
  "wa",
  "n",
  "ga",
  "za",
  "da",
  "ba",
  "pa",
  "kya",
  "sha",
  "cha",
  "nya",
  "hya",
  "mya",
  "rya",
  "gya",
  "ja",
  "bya",
  "pya",
];

export const kanaRowLabels: Record<string, string> = {
  a: "Vokal",
  ka: "K",
  sa: "S",
  ta: "T",
  na: "N",
  ha: "H",
  ma: "M",
  ya: "Y",
  ra: "R",
  wa: "W",
  n: "N (akhir)",
  ga: "G · dakuten",
  za: "Z / J · dakuten",
  da: "D · dakuten",
  ba: "B · dakuten",
  pa: "P · handakuten",
  kya: "Ky · yōon",
  sha: "Sh · yōon",
  cha: "Ch · yōon",
  nya: "Ny · yōon",
  hya: "Hy · yōon",
  mya: "My · yōon",
  rya: "Ry · yōon",
  gya: "Gy · yōon",
  ja: "J · yōon",
  bya: "By · yōon",
  pya: "Py · yōon",
};
