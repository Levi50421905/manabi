import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: {
    default: "Manabi — Belajar Bahasa Jepang",
    template: "%s · Manabi",
  },
  description:
    "Manabi (学び) adalah platform belajar bahasa Jepang terstruktur: kana, kanji, kosakata, tata bahasa, listening, reading, dan quiz — dengan sistem spaced repetition.",
  keywords: [
    "belajar bahasa jepang",
    "jlpt",
    "kanji",
    "hiragana",
    "katakana",
    "manabi",
  ],
};

export const viewport: Viewport = {
  themeColor: "#c94f7c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-paper font-sans text-ink-800 antialiased">
        <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col md:flex-row">
          <Sidebar />
          <main className="min-w-0 flex-1 px-4 pb-20 pt-4 md:px-8 md:py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
