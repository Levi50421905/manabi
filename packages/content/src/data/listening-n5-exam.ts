import type { JlptLevel } from "../types";

/** Empat bentuk soal 聴解 N5. */
export type ExamListeningType = "task" | "point" | "expression" | "response";

export interface ExamListeningLine {
  speaker: string;
  jp: string;
}

export interface ExamListeningItem {
  id: string;
  type: ExamListeningType;
  level: JlptLevel;
  /** Semua yang dibacakan: instruksi, dialog/situasi, dan pengulangan pertanyaan. */
  script: ExamListeningLine[];
  /** Pertanyaan yang tampil di layar (bahasa Indonesia). */
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
}

export const EXAM_LISTENING_LABEL: Record<ExamListeningType, string> = {
  task: "課題理解",
  point: "ポイント理解",
  expression: "発話表現",
  response: "即時応答",
};

export const EXAM_LISTENING_HINT: Record<ExamListeningType, string> = {
  task: "Dengarkan pertanyaan, lalu pilih tindakan yang tepat.",
  point: "Dengarkan pertanyaan, lalu pilih informasi yang tepat.",
  expression: "Bayangkan situasinya, lalu pilih ucapan yang tepat.",
  response: "Dengarkan ucapannya, lalu pilih jawaban yang tepat.",
};

/**
 * Bank soal 聴解 N5 bergaya ujian resmi.
 * 7 課題理解 + 6 ポイント理解 + 5 発話表現 + 6 即時応答 = 24 soal.
 */
export const examListeningN5: ExamListeningItem[] = [
  /* ---------------- 課題理解 (7) ---------------- */
  {
    id: "listen-exam:n5:meeting",
    type: "task",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "女の人と男の人が電話で話しています。男の人はこのあと何をしますか。" },
      { speaker: "女", jp: "もしもし、山田さんですか。田中です。" },
      { speaker: "男", jp: "あ、田中さん。こんにちは。" },
      { speaker: "女", jp: "あしたの会議ですが、三時から四時に変わりました。" },
      { speaker: "男", jp: "そうですか。じゃあ、資料を作り直します。" },
      { speaker: "女", jp: "お願いします。会議室は二階の三号室です。" },
      { speaker: "男", jp: "わかりました。" },
      { speaker: "ナレーター", jp: "男の人はこのあと何をしますか。" },
    ],
    prompt: "男の人はこのあと何をしますか。",
    options: ["資料を作り直す", "会議室を予約する", "田中さんに電話をかける", "会議を三時からにする"],
    answer: 0,
    explanation: "男の人は「資料を作り直します」と言いました。会議は三時から四時に変わり、会議室は二階の三号室です。",
  },
  {
    id: "listen-exam:n5:garbage",
    type: "task",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "女の人がアパートの管理人と話しています。女の人はあした何をしますか。" },
      { speaker: "管理人", jp: "あしたは燃えるごみの日ですよ。" },
      { speaker: "女", jp: "あ、そうですか。でも、びんもあります。" },
      { speaker: "管理人", jp: "びんは来週の水曜日です。あしたはごみだけ出してください。" },
      { speaker: "女", jp: "わかりました。じゃあ、びんは来週まで家に置いておきます。" },
      { speaker: "ナレーター", jp: "女の人はあした何をしますか。" },
    ],
    prompt: "女の人はあした何をしますか。",
    options: ["燃えるごみを出す", "びんを出す", "ごみを来週まで待つ", "管理人にびんを渡す"],
    answer: 0,
    explanation: "あしたは燃えるごみの日です。びんは来週の水曜日なので、あしたはごみだけ出します。",
  },
  {
    id: "listen-exam:n5:library",
    type: "task",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "学生と図書館の人が話しています。学生はこのあと何をしますか。" },
      { speaker: "学生", jp: "すみません、この本を借りたいんですが。" },
      { speaker: "司書", jp: "はい。まず、この用紙に名前と住所を書いてください。" },
      { speaker: "学生", jp: "わかりました。ペンはどこにありますか。" },
      { speaker: "司書", jp: "あちらの机の上です。" },
      { speaker: "学生", jp: "ありがとうございます。" },
      { speaker: "ナレーター", jp: "学生はこのあと何をしますか。" },
    ],
    prompt: "学生はこのあと何をしますか。",
    options: ["用紙に名前と住所を書く", "本を図書館に返す", "司書に住所を聞く", "机をあちらへ運ぶ"],
    answer: 0,
    explanation: "司書に「この用紙に名前と住所を書いてください」と言われました。学生はまず用紙に書きます。",
  },
  {
    id: "listen-exam:n5:party",
    type: "task",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "女の人と男の人が話しています。男の人はこのあと何をしますか。" },
      { speaker: "女", jp: "土曜日のパーティー、何を持って行きますか。" },
      { speaker: "男", jp: "飲み物はもう買いました。食べ物はどうしましょうか。" },
      { speaker: "女", jp: "じゃあ、ケーキをお願いします。" },
      { speaker: "男", jp: "わかりました。何時に行きますか。" },
      { speaker: "女", jp: "六時までに来てください。" },
      { speaker: "男", jp: "はい。" },
      { speaker: "ナレーター", jp: "男の人はこのあと何をしますか。" },
    ],
    prompt: "男の人はこのあと何をしますか。",
    options: ["ケーキを買う", "飲み物を買う", "パーティーを開く", "女の人に電話する"],
    answer: 0,
    explanation: "飲み物はもう買ったので、男の人はパーティーのためにケーキを買います。",
  },
  {
    id: "listen-exam:n5:train",
    type: "task",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "駅で女の人が駅員と話しています。女の人はどうしますか。" },
      { speaker: "女", jp: "すみません、京都まで行きたいんですが、どの電車に乗ればいいですか。" },
      { speaker: "駅員", jp: "京都ですか。この電車は大阪までです。京都へは、次の快速電車に乗ってください。" },
      { speaker: "女", jp: "次の快速ですね。何番線ですか。" },
      { speaker: "駅員", jp: "三番線です。あと五分で来ます。" },
      { speaker: "女", jp: "ありがとうございます。" },
      { speaker: "ナレーター", jp: "女の人はどうしますか。" },
    ],
    prompt: "女の人はどうしますか。",
    options: ["三番線で快速電車に乗る", "大阪行きの電車に乗る", "京都まで歩いて行く", "駅員に切符を買う"],
    answer: 0,
    explanation: "京都へ行くには、三番線から来る次の快速電車に乗ります。この電車は大阪までです。",
  },
  {
    id: "listen-exam:n5:doctor",
    type: "task",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "男の人が病院で医者と話しています。男の人はこのあと何をしますか。" },
      { speaker: "医者", jp: "かぜですね。この薬を一日三回飲んでください。" },
      { speaker: "男", jp: "はい。お風呂は入ってもいいですか。" },
      { speaker: "医者", jp: "今日はやめて、ゆっくり休んでください。" },
      { speaker: "男", jp: "わかりました。" },
      { speaker: "ナレーター", jp: "男の人はこのあと何をしますか。" },
    ],
    prompt: "男の人はこのあと何をしますか。",
    options: ["薬を飲んで休む", "お風呂に入る", "仕事に行く", "もう一度病院に来る"],
    answer: 0,
    explanation: "医者に「薬を飲んで、ゆっくり休んでください」と言われました。今日はお風呂に入りません。",
  },
  {
    id: "listen-exam:n5:post",
    type: "task",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "女の人が郵便局で店員と話しています。女の人はこのあと何をしますか。" },
      { speaker: "女", jp: "この荷物をアメリカに送りたいんですが。" },
      { speaker: "店員", jp: "はい。この箱に入れて、この紙に住所を書いてください。" },
      { speaker: "女", jp: "箱はどこにありますか。" },
      { speaker: "店員", jp: "あそこのカウンターの下です。" },
      { speaker: "女", jp: "わかりました。" },
      { speaker: "ナレーター", jp: "女の人はこのあと何をしますか。" },
    ],
    prompt: "女の人はこのあと何をしますか。",
    options: ["箱に荷物を入れて住所を書く", "切手を買って家に帰る", "荷物をアメリカから受け取る", "カウンターを掃除する"],
    answer: 0,
    explanation: "女の人は箱に荷物を入れて、紙に住所を書きます。箱はカウンターの下にあります。",
  },

  /* ---------------- ポイント理解 (6) ---------------- */
  {
    id: "listen-exam:n5:time",
    type: "point",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "男の人と女の人が話しています。二人は何時に会いますか。" },
      { speaker: "男", jp: "あした、映画を見に行きませんか。" },
      { speaker: "女", jp: "いいですね。何時からですか。" },
      { speaker: "男", jp: "映画は四時からです。でも、三時半に駅で会いましょう。" },
      { speaker: "女", jp: "えーと、私は三時まで授業があります。三時半はちょっと…" },
      { speaker: "男", jp: "じゃあ、四時十分前にしましょう。映画の前にコーヒーでも飲みましょう。" },
      { speaker: "女", jp: "いいですね。" },
      { speaker: "ナレーター", jp: "二人は何時に会いますか。" },
    ],
    prompt: "二人は何時に会いますか。",
    options: ["三時", "三時半", "四時", "四時十分前"],
    answer: 3,
    explanation: "女の人は三時まで授業があります。二人は映画の前に、四時十分前に駅で会うことにしました。",
  },
  {
    id: "listen-exam:n5:price",
    type: "point",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "女の人が店で店員と話しています。女の人はいくら払いますか。" },
      { speaker: "女", jp: "この赤いかばんはいくらですか。" },
      { speaker: "店員", jp: "五千円です。茶色いかばんは四千円です。" },
      { speaker: "女", jp: "そうですか。じゃあ、赤いかばんをください。プレゼント用に包んでください。" },
      { speaker: "店員", jp: "はい。包み代は二百円です。" },
      { speaker: "女", jp: "わかりました。" },
      { speaker: "ナレーター", jp: "女の人はいくら払いますか。" },
    ],
    prompt: "女の人はいくら払いますか。",
    options: ["四千円", "四千二百円", "五千円", "五千二百円"],
    answer: 3,
    explanation: "赤いかばんは五千円で、包み代は二百円です。だから、五千二百円払います。",
  },
  {
    id: "listen-exam:n5:place",
    type: "point",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "男の人が女の人に道を聞いています。郵便局はどこにありますか。" },
      { speaker: "男", jp: "すみません、この近くに郵便局はありますか。" },
      { speaker: "女", jp: "はい。この道をまっすぐ行って、二つ目の角を右に曲がってください。" },
      { speaker: "男", jp: "二つ目ですね。" },
      { speaker: "女", jp: "ええ。右に曲がると、銀行があります。郵便局はその銀行の隣です。" },
      { speaker: "男", jp: "銀行の隣ですね。ありがとうございます。" },
      { speaker: "ナレーター", jp: "郵便局はどこにありますか。" },
    ],
    prompt: "郵便局はどこにありますか。",
    options: ["銀行の隣", "銀行の前", "二つ目の角の左", "道の反対側"],
    answer: 0,
    explanation: "二つ目の角を右に曲がると銀行があります。郵便局はその銀行の隣です。",
  },
  {
    id: "listen-exam:n5:reason",
    type: "point",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "女の人が男の人に話しています。女の人はなぜ早く帰りますか。" },
      { speaker: "女", jp: "あした、会社を休みます。" },
      { speaker: "男", jp: "どうしたんですか。" },
      { speaker: "女", jp: "母が入院しているので、病院に行きます。" },
      { speaker: "男", jp: "そうですか。大丈夫ですか。" },
      { speaker: "女", jp: "はい。あしたは手術があります。今日は早く帰って、準備します。" },
      { speaker: "男", jp: "わかりました。お大事に。" },
      { speaker: "ナレーター", jp: "女の人はなぜ早く帰りますか。" },
    ],
    prompt: "女の人はなぜ早く帰りますか。",
    options: ["病院へ行く準備をするため", "旅行の準備をするため", "会社の会議に出るため", "母と買い物に行くため"],
    answer: 0,
    explanation: "母が入院していて、あした手術があります。女の人は病院へ行く準備をするために早く帰ります。",
  },
  {
    id: "listen-exam:n5:trip",
    type: "point",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "男の人が女の人に旅行の話をしています。男の人は旅行で何をしましたか。" },
      { speaker: "男", jp: "先週、北海道に行きました。" },
      { speaker: "女", jp: "いいですね。何をしましたか。" },
      { speaker: "男", jp: "雪がたくさん降っていて、スキーをしました。でも、温泉には入りませんでした。" },
      { speaker: "女", jp: "写真は撮りましたか。" },
      { speaker: "男", jp: "はい、たくさん撮りました。" },
      { speaker: "ナレーター", jp: "男の人は旅行で何をしましたか。" },
    ],
    prompt: "男の人は旅行で何をしましたか。",
    options: ["スキーをした", "温泉に入った", "買い物をした", "海で泳いだ"],
    answer: 0,
    explanation: "男の人は北海道でスキーをしました。温泉には入りませんでした。",
  },
  {
    id: "listen-exam:n5:sunday",
    type: "point",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "女の人が男の人に週末の話をしています。女の人は日曜日に何をしますか。" },
      { speaker: "女", jp: "土曜日は友だちと買い物に行きます。" },
      { speaker: "男", jp: "日曜日は？" },
      { speaker: "女", jp: "日曜日は家で日本語を勉強します。午後から映画を見るかもしれません。" },
      { speaker: "男", jp: "いいですね。" },
      { speaker: "ナレーター", jp: "女の人は日曜日に何をしますか。" },
    ],
    prompt: "女の人は日曜日に何をしますか。",
    options: ["日本語を勉強する", "友だちと買い物に行く", "映画を見に行く", "家で料理をする"],
    answer: 0,
    explanation: "日曜日は家で日本語を勉強します。映画は「見るかもしれません」なので、まだ決まっていません。",
  },

  /* ---------------- 発話表現 (5) ---------------- */
  {
    id: "listen-exam:n5:expression-time",
    type: "expression",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "あなたは駅で友だちに会いました。今の時間が分かりません。何と言いますか。" },
    ],
    prompt: "今の時間が分かりません。何と言いますか。",
    options: ["今、何歳ですか。", "今、何時ですか。", "今、何人ですか。"],
    answer: 1,
    explanation: "Menanyakan waktu memakai 「今、何時ですか」. 「何歳」 untuk usia, 「何人」 untuk jumlah orang.",
  },
  {
    id: "listen-exam:n5:expression-staff",
    type: "expression",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "レストランで店員を呼びたいです。何と言いますか。" },
    ],
    prompt: "レストランで店員を呼びたいです。何と言いますか。",
    options: ["いらっしゃいませ。", "おかげさまで。", "すみません。"],
    answer: 2,
    explanation: "Untuk memanggil pelayan, ucapkan 「すみません」. 「いらっしゃいませ」 adalah sapaan dari pihak toko.",
  },
  {
    id: "listen-exam:n5:expression-pen",
    type: "expression",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "友だちのペンを使いたいです。何と言いますか。" },
    ],
    prompt: "友だちのペンを使いたいです。何と言いますか。",
    options: ["このペン、貸してください。", "このペン、いただきます。", "このペン、おめでとうございます。"],
    answer: 0,
    explanation: "Meminjam benda memakai 「貸してください」. 「いただきます」 dipakai sebelum makan.",
  },
  {
    id: "listen-exam:n5:expression-leave",
    type: "expression",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "会社で先に帰るとき、同僚に何と言いますか。" },
    ],
    prompt: "会社で先に帰るとき、同僚に何と言いますか。",
    options: ["おかえりなさい。", "お先に失礼します。", "いってらっしゃい。"],
    answer: 1,
    explanation: "Saat pulang lebih dulu, ucapkan 「お先に失礼します」. 「おかえりなさい」 untuk menyambut yang pulang.",
  },
  {
    id: "listen-exam:n5:expression-late",
    type: "expression",
    level: "N5",
    script: [
      { speaker: "ナレーター", jp: "約束の時間に遅れました。友だちに何と言いますか。" },
    ],
    prompt: "約束の時間に遅れました。友だちに何と言いますか。",
    options: ["おめでとうございます。", "お疲れさまでした。", "遅れて、すみません。"],
    answer: 2,
    explanation: "Meminta maaf karena terlambat: 「遅れて、すみません」.",
  },

  /* ---------------- 即時応答 (6) ---------------- */
  {
    id: "listen-exam:n5:response-thanks",
    type: "response",
    level: "N5",
    script: [
      { speaker: "男", jp: "手伝ってくれて、ありがとうございます。" },
    ],
    prompt: "何と答えますか。",
    options: ["おかげさまで。", "どういたしまして。", "はじめまして。"],
    answer: 1,
    explanation: "Jawaban untuk 「ありがとうございます」 adalah 「どういたしまして」 = sama-sama.",
  },
  {
    id: "listen-exam:n5:response-name",
    type: "response",
    level: "N5",
    script: [{ speaker: "女", jp: "お名前は何ですか。" }],
    prompt: "何と答えますか。",
    options: ["元気です。", "学生です。", "田中です。"],
    answer: 2,
    explanation: "Pertanyaan 「お名前は何ですか」 menanyakan nama, jadi jawablah dengan nama: 「田中です」.",
  },
  {
    id: "listen-exam:n5:response-toilet",
    type: "response",
    level: "N5",
    script: [{ speaker: "男", jp: "すみません、トイレはどこですか。" }],
    prompt: "何と答えますか。",
    options: ["あちらです。", "三時です。", "五百円です。"],
    answer: 0,
    explanation: "Pertanyaan 「どこですか」 menanyakan tempat, jadi jawablah dengan arah: 「あちらです」.",
  },
  {
    id: "listen-exam:n5:response-tea",
    type: "response",
    level: "N5",
    script: [{ speaker: "女", jp: "お茶、どうぞ。" }],
    prompt: "何と答えますか。",
    options: ["いかがですか。", "ありがとうございます。", "どういたしまして。"],
    answer: 1,
    explanation: "Saat ditawari sesuatu, ucapkan terima kasih: 「ありがとうございます」.",
  },
  {
    id: "listen-exam:n5:response-lunch",
    type: "response",
    level: "N5",
    script: [{ speaker: "男", jp: "一緒に昼ご飯を食べませんか。" }],
    prompt: "何と答えますか。",
    options: ["ごちそうさまでした。", "いただきます。", "いいですね。"],
    answer: 2,
    explanation: "Menerima ajakan memakai 「いいですね」. 「ごちそうさまでした」 diucapkan setelah makan.",
  },
  {
    id: "listen-exam:n5:response-difficult",
    type: "response",
    level: "N5",
    script: [{ speaker: "女", jp: "日本語は難しいですか。" }],
    prompt: "何と答えますか。",
    options: ["いいえ、あまり難しくないです。", "いいえ、日本語です。", "はい、日本語を話します。"],
    answer: 0,
    explanation: "Pertanyaan 「難しいですか」 dijawab dengan tingkat kesulitan: 「いいえ、あまり難しくないです」.",
  },
];
