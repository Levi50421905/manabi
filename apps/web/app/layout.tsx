import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppShell } from "@/components/app-shell";
import { ThemeSync } from "@/components/theme-sync";

export const metadata: Metadata = {
  title: {
    default: "Manabi — Belajar Bahasa Jepang",
    template: "%s · Manabi",
  },
  description:
    "Manabi (学び) adalah platform belajar bahasa Jepang terstruktur per level JLPT: kana, kanji, kosakata, tata bahasa, listening, reading, dan ujian — dengan sistem spaced repetition.",
  keywords: ["belajar bahasa jepang", "jlpt", "kanji", "hiragana", "katakana", "manabi"],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#121110" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Script anti-flicker: memasang class `dark` sebelum halaman dilukis,
 * membaca preferensi dari localStorage (lihat lib/prefs.ts).
 */
const THEME_SCRIPT = `try{var p=JSON.parse(localStorage.getItem("manabi:v1:prefs")||"{}");var t=p.theme||"system";var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);if(d){document.documentElement.classList.add("dark");}}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen overflow-x-hidden bg-paper font-sans text-fg antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <ThemeSync />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
