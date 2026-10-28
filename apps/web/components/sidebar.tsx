"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn, ProgressBar } from "@manabi/ui";
import { currentStreak, dayKey, levelFromXp, useProgress } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";

interface NavItem {
  href: string;
  label: string;
  glyph: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dasbor", glyph: "学" },
  { href: "/kana", label: "Kana", glyph: "あ" },
  { href: "/write", label: "Menulis", glyph: "書" },
  { href: "/vocab", label: "Kosakata", glyph: "語" },
  { href: "/kanji", label: "Kanji", glyph: "漢" },
  { href: "/grammar", label: "Tata Bahasa", glyph: "文" },
  { href: "/listening", label: "Listening", glyph: "聴" },
  { href: "/reading", label: "Membaca", glyph: "読" },
  { href: "/quiz", label: "Latihan", glyph: "問" },
  { href: "/ujian", label: "Ujian", glyph: "試" },
  { href: "/dictionary", label: "Kamus", glyph: "辞" },
  { href: "/settings", label: "Pengaturan", glyph: "設" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Item yang tampil langsung di bottom nav mobile. */
const MOBILE_PRIMARY = ["/dashboard", "/kana", "/vocab", "/quiz", "/dictionary"];

export function Sidebar() {
  const pathname = usePathname();
  const progress = useProgress();
  const [prefs] = usePrefs();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { level, intoLevel, need } = levelFromXp(progress.xp);
  const todayActions = progress.activity[dayKey()] ?? 0;

  return (
    <>
      {/* ---------- Mobile: header tipis + bottom nav ---------- */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-paper/95 px-4 py-2.5 backdrop-blur md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span lang="ja" className="jp grid h-8 w-8 place-items-center rounded-lg bg-accent text-sm font-bold text-accent-contrast">
            学
          </span>
          <span className="text-sm font-semibold tracking-tight text-fg">Manabi</span>
        </Link>
        <div className="flex items-center gap-3 text-xs text-fg-muted">
          <span aria-label={`streak ${currentStreak(progress)} hari`}>🔥 {currentStreak(progress)}</span>
          <span aria-label={`${progress.xp} XP`}>{progress.xp} XP</span>
        </div>
      </header>

      {/* Sheet menu "Lainnya" */}
      {sheetOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-label="Menu lainnya">
          <button
            type="button"
            aria-label="Tutup menu"
            className="absolute inset-0 bg-black/40"
            onClick={() => setSheetOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-[58px] rounded-t-2xl border-t border-border bg-surface p-3 pb-5 shadow-xl">
            <p className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wide text-fg-muted">
              Menu lainnya
            </p>
            <div className="grid grid-cols-3 gap-2">
              {NAV_ITEMS.filter((item) => !MOBILE_PRIMARY.includes(item.href)).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-[11px] transition-colors",
                    isActive(pathname, item.href)
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border text-fg-muted hover:bg-surface-muted",
                  )}
                >
                  <span lang="ja" className="jp text-base leading-none">{item.glyph}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur md:hidden"
        aria-label="Navigasi bawah"
      >
        <div className="grid grid-cols-6 pb-[env(safe-area-inset-bottom)]">
          {NAV_ITEMS.filter((item) => MOBILE_PRIMARY.includes(item.href)).map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors",
                  active ? "text-accent" : "text-fg-muted",
                )}
              >
                <span lang="ja" className="jp text-lg leading-none">{item.glyph}</span>
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setSheetOpen((value) => !value)}
            aria-expanded={sheetOpen}
            className={cn(
              "flex flex-col items-center gap-0.5 py-2 text-[10px] transition-colors",
              sheetOpen ? "text-accent" : "text-fg-muted",
            )}
          >
            <span className="text-lg leading-none">⋯</span>
            Lainnya
          </button>
        </div>
      </nav>

      {/* ---------- Desktop ---------- */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-border bg-surface/40 px-3 py-4 backdrop-blur md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sakura-600 text-base font-bold text-white jp">
            学
          </span>
          <span>
            <span className="block text-sm font-semibold leading-tight text-ink-900">Manabi</span>
            <span className="block text-[11px] leading-tight text-ink-400">学び · belajar Jepang</span>
          </span>
        </Link>

        <nav
          className="mt-4 flex flex-1 flex-col gap-0.5 overflow-y-auto pr-1"
          aria-label="Navigasi utama"
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex shrink-0 items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-fg-muted hover:bg-surface-muted hover:text-fg",
                )}
              >
                <span
                  className={cn(
                    "jp grid h-7 w-7 shrink-0 place-items-center rounded-md text-xs transition-colors",
                    active
                      ? "bg-accent text-accent-contrast"
                      : "bg-surface-muted text-fg-muted group-hover:bg-border",
                  )}
                >
                  {item.glyph}
                </span>
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-3 shrink-0 rounded-xl border border-border bg-surface p-2.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-medium text-fg">Level {level}</span>
            <span className="text-fg-muted">{progress.xp} XP</span>
          </div>
          <ProgressBar className="mt-1.5 h-1.5" value={intoLevel} max={need} />

          <div className="mt-2 flex items-center justify-between text-[10px] text-fg-muted">
            <span>🔥 {currentStreak(progress)} hari</span>
            <span>
              {Math.min(todayActions, prefs.dailyGoal)}/{prefs.dailyGoal} target
            </span>
          </div>
          <ProgressBar
            className="mt-1 h-1.5"
            value={Math.min(todayActions, prefs.dailyGoal)}
            max={prefs.dailyGoal}
            tone="matcha"
          />
        </div>
      </aside>
    </>
  );
}
