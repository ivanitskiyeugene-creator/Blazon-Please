import { useLayoutEffect, useRef } from "react";
import type { Country, FakeEmblemKind } from "../game/types";

const GOLD = "#d2aa38";
const SILVER = "#c8d1db";
const DARK = "#4a100d";
const CYAN = "#48cae4";
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

/** Настоящий 32×32 bitmap-герб АССР (3 орбиты) или подделка (2 орбиты). */
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
    const mx = (x: number) => (mirrored ? 31 - x : x);
    const pRect = (x: number, y: number, w: number, h: number, col: string) => {
      if (mirrored) rect(ctx, mx(x + w - 1), y, w, h, col);
      else rect(ctx, x, y, w, h, col);
    };
    // Серп
    pRect(21, 5, 4, 2, GOLD);
    pRect(24, 7, 3, 4, GOLD);
    pRect(26, 10, 3, 8, GOLD);
    pRect(24, 17, 3, 5, GOLD);
    pRect(21, 21, 4, 4, GOLD);
    pRect(17, 24, 6, 3, GOLD);
    pRect(10, 23, 8, 3, GOLD);
    pRect(7, 20, 5, 4, GOLD);
    pRect(5, 16, 4, 5, GOLD);
    // Молот
    for (let n = 0; n < 16; n += 1) pRect(8 + n, 8 + n, 3, 3, GOLD);
    pRect(4, 5, 11, 5, GOLD);
    pRect(4, 5, 5, 8, GOLD);
  };
  return <PixelCanvas size={size} draw={draw} />;
}

/** Герб Горностана: наковальня и молот в шестерне. Подделка: молот влево. */
export function GornostanEmblem({ size = 48, fake = false }: { size?: number; fake?: boolean }) {
  const draw: Draw = (ctx) => {
    badge(ctx, "#26292d", "#121416");
    // Шестерня
    rect(ctx, 13, 5, 6, 22, "#858c94");
    rect(ctx, 5, 13, 22, 6, "#858c94");
    rect(ctx, 8, 8, 16, 16, "#858c94");
    rect(ctx, 11, 11, 10, 10, "#26292d");
    // Наковальня в центре
    rect(ctx, 10, 20, 12, 3, GOLD);
    rect(ctx, 12, 17, 8, 3, GOLD);
    // Молот: подлинник смотрит вправо (рукоять с наклоном), подделка — влево
    if (!fake) {
      // Подлинник: молот вправо
      line(ctx, 9, 21, 20, 10, GOLD, 2);
      rect(ctx, 18, 8, 7, 4, GOLD);
      rect(ctx, 22, 7, 3, 6, GOLD);
    } else {
      // Подделка: молот влево
      line(ctx, 23, 21, 12, 10, "#e06c75", 2);
      rect(ctx, 7, 8, 7, 4, "#e06c75");
      rect(ctx, 7, 7, 3, 6, "#e06c75");
    }
  };
  return <PixelCanvas size={size} draw={draw} />;
}

/** Герб Остоляндии: трехмачтовый клипер и 3 волны + 3 звезды. Подделка: корабль влево или 2 волны / 4 звезды. */
export function OstolandiaEmblem({ size = 48, fake = false }: { size?: number; fake?: boolean }) {
  const draw: Draw = (ctx) => {
    badge(ctx, "#1b3754", "#0f1c2b");
    // Волны
    const waveCount = fake ? 2 : 3;
    for (let w = 0; w < waveCount; w += 1) {
      const y = 22 + w * 2;
      for (let x = 6; x < 26; x += 4) {
        rect(ctx, x, y, 2, 1, CYAN);
        rect(ctx, x + 2, y + 1, 2, 1, CYAN);
      }
    }
    // Звезды над кораблем: 3 в подлиннике, 4 в подделке
    if (!fake) {
      rect(ctx, 10, 7, 2, 2, GOLD);
      rect(ctx, 15, 6, 2, 2, GOLD);
      rect(ctx, 20, 7, 2, 2, GOLD);
    } else {
      rect(ctx, 8, 7, 2, 2, GOLD);
      rect(ctx, 13, 6, 2, 2, GOLD);
      rect(ctx, 18, 6, 2, 2, GOLD);
      rect(ctx, 23, 7, 2, 2, GOLD);
    }
    // Корпус клипера
    if (!fake) {
      // Плывет вправо
      rect(ctx, 9, 18, 14, 3, GOLD);
      rect(ctx, 22, 17, 3, 2, GOLD);
      // Паруса
      rect(ctx, 11, 11, 3, 6, SILVER);
      rect(ctx, 16, 9, 4, 8, SILVER);
      rect(ctx, 21, 12, 2, 5, SILVER);
    } else {
      // Плывет влево (подделка)
      rect(ctx, 9, 18, 14, 3, GOLD);
      rect(ctx, 7, 17, 3, 2, GOLD);
      rect(ctx, 9, 12, 2, 5, SILVER);
      rect(ctx, 12, 9, 4, 8, SILVER);
      rect(ctx, 18, 11, 3, 6, SILVER);
    }
  };
  return <PixelCanvas size={size} draw={draw} />;
}

/** Герб Виктерии: орёл с 3 молниями в правой лапе и 6 звездами. Подделка: молнии в левой лапе или 5 звезд. */
export function VicteriaEmblem({ size = 48, fake = false }: { size?: number; fake?: boolean }) {
  const draw: Draw = (ctx) => {
    badge(ctx, "#10233d", "#08111e");
    // Звезды полукругом: 6 в подлиннике, 5 в подделке
    const starCount = fake ? 5 : 6;
    const starCoords = starCount === 6
      ? [[7, 8], [10, 6], [14, 5], [18, 5], [22, 6], [25, 8]]
      : [[8, 8], [12, 6], [16, 5], [20, 6], [24, 8]];
    starCoords.forEach(([x, y]) => rect(ctx, x, y, 2, 2, GOLD));

    // Крылья орла
    line(ctx, 16, 9, 8, 14, GOLD, 2);
    line(ctx, 8, 14, 6, 20, GOLD, 2);
    line(ctx, 16, 9, 24, 14, GOLD, 2);
    line(ctx, 24, 14, 26, 20, GOLD, 2);
    rect(ctx, 14, 11, 4, 8, GOLD); // тело
    rect(ctx, 15, 8, 3, 3, "#ffffff"); // голова

    // Молнии в лапе
    if (!fake) {
      // В правой лапе (x: 19..24)
      rect(ctx, 19, 18, 4, 2, CYAN);
      rect(ctx, 21, 20, 4, 2, CYAN);
      rect(ctx, 19, 22, 5, 2, CYAN);
      // Оливковая ветвь в левой
      rect(ctx, 8, 19, 4, 3, "#4ade80");
    } else {
      // Подделка: молнии в левой лапе
      rect(ctx, 9, 18, 4, 2, CYAN);
      rect(ctx, 7, 20, 4, 2, CYAN);
      rect(ctx, 8, 22, 5, 2, CYAN);
      rect(ctx, 20, 19, 4, 3, "#4ade80");
    }
  };
  return <PixelCanvas size={size} draw={draw} />;
}

/** Герб Ондара: восходящее солнце с 7 лучами + шестерня и колос. Подделка: 5 лучей. */
export function OndarEmblem({ size = 48, fake = false }: { size?: number; fake?: boolean }) {
  const draw: Draw = (ctx) => {
    badge(ctx, "#183822", "#0b1d11");
    // Лучи солнца
    const rayAngles = fake
      ? [0, 45, 90, 135, 180] // 5 лучей
      : [0, 30, 60, 90, 120, 150, 180]; // 7 лучей в подлиннике
    rayAngles.forEach((deg) => {
      const rad = (deg * Math.PI) / 180;
      const x = Math.round(16 + 10 * Math.cos(rad));
      const y = Math.round(16 - 10 * Math.sin(rad));
      line(ctx, 16, 16, x, y, GOLD, 1);
    });
    // Солнечный диск
    rect(ctx, 12, 12, 8, 8, GOLD);
    // Шестерня внизу
    rect(ctx, 10, 20, 12, 4, "#5c6b73");
    rect(ctx, 14, 18, 4, 8, "#5c6b73");
    rect(ctx, 15, 21, 2, 2, "#183822");
    // Колосья по бокам
    rect(ctx, 6, 16, 3, 8, GOLD);
    rect(ctx, 23, 16, 3, 8, GOLD);
  };
  return <PixelCanvas size={size} draw={draw} />;
}

/** Герб Балтелии: маяк с двумя расходящимися лучами. Подделка: 1 луч или угасший фонарь. */
export function BalteliaEmblem({ size = 48, fake = false }: { size?: number; fake?: boolean }) {
  const draw: Draw = (ctx) => {
    badge(ctx, "#143a3c", "#0a2022");
    // Волны
    rect(ctx, 5, 24, 22, 2, "#38bdf8");
    rect(ctx, 7, 26, 18, 2, "#0369a1");
    // Башня маяка
    line(ctx, 14, 12, 12, 24, SILVER, 2);
    line(ctx, 17, 12, 19, 24, SILVER, 2);
    rect(ctx, 13, 20, 6, 2, "#ef4444");
    rect(ctx, 14, 16, 4, 2, "#ef4444");
    // Фонарь
    rect(ctx, 14, 9, 4, 3, GOLD);
    // Лучи света
    if (!fake) {
      // 2 расходящихся луча
      line(ctx, 13, 10, 5, 6, GOLD, 2);
      line(ctx, 18, 10, 26, 6, GOLD, 2);
      rect(ctx, 4, 5, 3, 3, "#fef08a");
      rect(ctx, 25, 5, 3, 3, "#fef08a");
    } else {
      // 1 луч (подделка)
      line(ctx, 13, 10, 5, 6, GOLD, 2);
    }
  };
  return <PixelCanvas size={size} draw={draw} />;
}

/** Герб Отеплии: имперский орел с мечом в правой лапе и короной. Подделка: меч в левой лапе. */
export function OtepliaEmblem({ size = 48, fake = false }: { size?: number; fake?: boolean }) {
  const draw: Draw = (ctx) => {
    badge(ctx, "#261515", "#130909");
    // Корона наверху
    rect(ctx, 12, 5, 8, 3, GOLD);
    rect(ctx, 11, 4, 2, 2, GOLD);
    rect(ctx, 15, 3, 2, 3, GOLD);
    rect(ctx, 19, 4, 2, 2, GOLD);

    // Тело и крылья орла Отеплии
    line(ctx, 16, 9, 8, 15, "#e0e0e0", 2);
    line(ctx, 8, 15, 6, 22, "#e0e0e0", 2);
    line(ctx, 16, 9, 24, 15, "#e0e0e0", 2);
    line(ctx, 24, 15, 26, 22, "#e0e0e0", 2);
    rect(ctx, 13, 11, 6, 9, "#1c1c1c");
    rect(ctx, 14, 13, 4, 5, "#8b0000"); // красный щиток MAWU

    // Меч
    if (!fake) {
      // Меч в правой лапе
      line(ctx, 22, 17, 24, 26, SILVER, 2);
      rect(ctx, 20, 23, 6, 2, GOLD); // эфес
    } else {
      // Подделка: меч в левой лапе
      line(ctx, 10, 17, 8, 26, SILVER, 2);
      rect(ctx, 6, 23, 6, 2, GOLD);
    }
  };
  return <PixelCanvas size={size} draw={draw} />;
}

/** Герб Краснославии / Аргестана: звезда. */
export function StarEmblem({ size = 48 }: { size?: number }) {
  const draw: Draw = (ctx) => {
    badge(ctx, "#5e1d1d", "#120e0b");
    const rows = [
      [15, 2], [14, 4], [13, 6], [5, 22], [8, 16], [10, 12], [12, 8], [10, 12], [9, 6], [7, 5],
    ];
    rows.forEach(([x, w], i) => rect(ctx, x, 5 + i * 2, w, 2, GOLD));
  };
  return <PixelCanvas size={size} draw={draw} />;
}

export function CountryEmblem({
  country,
  size = 48,
  fake,
}: {
  country: Country;
  size?: number;
  fake?: FakeEmblemKind;
}) {
  switch (country.code) {
    case "ASSR":
      return <AtomEmblem size={size} color={GOLD} orbits={fake === "orb2" ? 2 : 3} badge />;
    case "UGS":
      return <GornostanEmblem size={size} fake={fake === "gorn_left"} />;
    case "STV":
      return <OstolandiaEmblem size={size} fake={fake === "osto_left"} />;
    case "VIC":
      return <VicteriaEmblem size={size} fake={fake === "vic_5star"} />;
    case "OND":
      return <OndarEmblem size={size} fake={fake === "ond_5ray"} />;
    case "BLT":
      return <BalteliaEmblem size={size} fake={fake === "blt_1beam"} />;
    case "ZPS":
      return <OtepliaEmblem size={size} fake={fake === "otep_sword_left"} />;
    case "KRS":
    default:
      return <StarEmblem size={size} />;
  }
}
