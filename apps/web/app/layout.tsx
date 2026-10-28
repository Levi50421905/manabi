import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { ThemeSync } from "@/components/theme-sync";

export const metadata: Metadata = {
  title: {
    default: "Manabi — Belajar Bahasa Jepang",
    template: "%s · Manabi",
  },
  description:
    "Manabi (学び) adalah platform belajar bahasa Jepang terstruktur: kana, kanji, kosakata, tata bahasa, listening, reading, dan quiz — dengan sistem spaced repetition.",
  keywords: ["belajar bahasa jepang", "jlpt", "kanji", "hiragana", "katakana", "manabi"],
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#c94f7c" },
    { media: "(prefers-color-scheme: dark)", color: "#111117" },
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
      <body className="min-h-screen overflow-x-hidden bg-paper font-sans text-ink-800 antialiased">
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <ThemeSync />
        <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col md:flex-row">
          <Sidebar />
          <main className="min-w-0 flex-1 px-3 pb-24 pt-3 sm:px-4 md:px-8 md:pb-20 md:py-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
