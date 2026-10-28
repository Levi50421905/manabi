"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button, cn } from "@manabi/ui";

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

function inkColor(): string {
  if (typeof window === "undefined") return "#16161a";
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--ink-900")
    .trim();
  if (!raw) return "#16161a";
  return `rgb(${raw.split(/\s+/).join(", ")})`;
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

    const ink = inkColor();
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

  // Kanvas baru & gambar petunjuk setiap kali huruf berganti
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
    if (ctx) {
      ctx.fillStyle = inkColor();
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
    if (!ctx) return;
    ctx.strokeStyle = inkColor();
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

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative h-[300px] w-[300px]">
        <div className="genko-grid absolute inset-0 rounded-2xl border border-ink-200 bg-surface" />
        {showGuide && (
          <span
            aria-hidden="true"
            lang="ja" className="jp pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[210px] leading-none text-ink-900 opacity-[0.09]"
          >
            {character}
          </span>
        )}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none rounded-2xl"
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
        <p lang="ja" className="jp text-xl font-semibold text-ink-900">{character}</p>
        {(romaji || meaning) && (
          <p className="text-xs text-ink-500">
            {romaji}
            {romaji && meaning ? " · " : ""}
            {meaning}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button size="sm" variant="outline" onClick={handleUndo} disabled={strokeCount === 0}>
          Undo
        </Button>
        <Button size="sm" variant="outline" onClick={handleClear} disabled={strokeCount === 0}>
          Hapus
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setShowGuide((value) => !value)}>
          {showGuide ? "Sembunyikan contoh" : "Tampilkan contoh"}
        </Button>
        {onNext && (
          <Button size="sm" onClick={onNext}>
            {nextLabel}
          </Button>
        )}
      </div>

      <p className={cn("text-[11px] text-ink-400", strokeCount === 0 && "opacity-60")}>
        Coretan: {strokeCount}
      </p>
    </div>
  );
}
