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
        jp: "食べるの？",
        id: "Mau makan?",
        note: "の menambah keakraban dan sedikit rasa ingin tahu; tetap hanya untuk orang dekat.",
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
        jp: "何時なの？",
        id: "Jam berapa?",
        note: "なの melembutkan pertanyaan; lebih ramah daripada 何時？ saja.",
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
  {
    id: "register:toire",
    title: "Meminta izin ke toilet",
    situation: "Ingin permisi sebentar untuk ke toilet.",
    lines: [
      {
        audience: "akrab",
        jp: "トイレ行っていい？",
        id: "Boleh ke toilet?",
        note: "Singkat dan santai; hanya untuk keluarga/sahabat.",
      },
      {
        audience: "teman",
        jp: "トイレ、行ってもいい？",
        id: "Boleh saya ke toilet?",
        note: "てもいい？ adalah bentuk izin santai.",
      },
      {
        audience: "atasan",
        jp: "お手洗いを借りてもよろしいですか。",
        id: "Boleh saya memakai toilet?",
        note: "借りる + てもよろしいですか sangat sopan; お手洗い lebih halus daripada トイレ.",
      },
      {
        audience: "asing",
        jp: "お手洗いに行ってもいいですか。",
        id: "Boleh saya ke toilet?",
        note: "Sopan dan jelas; aman untuk orang baru dikenal.",
      },
    ],
  },
  {
    id: "register:kotowaru",
    title: "Menolak ajakan",
    situation: "Teman mengajak pergi, tetapi Anda tidak bisa.",
    lines: [
      {
        audience: "akrab",
        jp: "ごめん、無理。",
        id: "Maaf, aku tidak bisa.",
        note: "Sangat langsung; hanya untuk orang sangat dekat.",
      },
      {
        audience: "teman",
        jp: "ごめん、その日はちょっと。",
        id: "Maaf, hari itu agak sulit.",
        note: "ちょっと… adalah penolakan halus; biarkan kalimat menggantung.",
      },
      {
        audience: "atasan",
        jp: "あいにく予定がございまして。",
        id: "Maaf, kebetulan ada acara lain.",
        note: "あいにく + ございまして menolak tanpa menyebut alasan secara detail.",
      },
      {
        audience: "asing",
        jp: "申し訳ありませんが、その日は都合が悪いです。",
        id: "Maaf, hari itu saya tidak bisa.",
        note: "Jelas, sopan, dan tidak menyinggung.",
      },
    ],
  },
  {
    id: "register:denwa",
    title: "Menelepon",
    situation: "Menelepon keluarga, teman, atau kantor.",
    lines: [
      {
        audience: "akrab",
        jp: "もしもし。",
        id: "Halo.",
        note: "Hanya untuk telepon pribadi; jangan dipakai ke klien.",
      },
      {
        audience: "teman",
        jp: "もしもし、元気？",
        id: "Halo, apa kabar?",
        note: "Santai; もしもし aman untuk teman.",
      },
      {
        audience: "atasan",
        jp: "お世話になっております。",
        id: "Terima kasih atas kerja samanya.",
        note: "Pembuka telepon bisnis; sebutkan nama perusahaan dan nama sendiri setelahnya.",
      },
      {
        audience: "asing",
        jp: "もしもし、田中さんのお宅ですか。",
        id: "Halo, apakah ini rumah Bapak/Ibu Tanaka?",
        note: "Sopan untuk menelepon rumah orang yang belum akrab.",
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
  {
    id: "keigo:yomu",
    dictionary: "読む",
    meaning: "membaca",
    teinei: "読みます",
    sonkeigo: "お読みになる",
    kenjougo: "拝読する",
    note: "拝読する dipakai untuk membaca tulisan orang yang dihormati.",
  },
  {
    id: "keigo:kaku",
    dictionary: "書く",
    meaning: "menulis",
    teinei: "書きます",
    sonkeigo: "お書きになる",
    kenjougo: "お書きする",
    note: "お書きする dipakai saat menulis untuk orang lain, mis. surat/nama.",
  },
  {
    id: "keigo:matsu",
    dictionary: "待つ",
    meaning: "menunggu",
    teinei: "待ちます",
    sonkeigo: "お待ちになる",
    kenjougo: "お待ちする",
    note: "お待ちしております adalah frasa bisnis yang sangat umum.",
  },
  {
    id: "keigo:kariru",
    dictionary: "借りる",
    meaning: "meminjam",
    teinei: "借ります",
    sonkeigo: "お借りになる",
    kenjougo: "拝借する",
    note: "拝借する sangat sopan; お借りする juga umum dalam bisnis.",
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

  {
    id: "konteks:kusu",
    category: "kebiasaan",
    title: "Melepas sepatu di rumah",
    japanese: "玄関で靴を脱ぐ / スリッパ",
    romaji: "genkan de kutsu o nugu / surippa",
    summary:
      "Sepatu dilepas di pintu masuk (玄関). Di dalam rumah biasanya tersedia sandal rumah, dan ada sandal khusus untuk toilet.",
    points: [
      "Masuk rumah orang Jepang: lepas sepatu di 玄関, hadapkan ujung sepatu ke pintu.",
      "Gunakan スリッパ yang disediakan; jangan membawa sandal toilet ke ruang lain.",
      "Di ryokan, restoran tatami, dan beberapa klinik juga berlaku aturan serupa.",
      "Perhatikan tanda 「土足禁止」 (dilarang memakai sepatu) di pintu masuk.",
    ],
    confidence: "kuat",
    caution:
      "Aturan berbeda di rumah, ryokan, restoran, dan ruang ibadah. Ikuti tanda dan kebiasaan tuan rumah.",
  },
  {
    id: "konteks:jikan",
    category: "kebiasaan",
    title: "Tepat waktu itu sopan",
    japanese: "時間を守る / 5分前",
    romaji: "jikan o mamoru / go-fun mae",
    summary:
      "Janji biasanya dimulai tepat waktu. Datang lebih awal dianggap menghargai waktu orang lain.",
    points: [
      "Untuk janji dengan atasan, klien, atau wawancara, datang 5–10 menit lebih awal.",
      "Kereta di Jepang umumnya tepat waktu; keterlambatan kecil pun dianggap masalah.",
      "Jika terlambat, hubungi secepat mungkin dan jelaskan perkiraan waktu tiba.",
      "Untuk acara sosial, sedikit terlambat masih bisa dimaklumi, tetapi tetap beri kabar.",
    ],
    confidence: "kuat",
    caution:
      "Tingkat ketatnya berbeda menurut situasi dan hubungan. Untuk kerja/klien, anggap tepat waktu sebagai standar.",
  },
  {
    id: "konteks:tip",
    category: "kebiasaan",
    title: "Tidak ada tipping",
    japanese: "チップ / サービス料",
    romaji: "chippu / sābisu-ryō",
    summary:
      "Memberi uang tip bukan kebiasaan di Jepang. Layanan sudah termasuk dalam harga atau サービス料.",
    points: [
      "Restoran, taksi, dan hotel biasanya tidak mengharapkan tip.",
      "Di izakaya kadang ada お通し (makanan pembuka) yang menambah biaya; itu bukan tip.",
      "Jika ingin menghargai layanan, cukup ucapkan ありがとうございました dengan tulus.",
      "Beberapa restoran menambahkan サービス料/チャージ料; periksa struk.",
    ],
    confidence: "kuat",
    caution:
      "Ada pengecualian di tempat wisata tertentu, tetapi secara umum tip tidak diperlukan dan bisa membuat bingung.",
  },
  {
    id: "konteks:omiyage",
    category: "kebiasaan",
    title: "Omiyage dan hadiah",
    japanese: "お土産 / 手土産",
    romaji: "omiyage / temiyage",
    summary:
      "Membawa oleh-oleh dari perjalanan atau saat berkunjung adalah kebiasaan sosial yang penting.",
    points: [
      "お土産 = oleh-oleh dari perjalanan; 手土産 = hadiah saat berkunjung ke rumah.",
      "Berikan setelah masuk dan mengobrol sebentar; jangan langsung memaksa dibuka.",
      "Makanan kecil yang bisa dibagi lebih aman daripada barang pribadi.",
      "Untuk atasan/klien, hadiah yang terlalu mahal bisa merepotkan; pilih sederhana dan bermakna.",
      "Bungkus rapi; hadiah uang memiliki amplop khusus (のし袋).",
    ],
    confidence: "kuat",
    caution:
      "Kebiasaan berbeda menurut daerah, hubungan, dan acara. Untuk kerja, ikuti aturan perusahaan.",
  },
  {
    id: "konteks:kinsho",
    category: "kebiasaan",
    title: "Salam tetangga dan lingkungan",
    japanese: "引っ越しの挨拶 / 自治会",
    romaji: "hikkoshi no aisatsu / jichikai",
    summary:
      "Saat pindah, menyapa tetangga membantu membangun hubungan dan menghindari kesalahpahaman.",
    points: [
      "Umumnya memberi salam singkat ke tetangga kiri-kanan dan pengelola apartemen.",
      "Bawa 手土産 kecil seperti handuk, makanan ringan, atau sabun.",
      "Ikuti aturan 自治会/町内会 (organisasi lingkungan) bila ada; tidak semua wajib.",
      "Perkenalkan diri dengan nama dan unit; tanyakan aturan sampah setempat.",
      "Jika tidak sempat, titipkan salam lewat pengelola atau kartu singkat.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Tidak semua lingkungan mengharuskan 自治会. Ikuti kebiasaan setempat dan jangan memaksakan diri.",
  },
  {
    id: "konteks:densha",
    category: "kebiasaan",
    title: "Etiket di kereta dan ruang publik",
    japanese: "マナーモード / 通話禁止",
    romaji: "manā mōdo / tsūwa kinshi",
    summary:
      "Kereta adalah ruang bersama. Suara ponsel, musik, dan percakapan perlu dijaga.",
    points: [
      "Atur ponsel ke マナーモード (mode senyap) dan hindari menelepon.",
      "Musik pakai earphone; jangan sampai suara keluar.",
      "Prioritaskan kursi prioritas (優先席) untuk lansia, ibu hamil, dan penyandang disabilitas.",
      "Antre di sisi pintu, biarkan penumpang turun lebih dulu.",
      "Dilarang merokok, makan/minum tertentu, dan berbicara keras di dalam kereta.",
    ],
    confidence: "kuat",
    caution:
      "Aturan berbeda menurut operator dan jenis kereta. Perhatikan pengumuman dan stiker di dalam kereta.",
  },
  {
    id: "konteks:ofuro",
    category: "kebiasaan",
    title: "Cara mandi di rumah Jepang",
    japanese: "お風呂 / かけ湯",
    romaji: "ofuro / kakeyu",
    summary:
      "Bak mandi dipakai untuk berendam, bukan untuk mencuci badan. Cuci badan dulu di luar bak.",
    points: [
      "Gunakan shower dan sabun di area cuci sebelum masuk bak.",
      "Jaga air bak tetap bersih; jangan membilas sabun di dalam bak.",
      "Di onsen/ryokan, ikuti aturan: lepas pakaian, cuci badan dulu, jangan berenang.",
      "Bawa handuk kecil; handuk besar diletakkan di luar area bak.",
      "Tato, pakaian renang, dan kamera sering dilarang di onsen tertentu; cek aturan.",
    ],
    confidence: "kuat",
    caution:
      "Aturan onsen berbeda-beda, termasuk kebijakan tato. Cek informasi fasilitas sebelum datang.",
  },
  {
    id: "konteks:hashi",
    category: "kebiasaan",
    title: "Etiket sumpit",
    japanese: "箸 / 立て箸 / 箸渡し",
    romaji: "hashi / tatebashi / hashiwatashi",
    summary:
      "Sumpit memiliki aturan sopan santun. Beberapa hal dianggap tabu karena terkait upacara kematian.",
    points: [
      "Jangan menancapkan sumpit tegak di nasi (立て箸).",
      "Jangan memindahkan makanan dari sumpit ke sumpit (箸渡し).",
      "Jangan menunjuk orang atau menarik piring dengan sumpit.",
      "Letakkan sumpit di 箸置き setelah selesai; jangan menyilangkan di mangkuk.",
      "Saat memakai sumpit bersama, gunakan 取り箸 (sumpit saji) bila disediakan.",
    ],
    confidence: "kuat",
    caution:
      "Tingkat formalitas berbeda di rumah vs restoran. Aturan dasar ini berlaku luas di Jepang.",
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

  {
    id: "konteks:kekkou",
    category: "unik",
    title: "結構です bisa berarti “tidak perlu”",
    japanese: "結構です",
    romaji: "kekkō desu",
    summary:
      "Ungkapan ini bisa berarti “cukup/tidak perlu” atau “bagus”. Nada dan konteks menentukan.",
    points: [
      "Ditawari kantong plastik: 結構です sering berarti “tidak perlu”.",
      "Menilai sesuatu: 結構です bisa berarti “cukup bagus”.",
      "Untuk menolak dengan jelas, gunakan 大丈夫です atau いりません bila perlu.",
      "Nada datar dan singkat bisa terdengar tegas; nada ramah lebih aman.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Karena ambigu, dalam situasi formal lebih aman memakai kalimat lengkap seperti 大丈夫です、ありがとうございます.",
  },
  {
    id: "konteks:kentou",
    category: "unik",
    title: "検討します sering berarti “tidak”",
    japanese: "検討します",
    romaji: "kentō shimasu",
    summary:
      "Secara harfiah “akan mempertimbangkan”, tetapi dalam bisnis sering menjadi penolakan halus.",
    points: [
      "Sering dipakai ketika pihak lain tidak ingin mengatakan tidak secara langsung.",
      "Jangan langsung menganggap ada persetujuan; tunggu keputusan resmi.",
      "Frasa terkait: 前向きに検討します (akan mempertimbangkan secara positif).",
      "Jika perlu kepastian, tanyakan tenggat dan tindak lanjutnya dengan sopan.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Maknanya sangat bergantung konteks. Dalam negosiasi, konfirmasi tertulis lebih aman.",
  },
  {
    id: "konteks:enryo",
    category: "unik",
    title: "遠慮: menahan diri dan menolak halus",
    japanese: "遠慮 / 遠慮なく",
    romaji: "enryo / enryo naku",
    summary:
      "Kata ini muncul saat menolak, meminta izin, atau menyuruh orang lain tidak sungkan.",
    points: [
      "遠慮します = “saya menahan diri” → sering berarti menolak tawaran.",
      "遠慮なく = “jangan sungkan” → dipakai untuk mempersilakan.",
      "ご遠慮ください = “mohon menahan diri” → larangan halus.",
      "Contoh: 遠慮なく召し上がってください (silakan makan tanpa sungkan).",
    ],
    confidence: "kuat",
    caution:
      "Arah maknanya berubah tergantung bentuk: 遠慮します (menolak) vs 遠慮なく (mempersilakan).",
  },
  {
    id: "konteks:honne",
    category: "unik",
    title: "本音 dan 建前",
    japanese: "本音 / 建前",
    romaji: "honne / tatemae",
    summary:
      "本音 adalah perasaan/ pendapat sebenarnya; 建前 adalah sikap resmi yang ditampilkan di depan publik.",
    points: [
      "Dalam rapat, 建前 sering dipakai untuk menjaga harmoni.",
      "本音 bisa disampaikan setelah hubungan lebih dekat, di luar forum resmi.",
      "Pembelajar tidak harus selalu menebak 本音; bertanya dengan sopan lebih baik.",
      "Frasa: 建前では… / 本音を言うと…",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Ini kecenderungan sosial, bukan aturan mutlak. Banyak orang Jepang juga berbicara terus terang bila situasinya tepat.",
  },
  {
    id: "konteks:chotto",
    category: "unik",
    title: "ちょっと… sebagai penolakan halus",
    japanese: "ちょっと…",
    romaji: "chotto…",
    summary:
      "Kalimat yang menggantung dengan ちょっと sering berarti “agak sulit” atau “tidak bisa”.",
    points: [
      "Contoh: その日はちょっと… = hari itu agak sulit.",
      "Jangan menganggapnya sebagai “sebentar” jika konteksnya ajakan/permintaan.",
      "Untuk menerima, jawab jelas: いいですね、行きます.",
      "Untuk menolak lebih jelas: 申し訳ありませんが、難しいです.",
    ],
    confidence: "kuat",
    caution:
      "Maknanya bergantung intonasi dan konteks. Jika ragu, ajukan pertanyaan klarifikasi.",
  },
  {
    id: "konteks:nijuu",
    category: "unik",
    title: "敬語 berlebihan (二重敬語)",
    japanese: "おっしゃられる / ご覧になられる",
    romaji: "ossharareru / goran ni narareru",
    summary:
      "Menggabungkan dua bentuk hormat sekaligus sering dianggap berlebihan atau salah.",
    points: [
      "Bentuk baku: おっしゃる (bukan おっしゃられる).",
      "Bentuk baku: ご覧になる (bukan ご覧になられる).",
      "Hindari menambahkan られる pada bentuk hormat yang sudah lengkap.",
      "Lebih baik sederhana dan tepat daripada banyak tetapi salah.",
    ],
    confidence: "kuat",
    caution:
      "Beberapa bentuk yang tampak berlebihan tetap dipakai dalam bahasa sopan tertentu; fokus pada bentuk baku untuk pembelajar.",
  },

  /* ---------------- praktis ---------------- */
  {
    id: "praktis:gomi",
    category: "praktis",
    title: "Membuang sampah: dipilah, dan ada jadwalnya",
    japanese: "ゴミの分別 / ゴミの日",
    summary:
      "Sampah tidak dibuang sembarangan. Jenisnya dipisah, dan tiap jenis hanya diambil pada hari tertentu.",
    points: [
      "燃えるゴミ — sampah mudah terbakar (sisa makanan, kertas kotor).",
      "燃えないゴミ — sampah tidak terbakar (logam, kaca, keramik).",
      "資源ゴミ — sampah yang bisa didaur ulang (plastik, kaleng, botol PET).",
      "Jadwal dan jenisnya berbeda per kota bahkan per distrik. Biasanya ada kalender sampah dari balai kota.",
      "Sampah diletakkan di ゴミ置き場 (tempat sampah bersama) pada pagi hari pengambilan, bukan malam sebelumnya.",
      "Barang besar (粗大ゴミ) harus didaftarkan dan dibayar dulu, tidak boleh ditaruh begitu saja.",
    ],
    confidence: "kuat",
    caution:
      "Menaruh sampah pada hari yang salah bisa dikembalikan dengan catatan. Aturan tiap daerah berbeda, jadi ikuti kalender setempat.",
  },
  {
    id: "praktis:kenbaiki",
    category: "praktis",
    title: "Memesan makan di 券売機",
    japanese: "食券 / 券売機",
    summary:
      "Banyak restoran murah memakai mesin tiket: bayar dulu, baru duduk, lalu serahkan tiket.",
    points: [
      "Pilih menu di 券売機, masukkan uang, ambil 食券 (tiket).",
      "Banyak mesin masih hanya menerima uang tunai; sebagian sudah bisa kartu IC.",
      "Serahkan tiket ke staf setelah duduk; tiket sekaligus bukti pesanan.",
      "Ungkapan berguna: 「すみません、これお願いします」 saat menyerahkan tiket.",
      "Kalau bingung, staf biasanya membantu: 「押していただけますか」.",
    ],
    confidence: "kuat",
  },
  {
    id: "praktis:mochikaeri",
    category: "praktis",
    title: "店内 atau お持ち帰り",
    japanese: "店内でお召し上がりですか / お持ち帰りですか",
    summary:
      "Di kedai cepat saji, kasir hampir selalu menanyakan ini. Menjawab salah membuat pesanan dianggap beda.",
    points: [
      "店内で — makan di tempat.",
      "お持ち帰りで — dibungkus untuk dibawa pulang.",
      "Di minimarket, 「お弁当温めますか」 berarti “mau dipanaskan?”.",
      "レジ袋はご入用ですか — “perlu kantong plastik?”; kantong biasanya berbayar.",
    ],
    confidence: "kuat",
  },
  {
    id: "praktis:jihanki",
    category: "praktis",
    title: "Membeli minum di 自販機",
    japanese: "自販機",
    summary:
      "Mesin penjual otomatis ada di hampir setiap sudut. Bayar dengan uang tunai atau kartu IC.",
    points: [
      "Uang kertas yang diterima umumnya 1000 yen; koin 10/50/100/500.",
      "Tombol つめた〜い = dingin, あたたか〜い = hangat (musim dingin).",
      "Kartu IC (Suica, PASMO) bisa ditempelkan di sebagian mesin.",
      "Setelah menekan tombol, minuman keluar dari bawah — jangan lupa mengambilnya.",
    ],
    confidence: "kuat",
  },
  {
    id: "praktis:jishin",
    category: "praktis",
    title: "Saat gempa: tiga hal pertama",
    japanese: "地震 / 安全確保",
    summary:
      "Jepang sering gempa. Yang paling menentukan keselamatan adalah reaksi dalam beberapa detik pertama.",
    points: [
      "安全確保 — lindungi kepala, masuk bawah meja, jangan berlari keluar.",
      "Jauhi jendela dan rak tinggi; jangan pakai lift.",
      "Setelah guncangan berhenti: pastikan 火の元 (sumber api) mati, buka pintu agar tidak terjepit.",
      "非常口 — pintu darurat; cari jalur evakuasi di bangunan atau stasiun.",
      "Ikuti informasi resmi. Peringatan dini muncul di ponsel dan TV dengan teks bergerak.",
    ],
    confidence: "kuat",
    caution:
      "Jangan langsung percaya kabar di media sosial. Ikuti pengumuman pemerintah daerah atau 気象庁 untuk informasi resmi.",
  },
  {
    id: "praktis:hinan",
    category: "praktis",
    title: "Setelah gempa: evakuasi dan peringatan tsunami",
    japanese: "避難所 / 津波",
    summary:
      "Bila guncangan besar terjadi di dekat pantai, langkah berikutnya bukan menunggu, melainkan menuju tempat tinggi.",
    points: [
      "避難所 — tempat evakuasi; biasanya sekolah atau balai warga.",
      "津波警報 — peringatan tsunami. Segera menuju tempat tinggi, jangan menunggu melihat air.",
      "Guncangan kuat dan lama di dekat pantai adalah tanda bahaya tsunami.",
      "Di stasiun, ikuti arahan staf; jangan memaksa naik kereta yang berhenti.",
    ],
    confidence: "kuat",
  },
  {
    id: "praktis:sim",
    category: "praktis",
    title: "Membeli SIM/kartu Jepang",
    japanese: "SIMカード / eSIM / 本人確認",
    romaji: "SIM kādo / eSIM / honnin kakunin",
    summary:
      "Nomor telepon Jepang memerlukan verifikasi identitas. Pilih operator, siapkan dokumen, lalu aktifkan SIM/eSIM.",
    points: [
      "Jenis: kartu fisik, eSIM, data-only, atau voice + data.",
      "Operator wajib melakukan 本人確認 (verifikasi identitas) untuk nomor telepon.",
      "Dokumen umum: 在留カード dengan alamat terbaru, paspor, dan My Number; sebagian operator meminta kartu pelajar/karyawan atau metode pembayaran tertentu.",
      "Alur: pilih paket → unggah/pindai dokumen → verifikasi → bayar → aktifkan SIM/eSIM → atur APN.",
      "MNP diperlukan bila tetap memakai nomor lama; biaya dan masa kontrak berbeda per operator.",
      "Bisa dibeli di bandara, toko elektronik, atau online; ketersediaan dukungan bahasa berbeda.",
    ],
    steps: [
      "Tentukan butuh nomor telepon atau data saja.",
      "Siapkan 在留カード, paspor, dan My Number.",
      "Pilih operator/paket; cek masa kontrak dan biaya pembatalan.",
      "Lakukan verifikasi identitas dan pembayaran.",
      "Aktifkan SIM/eSIM dan atur APN bila diperlukan.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Syarat dokumen dan harga berbeda per operator serta berubah. Bila 在留カード belum mencantumkan alamat, urus alamat di balai kota terlebih dahulu.",
    source: {
      label: "Sakura Mobile — dokumen SIM/eSIM",
      url: "https://support.sakuramobile.jp/hc/en-us/articles/360020269612-What-documents-do-I-need-Where-can-I-pick-it-up",
    },
  },
  {
    id: "praktis:bank",
    category: "praktis",
    title: "Membuka rekening bank",
    japanese: "口座開設 / 通帳 / キャッシュカード",
    romaji: "kōza kaisetsu / tsūchō / kyasshu kādo",
    summary:
      "Rekening bank diperlukan untuk gaji, transfer, dan pembayaran. Warga asing perlu identitas dan alamat Jepang.",
    points: [
      "Dokumen umum: 在留カード, paspor, My Number, dan kartu pelajar/karyawan.",
      "Di ゆうちょ銀行, 在留カード wajib ditunjukkan; pemegang visa 留学/技能実習 juga diminta 学生証/社員証.",
      "Bila masa berlaku 在留カード berakhir dalam 3 bulan, pengajuan dapat ditolak sampai visa diperbarui.",
      "Pembukaan bisa tidak selesai hari itu; 通帳 dapat dikirim ke rumah, dan bank dapat meminta pendamping berbahasa Jepang.",
      "Data yang diisi: nama, alamat, tanggal lahir, telepon, pekerjaan, tujuan rekening, dan tanda tangan/印鑑.",
      "Setelah aktif: 通帳/cash card, setoran awal, dan ゆうちょダイレクト (internet banking).",
    ],
    steps: [
      "Pilih bank dan jenis rekening (umumnya 普通預金).",
      "Siapkan 在留カード, paspor, My Number, dan bukti alamat.",
      "Isi formulir di kantor atau aplikasi; ikuti verifikasi identitas.",
      "Terima 通帳/cash card dan lakukan setoran awal.",
      "Perbarui alamat rekening setelah pindah rumah.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Kebijakan berbeda per bank dan status visa. Rekening dapat dibatasi bila data alamat/在留カード tidak diperbarui.",
    source: {
      label: "Japan Post Bank — 口座を開設される外国人のお客さまへ",
      url: "https://www.jp-bank.japanpost.jp/kaisetu/kat_gaikokujin.html",
    },
  },
  {
    id: "praktis:atm",
    category: "praktis",
    title: "Setor dan tarik uang di ATM",
    japanese: "お預け入れ / お引き出し / 振込",
    romaji: "o-azukeire / o-hikidashi / furikomi",
    summary:
      "ATM Jepang memakai alur menu yang konsisten. Pahami tiga tombol utama: setor, tarik, dan transfer.",
    points: [
      "Alur umum: masukkan kartu → 暗証番号 (PIN) → pilih menu → masukkan jumlah → ambil uang/kartu/struk.",
      "お預け入れ = setor uang. Tidak semua ATM menerima setoran; koin dapat dikenai biaya atau batas.",
      "お引き出し = tarik uang. Biaya dan jam layanan berbeda menurut bank, hari, dan jenis kartu.",
      "振込 = transfer ke rekening lain; perlu nama bank, cabang, jenis rekening, nomor rekening, dan nama penerima.",
      "ATM konbini (7-Eleven, Lawson) menerima banyak kartu bank; aturan biaya dan waktu tetap berbeda.",
      "Bila kartu tertelan atau tertinggal, segera hubungi bank dan jangan menunggu terlalu lama.",
    ],
    steps: [
      "Masukkan kartu sesuai arah panah.",
      "Masukkan 暗証番号, lalu tekan 確認.",
      "Pilih お預け入れ, お引き出し, atau 振込.",
      "Masukkan uang/jumlah sesuai instruksi layar.",
      "Ambil uang, kartu, dan struk; periksa saldo.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Batas setoran/penarikan, biaya, dan jam ATM berbeda per bank dan berubah. Ajarkan cara membaca layar, bukan menghafal angka.",
    source: {
      label: "Japan Post Bank — ATM FAQ",
      url: "https://faq.jp-bank.japanpost.jp/faq.html",
    },
  },
  {
    id: "praktis:yakusho",
    category: "praktis",
    title: "Urusan di balai kota",
    japanese: "転入届 / 住民票 / マイナンバー",
    romaji: "tennyūtodoke / jūminhyō / Mainanbā",
    summary:
      "Setelah pindah, urusan balai kota harus selesai cepat. Bawa 在留カード dan dokumen alamat.",
    points: [
      "Ajukan 転入届 dalam 14 hari setelah pindah; bawa 在留カード dan paspor.",
      "Sekaligus urus 住民票, My Number, 国民健康保険, 国民年金, dan 印鑑登録 bila diperlukan.",
      "Bawa bukti alamat baru (kontrak sewa/utility) dan dokumen dari alamat lama.",
      "Banyak kota menyediakan loket/terjemahan multibahasa; tanyakan di reception.",
      "Saat pindah keluar: ajukan 転出届 dan urus pengalihan surat di kantor pos.",
      "Perbarui alamat di 在留カード, bank, SIM, dan layanan lain setelah pindah.",
    ],
    steps: [
      "Cek jam layanan dan loket untuk warga asing.",
      "Bawa 在留カード, paspor, dan bukti alamat.",
      "Isi 転入届 dan formulir terkait.",
      "Terima 住民票/My Number dan informasi asuransi/pensiun.",
      "Perbarui alamat layanan lain.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Prosedur dan dokumen berbeda per kota. Beberapa kota mewajibkan reservasi; cek situs resmi kota Anda.",
    source: {
      label: "ISA — 生活・就労ガイドブック",
      url: "https://www.moj.go.jp/isa/content/001423934.pdf",
    },
  },
  {
    id: "praktis:chintai",
    category: "praktis",
    title: "Menyewa tempat tinggal",
    japanese: "賃貸 / 敷金・礼金 / 保証会社",
    romaji: "chintai / shikikin・reikin / hoshōgaisha",
    summary:
      "Biaya awal sewa di Jepang bisa jauh lebih besar dari satu bulan sewa. Pahami komponen dan syaratnya.",
    points: [
      "Biaya awal: 敷金 (deposit), 礼金 (key money), 仲介手数料, 火災保険, 鍵交換, dan biaya 保証会社.",
      "Banyak pemilik meminta 保証会社 atau 連帯保証人; warga asing kadang diminta pendamping berbahasa Jepang.",
      "Dokumen: 在留カード, paspor, bukti penghasilan/pekerjaan, dan kontak darurat.",
      "Periksa kontrak: biaya perpanjangan, pemberitahuan keluar, aturan hewan/rokok, sampah, dan parkir.",
      "Urus listrik/gas/air/internet sebelum tanggal pindah; konfirmasi serah terima kunci.",
      "Pemeriksaan dan biaya pembersihan saat keluar bisa diambil dari 敷金.",
    ],
    steps: [
      "Tentukan area dan budget termasuk biaya awal.",
      "Cek syarat 保証会社 dan dokumen yang diminta.",
      "Baca kontrak dan rincian biaya sebelum tanda tangan.",
      "Jadwalkan utility dan internet sebelum pindah.",
      "Catat kondisi awal kamar dengan foto.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Ketentuan agen dan pemilik berbeda. Jangan tanda tangan kontrak yang tidak dipahami; minta penjelasan tertulis.",
  },
  {
    id: "praktis:utilities",
    category: "praktis",
    title: "Mengaktifkan listrik, gas, dan air",
    japanese: "電気・ガス・水道 / 開通",
    romaji: "denki・gasu・suidō / kaitsū",
    summary:
      "Layanan utilitas perlu didaftarkan saat pindah. Gas biasanya memerlukan kunjungan petugas.",
    points: [
      "Hubungi perusahaan listrik/gas sebelum pindah; sebagian butuh reservasi beberapa hari sebelumnya.",
      "Siapkan alamat, tanggal pindah, nama, dan metode pembayaran.",
      "Untuk gas, petugas biasanya datang memeriksa dan menyalakan alat; orang dewasa harus di rumah.",
      "Air biasanya ditangani biro air kota; pendaftaran bisa online/telepon.",
      "Catat/photo meter saat masuk dan keluar.",
      "Pembayaran: transfer bank, kartu kredit, atau konbini; simpan bukti.",
    ],
    steps: [
      "Cek penyedia listrik/gas/air di alamat baru.",
      "Daftar dengan tanggal mulai layanan.",
      "Jadwalkan kunjungan gas bila diperlukan.",
      "Catat meter awal.",
      "Atur metode pembayaran.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Penyedia dan prosedur berbeda per daerah. Internet rumah bisa memerlukan beberapa minggu; daftarkan lebih awal.",
    source: {
      label: "ISA — 生活・就労ガイドブック",
      url: "https://www.moj.go.jp/isa/content/001423934.pdf",
    },
  },
  {
    id: "praktis:byouin",
    category: "praktis",
    title: "Rumah sakit dan apotek",
    japanese: "受付 / 保険証 / 診察券",
    romaji: "uketsuke / hokenshō / shinsatsuken",
    summary:
      "Saat sakit, tahu alur pendaftaran, pemeriksaan, pembayaran, dan mengambil obat akan menghemat waktu.",
    points: [
      "Pertama kali: isi 問診票, tunjukkan 保険証 dan 診察券, lalu tunggu dipanggil.",
      "Sebutkan gejala dan durasi: 熱, 頭痛, 腹痛, 咳, 鼻水, めまい, 吐き気.",
      "Sebutkan alergi obat dan obat yang sedang diminum; bawa お薬手帳 bila ada.",
      "Bayar di 会計, lalu bawa 処方箋 ke 薬局 untuk mengambil obat.",
      "Untuk darurat, telepon 119; untuk malam hari cari 救急外来/夜間診療.",
      "Tanpa asuransi, biaya bisa jauh lebih mahal; bawa 保険証 selalu.",
    ],
    steps: [
      "Cari rumah sakit/klinik yang menerima pasien baru.",
      "Isi 問診票 dan serahkan 保険証.",
      "Jelaskan gejala, durasi, dan alergi.",
      "Lakukan pemeriksaan dan bayar di 会計.",
      "Ambil obat di 薬局 dengan 処方箋.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Jam praktik, reservasi, dan ketersediaan bahasa berbeda per fasilitas. Untuk darurat, gunakan 119.",
    source: {
      label: "ISA — 生活・就労ガイドブック",
      url: "https://www.moj.go.jp/isa/content/001423934.pdf",
    },
  },
  {
    id: "praktis:shigoto",
    category: "praktis",
    title: "Hari pertama kerja",
    japanese: "報連相 / お疲れ様です / 有給休暇",
    romaji: "hōrensō / otsukaresama desu / yūkyū kyūka",
    summary:
      "Di tempat kerja, komunikasi dan keselamatan sama pentingnya dengan kemampuan bahasa.",
    points: [
      "Sapaan kerja: おはようございます, お疲れ様です, お先に失礼します.",
      "報連相 (報告・連絡・相談): laporkan, hubungi, dan konsultasikan; jangan menunda kabar buruk.",
      "Ulangi instruksi (復唱) untuk memastikan Anda memahami tugas.",
      "Cuti/lembur: 有給休暇, 残業, 早退; ikuti prosedur dan beri kabar lebih awal.",
      "Keselamatan: pakai 保護具, laporkan ヒヤリハット (hampir celaka), jangan mengambil risiko.",
      "Gunakan bentuk sopan kepada atasan/klien; hindari bahasa santai.",
    ],
    steps: [
      "Konfirmasi jam kerja, aturan pakaian, dan lokasi.",
      "Perkenalkan diri singkat dan jelas.",
      "Catat instruksi; ulangi poin penting.",
      "Tanyakan alur cuti/lembur dan kontak darurat.",
      "Laporkan pekerjaan dan kendala sebelum pulang.",
    ],
    confidence: "tergantung-situasi",
    caution:
      "Aturan perusahaan berbeda. Tanyakan hal yang tidak jelas sejak awal daripada menebak.",
  },
  {
    id: "praktis:yuubin",
    category: "praktis",
    title: "Kirim surat dan paket",
    japanese: "郵便 / 宅配便 / 再配達",
    romaji: "yūbin / takuhaibin / saihaitatsu",
    summary:
      "Alamat Jepang ditulis dari wilayah besar ke kecil. Paket yang tidak diterima bisa dijadwalkan ulang.",
    points: [
      "Urutan alamat: 〒 kode pos → prefektur → kota → distrik → blok → gedung → nomor kamar → nama.",
      "Surat masuk 郵便受け; paket bisa ke 宅配ボックス atau meninggalkan 不在票.",
      "Atur 再配達 lewat aplikasi/telepon bila paket terlewat.",
      "Layanan populer: ゆうパック, 宅急便; ada 代引き (bayar saat terima) dan 着払い (biaya ditanggung penerima).",
      "Saat pindah, ajukan 転居届 di kantor pos agar surat diteruskan.",
      "Simpan nomor pelacakan (追跡番号).",
    ],
    steps: [
      "Tulis alamat lengkap dari wilayah besar ke kecil.",
      "Pilih layanan dan ukuran paket.",
      "Bungkus dengan aman; isi formulir pengiriman.",
      "Simpan nomor pelacakan.",
      "Jika ada 不在票, jadwalkan 再配達.",
    ],
    confidence: "kuat",
    caution:
      "Aturan ukuran, harga, dan pengiriman berbeda per layanan. Barang berbahaya memiliki larangan khusus.",
  },
  {
    id: "praktis:koutsuu",
    category: "praktis",
    title: "Naik kereta dan bus",
    japanese: "ICカード / 定期券 / 遅延証明書",
    romaji: "IC kādo / teikiken / chien shōmeisho",
    summary:
      "Kartu IC dan pemahaman papan petunjuk membuat perjalanan jauh lebih lancar.",
    points: [
      "ICカード (Suica/PASMO/ICOCA) diisi ulang di mesin; tempelkan saat masuk dan keluar.",
      "Jika saldo kurang, gunakan 精算機 (mesin penyesuaian tarif) di stasiun tujuan.",
      "指定席 = kursi reservasi; 自由席 = tanpa reservasi. Green car memiliki biaya tambahan.",
      "Ikuti tanda 乗り換え untuk pindah jalur; perhatikan nomor jalur dan arah.",
      "Saat kereta terlambat, ambil 遅延証明書 untuk sekolah/kantor.",
      "Bus: perhatikan pintu masuk, cara bayar, dan tombol berhenti.",
    ],
    steps: [
      "Cek rute dan jalur di aplikasi/peta stasiun.",
      "Isi ulang IC card atau beli tiket.",
      "Tempelkan kartu saat masuk dan keluar.",
      "Ikuti tanda 乗り換え bila perlu.",
      "Ambil 遅延証明書 bila terjadi keterlambatan.",
    ],
    confidence: "kuat",
    caution:
      "Aturan berbeda menurut operator dan wilayah. Kartu IC antarwilayah belum tentu saling menerima semua layanan.",
  },
];
