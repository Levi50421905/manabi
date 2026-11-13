"use client";

import { usePathname } from "next/navigation";
import { cn } from "@manabi/ui";

/**
 * Transisi masuk halaman. `key={pathname}` membuat konten baru dipasang ulang
 * saat rute berubah, lalu animasi CSS berjalan sekali. Kerangka aplikasi
 * (sidebar, top bar) tidak ikut beranimasi, jadi perpindahan terasa tenang.
 */
export function PageTransition({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname() ?? "/";

  return (
    <div key={pathname} className={cn("page-shell", className)}>
      {children}
    </div>
  );
}
