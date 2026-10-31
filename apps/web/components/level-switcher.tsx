"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@manabi/ui";
import {
  LEVEL_ORDER,
  availableLevels,
  levelClassName,
  levelMeta,
  type JlptLevel,
} from "@manabi/content";
import { updatePrefs } from "@/lib/prefs";
import { useActiveLevel } from "@/lib/level";

/** Ganti segmen level pertama pada pathname, mis. /n5/vocab → /n4/vocab. */
function replaceLevelInPath(pathname: string, next: JlptLevel): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${next.toLowerCase()}`;
  const first = parts[0].toUpperCase();
  if (LEVEL_ORDER.includes(first as JlptLevel)) {
    parts[0] = next.toLowerCase();
  } else {
    parts.unshift(next.toLowerCase());
  }
  return `/${parts.join("/")}`;
}

export function useSwitchLevel(): (level: JlptLevel) => void {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { fromRoute } = useActiveLevel();

  return (level: JlptLevel) => {
    updatePrefs({ level });
    if (fromRoute) {
      router.push(replaceLevelInPath(pathname, level));
    } else {
      router.push(`/${level.toLowerCase()}`);
    }
  };
}

function levelAvailable(level: JlptLevel): boolean {
  return availableLevels.includes(level);
}

/** Baris tombol level untuk rail desktop. */
export function LevelRail() {
  const { level: active } = useActiveLevel();
  const switchLevel = useSwitchLevel();

  return (
    <div
      className={cn(levelClassName(active), "rounded-xl border border-border bg-surface p-1")}
      role="group"
      aria-label="Pilih level JLPT"
    >
      <div className="flex items-center gap-0.5">
        {LEVEL_ORDER.map((level) => {
          const available = levelAvailable(level);
          const isActive = level === active;
          return (
            <button
              key={level}
              type="button"
              disabled={!available}
              aria-pressed={isActive}
              aria-label={available ? `Level ${level}` : `Level ${level} belum tersedia`}
              onClick={() => switchLevel(level)}
              className={cn(
                "tnum flex-1 rounded-lg py-1.5 text-caption font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                isActive
                  ? "bg-level text-level-contrast"
                  : available
                    ? "text-fg-muted hover:bg-surface-muted hover:text-fg"
                    : "cursor-not-allowed text-fg-subtle/50",
              )}
            >
              {level}
            </button>
          );
        })}
      </div>
      <Link
        href={`/${active.toLowerCase()}`}
        className="mt-0.5 block rounded-lg px-2 pb-1 pt-1.5 text-center text-caption text-fg-muted transition-colors hover:text-fg"
      >
        {levelMeta(active).name} · <span lang="ja" className="jp">{levelMeta(active).japanese}</span>
      </Link>
    </div>
  );
}

/** Daftar level vertikal untuk sheet mobile. */
export function LevelList({ onPick }: { onPick?: () => void }) {
  const { level: active } = useActiveLevel();
  const switchLevel = useSwitchLevel();

  return (
    <ul className="space-y-1.5">
      {LEVEL_ORDER.map((level) => {
        const meta = levelMeta(level);
        const available = levelAvailable(level);
        const isActive = level === active;
        return (
          <li key={level}>
            <button
              type="button"
              disabled={!available}
              onClick={() => {
                switchLevel(level);
                onPick?.();
              }}
              className={cn(
                cn(levelClassName(level)),
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "border-level/40 bg-level-soft"
                  : available
                    ? "border-border bg-surface hover:border-border-strong"
                    : "cursor-not-allowed border-border bg-surface opacity-55",
              )}
            >
              <span
                className={cn(
                  "tnum grid h-9 w-9 shrink-0 place-items-center rounded-lg text-caption font-bold",
                  isActive ? "bg-level text-level-contrast" : "bg-surface-muted text-fg-muted",
                )}
              >
                {level}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-fg">
                  {meta.name}
                  <span lang="ja" className="jp ml-1.5 text-caption font-normal text-fg-subtle">
                    {meta.japanese}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-caption text-fg-muted">
                  {available ? meta.description : "Materi sedang disusun"}
                </span>
              </span>
              {available ? null : (
                <span className="shrink-0 rounded-md bg-surface-muted px-1.5 py-0.5 text-caption font-semibold text-fg-subtle">
                  Segera
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
