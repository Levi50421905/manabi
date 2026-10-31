"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@manabi/ui";

const SIZE = 300;
const LINE_WIDTH = 12;

interface Point {
  x: number;
  y: number;
}

interface WritingPadProps {
  character: string;
  romaji?: string;
  meaning?: string;
  onNext?: () => void;
  nextLabel?: string;
}

/**
 * Warna tinta mengikuti `color` kanvas (token `text-fg`), jadi otomatis
 * menyesuaikan tema terang/gelap tanpa menulis kode warna di sini.
 */
function inkColor(canvas: HTMLCanvasElement | null): string {
  if (!canvas || typeof window === "undefined") return "";
  return window.getComputedStyle(canvas).color;
}

export function WritingPad({
  character,
  romaji,
  meaning,
  onNext,
  nextLabel = "Berikutnya",
}: WritingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Point[][]>([]);
  const currentRef = useRef<Point[]>([]);
  const drawingRef = useRef(false);
  const inkRef = useRef("");
  const [strokeCount, setStrokeCount] = useState(0);
  const [showGuide, setShowGuide] = useState(true);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = LINE_WIDTH;

    const ink = inkColor(canvas);
    if (!ink) return;
    inkRef.current = ink;
    ctx.strokeStyle = ink;
    ctx.fillStyle = ink;

    for (const stroke of strokesRef.current) {
      if (stroke.length === 1) {
        const point = stroke[0];
        if (!point) continue;
        ctx.beginPath();
        ctx.arc(point.x, point.y, LINE_WIDTH / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      stroke.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  }, []);

  // Kanvas baru setiap kali huruf berganti.
  useEffect(() => {
    strokesRef.current = [];
    currentRef.current = [];
    setStrokeCount(0);
    redraw();
  }, [character, redraw]);

  function pointsFromEvent(event: React.PointerEvent<HTMLCanvasElement>): Point {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * SIZE,
      y: ((event.clientY - rect.top) / rect.height) * SIZE,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const point = pointsFromEvent(event);
    currentRef.current = [point];

    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && inkRef.current) {
      ctx.fillStyle = inkRef.current;
      ctx.beginPath();
      ctx.arc(point.x, point.y, LINE_WIDTH / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const point = pointsFromEvent(event);
    const previous = currentRef.current[currentRef.current.length - 1];
    currentRef.current.push(point);
    if (!previous) return;

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !inkRef.current) return;
    ctx.strokeStyle = inkRef.current;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = LINE_WIDTH;
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  function handlePointerUp() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    if (currentRef.current.length > 0) {
      strokesRef.current.push(currentRef.current);
      setStrokeCount(strokesRef.current.length);
    }
    currentRef.current = [];
  }

  function handleClear() {
    strokesRef.current = [];
    currentRef.current = [];
    setStrokeCount(0);
    redraw();
  }

  function handleUndo() {
    strokesRef.current.pop();
    setStrokeCount(strokesRef.current.length);
    redraw();
  }

  /** Untuk kanji, "romaji" berisi bacaan Jepang — beri font & atribut bahasa yang tepat. */
  const hintIsJapanese = Boolean(romaji && /[^\x00-\x7F]/.test(romaji));

  return (
    <div className="flex flex-col items-center gap-4">      <div className="relative aspect-square w-full max-w-[340px] sm:max-w-[420px]">
        <div
          className="genko-grid absolute inset-0 rounded-xl border border-border bg-surface"
          aria-hidden="true"
        />
        {showGuide ? (
          <span
            aria-hidden="true"
            lang="ja"
            className="font-jp-serif pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[clamp(180px,55vw,280px)] leading-none text-fg opacity-[0.08]"
          >
            {character}
          </span>
        ) : null}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none rounded-xl text-fg"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label={`Area latihan menulis huruf ${character}`}
          role="img"
        />
      </div>

      <div className="text-center">
        <p lang="ja" className="font-jp-serif text-[40px] font-semibold leading-none text-fg">
          {character}
        </p>
        {romaji || meaning ? (
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">
            {romaji ? (
              <span
                lang={hintIsJapanese ? "ja" : undefined}
                className={hintIsJapanese ? "font-jp font-medium text-fg" : "font-medium text-fg"}
              >
                {romaji}
              </span>
            ) : null}
            {romaji && meaning ? <span aria-hidden="true"> · </span> : null}
            {meaning ? <span>{meaning}</span> : null}
          </p>
        ) : null}
      </div>

      <div className="flex w-full flex-wrap items-center justify-center gap-2">
        <Button size="lg" variant="outline" onClick={handleUndo} disabled={strokeCount === 0}>
          Undo
        </Button>
        <Button size="lg" variant="outline" onClick={handleClear} disabled={strokeCount === 0}>
          Hapus
        </Button>
        <Button
          size="lg"
          variant="ghost"
          onClick={() => setShowGuide((value) => !value)}
          aria-pressed={showGuide}
        >
          {showGuide ? "Sembunyikan contoh" : "Tampilkan contoh"}
        </Button>
      </div>

      <p className="text-caption text-fg-muted" aria-live="polite">
        Coretan: <span className="tnum font-semibold text-fg">{strokeCount}</span>
      </p>

      {onNext ? (
        <Button size="lg" variant="level" block className="sm:w-auto" onClick={onNext}>
          {nextLabel}
        </Button>
      ) : null}
    </div>
  );
}
