"use client";

import { useEffect, useId, useRef } from "react";
import { Button, Callout, cn } from "@manabi/ui";

export interface SessionExitDialogProps {
  open: boolean;
  /** Judul dialog, mis. "Akhiri sesi latihan?". */
  title?: string;
  /** Tutup dialog tanpa mengubah sesi. */
  onCancel: () => void;
  /** Selesaikan sesi sekarang dan simpan hasilnya. */
  onFinish: () => void;
  /** Keluar dan buang seluruh jawaban sesi ini. */
  onDiscard: () => void;
}

/**
 * Konfirmasi keluar dari sesi latihan/ujian.
 *
 * Selama sesi berjalan kerangka aplikasi dikunci (lihat lib/session-guard),
 * jadi dialog ini satu-satunya jalan keluar: selesaikan sesi, kembali
 * mengerjakan, atau keluar dan buang jawaban.
 */
export function SessionExitDialog({
  open,
  title = "Keluar dari sesi?",
  onCancel,
  onFinish,
  onDiscard,
}: SessionExitDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Handler disimpan di ref supaya efek fokus/Esc tidak dipasang ulang tiap render.
  const handlers = useRef({ onCancel });
  handlers.current = { onCancel };

  useEffect(() => {
    if (!open) return;

    const previous =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    (cancelRef.current ?? panelRef.current)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handlers.current.onCancel();
        return;
      }
      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusables.length === 0) return;
      const first = focusables[0]!;
      const last = focusables[focusables.length - 1]!;

      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);

  // Kunci scroll latar selama dialog terbuka.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        tabIndex={-1}
        aria-label="Tutup dialog"
        onClick={onCancel}
        className="animate-overlay-in absolute inset-0 bg-[rgb(20_18_16/0.45)] backdrop-blur-[2px]"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className="animate-pop relative w-full max-w-[460px] rounded-2xl border border-border bg-surface p-5 shadow-overlay focus:outline-none sm:p-6"
      >
        <p className="text-caption font-semibold uppercase tracking-[0.12em] text-fg-subtle">
          Sesi berjalan
        </p>
        <h2
          id={titleId}
          className="mt-1.5 font-display text-h2 font-semibold tracking-tight text-fg"
        >
          {title}
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-relaxed text-fg-muted">
          Kamu sedang di tengah sesi, jadi navigasi ke menu lain dikunci. Pilih
          cara keluar di bawah ini.
        </p>

        <Callout tone="danger" title="Jawaban akan hilang" className="mt-4">
          <p className="text-caption leading-relaxed text-fg-muted">
            <span className="font-semibold text-fg">Keluar &amp; buang jawaban</span> menghapus
            seluruh jawaban sesi ini dan tidak menyimpan hasil. Tindakan ini tidak bisa
            dibatalkan.
          </p>
        </Callout>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            size="lg"
            className="w-full sm:w-auto"
            onClick={onFinish}
          >
            Selesaikan sesi
          </Button>
          <Button
            ref={cancelRef}
            size="lg"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onCancel}
          >
            Lanjut mengerjakan
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className={cn("w-full text-danger hover:bg-danger-soft hover:text-danger sm:w-auto")}
            onClick={onDiscard}
          >
            Keluar &amp; buang jawaban
          </Button>
        </div>
      </div>
    </div>
  );
}
