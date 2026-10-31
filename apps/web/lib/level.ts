"use client";

/**
 * Level aktif aplikasi.
 *
 * Sumber kebenaran ada di URL (`/n5/vocab`). Halaman global (dasbor, kamus)
 * memakai level terakhir yang dibuka, tersimpan di preferensi. Dengan begitu
 * menambah N4 tidak butuh perubahan kode apa pun di halaman modul.
 */

import { useEffect, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { isJlptLevel, type JlptLevel } from "@manabi/content";
import { updatePrefs, usePrefs } from "./prefs";

export interface ActiveLevel {
  level: JlptLevel;
  /** true bila level berasal dari segmen URL, bukan preferensi. */
  fromRoute: boolean;
}

/** Ambil level dari pathname mentah, mis. "/n4/vocab" → "N4". */
export function levelFromPath(pathname: string): JlptLevel | undefined {
  const segment = pathname.split("/").filter(Boolean)[0];
  if (!segment) return undefined;
  const upper = segment.toUpperCase();
  return isJlptLevel(upper) ? upper : undefined;
}

export function useActiveLevel(): ActiveLevel {
  const params = useParams();
  const pathname = usePathname();
  const [prefs] = usePrefs();

  const routeLevel = useMemo(() => {
    const raw = params?.level;
    const segment = Array.isArray(raw) ? raw[0] : raw;
    const candidate = segment ?? levelFromPath(pathname ?? "");
    if (!candidate) return undefined;
    const upper = candidate.toUpperCase();
    return isJlptLevel(upper) ? upper : undefined;
  }, [params, pathname]);

  // Ingat level terakhir agar halaman global konsisten saat level berpindah.
  useEffect(() => {
    if (routeLevel && routeLevel !== prefs.level) {
      updatePrefs({ level: routeLevel });
    }
  }, [routeLevel, prefs.level]);

  return { level: routeLevel ?? prefs.level, fromRoute: Boolean(routeLevel) };
}
