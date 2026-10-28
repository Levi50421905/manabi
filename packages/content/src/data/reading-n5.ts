import type { ReadingPassage } from "../types";

/**
 * Bacaan N5. Setiap segmen boleh punya `reading` (kana) — akan dirender
 * sebagai furigana di atas kanji.
 */
export const readingN5: ReadingPassage[] = [
  {
    id: "read:n5:ichinichi",
    title: "わたしの一日",
    level: "N5",
    segments: [
      { text: "わたしは" },
      { text: "毎朝", reading: "まいあさ" },
      { text: "六時", reading: "ろくじ" },
      { text: "に" },
      { text: "起きます。", reading: "おきます。" },
      { text: "朝ごはんを" },
      { text: "食べて", reading: "たべて" },
      { text: "、学校へ" },
      { text: "行きます。", reading: "いきます。" },
      { text: "学校で" },
      { text: "日本語", reading: "にほんご" },
      { text: "を" },
      { text: "勉強します。", reading: "べんきょうします。" },
      { text: "夜は" },
      { text: "家", reading: "いえ" },
      { text: "で" },
      { text: "本", reading: "ほん" },
      { text: "を" },
      { text: "読みます。", reading: "よみます。" },
      { text: "十一時", reading: "じゅういちじ" },
      { text: "に" },
      { text: "寝ます。", reading: "ねます。" },
    ],
    translation:
      "Saya bangun setiap pagi jam enam. Setelah makan sarapan, saya pergi ke sekolah. Di sekolah saya belajar bahasa Jepang. Malamnya saya membaca buku di rumah. Saya tidur jam sebelas.",
    questions: [
      {
        question: "何時に起きますか。",
        options: ["五時", "六時", "七時", "十一時"],
        answer: 1,
      },
      {
        question: "夜は何をしますか。",
        options: ["勉強します", "本を読みます", "テレビを見ます", "散歩します"],
        answer: 1,
      },
    ],
  },
  {
    id: "read:n5:kazoku",
    title: "わたしの家族",
    level: "N5",
    segments: [
      { text: "わたしの" },
      { text: "家族", reading: "かぞく" },
      { text: "は" },
      { text: "四人", reading: "よにん" },
      { text: "です。" },
      { text: "父", reading: "ちち" },
      { text: "と" },
      { text: "母", reading: "はは" },
      { text: "と" },
      { text: "姉", reading: "あね" },
      { text: "とわたしです。" },
      { text: "父", reading: "ちち" },
      { text: "は" },
      { text: "会社員", reading: "かいしゃいん" },
      { text: "で、" },
      { text: "母", reading: "はは" },
      { text: "は" },
      { text: "先生", reading: "せんせい" },
      { text: "です。" },
      { text: "姉", reading: "あね" },
      { text: "は" },
      { text: "大学生", reading: "だいがくせい" },
      { text: "です。みんな東京に" },
      { text: "住んでいます。", reading: "すんでいます。" },
    ],
    translation:
      "Keluarga saya ada empat orang: ayah, ibu, kakak perempuan, dan saya. Ayah pegawai perusahaan, ibu guru. Kakak perempuan saya mahasiswa. Semuanya tinggal di Tokyo.",
    questions: [
      {
        question: "家族は何人ですか。",
        options: ["三人", "四人", "五人", "六人"],
        answer: 1,
      },
      {
        question: "母の仕事は何ですか。",
        options: ["会社員", "学生", "先生", "医者"],
        answer: 2,
      },
    ],
  },
  {
    id: "read:n5:konbini",
    title: "日本のコンビニ",
    level: "N5",
    segments: [
      { text: "日本のコンビニはとても" },
      { text: "便利", reading: "べんり" },
      { text: "です。" },
      { text: "二十四時間", reading: "にじゅうよじかん" },
      { text: "開いています。", reading: "あいています。" },
      { text: "お" },
      { text: "弁当", reading: "べんとう" },
      { text: "や" },
      { text: "飲み物", reading: "のみもの" },
      { text: "を" },
      { text: "買う", reading: "かう" },
      { text: "ことができます。" },
      { text: "夜遅くても、明るくて安心です。", reading: "よるおそくても、あかるくてあんしんです。" },
    ],
    translation:
      "Minimarket di Jepang sangat praktis. Buka 24 jam. Kita bisa membeli bento dan minuman. Meski malam larut, tempatnya terang dan membuat tenang.",
    questions: [
      {
        question: "コンビニは何時間開いていますか。",
        options: ["八時間", "十二時間", "二十四時間", "六時間"],
        answer: 2,
      },
    ],
  },
];
