"use client";

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
  { href: "/dictionary", label: "Kamus", glyph: "辞" },
  { href: "/settings", label: "Pengaturan", glyph: "設" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();
  const progress = useProgress();
  const [prefs] = usePrefs();
  const { level, intoLevel, need } = levelFromXp(progress.xp);
  const todayActions = progress.activity[dayKey()] ?? 0;

  return (
    <>
      {/* ---------- Mobile ---------- */}
      <header className="sticky top-0 z-30 border-b border-ink-100 bg-paper/95 backdrop-blur md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-sakura-600 text-sm font-bold text-white jp">
              学
            </span>
            <span className="text-sm font-semibold tracking-tight text-ink-900">Manabi</span>
          </Link>
          <div className="flex items-center gap-3 text-xs text-ink-500">
            <span aria-label="streak">🔥 {progress.streak}</span>
            <span aria-label="xp">{progress.xp} XP</span>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                isActive(pathname, item.href)
                  ? "bg-sakura-100 text-sakura-700"
                  : "text-ink-500 hover:bg-ink-100",
              )}
            >
              <span className="jp">{item.glyph}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* ---------- Desktop ---------- */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-ink-100 bg-surface/60 px-4 py-6 backdrop-blur md:flex">
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sakura-600 text-base font-bold text-white jp">
            学
          </span>
          <span>
            <span className="block text-sm font-semibold leading-tight text-ink-900">Manabi</span>
            <span className="block text-[11px] leading-tight text-ink-400">学び · belajar Jepang</span>
          </span>
        </Link>

        <nav className="mt-8 flex flex-col gap-0.5" aria-label="Navigasi utama">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sakura-50 font-medium text-sakura-700"
                    : "text-ink-600 hover:bg-ink-50 hover:text-ink-900",
                )}
              >
                <span
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-lg text-xs jp transition-colors",
                    active
                      ? "bg-sakura-600 text-white"
                      : "bg-ink-100 text-ink-500 group-hover:bg-ink-200",
                  )}
                >
                  {item.glyph}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl border border-ink-100 bg-surface p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-ink-700">Level {level}</span>
            <span className="text-ink-400">{progress.xp} XP</span>
          </div>
          <ProgressBar className="mt-2" value={intoLevel} max={need} />
          <p className="mt-2 text-[11px] text-ink-400">
            🔥 Streak {currentStreak(progress)} hari · {intoLevel}/{need} XP
          </p>
          <div className="mt-3 border-t border-ink-100 pt-2">
            <div className="flex items-center justify-between text-[11px] text-ink-400">
              <span>Target hari ini</span>
              <span>
                {Math.min(todayActions, prefs.dailyGoal)}/{prefs.dailyGoal}
              </span>
            </div>
            <ProgressBar
              className="mt-1.5"
              value={Math.min(todayActions, prefs.dailyGoal)}
              max={prefs.dailyGoal}
              tone="matcha"
            />
          </div>
        </div>
      </aside>
    </>
  );
}
