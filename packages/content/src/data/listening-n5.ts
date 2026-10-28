import type { ListeningTrack } from "../types";

/** Dialog listening N5 — diputar lewat Web Speech API (TTS) di browser. */
export const listeningN5: ListeningTrack[] = [
  {
    id: "listen:n5:aisatsu",
    title: "あいさつ — Salam Perkenalan",
    level: "N5",
    description: "Dialog salam pagi sampai malam, dengan bentuk sopan.",
    lines: [
      { speaker: "田中", jp: "おはようございます。", kana: "おはようございます。", id: "1" },
      { speaker: "マリア", jp: "おはようございます。", kana: "おはようございます。", id: "2" },
      { speaker: "田中", jp: "いい天気ですね。", kana: "いいてんきですね。", id: "3" },
      { speaker: "マリア", jp: "そうですね。今日は暖かいです。", kana: "そうですね。きょうはあたたかいです。", id: "4" },
      { speaker: "田中", jp: "では、また後で。", kana: "では、またあとで。", id: "5" },
      { speaker: "マリア", jp: "失礼します。", kana: "しつれいします。", id: "6" },
    ],
  },
  {
    id: "listen:n5:cafe",
    title: "カフェで注文 — Memesan di Kafe",
    level: "N5",
    description: "Memesan minuman dan makanan di kafe, plus menanyakan harga.",
    lines: [
      { speaker: "店員", jp: "いらっしゃいませ。", kana: "いらっしゃいませ。", id: "1" },
      { speaker: "客", jp: "コーヒーを一つください。", kana: "コーヒーをひとつください。", id: "2" },
      { speaker: "店員", jp: "はい、かしこまりました。", kana: "はい、かしこまりました。", id: "3" },
      { speaker: "客", jp: "あのう、ケーキもありますか。", kana: "あのう、ケーキもありますか。", id: "4" },
      { speaker: "店員", jp: "はい、ありますよ。", kana: "はい、ありますよ。", id: "5" },
      { speaker: "客", jp: "じゃあ、チーズケーキもお願いします。", kana: "じゃあ、チーズケーキもおねがいします。", id: "6" },
      { speaker: "店員", jp: "全部で九百円です。", kana: "ぜんぶできゅうひゃくえんです。", id: "7" },
    ],
  },
  {
    id: "listen:n5:michi",
    title: "道を聞く — Menanyakan Jalan",
    level: "N5",
    description: "Bertanya arah ke stasiun dan memahami petunjuk sederhana.",
    lines: [
      { speaker: "旅行者", jp: "すみません、駅はどこですか。", kana: "すみません、えきはどこですか。", id: "1" },
      { speaker: "通行人", jp: "駅ですか。この道をまっすぐ行ってください。", kana: "えきですか。このみちをまっすぐいってください。", id: "2" },
      { speaker: "旅行者", jp: "まっすぐですか。ありがとうございます。", kana: "まっすぐですか。ありがとうございます。", id: "3" },
      { speaker: "通行人", jp: "ええ。そこに信号があります。その先です。", kana: "ええ。そこにしんごうがあります。そのさきです。", id: "4" },
      { speaker: "旅行者", jp: "分かりました。助かりました。", kana: "わかりました。たすかりました。", id: "5" },
    ],
  },
  {
    id: "listen:n5:jikoshoukai",
    title: "自己紹介 — Perkenalan Diri",
    level: "N5",
    description: "Memperkenalkan nama, asal, pekerjaan, dan kesukaan.",
    lines: [
      { speaker: "スミス", jp: "はじめまして。スミスです。", kana: "はじめまして。スミスです。", id: "1" },
      { speaker: "佐藤", jp: "はじめまして。佐藤です。どうぞよろしく。", kana: "はじめまして。さとうです。どうぞよろしく。", id: "2" },
      { speaker: "スミス", jp: "アメリカから来ました。", kana: "アメリカからきました。", id: "3" },
      { speaker: "佐藤", jp: "お仕事は何ですか。", kana: "おしごとはなんですか。", id: "4" },
      { speaker: "スミス", jp: "エンジニアです。日本語を勉強しています。", kana: "エンジニアです。にほんごをべんきょうしています。", id: "5" },
      { speaker: "佐藤", jp: "そうですか。頑張ってください。", kana: "そうですか。がんばってください。", id: "6" },
    ],
  },
];
