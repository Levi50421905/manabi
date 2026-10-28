import type { GrammarPoint } from "../types";

/** Pola tata bahasa N5 — 13 pola fondasi. */
export const grammarN5: GrammarPoint[] = [
  {
    id: "grammar:n5:desu",
    title: "Kalimat nominal: です / ではありません",
    pattern: "A は B です。",
    level: "N5",
    explanation:
      "です adalah kopula sopan (setara 'adalah'). Bentuk negatifnya ではありません (atau じゃありません untuk percakapan). Bentuk lampau: でした / ではありませんでした.",
    examples: [
      { jp: "私は学生です。", id: "Saya adalah pelajar." },
      { jp: "これは本ではありません。", id: "Ini bukan buku." },
      { jp: "昨日は日曜日でした。", id: "Kemarin adalah hari Minggu." },
    ],
    notes: ["です tidak dipakai setelah kata kerja — gunakan ます untuk kata kerja."],
  },
  {
    id: "grammar:n5:wa",
    title: "Partikel topik は",
    pattern: "A は …",
    level: "N5",
    explanation:
      "は (dibaca 'wa') menandai topik kalimat — 'mengenai A'. Topik yang sudah jelas bisa dihilangkan.",
    examples: [
      { jp: "私は日本人です。", id: "Saya orang Jepang." },
      { jp: "この店は安いです。", id: "Toko ini murah." },
    ],
    notes: ["Jangan tertukar dengan が, yang menandai subjek/pelaku baru."],
  },
  {
    id: "grammar:n5:wo",
    title: "Partikel objek を",
    pattern: "… を [kata kerja]",
    level: "N5",
    explanation:
      "を (dibaca 'o') menandai objek langsung dari kata kerja. Posisinya sebelum kata kerja.",
    examples: [
      { jp: "ご飯を食べます。", id: "Saya makan nasi." },
      { jp: "本を読みます。", id: "Saya membaca buku." },
    ],
  },
  {
    id: "grammar:n5:ni",
    title: "Partikel に (waktu, tempat, tujuan)",
    pattern: "waktu / tempat に …",
    level: "N5",
    explanation:
      "に menandai titik waktu (jam, tanggal), tempat keberadaan (dengan います/あります), dan tujuan perpindahan.",
    examples: [
      { jp: "七時に起きます。", id: "Saya bangun jam tujuh." },
      { jp: "家に猫がいます。", id: "Di rumah ada kucing." },
      { jp: "日本に行きます。", id: "Saya pergi ke Jepang." },
    ],
  },
  {
    id: "grammar:n5:de",
    title: "Partikel で (tempat aksi, alat)",
    pattern: "tempat / alat で …",
    level: "N5",
    explanation:
      "で menandai tempat terjadinya aksi (bukan sekadar keberadaan) atau alat/cara yang dipakai.",
    examples: [
      { jp: "図書館で勉強します。", id: "Saya belajar di perpustakaan." },
      { jp: "電車で行きます。", id: "Pergi dengan kereta." },
      { jp: "日本語で話します。", id: "Berbicara dalam bahasa Jepang." },
    ],
  },
  {
    id: "grammar:n5:e",
    title: "Partikel arah へ",
    pattern: "tempat へ [kata kerja perpindahan]",
    level: "N5",
    explanation:
      "へ (dibaca 'e') menandai arah tujuan, mirip に untuk perpindahan. へ lebih menekankan arah.",
    examples: [
      { jp: "学校へ行きます。", id: "Saya pergi ke sekolah." },
      { jp: "東京へ来ました。", id: "Saya datang ke Tokyo." },
    ],
  },
  {
    id: "grammar:n5:to",
    title: "Partikel と (dan, bersama)",
    pattern: "A と B / A と [kata kerja]",
    level: "N5",
    explanation:
      "と menghubungkan dua nomina secara lengkap ('dan') atau menandai lawan interaksi ('bersama').",
    examples: [
      { jp: "パンと卵を買いました。", id: "Saya membeli roti dan telur." },
      { jp: "友達と映画を見ます。", id: "Menonton film bersama teman." },
    ],
  },
  {
    id: "grammar:n5:mo",
    title: "Partikel も (juga)",
    pattern: "A も …",
    level: "N5",
    explanation: "も menggantikan は/が untuk menyatakan 'juga' atau 'juga tidak'.",
    examples: [
      { jp: "私も学生です。", id: "Saya juga pelajar." },
      { jp: "肉も魚も食べません。", id: "Saya tidak makan daging maupun ikan." },
    ],
  },
  {
    id: "grammar:n5:masu",
    title: "Bentuk sopan kata kerja ます",
    pattern: "kata kerja (stem) + ます / ません",
    level: "N5",
    explanation:
      "ます adalah bentuk sopan kata kerja untuk percakapan sehari-hari. Negatif: ません. Lampau: ました / ませんでした.",
    examples: [
      { jp: "毎日日本語を勉強します。", id: "Setiap hari saya belajar bahasa Jepang." },
      { jp: "お酒を飲みません。", id: "Saya tidak minum alkohol." },
      { jp: "昨日、映画を見ました。", id: "Kemarin saya menonton film." },
    ],
    notes: ["Golongan kata kerja menentukan cara membentuk stem — lihat catatan konjugasi."],
  },
  {
    id: "grammar:n5:te-kudasai",
    title: "Bentuk て + ください (permintaan)",
    pattern: "[kata kerja bentuk て] ください",
    level: "N5",
    explanation:
      "Bentuk て ditambah ください berarti 'tolong lakukan …'. Bentuk て juga dipakai untuk manyambung aksi.",
    examples: [
      { jp: "ちょっと待ってください。", id: "Tolong tunggu sebentar." },
      { jp: "ここに名前を書いてください。", id: "Tolong tulis nama di sini." },
    ],
  },
  {
    id: "grammar:n5:masen-ka",
    title: "Ajakan: ませんか",
    pattern: "[kata kerja] ませんか",
    level: "N5",
    explanation:
      "ませんか dipakai untuk mengajak dengan sopan: 'maukah …?'. Jawaban menerima: はい、いいですね / ええ、そうしましょう.",
    examples: [
      { jp: "一緒に昼ご飯を食べませんか。", id: "Mau makan siang bersama?" },
      { jp: "明日、映画を見ませんか。", id: "Mau nonton film besok?" },
    ],
  },
  {
    id: "grammar:n5:tai",
    title: "Keinginan: たい",
    pattern: "[stem kata kerja] たいです",
    level: "N5",
    explanation:
      "たい menyatakan keinginan pembicara sendiri. Untuk orang lain biasanya dipakai たがる.",
    examples: [
      { jp: "日本に行きたいです。", id: "Saya ingin pergi ke Jepang." },
      { jp: "何を食べたいですか。", id: "Kamu ingin makan apa?" },
    ],
  },
  {
    id: "grammar:n5:teiru",
    title: "Sedang berlangsung: ています",
    pattern: "[kata kerja bentuk て] います",
    level: "N5",
    explanation:
      "ています menyatakan aksi yang sedang berlangsung, atau keadaan hasil dari suatu aksi.",
    examples: [
      { jp: "今、本を読んでいます。", id: "Sekarang saya sedang membaca buku." },
      { jp: "東京に住んでいます。", id: "Saya tinggal di Tokyo." },
    ],
  },
];
