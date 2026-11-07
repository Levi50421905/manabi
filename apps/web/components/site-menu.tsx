"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Menu navigasi situs untuk beranda di layar kecil.
 *
 * Navbar beranda (`hidden md:flex`) hilang di bawah 768px, jadi tombol ini
 * membuka panel berisi tautan yang sama plus pintu masuk ke dasbor.
 * Ditulis sebagai komponen klien kecil supaya `app/page.tsx` tetap server
 * component; halaman aplikasi lain memakai `components/app-shell.tsx` dan
 * tidak tersentuh.
 */

const MENU_LINKS = [
  { href: "#kurikulum", label: "Kurikulum" },
  { href: "#modul", label: "Modul" },
  { href: "/dictionary", label: "Kamus" },
  { href: "/about", label: "Tentang" },
] as const;

const PANEL_ID = "menu-situs-mobile";
const PANEL_TITLE_ID = "menu-situs-mobile-judul";

export function SiteMenu() {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  const closeMenu = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  // Esc, klik latar (lewat tombol overlay), kunci gulir, dan tutup saat
  // viewport melebar ke ukuran desktop.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    // Fokus pindah ke tautan pertama supaya pengguna papan ketik tidak
    // "terjebak" di belakang panel.
    firstLinkRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Menu navigasi"
        aria-expanded={open}
        aria-controls={PANEL_ID}
        aria-haspopup="dialog"
        onClick={() => (open ? closeMenu() : setOpen(true))}
        className="grid h-11 w-11 place-items-center rounded-lg border border-border bg-surface text-fg transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      >
        {open ? (
          <span aria-hidden="true" className="text-xl leading-none">
            ×
          </span>
        ) : (
          <span aria-hidden="true" className="flex flex-col items-center gap-[3px]">
            <span className="block h-[2px] w-4 rounded-full bg-fg" />
            <span className="block h-[2px] w-4 rounded-full bg-fg" />
            <span className="block h-[2px] w-4 rounded-full bg-fg" />
          </span>
        )}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            tabIndex={-1}
            aria-label="Tutup menu"
            onClick={closeMenu}
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
          />
          <div
            id={PANEL_ID}
            role="dialog"
            aria-modal="true"
            aria-labelledby={PANEL_TITLE_ID}
            className="animate-sheet-up absolute inset-x-3 top-3 rounded-2xl border border-border bg-surface p-4 shadow-overlay"
          >
            <div className="flex items-center justify-between gap-3">
              <p
                id={PANEL_TITLE_ID}
                className="text-caption font-semibold uppercase tracking-[0.12em] text-fg-muted"
              >
                Menu
              </p>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="Tutup menu"
                className="grid h-11 w-11 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
              >
                <span aria-hidden="true" className="text-xl leading-none">
                  ×
                </span>
              </button>
            </div>

            <nav aria-label="Navigasi situs untuk ponsel" className="mt-2">
              <ul className="space-y-1">
                {MENU_LINKS.map((link, index) => (
                  <li key={link.href}>
                    <Link
                      ref={index === 0 ? firstLinkRef : undefined}
                      href={link.href}
                      onClick={closeMenu}
                      className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-fg transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <Link
              href="/dashboard"
              onClick={closeMenu}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-level px-4 text-sm font-semibold text-level-contrast shadow-soft transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
            >
              Buka dasbor
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
