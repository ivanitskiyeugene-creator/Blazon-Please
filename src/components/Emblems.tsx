import { useLayoutEffect, useRef } from "react";
import type { Country } from "../game/types";

const GOLD = "#d2aa38";
const DARK = "#4a100d";
const SIZE = 32;

type Draw = (ctx: CanvasRenderingContext2D) => void;

function PixelCanvas({ size, draw, className = "" }: { size: number; draw: Draw; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.imageSmoothingEnabled = false;
    draw(ctx);
  }, [draw]);
  return (
    <canvas
      ref={ref}
      width={SIZE}
      height={SIZE}
      className={`pixel-emblem ${className}`}
      aria-hidden="true"
      style={{ width: size, height: size, display: "block", imageRendering: "pixelated" }}
    />
  );
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function line(ctx: CanvasRenderingContext2D, ax: number, ay: number, bx: number, by: number, color: string, thickness = 1) {
  let x0 = Math.round(ax);
  let y0 = Math.round(ay);
  const x1 = Math.round(bx);
  const y1 = Math.round(by);
  const dx = Math.abs(x1 - x0);
  const sx = x0 < x1 ? 1 : -1;
  const dy = -Math.abs(y1 - y0);
  const sy = y0 < y1 ? 1 : -1;
  let error = dx + dy;
  while (true) {
    rect(ctx, x0, y0, thickness, thickness, color);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * error;
    if (e2 >= dy) { error += dy; x0 += sx; }
    if (e2 <= dx) { error += dx; y0 += sy; }
  }
}

function badge(ctx: CanvasRenderingContext2D, fill: string, border: string) {
  rect(ctx, 1, 1, 30, 30, border);
  rect(ctx, 3, 3, 26, 26, fill);
  rect(ctx, 5, 5, 22, 1, "#ffffff22");
  rect(ctx, 5, 26, 22, 1, "#2a090777");
}

const ORBIT = [
  [4, 16], [5, 13], [8, 11], [12, 10], [20, 10], [24, 11], [27, 13], [28, 16],
  [27, 19], [24, 21], [20, 22], [12, 22], [8, 21], [5, 19], [4, 16],
] as const;

function drawOrbit(ctx: CanvasRenderingContext2D, turn: number, color: string) {
  const rad = (turn * Math.PI) / 180;
  const points = ORBIT.map(([x, y]) => {
    const dx = x - 16;
    const dy = y - 16;
    return [Math.round(16 + dx * Math.cos(rad) - dy * Math.sin(rad)), Math.round(16 + dx * Math.sin(rad) + dy * Math.cos(rad))] as const;
  });
  for (let i = 0; i < points.length - 1; i += 1) {
    line(ctx, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1], color);
  }
}

/** Настоящий 32×32 bitmap-герб АССР. */
export function AtomEmblem({
  size = 48,
  color = GOLD,
  orbits = 3,
  badge: hasBadge = false,
}: {
  size?: number;
  color?: string;
  orbits?: 2 | 3;
  badge?: boolean;
}) {
  const draw: Draw = (ctx) => {
    if (hasBadge) badge(ctx, "#7b1c18", DARK);
    [0, 60, 120].slice(0, orbits).forEach((turn) => drawOrbit(ctx, turn, color));
    rect(ctx, 14, 14, 5, 5, "#0d0b09");
    rect(ctx, 15, 15, 3, 3, color);
    rect(ctx, 27, 15, 3, 3, color);
    if (orbits === 3) rect(ctx, 8, 24, 3, 3, color);
  };
  return <PixelCanvas size={size} draw={draw} />;
}

/** Ручной bitmap-знак КПТА: канонический вариант зеркалит молот вправо. */
export function PartyEmblem({
  size = 48,
  mirrored = true,
  badge: hasBadge = true,
}: {
  size?: number;
  color?: string;
  mirrored?: boolean;
  badge?: boolean;
}) {
  const draw: Draw = (ctx) => {
    if (hasBadge) badge(ctx, "#711713", GOLD);
    const mx = (x: number) => mirrored ? 31 - x : x;
    const pRect = (x: number, y: number, w: number, h: number, color: string) => {
      if (mirrored) rect(ctx, mx(x + w - 1), y, w, h, color);
      else rect(ctx, x, y, w, h, color);
    };
    // Ступенчатый серп.
    pRect(21, 5, 4, 2, GOLD);
    pRect(24, 7, 3, 4, GOLD);
    pRect(26, 10, 3, 8, GOLD);
    pRect(24, 17, 3, 5, GOLD);
    pRect(21, 21, 4, 4, GOLD);
    pRect(17, 24, 6, 3, GOLD);
    pRect(10, 23, 8, 3, GOLD);
    pRect(7, 20, 5, 4, GOLD);
    pRect(5, 16, 4, 5, GOLD);
    // Молот, собранный из пиксельной диагонали и прямоугольной головки.
    for (let n = 0; n < 16; n += 1) pRect(8 + n, 8 + n, 3, 3, GOLD);
    pRect(4, 5, 11, 5, GOLD);
    pRect(4, 5, 5, 8, GOLD);
  };
  return <PixelCanvas size={size} draw={draw} />;
}

export function CountryEmblem({ country, size = 48, fake }: { country: Country; size?: number; fake?: "orb2" }) {
  if (country.emblem === "atom") {
    return <AtomEmblem size={size} color={GOLD} orbits={fake === "orb2" ? 2 : 3} badge />;
  }

  const draw: Draw = (ctx) => {
    badge(ctx, country.color, "#120e0b");
    if (country.emblem === "star") {
      const rows = [
        [15, 2], [14, 4], [13, 6], [5, 22], [8, 16], [10, 12], [12, 8], [10, 12], [9, 6], [7, 5],
      ];
      rows.forEach(([x, w], i) => rect(ctx, x, 5 + i * 2, w, 2, GOLD));
    }
    if (country.emblem === "wings") {
      line(ctx, 16, 5, 10, 16, GOLD, 2);
      line(ctx, 10, 16, 16, 27, GOLD, 2);
      line(ctx, 16, 27, 22, 16, GOLD, 2);
      line(ctx, 22, 16, 16, 5, GOLD, 2);
      rect(ctx, 4, 10, 7, 2, GOLD); rect(ctx, 3, 15, 8, 2, GOLD); rect(ctx, 4, 20, 7, 2, GOLD);
      rect(ctx, 21, 10, 7, 2, GOLD); rect(ctx, 21, 15, 8, 2, GOLD); rect(ctx, 21, 20, 7, 2, GOLD);
    }
    if (country.emblem === "gear") {
      rect(ctx, 13, 5, 6, 22, GOLD); rect(ctx, 5, 13, 22, 6, GOLD); rect(ctx, 8, 8, 16, 16, GOLD);
      rect(ctx, 12, 12, 8, 8, country.color);
    }
    if (country.emblem === "wheat") {
      rect(ctx, 15, 6, 3, 22, GOLD);
      rect(ctx, 9, 8, 6, 3, GOLD); rect(ctx, 18, 11, 6, 3, GOLD);
      rect(ctx, 8, 15, 7, 3, GOLD); rect(ctx, 18, 18, 7, 3, GOLD); rect(ctx, 10, 22, 5, 3, GOLD);
    }
  };
  return <PixelCanvas size={size} draw={draw} />;
}
