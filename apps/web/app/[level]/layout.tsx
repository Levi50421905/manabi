import { notFound } from "next/navigation";
import Link from "next/link";
import { Button, Card } from "@manabi/ui";
import {
  LEVEL_META,
  LEVEL_ORDER,
  availableLevels,
  isJlptLevel,
  type JlptLevel,
} from "@manabi/content";

/**
 * Layout segmen `/[level]`.
 *
 * Dua tugas: menolak level yang tidak dikenal (mis. `/xyz/vocab`), dan
 * menampilkan layar "segera hadir" untuk level yang sah tapi belum punya
 * materi — supaya halaman modul tidak pernah tampil kosong tanpa penjelasan.
 */
export default async function LevelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ level: string }>;
}) {
  const { level: raw } = await params;
  const level = raw.toUpperCase();

  if (!isJlptLevel(level)) notFound();

  if (!availableLevels.includes(level)) {
    return <LevelComingSoon level={level} />;
  }

  return <>{children}</>;
}

function LevelComingSoon({ level }: { level: JlptLevel }) {
  const meta = LEVEL_META[level];
  const ready = availableLevels;
  const firstReady = ready[0] ?? LEVEL_ORDER[0];

  return (
    <div className="mx-auto max-w-[620px] py-10 sm:py-16">
      <p className="label-micro">Level {level}</p>
      <h1 className="mt-3 font-display text-h1 font-semibold text-fg">
        {meta.name}
        <span lang="ja" className="ml-3 text-sm font-normal text-fg-subtle">
          {meta.japanese}
        </span>
      </h1>
      <p className="mt-3 text-body leading-relaxed text-fg-muted">
        Materi level {level} sedang disusun. Struktur aplikasinya sudah siap — begitu datanya
        ditambahkan, seluruh modul di level ini otomatis aktif tanpa perubahan tampilan.
      </p>

      <Card className="mt-7 p-5">
        <p className="label-micro">Yang sudah tersedia</p>
        <ul className="mt-3 space-y-2">
          {ready.map((item) => (
            <li key={item}>
              <Link
                href={`/${item.toLowerCase()}`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 transition-colors hover:border-border-strong"
              >
                <span className="flex items-center gap-2.5">
                  <span className="tnum grid h-8 w-8 place-items-center rounded-md bg-surface-muted text-caption font-bold text-fg-muted">
                    {item}
                  </span>
                  <span className="text-sm font-medium text-fg">{LEVEL_META[item].name}</span>
                </span>
                <span aria-hidden="true" className="text-caption text-fg-subtle">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link href={`/${firstReady.toLowerCase()}`}>
          <Button>Ke level {firstReady}</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="outline">Buka dasbor</Button>
        </Link>
      </div>
    </div>
  );
}
