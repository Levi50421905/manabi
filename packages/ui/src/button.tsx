import * as React from "react";
import { cn } from "./cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "level";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-2 rounded-xl font-bold transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-emphasized hover:-translate-y-px active:translate-y-0 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-contrast shadow-soft hover:bg-accent-strong hover:shadow-lifted",
  secondary: "bg-accent-soft text-accent-strong hover:bg-accent-soft/80",
  outline: "border border-border-strong bg-surface text-fg hover:border-accent hover:bg-surface-muted",
  ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg",
  /* Teks memakai accent-contrast (terang saat tema terang, gelap saat tema
     gelap) supaya kontras tetap WCAG di kedua tema. */
  danger: "bg-danger text-accent-contrast shadow-soft hover:opacity-90",
  level: "bg-level text-level-contrast shadow-soft hover:opacity-90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-caption",
  /* 44px — target sentuh minimum di perangkat sentuh */
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-body",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Ikon di kiri label. */
  leading?: React.ReactNode;
  /** Ikon di kanan label. */
  trailing?: React.ReactNode;
  /** Lebar penuh (dipakai untuk aksi utama di mobile). */
  block?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      leading,
      trailing,
      block,
      type = "button",
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      type={type}
      className={cn(base, variants[variant], sizes[size], block && "w-full", className)}
      {...props}
    >
      {leading}
      {children}
      {trailing}
    </button>
  ),
);

Button.displayName = "Button";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Wajib: tombol ikon tidak punya label teks. */
  "aria-label": string;
  variant?: "ghost" | "outline" | "primary";
  size?: "sm" | "md";
}

/** Tombol persegi khusus ikon. Selalu beri `aria-label`. */
export function IconButton({
  className,
  variant = "ghost",
  size = "md",
  type = "button",
  ...props
}: IconButtonProps) {
  const appearance = {
    ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg",
    outline: "border border-border-strong bg-surface text-fg-muted hover:bg-surface-muted hover:text-fg",
    primary: "bg-accent text-accent-contrast shadow-soft hover:bg-accent-strong",
  } as const;

  return (
    <button
      type={type}
      className={cn(
        "grid shrink-0 place-items-center rounded-xl transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45",
        size === "sm" ? "h-9 w-9 [&>svg]:h-4 [&>svg]:w-4" : "h-11 w-11 [&>svg]:h-5 [&>svg]:w-5",
        appearance[variant],
        className,
      )}
      {...props}
    />
  );
}
