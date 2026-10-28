"use client";

import { useEffect, useState } from "react";
import { Button, cn, type ButtonSize } from "@manabi/ui";
import { isSpeechSupported, speak, voiceStatus, type VoiceStatus } from "@/lib/tts";
import { usePrefs } from "@/lib/prefs";

interface SpeakButtonProps {
  text: string;
  /** Override kecepatan; default mengikuti pengaturan pengguna. */
  rate?: number;
  /** Indeks pembicara dalam dialog — membuat suara/nada berbeda per orang. */
  speakerIndex?: number;
  size?: ButtonSize;
  variant?: "ghost" | "outline" | "primary";
  className?: string;
  label?: string;
}

export function SpeakButton({
  text,
  rate,
  speakerIndex = 0,
  size = "sm",
  variant = "outline",
  className,
  label,
}: SpeakButtonProps) {
  const [prefs] = usePrefs();
  const [status, setStatus] = useState<VoiceStatus | "unknown">("unknown");

  useEffect(() => {
    if (!isSpeechSupported()) {
      setStatus("unsupported");
      return;
    }

    const synth = window.speechSynthesis;
    const check = () => setStatus(voiceStatus());
    check();

    synth.addEventListener("voiceschanged", check);
    // Sebagian browser baru mengisi daftar voice setelah beberapa saat.
    const timer = window.setTimeout(check, 1000);

    return () => {
      synth.removeEventListener("voiceschanged", check);
      window.clearTimeout(timer);
    };
  }, []);

  const disabled = status === "unsupported" || status === "missing";

  const title =
    status === "unsupported"
      ? "Browser ini tidak mendukung pelafalan"
      : status === "missing"
        ? "Belum ada suara Jepang di perangkat ini (Windows: Settings → Time & Language → Speech → Add voices → Japanese)"
        : `Putar pelafalan (${prefs.ttsRate}×)`;

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      disabled={disabled}
      title={title}
      onClick={() => speak(text, { rate: rate ?? prefs.ttsRate, speakerIndex })}
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
