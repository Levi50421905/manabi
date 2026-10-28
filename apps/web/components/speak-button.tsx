"use client";

import { useEffect, useState } from "react";
import { Button, cn, type ButtonSize } from "@manabi/ui";
import { isSpeechSupported, speak } from "@/lib/tts";

interface SpeakButtonProps {
  text: string;
  rate?: number;
  size?: ButtonSize;
  variant?: "ghost" | "outline" | "primary";
  className?: string;
  label?: string;
}

export function SpeakButton({
  text,
  rate,
  size = "sm",
  variant = "outline",
  className,
  label,
}: SpeakButtonProps) {
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(isSpeechSupported());
  }, []);

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={!supported}
      title={supported ? "Putar pelafalan" : "Browser tidak mendukung pelafalan"}
      onClick={() => speak(text, { rate })}
      aria-label={label ?? `Putar pelafalan: ${text}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
        <path d="M15.5 8.5a5 5 0 0 1 0 7" />
        <path d="M18.5 5.5a9 9 0 0 1 0 13" />
      </svg>
      {label}
    </Button>
  );
}
