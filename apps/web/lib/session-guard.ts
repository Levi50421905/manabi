"use client";

/**
 * Status "sedang dalam sesi" (latihan / ujian).
 *
 * Saat aktif, kerangka aplikasi (rail desktop, top bar, bottom nav) tidak
 * dirender, sehingga pengguna tidak bisa berpindah menu di tengah sesi.
 * Keluar dari sesi hanya lewat dialog konfirmasi di halaman sesi itu sendiri.
 *
 * Dipakai lintas komponen yang tidak saling bersarang (app-shell dan halaman
 * sesi), jadi memakai external store kecil seperti lib/prefs.
 */

import { useEffect, useSyncExternalStore } from "react";

export interface SessionState {
  active: boolean;
  /** Judul sesi untuk ditampilkan di layar sempit, mis. "Latihan · Kosakata". */
  label: string;
}

const INACTIVE: SessionState = { active: false, label: "" };

let state: SessionState = INACTIVE;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): SessionState {
  return state;
}

function getServerSnapshot(): SessionState {
  return INACTIVE;
}

/** Nyalakan/matikan kunci sesi. Aman dipanggil berulang dengan nilai sama. */
export function setSessionActive(active: boolean, label = ""): void {
  if (state.active === active && state.label === label) return;
  state = active ? { active: true, label } : INACTIVE;
  emit();
}

/** Apakah sedang ada sesi berjalan. */
export function isSessionActive(): boolean {
  return state.active;
}

export function useSessionActive(): SessionState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Pasang penjaga `beforeunload` selama sesi aktif: menutup tab atau memuat
 * ulang halaman akan memunculkan konfirmasi bawaan browser.
 */
export function useBeforeUnloadGuard(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // Safari lama butuh returnValue terisi.
      event.returnValue = "";
      return "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
  }, [active]);
}
