"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@manabi/ui";
import {
  levelClassName,
  levelHref,
  levelMeta,
  type JlptLevel,
} from "@manabi/content";
import { currentStreak, dayKey, levelFromXp, useProgress } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { useActiveLevel } from "@/lib/level";
import { LevelList, LevelRail } from "./level-switcher";

/* ------------------------------------------------------------------ *
 * Konfigurasi navigasi
 * ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  glyph: string;
  /** Path relatif terhadap level, mis. "vocab" → /n5/vocab. */
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Belajar",
    items: [
      { label: "Kana", glyph: "あ", path: "kana" },
      { label: "Menulis", glyph: "書", path: "write" },
      { label: "Kosakata", glyph: "語", path: "vocab" },
      { label: "Kanji", glyph: "漢", path: "kanji" },
      { label: "Tata Bahasa", glyph: "文", path: "grammar" },
      { label: "Mendengar", glyph: "聴", path: "listening" },
      { label: "Membaca", glyph: "読", path: "reading" },
    ],
  },
  {
    title: "Latihan",
    items: [
      { label: "Latihan", glyph: "問", path: "quiz" },
      { label: "Ujian", glyph: "試", path: "ujian" },
    ],
  },
];

/** Menu sekunder — sama di desktop dan mobile. */
const SECONDARY: NavItem[] = [
  { label: "Kamus", glyph: "辞", path: "dictionary" },
  { label: "Pengaturan", glyph: "設", path: "settings" },
];

const GLOBAL_HREF: Record<string, string> = {
  dictionary: "/dictionary",
  settings: "/settings",
};

function hrefFor(level: JlptLevel, path: string): string {
  return GLOBAL_HREF[path] ?? levelHref(level, path);
}

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/* ------------------------------------------------------------------ *
 * Sheet bawah (mobile)
 * ------------------------------------------------------------------ */

function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Tutup menu"
        className="animate-overlay-in absolute inset-0 bg-[rgb(20_18_16/0.45)] backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="animate-sheet-up relative max-h-[82vh] overflow-y-auto rounded-t-2xl border-t border-border bg-surface px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 shadow-overlay">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-strong" aria-hidden="true" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-h2 font-semibold text-fg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="grid h-9 w-9 place-items-center rounded-lg text-fg-muted hover:bg-surface-muted hover:text-fg"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Shell
 * ------------------------------------------------------------------ */

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { level } = useActiveLevel();
  const [menu, setMenu] = useState<null | "belajar" | "lainnya" | "level">(null);
  const closeMenu = useCallback(() => setMenu(null), []);

  // Tutup sheet setiap kali rute berubah
  useEffect(() => {
    setMenu(null);
  }, [pathname]);

  // Landing page tampil tanpa kerangka aplikasi
  if (pathname === "/") {
    return <div className={cn(levelClassName(level), "min-h-screen")}>{children}</div>;
  }

  return (
    <div className={cn(levelClassName(level), "min-h-screen bg-paper text-fg")}>
      <div className="mx-auto flex w-full max-w-[1560px]">
        <DesktopRail pathname={pathname} level={level} />
        <div className="min-w-0 flex-1">
          <MobileTopBar level={level} onOpenLevel={() => setMenu("level")} />
          <main className="mx-auto w-full max-w-[1120px] px-4 pb-28 pt-5 sm:px-6 md:px-8 md:pb-16 md:pt-8">
            {children}
          </main>
        </div>
      </div>

      <MobileBottomNav
        pathname={pathname}
        level={level}
        activeMenu={menu}
        onOpenMenu={(next) => setMenu((current) => (current === next ? null : next))}
      />

      <Sheet open={menu === "belajar"} onClose={closeMenu} title="Belajar">
        <ModuleGrid level={level} onNavigate={closeMenu} paths={NAV_SECTIONS[0].items} />
      </Sheet>

      <Sheet open={menu === "lainnya"} onClose={closeMenu} title="Lainnya">
        <div className="space-y-5">
          <div>
            <p className="label-micro mb-2">Latihan</p>
            <ModuleGrid level={level} onNavigate={closeMenu} paths={NAV_SECTIONS[1].items} />
          </div>
          <div>
            <p className="label-micro mb-2">Referensi</p>
            <ModuleGrid
              level={level}
              onNavigate={closeMenu}
              paths={[
                ...SECONDARY,
                { label: "Tentang", glyph: "情", path: "about" },
                { label: "Dasbor", glyph: "学", path: "dashboard" },
              ]}
            />
          </div>
        </div>
      </Sheet>

      <Sheet open={menu === "level"} onClose={closeMenu} title="Pilih level">
        <LevelList onPick={closeMenu} />
        <p className="mt-4 text-caption leading-relaxed text-fg-muted">
          Materi tiap level terpisah. Progres belajar Anda dihitung per level.
        </p>
      </Sheet>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Rail desktop
 * ------------------------------------------------------------------ */

function DesktopRail({ pathname, level }: { pathname: string; level: JlptLevel }) {
  const progress = useProgress();
  const [prefs] = usePrefs();
  const { level: xpLevel, intoLevel, need } = levelFromXp(progress.xp);
  const todayActions = progress.activity[dayKey()] ?? 0;
  const goalPercent = Math.min(100, Math.round((todayActions / Math.max(1, prefs.dailyGoal)) * 100));
  const meta = levelMeta(level);

  return (
    <aside className="sticky top-0 hidden h-screen w-[264px] shrink-0 flex-col border-r border-border bg-paper px-4 py-5 lg:flex">
      <Link href="/" className="flex items-center gap-2.5 px-1">
        <span
          lang="ja"
          className="jp-serif grid h-9 w-9 place-items-center rounded-lg bg-fg text-base font-semibold leading-none text-paper"
        >
          学
        </span>
        <span className="min-w-0">
          <span className="block font-display text-base font-semibold leading-tight tracking-tight text-fg">
            Manabi
          </span>
          <span className="block text-caption leading-tight text-fg-subtle">
            学び · belajar Jepang
          </span>
        </span>
      </Link>

      <div className="mt-5">
        <LevelRail />
      </div>

      <nav
        className="mt-5 flex min-h-0 flex-1 flex-col overflow-y-auto pr-1 [scrollbar-width:thin]"
        aria-label="Navigasi utama"
      >
        <Link
          href="/dashboard"
          aria-current={isActive(pathname, "/dashboard") ? "page" : undefined}
          className={cn(
            "mb-1 flex items-center gap-2.5 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
            isActive(pathname, "/dashboard")
              ? "bg-level-soft text-level"
              : "text-fg-muted hover:bg-surface-muted hover:text-fg",
          )}
        >
          <Glyph active={isActive(pathname, "/dashboard")}>学</Glyph>
          Dasbor
        </Link>

        {NAV_SECTIONS.map((section) => (
          <div key={section.title} className="mt-4 first:mt-2">
            <p className="label-micro px-2 pb-1.5">{section.title}</p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const href = hrefFor(level, item.path);
                const active = isActive(pathname, href);
                return (
                  <li key={item.path}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                        active
                          ? "bg-level-soft font-medium text-level"
                          : "text-fg-muted hover:bg-surface-muted hover:text-fg",
                      )}
                    >
                      <Glyph active={active}>{item.glyph}</Glyph>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mt-4">
          <p className="label-micro px-2 pb-1.5">Referensi</p>
          <ul className="space-y-0.5">
            {SECONDARY.map((item) => {
              const href = hrefFor(level, item.path);
              const active = isActive(pathname, href);
              return (
                <li key={item.path}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-level-soft font-medium text-level"
                        : "text-fg-muted hover:bg-surface-muted hover:text-fg",
                    )}
                  >
                    <Glyph active={active}>{item.glyph}</Glyph>
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="mt-3 shrink-0 rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center justify-between">
          <span className="label-micro">Level {xpLevel}</span>
          <span className="tnum text-caption font-semibold text-fg">{progress.xp} XP</span>
        </div>
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-surface-inset">
          <div
            className="progress-fill h-full rounded-full bg-level"
            style={{ width: `${Math.round((intoLevel / need) * 100)}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-caption text-fg-muted">
          <span className="tnum">🔥 {currentStreak(progress)} hari</span>
          <span className="tnum">
            {Math.min(todayActions, prefs.dailyGoal)}/{prefs.dailyGoal}
          </span>
        </div>
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-surface-inset">
          <div className="h-full rounded-full bg-success" style={{ width: `${goalPercent}%` }} />
        </div>
        <p className="mt-2 text-caption leading-tight text-fg-subtle">
          {meta.label} · {meta.name}
        </p>
      </div>
    </aside>
  );
}

function Glyph({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      lang="ja"
      aria-hidden="true"
      className={cn(
        "jp grid h-6 w-6 shrink-0 place-items-center rounded-md text-caption transition-colors",
        active ? "bg-level text-level-contrast" : "bg-surface-muted text-fg-subtle",
      )}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * Mobile
 * ------------------------------------------------------------------ */

function MobileTopBar({ level, onOpenLevel }: { level: JlptLevel; onOpenLevel: () => void }) {
  const progress = useProgress();
  const meta = levelMeta(level);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-paper/90 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-14 w-full max-w-[1120px] items-center justify-between gap-2 px-4">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span
            lang="ja"
            className="jp-serif grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-fg text-sm font-semibold leading-none text-paper"
          >
            学
          </span>
          <span className="truncate font-display text-[15px] font-semibold tracking-tight text-fg">
            Manabi
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenLevel}
            aria-label={`Ganti level, sekarang ${level}`}
            className="flex items-center gap-1.5 rounded-lg border border-level/30 bg-level-soft px-2 py-1.5 text-caption font-semibold text-level"
          >
            <span className="tnum">{level}</span>
            <span lang="ja" className="jp text-caption font-normal">
              {meta.japanese}
            </span>
            <span aria-hidden="true" className="text-[9px] leading-none">▾</span>
          </button>
          <span className="tnum flex items-center gap-1 rounded-lg px-1.5 py-1.5 text-caption font-semibold text-fg-muted">
            🔥 {currentStreak(progress)}
          </span>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav({
  pathname,
  level,
  activeMenu,
  onOpenMenu,
}: {
  pathname: string;
  level: JlptLevel;
  activeMenu: string | null;
  onOpenMenu: (menu: "belajar" | "lainnya") => void;
}) {
  const tab =
    "flex flex-col items-center justify-center gap-1 py-2 text-caption font-medium transition-colors";
  const vocabHref = levelHref(level, "vocab");
  const quizHref = levelHref(level, "quiz");

  const tabs = [
    {
      key: "dashboard",
      label: "Dasbor",
      glyph: "学",
      href: "/dashboard",
      active: isActive(pathname, "/dashboard"),
    },
    {
      key: "belajar",
      label: "Belajar",
      glyph: "あ",
      active: activeMenu === "belajar",
      onClick: () => onOpenMenu("belajar"),
    },
    {
      key: "vocab",
      label: "Kosakata",
      glyph: "語",
      href: vocabHref,
      active: isActive(pathname, vocabHref),
    },
    {
      key: "quiz",
      label: "Latihan",
      glyph: "問",
      href: quizHref,
      active: isActive(pathname, quizHref),
    },
    {
      key: "lainnya",
      label: "Lainnya",
      glyph: "他",
      active: activeMenu === "lainnya",
      onClick: () => onOpenMenu("lainnya"),
    },
  ] as const;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Navigasi bawah"
    >
      <ul className="mx-auto grid max-w-[1120px] grid-cols-5">
        {tabs.map((item) =>
          "href" in item && item.href ? (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={item.active ? "page" : undefined}
                className={cn(tab, item.active ? "text-level" : "text-fg-muted")}
              >
                <span lang="ja" className="jp text-base leading-none" aria-hidden="true">
                  {item.glyph}
                </span>
                {item.label}
              </Link>
            </li>
          ) : (
            <li key={item.key}>
              <button
                type="button"
                onClick={"onClick" in item ? item.onClick : undefined}
                aria-expanded={item.active}
                className={cn(tab, "w-full", item.active ? "text-level" : "text-fg-muted")}
              >
                <span lang="ja" className="jp text-base leading-none" aria-hidden="true">
                  {item.glyph}
                </span>
                {item.label}
              </button>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ *
 * Grid modul di dalam sheet
 * ------------------------------------------------------------------ */

function ModuleGrid({
  level,
  paths,
  onNavigate,
}: {
  level: JlptLevel;
  paths: NavItem[];
  onNavigate: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {paths.map((item) => {
        const href = hrefFor(level, item.path);
        return (
          <Link
            key={item.path}
            href={href}
            onClick={onNavigate}
            className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2.5 transition-colors hover:border-border-strong"
          >
            <span
              lang="ja"
              aria-hidden="true"
              className="jp grid h-8 w-8 shrink-0 place-items-center rounded-md bg-level-soft text-caption font-semibold text-level"
            >
              {item.glyph}
            </span>
            <span className="truncate text-sm font-medium text-fg">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
