"use client";

import { useEffect, useState } from "react";
import { cn } from "@manabi/ui";
import { updatePrefs, usePrefs } from "@/lib/prefs";

/**
 * Tombol tema terang/gelap. Dipakai di kerangka aplikasi dan halaman beranda.
 * Status gelap dibaca dari class di <html> supaya konsisten dengan ThemeSync
 * dan skrip anti-flicker di layout.
 */
export function ThemeToggle({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [prefs] = usePrefs();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, [prefs.theme]);

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    updatePrefs({ theme: next });
    document.documentElement.classList.toggle("dark", next === "dark");
    setIsDark(!isDark);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      className={cn(
        "group inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border bg-surface px-3 text-caption font-extrabold text-fg-muted shadow-soft transition-colors hover:border-border-strong hover:text-fg",
        compact && "w-11 px-0",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="text-base leading-none transition-transform duration-300 group-hover:rotate-12"
      >
        {isDark ? "☀" : "☾"}
      </span>
      {compact ? null : <span>{isDark ? "Terang" : "Gelap"}</span>}
    </button>
  );
}
