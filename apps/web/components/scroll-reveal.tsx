"use client";

import { useEffect } from "react";

/**
 * Fade-up halus saat bagian halaman masuk viewport.
 *
 * Dipasang SEKALI di halaman utama dan bekerja otomatis pada semua <section>
 * di dalam <main>, sehingga tidak perlu menambah atribut di tiap bagian.
 * Halaman modul, latihan, dan ujian sengaja tidak memakai ini agar tetap sunyi.
 */
export function ScrollReveal() {
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll("main > section"));
    if (sections.length === 0) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Hero sudah punya animasi sendiri; bagian lain diberi reveal.
    const targets = sections.slice(1);

    if (reduce || typeof IntersectionObserver === "undefined") {
      targets.forEach((node) => node.classList.add("reveal", "is-visible"));
      return;
    }

    targets.forEach((node) => node.classList.add("reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.06 },
    );

    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return null;
}
