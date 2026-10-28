"use client";

import { useEffect } from "react";
import { usePrefs } from "@/lib/prefs";

/**
 * Menyinkronkan preferensi tema ke class `dark` di <html>.
 * Script kecil di layout sudah memasang class awal (anti-flicker);
 * komponen ini yang menjaga saat tema diubah dari halaman pengaturan.
 */
export function ThemeSync() {
  const [prefs] = usePrefs();

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const dark =
        prefs.theme === "dark" || (prefs.theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
    };

    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [prefs.theme]);

  return null;
}
