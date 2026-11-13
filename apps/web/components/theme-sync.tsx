"use client";

import { useEffect, useRef } from "react";
import { usePrefs } from "@/lib/prefs";

/**
 * Menyinkronkan preferensi tema ke class `dark` di <html>.
 * Script kecil di layout sudah memasang class awal (anti-flicker);
 * komponen ini yang menjaga saat tema diubah dari halaman pengaturan.
 * Saat tema berubah, transisi warna singkat dipasang agar tidak terasa
 * seperti kedipan.
 */
export function ThemeSync() {
  const [prefs] = usePrefs();
  const previousTheme = useRef<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const dark =
        prefs.theme === "dark" || (prefs.theme === "system" && media.matches);

      if (previousTheme.current !== null && previousTheme.current !== prefs.theme) {
        root.classList.add("theme-switching");
        window.setTimeout(() => root.classList.remove("theme-switching"), 320);
      }

      previousTheme.current = prefs.theme;
      root.classList.toggle("dark", dark);
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [prefs.theme]);

  return null;
}
