import type { GrammarPoint } from "../types";

/**
 * Tata bahasa N5 — lanjutan (27 pola).
 * Melengkapi grammar-n5.ts (13 pola) sehingga total 40 pola N5.
 */
export const grammarN5Extra: GrammarPoint[] = [
  {
    id: "grammar:n5:kore-sore",
    title: "Kata tunjuk benda: これ / それ / あれ",
    pattern: "これ / それ / あれ / どれ は B です",
    level: "N5",
    explanation:
      "これ = ini (dekat pembicara), それ = itu (dekat lawan bicara), あれ = itu (jauh dari keduanya), どれ = yang mana.",
    examples: [
      { jp: "これは私の本です。", id: "Ini buku saya." },
      { jp: "あれは何ですか。", id: "Itu apa?" },
    ],
  },
  {
    id: "grammar:n5:kono-sono",
    title: "Kata tunjuk + benda: この / その / あの / どの",
    pattern: "この / その / あの / どの + kata benda",
    level: "N5",
    explanation:
      "Berbeda dari これ, bentuk ini selalu diikuti kata benda: この本 (buku ini), その人 (orang itu).",
    examples: [
      { jp: "このカメラは新しいです。", id: "Kamera ini baru." },
      { jp: "あの店は安いです。", id: "Toko itu murah." },
    ],
  },
  {
    id: "grammar:n5:koko-soko",
    title: "Kata tunjuk tempat: ここ / そこ / あそこ / どこ",
    pattern: "ここ / そこ / あそこ / どこ は … です",
    level: "N5",
    explanation:
      "ここ = di sini, そこ = di situ, あそこ = di sana, どこ = di mana. juga こちら / そちら / あちら / どちら untuk versi sopan.",
    examples: [
      { jp: "ここは駅です。", id: "Di sini adalah stasiun." },
      { jp: "トイレはどこですか。", id: "Di mana toilet?" },
    ],
  },
  {
    id: "grammar:n5:arimasu-imasu",
    title: "Keberadaan: あります / います",
    pattern: "tempat に benda が あります / orang が います",
    level: "N5",
    explanation:
      "あります untuk benda tak bergerak/tumbuhan, います untuk manusia dan hewan. Polanya: [tempat] に [subjek] が あります/います.",
    examples: [
      { jp: "机の上に本があります。", id: "Di atas meja ada buku." },
      { jp: "教室に学生がいます。", id: "Di kelas ada siswa." },
    ],
    notes: ["Jangan pakai います untuk benda mati."],
  },
  {
    id: "grammar:n5:ga",
    title: "Partikel subjek が",
    pattern: "… が [kata kerja / kata sifat]",
    level: "N5",
    explanation:
      "が menandai subjek, terutama informasi baru atau jawaban atas pertanyaan 'siapa/apa'. Berbeda dari は yang menandai topik yang sudah dikenal.",
    examples: [
      { jp: "誰が来ましたか。", id: "Siapa yang datang?" },
      { jp: "田中さんが来ました。", id: "Pak Tanaka yang datang." },
      { jp: "私は猫が好きです。", id: "Saya suka kucing." },
    ],
    notes: ["Untuk objek kesukaan/skill, gunakan が bukan を (猫が好き、日本語が分かる)."],
  },
  {
    id: "grammar:n5:ne-yo",
    title: "Partikel akhir ね / よ",
    pattern: "… ね / … よ",
    level: "N5",
    explanation:
      "ね meminta persetujuan ('ya kan?'), よ memberi informasi baru kepada lawan bicara.",
    examples: [
      { jp: "今日は寒いですね。", id: "Hari ini dingin, ya." },
      { jp: "あの店は美味しいですよ。", id: "Toko itu enak, lho." },
    ],
  },
  {
    id: "grammar:n5:ka",
    title: "Partikel tanya か",
    pattern: "… か。",
    level: "N5",
    explanation:
      "か di akhir kalimat mengubah pernyataan menjadi pertanyaan. Urutan kata tidak berubah, tidak perlu tanda tanya.",
    examples: [
      { jp: "日本人ですか。", id: "Apakah Anda orang Jepang?" },
      { jp: "何時に起きますか。", id: "Jam berapa kamu bangun?" },
    ],
  },
  {
    id: "grammar:n5:no",
    title: "Partikel kepemilikan の",
    pattern: "A の B",
    level: "N5",
    explanation:
      "の menghubungkan dua kata benda: kepemilikan ('milik') atau penjelas ('B tentang A').",
    examples: [
      { jp: "これは私の傘です。", id: "Ini payung saya." },
      { jp: "日本語の先生です。", id: "Guru bahasa Jepang." },
    ],
    notes: ["Jika sudah jelas, B bisa dihilangkan: これは私のです。"],
  },
  {
    id: "grammar:n5:kara-made",
    title: "Rentang: から / まで",
    pattern: "A から B まで",
    level: "N5",
    explanation:
      "から = dari (titik awal waktu/tempat), まで = sampai (titik akhir).",
    examples: [
      { jp: "九時から五時まで働きます。", id: "Bekerja dari jam sembilan sampai lima." },
      { jp: "駅から家まで歩きます。", id: "Berjalan dari stasiun sampai rumah." },
    ],
  },
  {
    id: "grammar:n5:yori",
    title: "Perbandingan: より / のほうが",
    pattern: "A は B より [kata sifat] / A のほうが B より …",
    level: "N5",
    explanation:
      "より menandai pembanding ('daripada'). のほうが menegaskan pihak yang lebih.",
    examples: [
      { jp: "東京は大阪より大きいです。", id: "Tokyo lebih besar daripada Osaka." },
      { jp: "夏より冬のほうが好きです。", id: "Saya lebih suka musim dingin daripada musim panas." },
    ],
  },
  {
    id: "grammar:n5:ichiban",
    title: "Superlatif: 一番",
    pattern: "… の中で 一番 [kata sifat]",
    level: "N5",
    explanation:
      "一番 berarti 'paling'. Dalam kelompok, gunakan の中で (di antara …).",
    examples: [
      { jp: "果物の中でりんごが一番好きです。", id: "Di antara buah-buahan, saya paling suka apel." },
      { jp: "日本で一番高い山は富士山です。", id: "Gunung tertinggi di Jepang adalah Fuji." },
    ],
  },
  {
    id: "grammar:n5:mashou",
    title: "Ajakan: ましょう",
    pattern: "[kata kerja stem] ましょう",
    level: "N5",
    explanation:
      "ましょう menyatakan ajakan/tawaran yang sudah disepakati: 'mari kita …'.",
    examples: [
      { jp: "一緒に行きましょう。", id: "Mari pergi bersama." },
      { jp: "少し休みましょう。", id: "Mari istirahat sebentar." },
    ],
  },
  {
    id: "grammar:n5:mashouka",
    title: "Tawaran: ましょうか",
    pattern: "[kata kerja stem] ましょうか",
    level: "N5",
    explanation:
      "ましょうか menawarkan bantuan kepada lawan bicara: 'mau saya bantu …?'.",
    examples: [
      { jp: "荷物を持ちましょうか。", id: "Mau saya bawakan barangnya?" },
      { jp: "窓を開けましょうか。", id: "Mau saya buka jendelanya?" },
    ],
  },
  {
    id: "grammar:n5:nai-form",
    title: "Bentuk negatif biasa: ない形",
    pattern: "[kata kerja bentuk ない]",
    level: "N5",
    explanation:
      "Bentuk negatif informal (bentuk kamus + ない). Dipakai dalam percakapan santai dan sebagai dasar pola lain (ないでください, なければなりません).",
    examples: [
      { jp: "今日は行かない。", id: "Hari ini tidak pergi." },
      { jp: "肉を食べない。", id: "Tidak makan daging." },
    ],
    notes: [
      "Golongan 1: 書く→書かない. Golongan 2: 食べる→食べない. Tidak beraturan: する→しない, 来る→来ない.",
    ],
  },
  {
    id: "grammar:n5:ta-form",
    title: "Bentuk lampau biasa: た形",
    pattern: "[kata kerja bentuk た]",
    level: "N5",
    explanation:
      "Bentuk lampau informal. Sering dipakai dalam percakapan santai dan cerita.",
    examples: [
      { jp: "昨日、映画を見た。", id: "Kemarin saya menonton film." },
      { jp: "もうご飯を食べた。", id: "Sudah makan nasi." },
    ],
    notes: ["Bentuk sopan: ました (sudah dipelajari di pola ます)."],
  },
  {
    id: "grammar:n5:naide-kudasai",
    title: "Larangan: ないでください",
    pattern: "[kata kerja bentuk ない] でください",
    level: "N5",
    explanation:
      "Berarti 'tolong jangan …'. Kebalikan dari てください.",
    examples: [
      { jp: "ここに入らないでください。", id: "Tolong jangan masuk ke sini." },
      { jp: "写真を撮らないでください。", id: "Tolong jangan mengambil foto." },
    ],
  },
  {
    id: "grammar:n5:nakereba",
    title: "Keharusan: なければなりません",
    pattern: "[kata kerja bentuk ない (hapus い)] + ければなりません",
    level: "N5",
    explanation:
      "Berarti 'harus …'. Versi percakapan: なきゃ / なくちゃ.",
    examples: [
      { jp: "明日、早く起きなければなりません。", id: "Besok harus bangun pagi." },
      { jp: "宿題をしなければなりません。", id: "Harus mengerjakan PR." },
    ],
  },
  {
    id: "grammar:n5:nakutemo",
    title: "Tidak wajib: なくてもいいです",
    pattern: "[kata kerja bentuk ない (hapus い)] + くてもいいです",
    level: "N5",
    explanation:
      "Berarti 'tidak perlu …'. Memberi izin untuk tidak melakukan sesuatu.",
    examples: [
      { jp: "明日は来なくてもいいです。", id: "Besok tidak perlu datang." },
      { jp: "今日は勉強しなくてもいいです。", id: "Hari ini tidak perlu belajar." },
    ],
  },
  {
    id: "grammar:n5:koto-ga-dekimasu",
    title: "Kemampuan: ことができます",
    pattern: "[kata kerja bentuk kamus] ことができます",
    level: "N5",
    explanation:
      "Menyatakan kemampuan melakukan sesuatu. Setara dengan bentuk potensial (できます).",
    examples: [
      { jp: "日本語を話すことができます。", id: "Saya bisa berbicara bahasa Jepang." },
      { jp: "ここで写真を撮ることができます。", id: "Di sini bisa mengambil foto." },
    ],
  },
  {
    id: "grammar:n5:no-ga-suki",
    title: "Kesukaan: のが好きです",
    pattern: "[kata kerja bentuk kamus] のが好きです",
    level: "N5",
    explanation:
      "Menyatakan kesukaan terhadap suatu kegiatan. の mengubah kata kerja menjadi kata benda.",
    examples: [
      { jp: "音楽を聞くのが好きです。", id: "Saya suka mendengarkan musik." },
      { jp: "旅行するのが好きです。", id: "Saya suka bepergian." },
    ],
  },
  {
    id: "grammar:n5:tsumori",
    title: "Niat: つもりです",
    pattern: "[kata kerja bentuk kamus / ない] つもりです",
    level: "N5",
    explanation:
      "Menyatakan rencana atau niat pembicara: 'berencana …'. Bentuk negatif: ないつもりです.",
    examples: [
      { jp: "来年、日本へ行くつもりです。", id: "Tahun depan saya berencana ke Jepang." },
      { jp: "お酒は飲まないつもりです。", id: "Saya berniat tidak minum alkohol." },
    ],
  },
  {
    id: "grammar:n5:deshou",
    title: "Dugaan: でしょう",
    pattern: "… でしょう",
    level: "N5",
    explanation:
      "Menyatakan dugaan atau kemungkinan tinggi ('mungkin/sepertinya'). Nada lebih yakin daripada かもしれません.",
    examples: [
      { jp: "明日は雨でしょう。", id: "Besok sepertinya hujan." },
      { jp: "彼はもう帰ったでしょう。", id: "Dia sepertinya sudah pulang." },
    ],
  },
  {
    id: "grammar:n5:kamo",
    title: "Kemungkinan: かもしれません",
    pattern: "… かもしれません",
    level: "N5",
    explanation:
      "Berarti 'mungkin …' dengan keyakinan rendah. Lebih ragu daripada でしょう.",
    examples: [
      { jp: "少し遅れるかもしれません。", id: "Mungkin agak terlambat." },
      { jp: "それは本当かもしれません。", id: "Itu mungkin benar." },
    ],
  },
  {
    id: "grammar:n5:nagara",
    title: "Sambil: ながら",
    pattern: "[kata kerja stem] ながら [kata kerja utama]",
    level: "N5",
    explanation:
      "Menyatakan dua aksi yang dilakukan bersamaan oleh satu orang. Aksi utama ada di akhir kalimat.",
    examples: [
      { jp: "音楽を聞きながら勉強します。", id: "Belajar sambil mendengarkan musik." },
      { jp: "コーヒーを飲みながら話しましょう。", id: "Mari bicara sambil minum kopi." },
    ],
  },
  {
    id: "grammar:n5:tari-tari",
    title: "Aksi bergantian: たり〜たり",
    pattern: "[bentuk た] り、[bentuk た] り します",
    level: "N5",
    explanation:
      "Menyebutkan beberapa kegiatan sebagai contoh ('kadang A, kadang B').",
    examples: [
      { jp: "週末は映画を見たり、買い物をしたりします。", id: "Akhir pekan saya menonton film atau berbelanja." },
      { jp: "休みの日は寝たり、本を読んだりします。", id: "Hari libur saya tidur atau membaca buku." },
    ],
  },
  {
    id: "grammar:n5:ageru-morau",
    title: "Memberi & menerima: あげる / もらう / くれる",
    pattern: "A は B に あげる / A は B に もらう / B は A に くれる",
    level: "N5",
    explanation:
      "あげる = saya/anda memberi ke orang lain; もらう = menerima; くれる = orang lain memberi kepada saya.",
    examples: [
      { jp: "友達に本をあげました。", id: "Saya memberi buku kepada teman." },
      { jp: "先生に辞書をもらいました。", id: "Saya menerima kamus dari guru." },
      { jp: "母がセーターをくれました。", id: "Ibu memberi saya sweter." },
    ],
    notes: ["Perhatikan arah: くれる selalu dari pihak lain kepada pembicara."],
  },
];
