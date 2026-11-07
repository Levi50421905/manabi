import type { Particle, ParticleComparison, ParticlePitfall, ParticleQuestion } from "../types";

/**
 * Partikel dasar JLPT N5.
 *
 * `examples[].target` adalah potongan kalimat yang berakhir dengan partikel yang
 * dibahas — dipakai `apps/web/lib/partikel.ts` untuk membuat soal isi celah
 * otomatis, sehingga menambah contoh di sini otomatis menambah bank soal.
 */
export const particlesN5: Particle[] = [
  {
    id: "partikel:n5:wa",
    char: "は",
    romaji: "wa",
    level: "N5",
    tier: "dasar",
    role: "penanda topik",
    explanation:
      "は (dibaca “wa”) menandai topik yang sedang dibicarakan — biasanya sesuatu yang sudah diketahui pendengar. Setelah は, kalimat menjelaskan sesuatu tentang topik itu.",
    examples: [
      { jp: "わたしは学生です。", id: "Saya pelajar.", target: "わたしは", note: "Topiknya “saya”, lalu dijelaskan status saya." },
      { jp: "この店は安いです。", id: "Toko ini murah.", target: "この店は" },
      { jp: "きょうは日曜日です。", id: "Hari ini hari Minggu.", target: "きょうは" },
    ],
    cautions: ["Jangan tertukar dengan が: は untuk topik yang sudah jelas, が untuk menekankan pelaku baru."],
  },
  {
    id: "partikel:n5:ga",
    char: "が",
    romaji: "ga",
    level: "N5",
    tier: "dasar",
    role: "penanda subjek",
    explanation:
      "が menandai subjek kalimat, terutama ketika informasinya baru atau ingin ditekankan. Pada kalimat tanya seperti “siapa yang…”, jawabannya memakai が.",
    examples: [
      { jp: "ねこがいます。", id: "Ada kucing.", target: "ねこが", note: "Yang pertama kali disebut adalah kucing, jadi memakai が." },
      { jp: "だれが来ますか。", id: "Siapa yang datang?", target: "だれが" },
      { jp: "田中さんが先生です。", id: "Tanaka-lah yang guru.", target: "田中さんが" },
    ],
    cautions: ["Kata 好き, 分かる, 上手 memakai が untuk hal yang disukai/dipahami, bukan を."],
  },
  {
    id: "partikel:n5:wo",
    char: "を",
    romaji: "o",
    level: "N5",
    tier: "dasar",
    role: "penanda objek langsung",
    explanation:
      "を (dibaca “o”) menandai objek langsung dari kata kerja — apa yang dikenai tindakan. Posisinya sebelum kata kerja.",
    examples: [
      { jp: "ごはんを食べます。", id: "Saya makan nasi.", target: "ごはんを" },
      { jp: "本を読みます。", id: "Saya membaca buku.", target: "本を" },
      { jp: "音楽を聞きます。", id: "Saya mendengarkan musik.", target: "音楽を" },
    ],
    cautions: ["Kata kerja perpindahan yang meninggalkan tempat juga memakai を: 家を出ます."],
  },
  {
    id: "partikel:n5:ni",
    char: "に",
    romaji: "ni",
    level: "N5",
    tier: "dasar",
    role: "waktu, tujuan, keberadaan",
    explanation:
      "に menandai titik waktu yang spesifik (jam, tanggal), tujuan perpindahan, dan tempat keberadaan saat memakai います / あります.",
    examples: [
      { jp: "七時に起きます。", id: "Saya bangun jam tujuh.", target: "七時に", note: "Waktu yang spesifik selalu memakai に." },
      { jp: "学校に行きます。", id: "Saya pergi ke sekolah.", target: "学校に" },
      { jp: "家にねこがいます。", id: "Di rumah ada kucing.", target: "家に", note: "Keberadaan memakai に, bukan で." },
    ],
    cautions: ["Untuk tempat berlangsungnya aktivitas pakai で, bukan に."],
  },
  {
    id: "partikel:n5:de",
    char: "で",
    romaji: "de",
    level: "N5",
    tier: "dasar",
    role: "tempat aktivitas, alat",
    explanation:
      "で menandai tempat terjadinya tindakan (bukan sekadar keberadaan) dan alat atau cara yang dipakai untuk melakukan sesuatu.",
    examples: [
      { jp: "学校で勉強します。", id: "Saya belajar di sekolah.", target: "学校で", note: "Belajar adalah aktivitas, jadi memakai で." },
      { jp: "電車で行きます。", id: "Pergi dengan kereta.", target: "電車で", note: "Kereta adalah alat." },
      { jp: "日本語で話します。", id: "Berbicara dalam bahasa Jepang.", target: "日本語で" },
    ],
    cautions: ["Jangan pakai で untuk keberadaan: 家にいます (bukan 家でいます)."],
  },
  {
    id: "partikel:n5:e",
    char: "へ",
    romaji: "e",
    level: "N5",
    tier: "inti",
    role: "arah tujuan",
    explanation:
      "へ (dibaca “e”) menandai arah perpindahan. Artinya mirip に untuk tujuan, tetapi へ lebih menekankan arah perjalanan daripada titik akhirnya.",
    examples: [
      { jp: "日本へ行きます。", id: "Saya pergi ke Jepang.", target: "日本へ" },
      { jp: "学校へ来ました。", id: "Saya datang ke sekolah.", target: "学校へ" },
      { jp: "東京へ帰ります。", id: "Saya pulang ke Tokyo.", target: "東京へ" },
    ],
    cautions: ["Untuk tujuan perpindahan, に dan へ hampir selalu bisa menggantikan satu sama lain."],
  },
  {
    id: "partikel:n5:no",
    char: "の",
    romaji: "no",
    level: "N5",
    tier: "inti",
    role: "kepemilikan & penghubung",
    explanation:
      "の menghubungkan dua kata benda. Gunanya bisa kepemilikan (“milik”), asal, bahan, atau sekadar menerangkan kata benda di belakangnya.",
    examples: [
      { jp: "わたしの本です。", id: "Ini buku saya.", target: "わたしの" },
      { jp: "日本語の先生。", id: "Guru bahasa Jepang.", target: "日本語の" },
      { jp: "これは田中さんのかばんです。", id: "Ini tas Tanaka.", target: "田中さんの" },
    ],
    cautions: ["Urutan penting: pemilik dulu, baru の, baru benda yang dimiliki."],
  },
  {
    id: "partikel:n5:to",
    char: "と",
    romaji: "to",
    level: "N5",
    tier: "inti",
    role: "dan, bersama",
    explanation:
      "と menyambung dua kata benda secara lengkap (“A dan B”) dan menandai lawan yang melakukan sesuatu bersama kita.",
    examples: [
      { jp: "友だちと映画を見ます。", id: "Menonton film bersama teman.", target: "友だちと", note: "Di sini と berarti “bersama”." },
      { jp: "パンとたまごを買いました。", id: "Saya membeli roti dan telur.", target: "パンと" },
      { jp: "父と母が来ます。", id: "Ayah dan ibu datang.", target: "父と" },
    ],
  },
  {
    id: "partikel:n5:mo",
    char: "も",
    romaji: "mo",
    level: "N5",
    tier: "inti",
    role: "juga",
    explanation:
      "も menggantikan は atau が untuk menyatakan “juga”. Jika ingin mengatakan hal yang sama berlaku untuk subjek lain, pakai も.",
    examples: [
      { jp: "わたしも学生です。", id: "Saya juga pelajar.", target: "わたしも" },
      { jp: "これもおいしいです。", id: "Ini juga enak.", target: "これも" },
      { jp: "日曜日も働きます。", id: "Hari Minggu pun saya bekerja.", target: "日曜日も" },
    ],
    cautions: ["も tidak digabung dengan は; pilih salah satu."],
  },
  {
    id: "partikel:n5:ka",
    char: "か",
    romaji: "ka",
    level: "N5",
    tier: "inti",
    role: "pertanyaan & pilihan",
    explanation:
      "か di akhir kalimat menjadikannya pertanyaan. Di tengah kalimat, か menghubungkan dua pilihan (“A atau B”).",
    examples: [
      { jp: "学生ですか。", id: "Apakah Anda pelajar?", target: "学生ですか" },
      { jp: "コーヒーか紅茶を飲みます。", id: "Minum kopi atau teh.", target: "コーヒーか" },
      { jp: "どこに行きますか。", id: "Mau pergi ke mana?", target: "行きますか" },
    ],
    cautions: ["Dalam percakapan santai, か di akhir kalimat bisa terdengar tegas; naikkan intonasi sebagai gantinya."],
  },
  {
    id: "partikel:n5:kara",
    char: "から",
    romaji: "kara",
    level: "N5",
    tier: "menengah",
    role: "dari, karena",
    explanation:
      "から punya dua fungsi: menandai titik awal (waktu atau tempat) dan menyatakan sebab (“karena”). Bedanya dengan ので: から lebih langsung.",
    examples: [
      { jp: "九時から勉強します。", id: "Belajar mulai jam sembilan.", target: "九時から" },
      { jp: "日本から来ました。", id: "Saya datang dari Jepang.", target: "日本から" },
      { jp: "雨だから行きません。", id: "Karena hujan, saya tidak pergi.", target: "雨だから" },
    ],
  },
  {
    id: "partikel:n5:made",
    char: "まで",
    romaji: "made",
    level: "N5",
    tier: "menengah",
    role: "sampai",
    explanation:
      "まで menandai batas akhir, baik waktu maupun tempat. Sering berpasangan dengan から: から … まで …",
    examples: [
      { jp: "五時まで働きます。", id: "Bekerja sampai jam lima.", target: "五時まで" },
      { jp: "駅まで歩きます。", id: "Berjalan sampai stasiun.", target: "駅まで" },
      { jp: "月曜日から金曜日まで学校です。", id: "Dari Senin sampai Jumat ada sekolah.", target: "金曜日まで" },
    ],
  },
  {
    id: "partikel:n5:ya",
    char: "や",
    romaji: "ya",
    level: "N5",
    tier: "menengah",
    role: "dan (antara lain)",
    explanation:
      "や menyebutkan beberapa contoh dari sekumpulan benda, dengan nuansa “antara lain”. Berbeda dengan と yang berarti daftarnya lengkap.",
    examples: [
      { jp: "本やペンを買います。", id: "Membeli buku, pulpen, dan lain-lain.", target: "本や" },
      { jp: "りんごやバナナがあります。", id: "Ada apel, pisang, dan sebagainya.", target: "りんごや" },
      { jp: "コーヒーや紅茶が好きです。", id: "Saya suka kopi, teh, dan yang semacamnya.", target: "コーヒーや" },
    ],
    cautions: ["Kalau daftarnya memang hanya dua dan lengkap, pakai と."],
  },
  {
    id: "partikel:n5:ne",
    char: "ね",
    romaji: "ne",
    level: "N5",
    tier: "menengah",
    role: "meminta persetujuan",
    explanation:
      "ね di akhir kalimat mencari persetujuan pendengar, seperti “ya kan?”. Nada kalimatnya naik sedikit.",
    examples: [
      { jp: "いいですね。", id: "Bagus, ya.", target: "いいですね" },
      { jp: "今日は寒いですね。", id: "Hari ini dingin, ya.", target: "寒いですね" },
      { jp: "おいしいですね。", id: "Enak, ya.", target: "おいしいですね" },
    ],
  },
  {
    id: "partikel:n5:yo",
    char: "よ",
    romaji: "yo",
    level: "N5",
    tier: "menengah",
    role: "penegasan & informasi baru",
    explanation:
      "よ menegaskan pendapat atau memberi tahu hal yang belum diketahui pendengar. Berbeda dengan ね yang mencari persetujuan.",
    examples: [
      { jp: "おいしいですよ。", id: "Enak, lho.", target: "おいしいですよ" },
      { jp: "あの店は安いですよ。", id: "Toko itu murah, lho.", target: "安いですよ" },
      { jp: "明日は休みですよ。", id: "Besok libur, lho.", target: "休みですよ" },
    ],
  },
  {
    id: "partikel:n5:yori",
    char: "より",
    romaji: "yori",
    level: "N5",
    tier: "menengah",
    role: "perbandingan",
    explanation:
      "より menandai pembanding dalam kalimat perbandingan. Polanya: A は B より … = A lebih … daripada B.",
    examples: [
      { jp: "夏より冬が好きです。", id: "Saya lebih suka musim dingin daripada musim panas.", target: "夏より" },
      { jp: "電車より歩くほうが速いです。", id: "Jalan kaki lebih cepat daripada naik kereta.", target: "電車より" },
      { jp: "今年は去年より暑いです。", id: "Tahun ini lebih panas daripada tahun lalu.", target: "去年より" },
    ],
  },
  {
    id: "partikel:n5:hodo",
    char: "ほど",
    romaji: "hodo",
    level: "N5",
    tier: "menengah",
    role: "sebatas, sejauh",
    explanation:
      "ほど menyatakan tingkat atau perkiraan. Dalam bentuk negatif (ほど〜ない) artinya “tidak se…”. Bisa juga untuk perkiraan jumlah.",
    examples: [
      { jp: "駅まで十分ほどかかります。", id: "Ke stasiun sekitar sepuluh menit.", target: "十分ほど" },
      { jp: "それほど高くないです。", id: "Tidak semahal itu.", target: "それほど" },
      { jp: "今日は昨日ほど寒くないです。", id: "Hari ini tidak sedingin kemarin.", target: "昨日ほど" },
    ],
    cautions: ["Pola “A は B ほど … ない” sering tertukar dengan より. より dipakai untuk menyatakan lebih, ほど untuk tidak se-."],
  },
  {
    id: "partikel:n5:dake",
    char: "だけ",
    romaji: "dake",
    level: "N5",
    tier: "menengah",
    role: "hanya",
    explanation:
      "だけ menandai batas: “hanya” atau “sekadar”. Bisa mengikuti kata benda, jumlah, atau kata kerja.",
    examples: [
      { jp: "水だけ飲みます。", id: "Saya hanya minum air.", target: "水だけ" },
      { jp: "一人だけ来ました。", id: "Hanya satu orang yang datang.", target: "一人だけ" },
      { jp: "少しだけ休みます。", id: "Saya beristirahat sebentar saja.", target: "少しだけ" },
    ],
    cautions: ["だけ menekankan batas atas; しか dipakai dengan bentuk negatif dan menekankan kekurangan."],
  },
];

/**
 * Pasangan partikel yang paling sering tertukar. Dipakai di halaman belajar
 * maupun sebagai sumber soal mode “pasangan”.
 */
export const particleComparisonsN5: ParticleComparison[] = [
  {
    id: "pasangan:wa-ga",
    title: "は vs が",
    question: "Topik yang sudah dibicarakan, atau pelaku yang ingin ditekankan?",
    left: {
      particleId: "partikel:n5:wa",
      char: "は",
      summary: "Menandai topik yang sudah diketahui pendengar. Fokus kalimat ada pada keterangan setelahnya.",
      examples: [
        { jp: "わたしは学生です。", id: "Saya pelajar.", target: "わたしは", note: "Yang ditanyakan: kamu apa? Jawabannya: pelajar." },
        { jp: "田中さんは先生です。", id: "Tanaka adalah guru.", target: "田中さんは" },
      ],
    },
    right: {
      particleId: "partikel:n5:ga",
      char: "が",
      summary: "Menandai subjek/pelaku, terutama informasi baru atau yang ingin ditekankan.",
      examples: [
        { jp: "田中さんが先生です。", id: "Tanaka-lah yang guru.", target: "田中さんが", note: "Dari beberapa orang, Tanaka-lah gurunya." },
        { jp: "だれが来ますか。", id: "Siapa yang datang?", target: "だれが" },
      ],
    },
    takeaway: "Kalau informasi pelaku baru, pakai が. Kalau sudah sama-sama tahu topiknya, pakai は.",
  },
  {
    id: "pasangan:ni-de",
    title: "に vs で",
    question: "Tempat keberadaan, atau tempat berlangsungnya aktivitas?",
    left: {
      particleId: "partikel:n5:ni",
      char: "に",
      summary: "Titik keberadaan (dengan います / あります) dan titik waktu.",
      examples: [
        { jp: "学校にいます。", id: "Saya berada di sekolah.", target: "学校に" },
        { jp: "七時に起きます。", id: "Bangun jam tujuh.", target: "七時に" },
      ],
    },
    right: {
      particleId: "partikel:n5:de",
      char: "で",
      summary: "Tempat terjadinya aktivitas, serta alat/cara.",
      examples: [
        { jp: "学校で勉強します。", id: "Belajar di sekolah.", target: "学校で" },
        { jp: "電車で行きます。", id: "Pergi dengan kereta.", target: "電車で" },
      ],
    },
    takeaway: "Ada di sana? に. Sedang melakukan sesuatu di sana? で.",
  },
  {
    id: "pasangan:ni-e",
    title: "に vs へ",
    question: "Titik tujuan, atau arah perjalanan?",
    left: {
      particleId: "partikel:n5:ni",
      char: "に",
      summary: "Menekankan titik akhir tujuan.",
      examples: [{ jp: "日本に行きます。", id: "Pergi ke Jepang.", target: "日本に" }],
    },
    right: {
      particleId: "partikel:n5:e",
      char: "へ",
      summary: "Menekankan arah perjalanan menuju tujuan.",
      examples: [{ jp: "日本へ行きます。", id: "Pergi ke arah Jepang.", target: "日本へ" }],
    },
    takeaway: "Untuk perpindahan, keduanya biasanya bisa saling menggantikan. Bedanya hanya nuansa penekanan.",
  },
  {
    id: "pasangan:wa-mo",
    title: "は vs も",
    question: "Topik biasa, atau “juga” seperti yang sebelumnya?",
    left: {
      particleId: "partikel:n5:wa",
      char: "は",
      summary: "Topik netral.",
      examples: [{ jp: "わたしは学生です。", id: "Saya pelajar.", target: "わたしは" }],
    },
    right: {
      particleId: "partikel:n5:mo",
      char: "も",
      summary: "Menggantikan は/が ketika hal yang sama berlaku untuk topik ini juga.",
      examples: [{ jp: "わたしも学生です。", id: "Saya juga pelajar.", target: "わたしも" }],
    },
    takeaway: "も menggantikan は — jangan menulis わたしはも.",
  },
  {
    id: "pasangan:wo-ga",
    title: "を vs が",
    question: "Objek dari tindakan, atau hal yang disukai/dipahami?",
    left: {
      particleId: "partikel:n5:wo",
      char: "を",
      summary: "Objek dari kata kerja tindakan.",
      examples: [{ jp: "音楽を聞きます。", id: "Mendengarkan musik.", target: "音楽を" }],
    },
    right: {
      particleId: "partikel:n5:ga",
      char: "が",
      summary: "Dipakai untuk 好き, 分かる, 上手, ほしい — bukan objek tindakan.",
      examples: [{ jp: "音楽が好きです。", id: "Saya suka musik.", target: "音楽が" }],
    },
    takeaway: "好き dan 分かる bukan tindakan, jadi memakai が.",
  },
  {
    id: "pasangan:to-ya",
    title: "と vs や",
    question: "Daftar lengkap, atau beberapa contoh saja?",
    left: {
      particleId: "partikel:n5:to",
      char: "と",
      summary: "Menyambung daftar yang lengkap: hanya itu.",
      examples: [{ jp: "パンとたまごを買いました。", id: "Membeli roti dan telur.", target: "パンと" }],
    },
    right: {
      particleId: "partikel:n5:ya",
      char: "や",
      summary: "Menyebut sebagian contoh: “antara lain”.",
      examples: [{ jp: "パンやたまごを買いました。", id: "Membeli roti, telur, dan lain-lain.", target: "パンや" }],
    },
    takeaway: "Lengkap dan hanya itu → と. Contoh dan masih ada yang lain → や.",
  },
];

/** Jebakan khusus yang tidak tercakup sebagai partikel tunggal. */
export const particlePitfallsN5: ParticlePitfall[] = [
  {
    id: "jebakan:suki-ga",
    title: "好き dan 分かる memakai が",
    particles: ["が", "を"],
    summary:
      "Dalam bahasa Indonesia “menyukai” terasa seperti tindakan, jadi pembelajar cenderung memakai を. Dalam bahasa Jepang, 好き, 分かる, 上手, ほしい adalah keadaan, sehingga penandanya が.",
    wrong: { jp: "音楽を好きです。", id: "Saya suka musik." },
    right: { jp: "音楽が好きです。", id: "Saya suka musik." },
    note: "Kalau ingin memakai を, ubah kata kerjanya: 音楽を好む (bentuk yang lebih formal).",
  },
  {
    id: "jebakan:zokuzai-ni",
    title: "Keberadaan memakai に",
    particles: ["に", "で"],
    summary:
      "Tempat berlangsungnya aktivitas memakai で, tetapi tempat keberadaan (います / あります) memakai に. Ini sumber kesalahan paling umum.",
    wrong: { jp: "家でねこがいます。", id: "Di rumah ada kucing." },
    right: { jp: "家にねこがいます。", id: "Di rumah ada kucing." },
    note: "Uji cepat: kalau ada います/あります dan tidak ada tindakan, pakai に.",
  },
  {
    id: "jebakan:deru-wo",
    title: "Meninggalkan tempat memakai を",
    particles: ["を", "から"],
    summary:
      "Kata kerja yang meninggalkan tempat (出ます, 卒業します, 降ります) memakai を walaupun bukan objek tindakan.",
    wrong: { jp: "七時に家から出ます。", id: "Keluar rumah jam tujuh." },
    right: { jp: "七時に家を出ます。", id: "Keluar rumah jam tujuh." },
    note: "から juga dipakai untuk titik awal, tetapi dengan 出ます bentuk yang wajar adalah を.",
  },
  {
    id: "jebakan:ni-e",
    title: "に dan へ sering saling menggantikan",
    particles: ["に", "へ"],
    summary:
      "Untuk tujuan perpindahan, keduanya benar. Jangan menghabiskan waktu memilih ketika keduanya diterima — yang penting bukan で.",
    wrong: { jp: "学校で行きます。", id: "Pergi ke sekolah." },
    right: { jp: "学校に行きます。", id: "Pergi ke sekolah." },
    note: "学校へ行きます juga benar. で salah karena 行きます bukan aktivitas di tempat itu.",
  },
];

/**
 * Soal isi celah yang ditulis tangan. Dipakai apa adanya, sementara contoh pada
 * tiap partikel juga diubah menjadi soal oleh `lib/partikel.ts`.
 */
export const particleQuestionsN5: ParticleQuestion[] = [
  {
    id: "soal:isi:1",
    mode: "isi-celah",
    prompt: "わたし ___ インドネシア人です。",
    promptId: "Saya orang Indonesia.",
    answer: "は",
    options: ["は", "を", "で"],
    explanation: "“わたし” adalah topik yang dibicarakan, jadi memakai は.",
    wrongNotes: {
      "を": "を menandai objek tindakan; kalimat ini tidak punya kata kerja tindakan.",
      "で": "で menandai tempat aktivitas atau alat.",
    },
  },
  {
    id: "soal:isi:2",
    mode: "isi-celah",
    prompt: "毎日、七時 ___ 起きます。",
    promptId: "Setiap hari saya bangun jam tujuh.",
    answer: "に",
    options: ["で", "に", "を"],
    explanation: "Waktu yang spesifik memakai に.",
    wrongNotes: {
      "で": "で untuk tempat aktivitas atau alat, bukan titik waktu.",
      "を": "を menandai objek tindakan.",
    },
  },
  {
    id: "soal:isi:3",
    mode: "isi-celah",
    prompt: "学校 ___ 日本語を勉強します。",
    promptId: "Saya belajar bahasa Jepang di sekolah.",
    answer: "で",
    options: ["で", "に", "へ"],
    explanation: "Belajar adalah aktivitas yang berlangsung di sekolah, jadi memakai で.",
    wrongNotes: {
      "に": "に menandai keberadaan atau tujuan, bukan tempat aktivitas.",
      "へ": "へ menandai arah perpindahan.",
    },
  },
  {
    id: "soal:isi:4",
    mode: "isi-celah",
    prompt: "パン ___ 食べます。",
    promptId: "Saya makan roti.",
    answer: "を",
    options: ["が", "を", "に"],
    explanation: "Roti adalah objek langsung dari 食べます, jadi memakai を.",
    wrongNotes: {
      "が": "が menandai subjek, bukan objek tindakan.",
      "に": "に menandai waktu, tujuan, atau keberadaan.",
    },
  },
  {
    id: "soal:isi:5",
    mode: "isi-celah",
    prompt: "友だち ___ 映画を見ます。",
    contextBefore: "ひとりで見ません。いつも同じ人と行きます。",
    promptId: "Menonton film bersama teman.",
    answer: "と",
    options: ["と", "の", "も"],
    explanation: "と di sini berarti “bersama”.",
    wrongNotes: {
      "の": "の menghubungkan dua kata benda, bukan menyatakan “bersama”.",
      "も": "も berarti “juga”.",
    },
  },
  {
    id: "soal:isi:6",
    mode: "isi-celah",
    prompt: "わたし ___ コーヒーも好きです。",
    promptId: "Saya juga suka kopi.",
    answer: "も",
    options: ["を", "も", "へ"],
    explanation: "も menyatakan “juga”, menggantikan は.",
    wrongNotes: {
      "を": "を menandai objek tindakan.",
      "へ": "へ menandai arah perpindahan.",
    },
  },
  {
    id: "soal:isi:7",
    mode: "isi-celah",
    prompt: "日本 ___ 行きます。",
    promptId: "Saya pergi ke Jepang.",
    answer: "へ",
    options: ["を", "で", "へ"],
    explanation: "へ menandai arah tujuan. に juga benar.",
    wrongNotes: {
      "を": "を menandai objek tindakan.",
      "で": "で menandai tempat aktivitas atau alat.",
    },
  },
  {
    id: "soal:isi:8",
    mode: "isi-celah",
    prompt: "これはわたし ___ 本です。",
    promptId: "Ini buku saya.",
    answer: "の",
    options: ["の", "が", "に"],
    explanation: "の menyatakan kepemilikan.",
    wrongNotes: {
      "が": "が menandai subjek, bukan kepemilikan.",
      "に": "に menandai waktu, tujuan, atau keberadaan.",
    },
  },
  {
    id: "soal:isi:9",
    mode: "isi-celah",
    prompt: "家 ___ ねこがいます。",
    promptId: "Di rumah ada kucing.",
    answer: "に",
    options: ["で", "に", "を"],
    explanation: "Keberadaan (います) memakai に.",
    wrongNotes: {
      "で": "で untuk tempat aktivitas; います bukan aktivitas.",
      "を": "を menandai objek tindakan.",
    },
  },
  {
    id: "soal:isi:10",
    mode: "isi-celah",
    prompt: "音楽 ___ 好きです。",
    promptId: "Saya suka musik.",
    answer: "が",
    options: ["を", "が", "で"],
    explanation: "好き adalah keadaan, jadi hal yang disukai memakai が.",
    wrongNotes: {
      "を": "を dipakai untuk objek tindakan; 好き bukan tindakan.",
      "で": "で menandai tempat aktivitas atau alat.",
    },
  },
  {
    id: "soal:isi:11",
    mode: "isi-celah",
    prompt: "九時 ___ 勉強します。",
    contextBefore: "授業は九時に始まります。",
    promptId: "Belajar mulai jam sembilan.",
    answer: "から",
    options: ["から", "まで", "より"],
    explanation: "から menandai titik awal waktu.",
    wrongNotes: {
      "まで": "まで menandai batas akhir, bukan awal.",
      "より": "より dipakai untuk perbandingan.",
    },
  },
  {
    id: "soal:isi:12",
    mode: "isi-celah",
    prompt: "五時 ___ 働きます。",
    contextBefore: "仕事は五時に終わります。",
    promptId: "Bekerja sampai jam lima.",
    answer: "まで",
    options: ["まで", "から", "ほど"],
    explanation: "まで menandai batas akhir.",
    wrongNotes: {
      "から": "から menandai titik awal.",
      "ほど": "ほど menyatakan perkiraan atau tingkat.",
    },
  },
  {
    id: "soal:isi:13",
    mode: "isi-celah",
    prompt: "本 ___ ペンなどを買いました。",
    promptId: "Membeli buku, pulpen, dan lain-lain.",
    answer: "や",
    options: ["や", "と", "も"],
    explanation: "や menyebut beberapa contoh, bukan daftar lengkap.",
    wrongNotes: {
      "と": "と berarti daftarnya lengkap dan hanya itu.",
      "も": "も berarti “juga”.",
    },
  },
  {
    id: "soal:isi:14",
    mode: "isi-celah",
    prompt: "本当においしいです ___ 。",
    contextBefore: "A：このケーキ、おいしいですね。 B：ええ、",
    promptId: "Sungguh enak, ya.",
    answer: "ね",
    options: ["ね", "よ", "か"],
    explanation: "ね mencari persetujuan pendengar, seperti “ya kan?”.",
    wrongNotes: {
      "よ": "よ memberi informasi baru, bukan mencari persetujuan.",
      "か": "か menjadikannya pertanyaan.",
    },
  },
  {
    id: "soal:isi:15",
    mode: "isi-celah",
    prompt: "でも、あの店は安いです ___ 。",
    contextBefore: "A：あの店を知っていますか。 B：いいえ、知りません。",
    promptId: "Tapi toko itu murah, lho.",
    answer: "よ",
    options: ["よ", "ね", "の"],
    explanation: "よ menegaskan informasi yang belum diketahui pendengar.",
    wrongNotes: {
      "ね": "ね meminta persetujuan, bukan memberi tahu.",
      "の": "の menghubungkan kata benda.",
    },
  },
  {
    id: "soal:isi:16",
    mode: "isi-celah",
    prompt: "夏 ___ 冬が好きです。",
    promptId: "Saya lebih suka musim dingin daripada musim panas.",
    answer: "より",
    options: ["より", "ほど", "まで"],
    explanation: "より menandai pembanding dalam perbandingan.",
    wrongNotes: {
      "ほど": "ほど dipakai dalam bentuk negatif: 〜ほど…ない.",
      "まで": "まで menandai batas akhir.",
    },
  },
  {
    id: "soal:isi:17",
    mode: "isi-celah",
    prompt: "水 ___ 飲みます。",
    promptId: "Saya hanya minum air.",
    answer: "だけ",
    options: ["だけ", "しか", "ほど"],
    explanation: "だけ berarti “hanya” dan dipakai dengan bentuk positif.",
    wrongNotes: {
      "しか": "しか harus berpasangan dengan bentuk negatif: しか…ません.",
      "ほど": "ほど menyatakan perkiraan atau tingkat.",
    },
  },
  {
    id: "soal:isi:18",
    mode: "isi-celah",
    prompt: "駅まで十分 ___ かかります。",
    promptId: "Ke stasiun sekitar sepuluh menit.",
    answer: "ほど",
    options: ["ほど", "だけ", "より"],
    explanation: "ほど di sini menyatakan perkiraan jumlah.",
    wrongNotes: {
      "だけ": "だけ berarti “hanya”, tidak menyatakan perkiraan.",
      "より": "より dipakai untuk perbandingan.",
    },
  },
  {
    id: "soal:isi:19",
    mode: "isi-celah",
    prompt: "毎朝、七時に家 ___ 出て、学校へ行きます。",
    contextBefore: "かぎを閉めてから、家を出ます。",
    promptId: "Setiap pagi keluar rumah jam tujuh lalu pergi ke sekolah.",
    answer: "を",
    options: ["を", "が", "に"],
    explanation: "Kata kerja 出ます (meninggalkan tempat) memakai を.",
    wrongNotes: {
      "が": "が menandai subjek, bukan tempat yang ditinggalkan.",
      "に": "に menandai tujuan atau keberadaan.",
    },
  },
  {
    id: "soal:isi:20",
    mode: "isi-celah",
    prompt: "コーヒー ___ 紅茶、どちらにしますか。",
    promptId: "Kopi atau teh, mau yang mana?",
    answer: "か",
    options: ["か", "と", "や"],
    explanation: "か di antara dua kata benda menyatakan pilihan “atau”.",
    wrongNotes: {
      "と": "と menyambung daftar lengkap, bukan pilihan.",
      "や": "や menyebut contoh, bukan pilihan.",
    },
  },
];
