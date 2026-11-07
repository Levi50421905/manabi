"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@manabi/ui";

/**
 * Mewujudkan isi saat masuk viewport — efek fade-up halus saat scroll.
 *
 * Dipakai hanya di halaman utama agar halaman belajar tetap "sunyi" dan fokus.
 * Bila pengguna memilih mengurangi gerakan, elemen langsung tampil tanpa
 * animasi (lihat prefers-reduced-motion di globals.css).
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Tanpa IntersectionObserver: tampilkan langsung agar konten tidak hilang.
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
