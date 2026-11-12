import { redirect } from "next/navigation";

/**
 * Bank Soal kini bukan halaman, melainkan lapisan data untuk Latihan Soal.
 *
 * Rute lama tetap hidup sebagai pengalihan supaya bookmark dan tautan lama
 * mendarat di tempat yang benar. Di halaman Latihan, deck bank muncul sebagai
 * pilihan sumber soal (Bank N5 / Bank JFT-Basic), bukan menu tersendiri.
 */
export default async function BankPage({
  params,
}: {
  params: Promise<{ level: string }>;
}) {
  const { level } = await params;
  redirect(`/${level.toLowerCase()}/quiz`);
}
