import Link from "next/link";
import { availableLevels, levelHref } from "@manabi/content";

/**
 * Catatan: `not-found.tsx` adalah server component — tidak ada hook, jadi
 * level tidak dibaca dari preferensi. Level yang ditawarkan diambil dari
 * `availableLevels` (materi yang benar-benar ada), yang saat ini N5.
 *
 * Tombol dibuat sebagai <Link> biasa, bukan <Button>: `Button` merender
 * <button> dan menyarangkannya di dalam <a> melanggar aturan interaktif
 * bersarang. Kelas di bawah menyalin tampilan varian `primary` dan `outline`.
 */
const PRIMARY_LINK =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-medium text-accent-contrast shadow-soft transition-colors duration-150 hover:bg-accent-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:w-auto";

const SECONDARY_LINK =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-5 text-sm font-medium text-fg transition-colors duration-150 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper sm:w-auto";

export default function NotFound() {
  const firstLevel = availableLevels[0] ?? "N5";

  return (
    <div className="mx-auto flex min-h-[68vh] max-w-[640px] flex-col items-center justify-center py-14 text-center">
      <p
        lang="ja"
        aria-hidden="true"
        className="font-jp-serif select-none text-6xl font-semibold leading-none text-level/30"
      >
        迷
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <span className="label-micro tnum">404</span>
        <span aria-hidden="true" className="h-3 w-px bg-border-strong" />
        <span lang="ja" className="font-jp text-sm text-fg-subtle">
          ページが見つかりません
        </span>
      </div>

      <h1 className="mt-3 font-display text-h1 font-semibold tracking-tight text-fg">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-fg-muted">
        Alamat ini tidak ada atau sudah dipindahkan. Tidak masalah — jalan pulang masih terbuka.
      </p>

      <div className="mt-7 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <Link href="/dashboard" className={PRIMARY_LINK}>
          Kembali ke dasbor
        </Link>
        <Link href={levelHref(firstLevel)} className={SECONDARY_LINK}>
          Buka level {firstLevel}
        </Link>
      </div>

      <p className="mt-6 text-caption text-fg-subtle">
        Atau langsung ke{" "}
        <Link
          href={levelHref(firstLevel, "kana")}
          className="font-medium text-fg-muted underline decoration-border-strong underline-offset-4 transition-colors hover:text-fg"
        >
          Kana
        </Link>
        {" · "}
        <Link
          href={levelHref(firstLevel, "vocab")}
          className="font-medium text-fg-muted underline decoration-border-strong underline-offset-4 transition-colors hover:text-fg"
        >
          Kosakata
        </Link>
        {" · "}
        <Link
          href="/settings"
          className="font-medium text-fg-muted underline decoration-border-strong underline-offset-4 transition-colors hover:text-fg"
        >
          Pengaturan
        </Link>
      </p>

      <p lang="ja" className="mt-8 font-jp-serif text-lg text-fg-subtle">
        道は、まだ続く。
      </p>
    </div>
  );
}
