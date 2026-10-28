import type { GrammarPoint } from "../types";

/**
 * Pelengkap celah tata bahasa N5 yang belum tercakup:
 * konjugasi kata sifat, bentuk て, larangan, kata tanya, bilangan, tanggal, jam.
 */
export const grammarN5Fixes: GrammarPoint[] = [
  {
    id: "grammar:n5:i-adj",
    title: "Konjugasi kata sifat い",
    pattern: "い-keiyoushi: 〜い → 〜くない / 〜かった / 〜くなかった",
    level: "N5",
    explanation:
      "Kata sifat い berubah sendiri tanpa です untuk bentuk negatif dan lampau. Akhiran い diubah: negatif 〜くない, lampau 〜かった, lampau negatif 〜くなかった.",
    examples: [
      { jp: "この本は高くないです。", id: "Buku ini tidak mahal." },
      { jp: "昨日は寒かったです。", id: "Kemarin dingin." },
      { jp: "あまり美味しくなかったです。", id: "Tidak begitu enak." },
    ],
    notes: ["Pengecualian: いい → よくない / よかった."],
  },
  {
    id: "grammar:n5:na-adj",
    title: "Konjugasi kata sifat な",
    pattern: "な-keiyoushi: 〜です / 〜じゃありません / 〜でした",
    level: "N5",
    explanation:
      "Kata sifat な tidak berubah bentuknya; perubahan terjadi pada です. Saat menerangkan kata benda, tambahkan な: 静かな部屋.",
    examples: [
      { jp: "この部屋は静かじゃありません。", id: "Kamar ini tidak tenang." },
      { jp: "昔、ここは便利でした。", id: "Dulu tempat ini praktis." },
      { jp: "きれいな花ですね。", id: "Bunganya indah, ya." },
    ],
  },
  {
    id: "grammar:n5:tewa-ikemasen",
    title: "Larangan: てはいけません",
    pattern: "[kata kerja bentuk て] は いけません",
    level: "N5",
    explanation:
      "Menyatakan larangan resmi: 'tidak boleh melakukan …'. Lebih tegas daripada ないでください.",
    examples: [
      { jp: "ここで写真を撮ってはいけません。", id: "Tidak boleh mengambil foto di sini." },
      { jp: "教室で食べてはいけません。", id: "Tidak boleh makan di kelas." },
    ],
  },
  {
    id: "grammar:n5:ga-kedo",
    title: "Pertentangan: が / けど",
    pattern: "kalimat が、kalimat / kalimat けど、kalimat",
    level: "N5",
    explanation:
      "が (sopan) dan けど (santai) berarti 'tetapi'. が juga dipakai untuk membuka percakapan dengan sopan.",
    examples: [
      { jp: "日本語は難しいですが、面白いです。", id: "Bahasa Jepang sulit, tetapi menarik." },
      { jp: "安いけど、美味しいです。", id: "Murah, tapi enak." },
    ],
  },
  {
    id: "grammar:n5:question-words",
    title: "Kata tanya: いつ / どう / いくら / どうして",
    pattern: "いつ (kapan) · どう (bagaimana) · いくら (berapa harga) · どうして (mengapa)",
    level: "N5",
    explanation:
      "Kata tanya diletakkan di posisi informasi yang ditanyakan. Tidak perlu membalik urutan kalimat.",
    examples: [
      { jp: "試験はいつですか。", id: "Kapan ujiannya?" },
      { jp: "このかばんはいくらですか。", id: "Tas ini berapa harganya?" },
      { jp: "どうして日本語を勉強しますか。", id: "Mengapa kamu belajar bahasa Jepang?" },
      { jp: "駅へはどう行きますか。", id: "Bagaimana caranya ke stasiun?" },
    ],
  },
  {
    id: "grammar:n5:counters",
    title: "Bilangan & penghitung (josuushi)",
    pattern: "angka + つ / 人 / 枚 / 本 / 台 / 匹",
    level: "N5",
    explanation:
      "Bahasa Jepang memakai kata bantu bilangan sesuai jenis benda: つ (umum), 人 (orang), 枚 (lembar/datar), 本 (batang/panjang), 台 (mesin/kendaraan), 匹 (hewan kecil).",
    examples: [
      { jp: "りんごを三つください。", id: "Tolong tiga apel." },
      { jp: "家族は四人です。", id: "Keluarga saya empat orang." },
      { jp: "切符を二枚買いました。", id: "Saya membeli dua lembar tiket." },
      { jp: "猫が二匹います。", id: "Ada dua ekor kucing." },
    ],
    notes: ["1 orang = 一人 (ひとり), 2 orang = 二人 (ふたり) — tidak beraturan."],
  },
  {
    id: "grammar:n5:dates",
    title: "Tanggal & bulan",
    pattern: "〜月 (がつ) 〜日 (にち)",
    level: "N5",
    explanation:
      "Bulan: 一月〜十二月. Tanggal 1–10 dan 20 tidak beraturan (ついたち, ふつか, みっか, よっか, いつか, むいか, なのか, ようか, ここのか, とおか, はつか).",
    examples: [
      { jp: "誕生日は四月八日です。", id: "Ulang tahun saya 8 April." },
      { jp: "五月五日は子どもの日です。", id: "5 Mei adalah Hari Anak." },
    ],
  },
  {
    id: "grammar:n5:time",
    title: "Jam & menit",
    pattern: "〜時 (じ) 〜分 (ふん/ぷん) 〜半 (はん) 〜ごろ",
    level: "N5",
    explanation:
      "Jam memakai 時, menit 分, setengah 半, kira-kira ごろ. Beberapa bacaan menit berubah: 1分 いっぷん, 3分 さんぷん, 4分 よんぷん, 6分 ろっぷん, 8分 はっぷん, 10分 じゅっぷん.",
    examples: [
      { jp: "今、七時半です。", id: "Sekarang jam setengah delapan." },
      { jp: "八時ごろ家を出ます。", id: "Saya keluar rumah sekitar jam delapan." },
    ],
  },
  {
    id: "grammar:n5:te-form",
    title: "Bentuk て & golongan kata kerja",
    pattern: "Gol.1: 書く→書いて · Gol.2: 食べる→食べて · Gol.3: する→して, 来る→来て",
    level: "N5",
    explanation:
      "Bentuk て adalah kunci banyak pola (てください, ています, てから). Kata kerja dibagi 3 golongan: Golongan 1 (akhiran u), Golongan 2 (〜eru/〜iru), Golongan 3 (する, 来る).",
    examples: [
      { jp: "書く → 書いて、飲む → 飲んで、話す → 話して", id: "Contoh perubahan bentuk て golongan 1." },
      { jp: "食べる → 食べて、見る → 見て", id: "Golongan 2: buang る, tambah て." },
    ],
    notes: [
      "Golongan 1: う/つ/る → って (買って), む/ぶ/ぬ → んで (読んで), く → いて (書いて), ぐ → いで (泳いで), す → して (話して).",
    ],
  },
];
