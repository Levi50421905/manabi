"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@manabi/ui";
import {
  NAV_ITEMS,
  NAV_SECTIONS,
  levelClassName,
  levelMeta,
  navItemActive,
  navItemHref,
  type JlptLevel,
  type NavItem,
} from "@manabi/content";
import { currentStreak, dayKey, levelFromXp, useProgress } from "@/lib/store";
import { usePrefs } from "@/lib/prefs";
import { useActiveLevel } from "@/lib/level";
import { useSessionActive } from "@/lib/session-guard";
import { LevelList, LevelRail } from "./level-switcher";
import { Mascot } from "./mascot";
import { PageTransition } from "./page-transition";
import { RouteProgress } from "./route-progress";
import { ThemeToggle } from "./theme-toggle";

/* ------------------------------------------------------------------ *
 * Kerangka aplikasi Arah 3 「なかま」Nakama
 *
 * Sidebar sengaja ringkas supaya tidak perlu scroll panjang:
 * - sub-halaman gabungan (Tabel Kana/Menulis, Kanji/Bacaan) menjadi tab
 *   di halaman masing-masing, bukan baris menu tambahan;
 * - referensi tampil sebagai baris ikon ringkas di kaki sidebar;
 * - kartu streak besar dipindah ke Dasbor, sidebar hanya menyisakan
 *   ringkasan progres satu baris.
 * ------------------------------------------------------------------ */

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Sheet({ open, onClose, title, children }: SheetProps) {
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
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Tutup menu"
        className="animate-overlay-in absolute inset-0 bg-fg/40 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="animate-sheet-up relative max-h-[84vh] overflow-y-auto rounded-t-3xl border-t border-border bg-surface px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 shadow-overlay">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-strong" aria-hidden="true" />
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-h2 font-extrabold text-fg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="grid h-11 w-11 place-items-center rounded-2xl text-fg-muted hover:bg-surface-muted hover:text-fg"
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
 * Sidebar
 * ------------------------------------------------------------------ */
function SidebarNavLink({
  level,
  item,
  pathname,
  compact = false,
}: {
  level: JlptLevel;
  item: NavItem;
  pathname: string;
  compact?: boolean;
}) {
  const active = navItemActive(pathname, level, item);
  const href = navItemHref(level, item);

  if (compact) {
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-[11px] font-bold leading-tight transition-colors",
          active ? "bg-accent-soft text-accent" : "text-fg-muted hover:bg-surface-muted hover:text-fg",
        )}
      >
        <span lang="ja" aria-hidden="true" className="text-base leading-none">
          {item.glyph}
        </span>
        <span className="truncate">{item.label}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rail-link group flex h-10 items-center gap-2.5 rounded-xl px-2 text-[13.5px] font-bold transition-colors",
        active
          ? "bg-accent-soft text-accent"
          : "text-fg-muted hover:bg-surface-muted hover:text-fg",
      )}
    >
      <span
        lang="ja"
        aria-hidden="true"
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold transition-colors",
          active ? "bg-accent text-accent-contrast" : "bg-surface-muted text-fg-subtle",
        )}
      >
        {item.glyph}
      </span>
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="shrink-0 rounded-full bg-coral-soft px-1.5 py-0.5 text-[11px] font-extrabold text-coral-strong">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function DesktopSidebar({ pathname, level }: { pathname: string; level: JlptLevel }) {
  const progress = useProgress();
  const [prefs] = usePrefs();
  const { level: xpLevel, intoLevel, need } = levelFromXp(progress.xp);
  const todayActions = progress.activity[dayKey()] ?? 0;
  const goalPercent = Math.min(100, Math.round((todayActions / Math.max(1, prefs.dailyGoal)) * 100));

  const materi = NAV_SECTIONS.find((section) => section.id === "materi")?.items ?? [];
  const latihan = NAV_SECTIONS.find((section) => section.id === "latihan")?.items ?? [];
  const referensi = NAV_SECTIONS.find((section) => section.id === "referensi")?.items ?? [];

  return (
    <aside className="sticky top-0 hidden h-dvh w-[280px] shrink-0 flex-col border-r border-border bg-paper/80 px-4 py-5 backdrop-blur lg:flex">
      <Link href="/" className="flex items-center gap-2.5 px-1">
        <Mascot size={44} />
        <span className="min-w-0">
          <span className="block font-display text-[22px] font-black leading-none tracking-tight text-fg">
            Manabi
          </span>
          <span className="mt-1 block text-[11.5px] font-semibold leading-tight text-fg-subtle">
            Belajar bahasa Jepang
          </span>
        </span>
      </Link>

      <div className="mt-4">
        <LevelRail />
      </div>

      <nav
        className="mt-3 flex min-h-0 flex-1 flex-col overflow-y-auto pr-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Navigasi utama"
      >
        <SidebarNavLink
          level={level}
          item={NAV_ITEMS.find((item) => item.id === "dasbor") ?? NAV_SECTIONS[0]!.items[0]!}
          pathname={pathname}
        />

        <p className="label-micro rail-label mt-3 px-2 pb-1">Materi</p>
        <ul className="space-y-0.5">
          {materi.map((item) => (
            <li key={item.id}>
              <SidebarNavLink level={level} item={item} pathname={pathname} />
            </li>
          ))}
        </ul>

        <p className="label-micro rail-label mt-3 px-2 pb-1">Latihan</p>
        <ul className="space-y-0.5">
          {latihan.map((item) => (
            <li key={item.id}>
              <SidebarNavLink level={level} item={item} pathname={pathname} />
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-3 shrink-0 border-t border-border pt-3">
        <div className="rail-progress">
          <div className="flex items-center justify-between gap-2">
            <span className="label-micro">Level {xpLevel}</span>
            <span className="tnum text-caption font-extrabold text-fg">{progress.xp} XP</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-inset">
            <div
              className="progress-fill h-full rounded-full bg-accent"
              style={{ width: `${Math.round((intoLevel / need) * 100)}%` }}
            />
          </div>
          <div className="rail-goal mt-1.5 flex items-center justify-between text-[11.5px] font-bold text-fg-muted">
            <span className="tnum">🔥 Streak {currentStreak(progress)} hari</span>
            <span className="tnum">
              {Math.min(todayActions, prefs.dailyGoal)}/{prefs.dailyGoal}
            </span>
          </div>
          <div className="rail-goal mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-inset">
            <div className="h-full rounded-full bg-success" style={{ width: `${goalPercent}%` }} />
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between gap-1 border-t border-border pt-2 text-[10.5px] font-extrabold text-fg-subtle">
          {referensi.map((item) => (
            <Link
              key={item.id}
              href={navItemHref(level, item)}
              className={cn(
                "rounded-md px-1 py-0.5 transition-colors hover:text-fg",
                pathname === item.path && "text-accent",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ *
 * Topbar & mobile
 * ------------------------------------------------------------------ */
function Topbar({ pathname, level }: { pathname: string; level: JlptLevel }) {
  const activeItem = NAV_ITEMS.find((item) => navItemActive(pathname, level, item));
  const title = activeItem?.label ?? "Manabi";
  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 hidden h-16 items-center justify-between gap-3 border-b border-border bg-paper/85 px-4 backdrop-blur sm:px-6 lg:flex lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <span className="hidden text-[13px] font-extrabold text-fg lg:inline">{title}</span>
        <span className="hidden h-4 w-px bg-border lg:inline" aria-hidden="true" />
        <span className="hidden truncate text-[12px] font-semibold text-fg-subtle sm:inline" suppressHydrationWarning>
          {today}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}

function MobileTopBar({
  level,
  onOpenLevel,
  onOpenMenu,
}: {
  level: JlptLevel;
  onOpenLevel: () => void;
  onOpenMenu: () => void;
}) {
  const progress = useProgress();
  const meta = levelMeta(level);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-paper/90 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center justify-between gap-2 px-4">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Buka menu"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-border bg-surface text-fg-muted shadow-soft"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <Mascot size={36} />
            <span className="truncate font-display text-lg font-black tracking-tight text-fg">Manabi</span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenLevel}
            aria-label={`Ganti level, sekarang ${level}`}
            className="flex h-11 items-center gap-1.5 rounded-2xl border border-accent/30 bg-accent-soft px-2.5 text-caption font-extrabold text-accent"
          >
            <span className="tnum">{level}</span>
            <span lang="ja" className="jp text-[11px] font-bold">
              {meta.japanese}
            </span>
            <span aria-hidden="true" className="text-[9px] leading-none">
              ▾
            </span>
          </button>
          <span className="tnum flex h-11 items-center gap-1 rounded-2xl px-1.5 text-caption font-extrabold text-fg-muted">
            🔥 {currentStreak(progress)} hr
          </span>
          <ThemeToggle compact />
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
  onOpenMenu: (menu: "materi" | "lainnya") => void;
}) {
  const quizHref = navItemHref(
    level,
    NAV_ITEMS.find((item) => item.id === "latihan-soal") as NavItem,
  );
  const ulasanHref = navItemHref(
    level,
    NAV_ITEMS.find((item) => item.id === "ulasan") as NavItem,
  );

  const tabs = [
    {
      key: "dasbor",
      label: "Dasbor",
      glyph: "学",
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      key: "materi",
      label: "Materi",
      glyph: "あ",
      active: activeMenu === "materi",
      onClick: () => onOpenMenu("materi"),
    },
    {
      key: "latihan",
      label: "Latihan",
      glyph: "問",
      href: quizHref,
      active: pathname.startsWith(quizHref),
    },
    {
      key: "ulasan",
      label: "Ulasan",
      glyph: "復",
      href: ulasanHref,
      active: pathname.startsWith(ulasanHref),
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
      <ul className="mx-auto grid max-w-[1280px] grid-cols-5">
        {tabs.map((item) => {
          const content = (
            <>
              <span lang="ja" className="text-base leading-none" aria-hidden="true">
                {item.glyph}
              </span>
              <span>{item.label}</span>
            </>
          );
          const cls = cn(
            "flex min-h-[56px] flex-col items-center justify-center gap-1 py-2 text-[11.5px] font-extrabold transition-colors",
            item.active ? "text-accent" : "text-fg-muted",
          );
          return (
            <li key={item.key}>
              {"href" in item && item.href ? (
                <Link
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={cn(cls, "w-full")}
                >
                  {content}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={"onClick" in item ? item.onClick : undefined}
                  aria-expanded={item.active}
                  className={cn(cls, "w-full")}
                >
                  {content}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ------------------------------------------------------------------ *
 * Isi sheet
 * ------------------------------------------------------------------ */
function ModuleGrid({
  level,
  items,
  onNavigate,
}: {
  level: JlptLevel;
  items: NavItem[];
  onNavigate: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <Link
          key={item.id}
          href={navItemHref(level, item)}
          onClick={onNavigate}
          className="flex min-h-[64px] items-center gap-2.5 rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-soft transition-colors hover:border-accent/40"
        >
          <span
            lang="ja"
            aria-hidden="true"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent-soft text-sm font-extrabold text-accent"
          >
            {item.glyph}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[13px] font-extrabold text-fg">{item.label}</span>
            {item.sub ? (
              <span className="mt-0.5 block truncate text-[11px] font-semibold text-fg-subtle">
                {item.sub.map((sub) => sub.label).join(" · ")}
              </span>
            ) : null}
          </span>
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Shell
 * ------------------------------------------------------------------ */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { level } = useActiveLevel();
  const session = useSessionActive();
  const [menu, setMenu] = useState<null | "materi" | "lainnya" | "level">(null);
  const closeMenu = useCallback(() => setMenu(null), []);

  useEffect(() => {
    setMenu(null);
  }, [pathname]);

  if (pathname === "/") {
    return (
      <div className={cn(levelClassName(level), "min-h-screen")}>
        <RouteProgress />
        <PageTransition>{children}</PageTransition>
      </div>
    );
  }

  const materi = NAV_SECTIONS.find((section) => section.id === "materi")?.items ?? [];
  const latihan = NAV_SECTIONS.find((section) => section.id === "latihan")?.items ?? [];
  const referensi = NAV_SECTIONS.find((section) => section.id === "referensi")?.items ?? [];

  return (
    <div className={cn(levelClassName(level), "min-h-screen bg-paper text-fg")}>
      <RouteProgress />
      <div
        className={cn(
          "mx-auto flex w-full",
          session.active ? "max-w-[1120px]" : "max-w-[1600px]",
        )}
      >
        <div className={session.active ? "hidden" : "contents"}>
          <DesktopSidebar pathname={pathname} level={level} />
        </div>
        <div className="min-w-0 flex-1">
          <div className={session.active ? "hidden" : "contents"}>
            <MobileTopBar
              level={level}
              onOpenLevel={() => setMenu("level")}
              onOpenMenu={() => setMenu("materi")}
            />
            <Topbar pathname={pathname} level={level} />
          </div>
          <main
            className={cn(
              "mx-auto w-full max-w-[1280px] px-4 pt-5 sm:px-6 md:px-8",
              session.active ? "pb-10 md:py-8" : "pb-28 md:pb-16 md:pt-8",
            )}
          >
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
      </div>

      {!session.active ? (
        <>
          <MobileBottomNav
            pathname={pathname}
            level={level}
            activeMenu={menu === "materi" || menu === "lainnya" ? menu : null}
            onOpenMenu={(next) => setMenu((current) => (current === next ? null : next))}
          />

          <Sheet open={menu === "materi"} onClose={closeMenu} title="Materi">
            <ModuleGrid level={level} items={materi} onNavigate={closeMenu} />
            <p className="mt-4 rounded-2xl bg-surface-muted px-3 py-2.5 text-caption font-semibold leading-relaxed text-fg-muted">
              Sub-halaman seperti Tabel Kana dan Perubahan Bacaan ada sebagai tab di dalam modulnya.
            </p>
          </Sheet>

          <Sheet open={menu === "lainnya"} onClose={closeMenu} title="Lainnya">
            <div className="space-y-5">
              <div>
                <p className="label-micro mb-2">Latihan</p>
                <ModuleGrid level={level} items={latihan} onNavigate={closeMenu} />
              </div>
              <div>
                <p className="label-micro mb-2">Referensi</p>
                <ModuleGrid level={level} items={referensi} onNavigate={closeMenu} />
              </div>
              <Link
                href="/"
                onClick={closeMenu}
                className="flex min-h-[52px] items-center justify-between rounded-2xl border border-border bg-surface-muted px-4 text-sm font-extrabold text-fg"
              >
                <span>Beranda Manabi</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </Sheet>

          <Sheet open={menu === "level"} onClose={closeMenu} title="Pilih level">
            <LevelList onPick={closeMenu} />
            <p className="mt-4 text-caption font-semibold leading-relaxed text-fg-muted">
              Materi tiap level terpisah. Progres belajar dihitung per level.
            </p>
          </Sheet>
        </>
      ) : null}
    </div>
  );
}
