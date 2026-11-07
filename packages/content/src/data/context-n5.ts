import type { ContextCard, KeigoVerb, RegisterScenario } from "../types";

/**
 * Konteks & etiket untuk pembelajar N5.
 *
 * Tiga kelompok:
 * - register  : kalimat yang sama pada empat tingkat lawan bicara
 * - kebiasaan : hal yang wajar bagi orang Jepang tetapi asing bagi pembelajar
 * - unik      : hal yang dianggap aneh atau membingungkan
 *
 * Kejujuran materi: tiap kartu diberi label `confidence`. Yang bertanda
 * "tergantung-situasi" memang berbeda menurut daerah, hubungan, atau sumber —
 * jangan disajikan sebagai aturan mutlak.
 */

/** Situasi yang sama, diucapkan pada empat tingkat lawan bicara. */
export const registerScenariosN5: RegisterScenario[] = [
  {
    id: "register:nama",
    title: "Menanyakan nama",
    situation: "Baru berkenalan dan ingin tahu nama lawan bicara.",
    lines: [
      {
        audience: "akrab",
        jp: "名前、何？",
        id: "Namamu siapa?",
        note: "Hanya untuk keluarga atau sahabat. Tanpa さん dan tanpa bentuk sopan.",
      },
      {
        audience: "teman",
        jp: "名前、何ていうの？",
        id: "Namamu siapa?",
        note: "Ramah. ていうの melembutkan pertanyaan.",
      },
      {
        audience: "atasan",
        jp: "お名前を伺ってもよろしいですか。",
        id: "Boleh saya mengetahui nama Anda?",
        note: "伺う adalah bentuk 謙譲 (merendahkan diri) dari 聞く.",
      },
      {
        audience: "asing",
        jp: "お名前は何ですか。",
        id: "Siapa nama Anda?",
        note: "Sopan dan netral. Untuk orang yang baru dikenal, ucapkan lebih lambat.",
      },
    ],
  },
  {
    id: "register:taberu",
    title: "Menawarkan makanan",
    situation: "Menawari lawan bicara makan atau minum.",
    lines: [
      {
        audience: "akrab",
        jp: "食べる？",
        id: "Makan?",
        note: "Bentuk kamus + intonasi naik. Hanya untuk orang dekat.",
      },
      {
        audience: "teman",
        jp: "食べる？",
        id: "Makan?",
        note: "Sama seperti di atas; keakraban ditentukan hubungan, bukan kata.",
      },
      {
        audience: "atasan",
        jp: "召し上がりますか。",
        id: "Apakah Anda akan makan?",
        note: "召し上がる adalah bentuk 尊敬 untuk 食べる/飲む.",
      },
      {
        audience: "asing",
        jp: "食べますか。",
        id: "Apakah Anda makan?",
        note: "Bentuk ます yang aman untuk hampir semua situasi.",
      },
    ],
  },
  {
    id: "register:nanji",
    title: "Menanyakan jam",
    situation: "Menanyakan pukul berapa sesuatu berlangsung.",
    lines: [
      {
        audience: "akrab",
        jp: "何時？",
        id: "Jam berapa?",
        note: "Sangat singkat, hanya untuk orang dekat.",
      },
      {
        audience: "teman",
        jp: "何時？",
        id: "Jam berapa?",
        note: "Bisa ditambah の？ menjadi 何時の？ agar terdengar lebih ramah.",
      },
      {
        audience: "atasan",
        jp: "何時でございましょうか。",
        id: "Kira-kira pukul berapa?",
        note: "でございましょうか adalah bentuk paling sopan dari ですか.",
      },
      {
        audience: "asing",
        jp: "何時ですか。",
        id: "Pukul berapa?",
        note: "Bentuk sopan standar, aman dipakai di mana saja.",
      },
    ],
  },
];

/** Tiga lapis kesopanan untuk kata kerja yang paling sering dipakai. */
export const keigoVerbsN5: KeigoVerb[] = [
  {
    id: "keigo:iku",
    dictionary: "行く",
    meaning: "pergi",
    teinei: "行きます",
    sonkeigo: "いらっしゃる",
    kenjougo: "伺う / 参る",
    note: "伺う dipakai saat pergi ke tempat orang yang dihormati; 参る lebih umum untuk “saya pergi”.",
  },
  {
    id: "keigo:kuru",
    dictionary: "来る",
    meaning: "datang",
    teinei: "来ます",
    sonkeigo: "いらっしゃる",
    kenjougo: "参る",
    note: "いらっしゃる dipakai untuk 行く, 来る, dan いる sekaligus — konteks menentukan artinya.",
  },
  {
    id: "keigo:iru",
    dictionary: "いる",
    meaning: "ada (orang/hewan)",
    teinei: "います",
    sonkeigo: "いらっしゃる",
    kenjougo: "おる",
    note: "おる terdengar merendah; dalam percakapan Kansai dipakai sehari-hari tanpa nuansa merendah.",
  },
  {
    id: "keigo:iu",
    dictionary: "言う",
    meaning: "berkata",
    teinei: "言います",
    sonkeigo: "おっしゃる",
    kenjougo: "申す / 申し上げる",
  },
  {
    id: "keigo:miru",
    dictionary: "見る",
    meaning: "melihat",
    teinei: "見ます",
    sonkeigo: "ご覧になる",
    kenjougo: "拝見する",
    note: "ご覧になる dipakai untuk melihat milik/diri orang lain; 拝見する untuk melihat milik orang lain dari sisi kita.",
  },
  {
    id: "keigo:taberu",
    dictionary: "食べる・飲む",
    meaning: "makan / minum",
    teinei: "食べます・飲みます",
    sonkeigo: "召し上がる",
    kenjougo: "いただく",
  },
  {
    id: "keigo:suru",
    dictionary: "する",
    meaning: "melakukan",
    teinei: "します",
    sonkeigo: "なさる",
    kenjougo: "いたす",
  },
  {
    id: "keigo:au",
    dictionary: "会う",
    meaning: "bertemu",
    teinei: "会います",
    sonkeigo: "お会いになる",
    kenjougo: "お目にかかる",
  },
  {
    id: "keigo:kiku",
    dictionary: "聞く",
    meaning: "mendengar / bertanya",
    teinei: "聞きます",
    sonkeigo: "お聞きになる",
    kenjougo: "伺う",
  },
  {
    id: "keigo:shiru",
    dictionary: "知る",
    meaning: "tahu",
    teinei: "知っています",
    sonkeigo: "ご存じです",
    kenjougo: "存じております",
    note: "ご存じです dipakai untuk “apakah Anda tahu”; 存じております untuk “saya tahu”.",
  },
];

/**
 * Hal yang wajar bagi orang Jepang tetapi asing bagi pembelajar, dan hal unik
 * yang sering membingungkan.
 */
export const contextCardsN5: ContextCard[] = [
  /* ---------------- kebiasaan ---------------- */
  {
    id: "konteks:tawa",
    category: "kebiasaan",
    title: "Tertawa punya banyak bentuk tulis",
    japanese: "はは / ふふ / ぐふふ / ぷっ / ホッ",
    summary:
      "Orang Jepang membedakan jenis tawa lewat bunyi yang ditulis, bukan hanya lewat emoji. Ini muncul di chat, manga, dan novel.",
    points: [
      "はは — tawa ringan dan terbuka.",
      "ふふ — tawa kecil, kadang terdengar halus atau sedikit menggoda.",
      "ぐふふ — tawa dalam, sering dipakai untuk nada nakal.",
      "ぷっ — tawa yang tidak bisa ditahan.",
      "ホッ — bukan tawa, melainkan napas lega.",
    ],
    confidence: "kuat",
    caution:
      "Dalam tulisan digital, 「w」 dan 「ww」 adalah bentuk tertawa (dari 笑う). 「草」 (rumput) dipakai karena deretan w mirip rumput.",
  },
  {
    id: "konteks:ittekimasu",
    category: "kebiasaan",
    title: "Ucapan saat keluar dan pulang",
    japanese: "いってきます / いってらっしゃい",
    summary:
      "Bukan sekadar “selamat tinggal”. Ini pasangan wajib antara yang pergi dan yang tinggal di rumah.",
    points: [
      "いってきます — diucapkan yang pergi.",
      "いってらっしゃい — dijawab yang tinggal di rumah.",
      "ただいま — diucapkan saat pulang.",
      "おかえりなさい — dijawab yang menyambut.",
    ],
    confidence: "kuat",
  },
  {
    id: "konteks:itadakimasu",
    category: "kebiasaan",
    title: "Sebelum dan sesudah makan",
    japanese: "いただきます / ごちそうさま",
    summary:
      "Diucapkan hampir setiap kali makan, termasuk saat makan sendirian.",
    points: [
      "いただきます — sebelum makan, terima kasih atas hidangan.",
      "ごちそうさま（でした） — setelah makan, terima kasih atas suguhan.",
      "Tidak ada padanan Indonesia yang pas; keduanya lebih dekat ke “saya terima hidangan ini”.",
    ],
    confidence: "kuat",
  },
  {
    id: "konteks:sumimasen",
    category: "kebiasaan",
    title: "すみません punya tiga makna",
    japanese: "すみません",
    summary:
      "Satu kata untuk tiga situasi: minta maaf, berterima kasih, dan memanggil perhatian.",
    points: [
      "Minta maaf — 遅れてすみません (maaf saya terlambat).",
      "Berterima kasih — すみません、どうも (terima kasih banyak).",
      "Memanggil — すみません、メニューをください (permisi, minta menunya).",
      "ごめんなさい lebih khusus untuk permintaan maaf pribadi.",
    ],
    confidence: "kuat",
  },
  {
    id: "konteks:hai",
    category: "kebiasaan",
    title: "はい belum tentu berarti setuju",
    japanese: "はい / ちょっと…",
    summary:
      "はい sering berarti “saya mendengar Anda”, bukan “saya setuju”. Penolakan biasanya disampaikan tidak langsung.",
    points: [
      "はい bisa berarti mendengar, mengerti, atau sekadar menandakan Anda masih diperhatikan.",
      "Penolakan halus: ちょっと… , 大丈夫です , 検討します (akan kami pertimbangkan).",
      "Menolak dengan いいえ secara langsung terasa keras dalam banyak situasi.",
    ],
    confidence: "kuat",
  },
  {
    id: "konteks:moshi",
    category: "kebiasaan",
    title: "もしもし hanya untuk orang dekat",
    japanese: "もしもし",
    summary:
      "Kata pembuka telepon ini tidak dipakai kepada klien atau atasan.",
    points: [
      "Keluarga/teman: もしもし、元気？",
      "Kerja: お世話になっております。〜の田中です。",
      "Untuk klien, langsung sebut nama perusahaan dan nama sendiri tanpa もしもし.",
    ],
    confidence: "kuat",
  },
  {
    id: "konteks:o-go",
    category: "kebiasaan",
    title: "お dan ご: awalan penghalus",
    japanese: "お名前 / ご連絡",
    summary:
      "Awalan お dan ご membuat kata terasa lebih sopan. Polanya cenderung mengikuti asal kata.",
    points: [
      "お + kata asli Jepang: お名前, お茶, お金, お弁当.",
      "ご + kata dari Tionghoa: ご連絡, ご説明, ご家族, ご意見.",
      "Ada pengecualian tetap yang wajib dihafal: お電話, お時間, お約束.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Aturan お/ご adalah kecenderungan, bukan hukum. Banyak kata harus dihafal satu per satu.",
  },

  /* ---------------- unik ---------------- */
  {
    id: "konteks:namae",
    category: "unik",
    title: "Nama kanji bisa tak terduga",
    japanese: "名前の読み方",
    summary:
      "Kanji nama orang memakai bacaan yang tidak selalu ada di kamus. Orang Jepang sendiri sering harus bertanya.",
    points: [
      "Satu kanji bisa punya banyak bacaan nama, mis. 一 dibaca はじめ, かず, いち, まこと.",
      "Menanyakan 「お名前、何とお読みしますか」 adalah hal wajar, bukan kesalahan.",
      "Menebak bacaan nama berisiko salah; lebih sopan bertanya.",
    ],
    confidence: "kuat",
  },
  {
    id: "konteks:daijoubu",
    category: "unik",
    title: "大丈夫 bisa berarti “tidak, terima kasih”",
    japanese: "大丈夫です",
    summary:
      "Kalimat ini terlihat positif, tetapi sering dipakai untuk menolak dengan halus.",
    points: [
      "Ditawari sesuatu: 大丈夫です bisa berarti “tidak perlu, terima kasih”.",
      "Menanyakan kondisi: 大丈夫ですか berarti “apakah Anda baik-baik saja?”.",
      "Karena maknanya dua arah, nada dan situasi menentukan.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Arti 大丈夫 sangat bergantung konteks. Bagi pembelajar, lebih aman memilih kalimat yang jelas seperti いりません atau 結構です bila ingin menolak.",
  },
  {
    id: "konteks:soroeru",
    category: "unik",
    title: "Menyamakan jawaban (空気を読む)",
    japanese: "空気を読む / そろえる",
    summary:
      "Dalam kelompok, orang Jepang cenderung menyelaraskan jawaban agar tidak terlihat berbeda. Pembelajar yang konsisten berbeda bisa dianggap keras.",
    points: [
      "Menjawab berbeda bukan dilarang, tetapi disampaikan dengan cara yang lebih halus.",
      "Frasa seperti そうですね… atau 一理あります meredam perbedaan pendapat.",
      "Membaca suasana (空気を読む) dianggap keterampilan sosial, bukan sekadar basa-basi.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Ini kecenderungan budaya, bukan aturan. Banyak orang Jepang justru menghargai pendapat yang jelas bila disampaikan dengan sopan.",
  },
  {
    id: "konteks:otsukare",
    category: "unik",
    title: "お疲れ様です sebagai sapaan kerja",
    japanese: "お疲れ様です",
    summary:
      "Di tempat kerja, ini hampir seperti “halo” — diucapkan saat bertemu, berpapasan, atau pulang.",
    points: [
      "お疲れ様です — untuk rekan kerja, atasan, dan klien.",
      "ご苦労様です — hanya dari atasan ke bawahan; memakainya ke atasan terasa merendahkan.",
      "お疲れ様でした — diucapkan saat pekerjaan selesai atau seseorang pulang.",
    ],
    confidence: "kuat",
  },
  {
    id: "konteks:onomatope",
    category: "unik",
    title: "Onomatope yang tak punya padanan",
    japanese: "ぽかぽか / ドキドキ / きらきら",
    summary:
      "Bahasa Jepang memakai bunyi untuk menggambarkan keadaan, perasaan, dan cahaya — jauh lebih sering daripada bahasa Indonesia.",
    points: [
      "ぽかぽか — hangat yang nyaman (cuaca, sinar matahari).",
      "ドキドキ — jantung berdebar karena gugup atau bersemangat.",
      "きらきら — berkilau (bintang, mata, perhiasan).",
      "ざあざあ — hujan deras.",
      "ふわふわ — lembut dan ringan (kapas, roti, awan).",
    ],
    confidence: "kuat",
  },
];
