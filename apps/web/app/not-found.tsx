import Link from "next/link";
import { Button } from "@manabi/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p lang="ja" className="jp text-6xl font-semibold text-ink-200">見</p>
      <h1 className="mt-4 text-xl font-bold text-ink-900">Halaman tidak ditemukan</h1>
      <p className="mt-1 text-sm text-ink-500">
        ページが見つかりません — sepertinya kamu tersesat.
      </p>
      <Link href="/dashboard" className="mt-5">
        <Button>Kembali ke dasbor</Button>
      </Link>
    </div>
  );
}
