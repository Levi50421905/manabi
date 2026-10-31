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
  "inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-emphasized active:translate-y-px disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-accent-contrast shadow-soft hover:bg-accent-strong",
  secondary: "bg-fg text-paper shadow-soft hover:opacity-90",
  outline: "border border-border-strong bg-surface text-fg hover:bg-surface-muted",
  ghost: "text-fg-muted hover:bg-surface-muted hover:text-fg",
  danger: "bg-danger text-white shadow-soft hover:opacity-90",
  level: "bg-level text-level-contrast shadow-soft hover:opacity-90",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-caption font-semibold",
  md: "h-10 px-4 text-sm",
  /* 44px — target sentuh minimum di perangkat sentuh */
  lg: "h-11 px-5 text-sm",
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
    outline: "border border-border-strong bg-surface text-fg-muted hover:text-fg",
    primary: "bg-accent text-accent-contrast hover:bg-accent-strong",
  } as const;

  return (
    <button
      type={type}
      className={cn(
        "grid shrink-0 place-items-center rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper disabled:pointer-events-none disabled:opacity-45",
        size === "sm" ? "h-8 w-8 [&>svg]:h-4 [&>svg]:w-4" : "h-10 w-10 [&>svg]:h-5 [&>svg]:w-5",
        appearance[variant],
        className,
      )}
      {...props}
    />
  );
}
