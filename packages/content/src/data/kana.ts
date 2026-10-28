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
];

export const kanaRowLabels: Record<string, string> = {
  a: "Vokal",
  ka: "K / G",
  sa: "S / Z",
  ta: "T / D",
  na: "N",
  ha: "H / B / P",
  ma: "M",
  ya: "Y",
  ra: "R",
  wa: "W",
  n: "N (akhir)",
};
