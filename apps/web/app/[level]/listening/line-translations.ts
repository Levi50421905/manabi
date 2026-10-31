/**
 * Terjemahan baris dialog Mendengar.
 *
 * Skema `ListeningLine` di `@manabi/content` hanya menyimpan speaker, teks
 * Jepang, kana, dan `id` — `id` di data lama berisi *nomor baris*, bukan
 * terjemahan (halaman lama keliru menampilkannya sebagai arti). Supaya toggle
 * "Terjemahan" tetap berfungsi tanpa membohongi pengguna, terjemahan tampilan
 * disimpan di sini, diurutkan sesuai urutan `track.lines`.
 *
 * Ketika materi listening di `packages/content` sudah punya kolom terjemahan,
 * pindahkan peta ini ke sana dan hapus berkas ini.
 */
export const LINE_TRANSLATIONS: Record<string, readonly string[]> = {
  "listen:n5:aisatsu": [
    "Selamat pagi.",
    "Selamat pagi.",
    "Cuacanya bagus, ya.",
    "Betul. Hari ini hangat.",
    "Kalau begitu, sampai nanti.",
    "Permisi, saya duluan.",
  ],
  "listen:n5:cafe": [
    "Selamat datang.",
    "Saya pesan satu kopi.",
    "Baik, pesanan diterima.",
    "Hmm, apakah ada kue juga?",
    "Ya, ada.",
    "Kalau begitu, saya tambah cheesecake juga.",
    "Totalnya sembilan ratus yen.",
  ],
  "listen:n5:michi": [
    "Permisi, stasiun di mana?",
    "Stasiun? Ikuti jalan ini lurus terus.",
    "Lurus terus, ya. Terima kasih.",
    "Ya. Ada lampu lalu lintas di sana. Stasiunnya setelah itu.",
    "Mengerti. Sangat membantu.",
  ],
  "listen:n5:jikoshoukai": [
    "Senang berkenalan. Saya Smith.",
    "Senang berkenalan. Saya Sato. Mohon bantuannya.",
    "Saya datang dari Amerika.",
    "Pekerjaan Anda apa?",
    "Saya insinyur. Saya sedang belajar bahasa Jepang.",
    "Begitu, ya. Semangat belajarnya.",
  ],
  "listen:n5:shokudou": [
    "Permisi, menu set hari ini apa?",
    "Set ikan bakar.",
    "Kalau begitu, saya ambil itu.",
    "Nasinya mau porsi besar?",
    "Tidak, porsi biasa saja.",
    "Baik, mohon tunggu sebentar.",
  ],
  "listen:n5:kaidana": [
    "Permisi, sepatu ada di mana?",
    "Di lantai tiga. Di samping lift.",
    "Terima kasih.",
    "Sedang mencari sesuatu?",
    "Saya ingin sepatu sneakers putih.",
    "Ukuran ini bagaimana?",
  ],
  "listen:n5:denwa": [
    "Halo, ini Tanaka.",
    "Oh, Tanaka. Sekarang saya agak sibuk.",
    "Mengerti. Nanti saya telepon lagi.",
    "Maaf. Kalau sebelum jam tujuh, saya bisa.",
    "Kalau begitu, jam enam saya telepon lagi.",
  ],
  "listen:n5:tenki": [
    "Hari ini cuacanya bagus, ya.",
    "Betul. Tapi katanya sore nanti akan hujan.",
    "Benarkah? Saya tidak membawa payung.",
    "Pakai payung saya saja, tidak apa-apa.",
    "Terima kasih. Sangat membantu.",
  ],
  "listen:n5:shuumatsu": [
    "Akhir pekan mau melakukan apa?",
    "Belum ada rencana apa-apa.",
    "Mau pergi ke gunung bersama?",
    "Boleh juga. Jam berapa?",
    "Ayo bertemu di stasiun jam delapan pagi.",
    "Baik. Saya tidak sabar.",
  ],
  "listen:n5:byouin": [
    "Ada keluhan apa?",
    "Kepala saya sakit dan badan juga demam.",
    "Sejak kapan?",
    "Sejak tadi malam.",
    "Minum obat ini dan istirahatlah dengan cukup.",
    "Baik. Terima kasih.",
  ],
  "listen:n5:kippu": [
    "Mau ke mana?",
    "Satu tiket ke Tokyo, ya.",
    "Sekali jalan atau pulang-pergi?",
    "Pulang-pergi, ya.",
    "Dua ribu yen.",
    "Baik. Ini uangnya.",
  ],
  "listen:n5:homestay": [
    "Selamat datang. Ini kamar Anda.",
    "Sangat rapi, ya.",
    "Sarapan jam tujuh. Tidak keberatan?",
    "Ya, tidak masalah.",
    "Kalau ada yang tidak mengerti, tanyakan saja apa pun.",
    "Terima kasih. Mohon bantuannya.",
  ],
};
