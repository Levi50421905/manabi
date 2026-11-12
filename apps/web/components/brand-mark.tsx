import { cn } from "@manabi/ui";

/**
 * Tanda merek Manabi: segel 学 di atas matcha.
 * Netral, mudah dikenali, dan tidak bergantung pada aset gambar.
 */
export function BrandMark({ size = 42, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "relative grid shrink-0 place-items-center rounded-xl bg-accent text-accent-contrast shadow-soft",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <span
        lang="ja"
        className="font-jp font-bold leading-none"
        style={{ fontSize: Math.round(size * 0.46) }}
      >
        学
      </span>
    </span>
  );
}
