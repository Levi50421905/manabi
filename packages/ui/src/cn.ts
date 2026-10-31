import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge tidak mengenali token ukuran huruf kustom kita (`text-h1`,
 * `text-body`, dst.) karena namanya tidak ada di skala bawaan Tailwind. Tanpa
 * konfigurasi ini ia menganggap `text-h2` sebagai *warna teks*, sehingga
 * `cn("text-h2", "text-fg")` diam-diam membuang ukuran hurufnya.
 *
 * Daftarkan di sini setiap kali menambah entri `fontSize` di tailwind.config.ts.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "h1", "h2", "h3", "body", "caption"] }],
    },
  },
});

/** Gabungkan class Tailwind dengan aman (class terakhir menang). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
