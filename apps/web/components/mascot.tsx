import { cn } from "@manabi/ui";

/**
 * Maskot sementara Manabi — buah matcha yang tersenyum.
 *
 * Dibuat dari bentuk CSS (tanpa aset) supaya ringan dan tetap tajam di semua
 * ukuran. Nanti bisa diganti maskot khusus Manabi tanpa mengubah pemakaian.
 */
export function Mascot({ size = 96, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-block shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {/* daun */}
      <span
        className="absolute left-[52%] top-[-7%] h-[24%] w-[26%] rotate-[28deg] rounded-[100%_0_100%_0] bg-accent"
        style={{ transformOrigin: "bottom left" }}
      />
      <span
        className="absolute left-[62%] top-[-3%] h-[18%] w-[20%] -rotate-[22deg] rounded-[100%_0_100%_0] bg-accent/70"
        style={{ transformOrigin: "bottom left" }}
      />
      {/* badan */}
      <span className="absolute inset-0 rounded-full border-2 border-accent/25 bg-accent-soft shadow-[inset_0_-6px_14px_rgba(36,32,27,0.06)]" />
      {/* mata */}
      <span className="absolute left-[30%] top-[43%] h-[9%] w-[9%] rounded-full bg-fg" />
      <span className="absolute right-[30%] top-[43%] h-[9%] w-[9%] rounded-full bg-fg" />
      {/* pipi */}
      <span className="absolute left-[20%] top-[58%] h-[9%] w-[14%] rounded-full bg-coral/35" />
      <span className="absolute right-[20%] top-[58%] h-[9%] w-[14%] rounded-full bg-coral/35" />
      {/* mulut */}
      <span className="absolute left-1/2 top-[57%] h-[12%] w-[18%] -translate-x-1/2 rounded-b-full border-b-2 border-fg" />
      {/* kilau */}
      <span className="absolute left-[22%] top-[22%] h-[10%] w-[16%] rotate-[-28deg] rounded-full bg-surface/70" />
    </span>
  );
}
