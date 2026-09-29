import { useLayoutEffect, useRef } from "react";
import type { PersonSpec } from "../game/types";

const SKINS = ["#b88f70", "#9e7454", "#815238"];
const SKIN_DARK = ["#8d674d", "#785139", "#643d2a"];
const HAIRS = ["#17120f", "#625b54", "#8a6a3d"];
const COATS = ["#332c27", "#29362f", "#3a2828", "#27313b", "#4a3c28", "#2c251f"];
const COAT_SHADOWS = ["#211c19", "#1b2722", "#281b1b", "#19232c", "#30271a", "#1d1815"];

const SPRITE_W = 48;
const SPRITE_H = 60;

/**
 * Ручной 48×60 bitmap-спрайт. Каждый элемент лица и одежды рисуется
 * целочисленными прямоугольниками прямо в пиксельный canvas — без генератора,
 * сглаживания и векторных кривых.
 */
export function Person({
  spec,
  width = 150,
  gray = false,
  className = "",
}: {
  spec: PersonSpec;
  width?: number;
  gray?: boolean;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const commissar = spec.uniform === "commissar";
  const skin = SKINS[spec.skin % SKINS.length];
  const skinDark = SKIN_DARK[spec.skin % SKIN_DARK.length];
  const hair = HAIRS[spec.hairTone % HAIRS.length];
  const coat = commissar ? "#3e4a2c" : COATS[spec.coat % COATS.length];
  const coatDark = commissar ? "#28311b" : COAT_SHADOWS[spec.coat % COAT_SHADOWS.length];

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, SPRITE_W, SPRITE_H);
    ctx.imageSmoothingEnabled = false;

    const rect = (x: number, y: number, w: number, h: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, w, h);
    };

    const ink = "#120f0c";
    const metal = "#958266";
    const scarf = "#92201c";
    const scarfDark = "#5f1512";

    // Куртка: ступенчатый силуэт сначала целиком обводится тёмными пикселями.
    rect(15, 34, 18, 2, ink);
    rect(11, 36, 26, 3, ink);
    rect(8, 39, 32, 4, ink);
    rect(6, 43, 36, 17, ink);
    rect(16, 35, 16, 2, coat);
    rect(12, 37, 24, 3, coat);
    rect(9, 40, 30, 4, coat);
    rect(7, 44, 34, 16, coat);
    // Жёсткая теневая половина вместо плавного градиента.
    rect(25, 37, 11, 3, coatDark);
    rect(25, 40, 14, 4, coatDark);
    rect(25, 44, 16, 16, coatDark);
    // Плечевые швы и лацканы.
    rect(10, 42, 8, 2, coatDark);
    rect(31, 42, 7, 2, ink);
    rect(17, 36, 3, 3, coatDark);
    rect(20, 39, 3, 3, coatDark);
    rect(29, 36, 3, 3, ink);
    rect(26, 39, 3, 3, ink);
    rect(23, 43, 3, 17, ink);
    rect(26, 45, 1, 1, metal);
    rect(26, 51, 1, 1, metal);
    rect(11, 49, 2, 1, coatDark);
    rect(36, 54, 2, 1, coat);

    // Шея.
    rect(18, 27, 12, 10, ink);
    rect(20, 28, 8, 8, skinDark);
    rect(20, 28, 4, 7, skin);

    // Голова с намеренно ломаным восьмиугольным контуром.
    rect(17, 6, 14, 2, ink);
    rect(15, 8, 18, 3, ink);
    rect(14, 11, 20, 16, ink);
    rect(16, 27, 16, 3, ink);
    rect(18, 30, 12, 2, ink);
    rect(16, 9, 16, 18, skin);
    rect(18, 7, 12, 2, skin);
    rect(17, 27, 14, 2, skin);
    rect(19, 29, 10, 2, skin);
    // Правая половина лица в фиксированной тени.
    rect(27, 9, 5, 18, skinDark);
    rect(27, 27, 4, 2, skinDark);
    rect(14, 16, 2, 6, skinDark);
    rect(32, 16, 2, 6, skinDark);
    rect(14, 17, 1, 3, skin);
    rect(33, 17, 1, 3, skin);

    // Брови, глаза, нос и рот — отдельные настоящие пиксели.
    rect(18, 14, 6, 1, hair);
    rect(26, 14, 5, 1, hair);
    rect(19, 16, 2, 2, ink);
    rect(28, 16, 2, 2, ink);
    rect(20, 16, 1, 1, "#c7b88f");
    rect(28, 16, 1, 1, "#c7b88f");
    rect(24, 18, 2, 5, skinDark);
    rect(25, 22, 2, 1, ink);
    rect(21, 25, 7, 1, skinDark);
    if (spec.female) rect(22, 25, 5, 1, "#71302b");

    // Волосы и головные уборы собираются только из прямоугольных кластеров.
    if (spec.hairStyle === "flat") {
      rect(16, 6, 16, 4, hair);
      rect(14, 9, 4, 5, hair);
      rect(29, 9, 4, 3, hair);
    }
    if (spec.hairStyle === "side") {
      rect(16, 5, 16, 4, hair);
      rect(14, 8, 7, 8, hair);
      rect(21, 8, 10, 2, hair);
      rect(29, 9, 4, 3, hair);
    }
    if (spec.hairStyle === "mop") {
      rect(15, 4, 18, 3, hair);
      rect(13, 7, 22, 5, hair);
      rect(14, 12, 4, 7, hair);
      rect(31, 11, 4, 8, hair);
      rect(19, 10, 3, 3, hair);
      rect(26, 10, 3, 2, hair);
    }
    if (spec.hairStyle === "bun") {
      rect(16, 5, 16, 4, hair);
      rect(14, 8, 20, 4, hair);
      rect(14, 11, 4, 10, hair);
      rect(31, 11, 3, 10, hair);
      rect(21, 2, 8, 4, hair);
      rect(23, 1, 4, 2, hair);
    }
    if (spec.hairStyle === "bald") {
      rect(14, 11, 3, 8, hair);
      rect(31, 11, 3, 8, hair);
      rect(17, 7, 3, 1, hair);
    }
    if (spec.hairStyle === "cap") {
      rect(14, 4, 20, 3, "#211c18");
      rect(12, 7, 24, 5, "#3d342b");
      rect(16, 5, 15, 2, "#685744");
      rect(12, 12, 16, 2, "#211c18");
      rect(14, 12, 12, 1, "#806c52");
    }
    if (spec.hairStyle === "ushanka") {
      rect(13, 2, 22, 3, "#302820");
      rect(11, 5, 26, 7, "#5c5042");
      rect(13, 5, 22, 2, "#80705d");
      rect(11, 11, 5, 11, "#504439");
      rect(32, 11, 5, 11, "#504439");
      rect(23, 7, 3, 3, scarf);
      rect(24, 6, 1, 5, "#b4382e");
    }

    // Усы, борода и очки.
    if (spec.facial === "mustache" || spec.facial === "glassesMustache") {
      rect(20, 23, 4, 2, hair);
      rect(25, 23, 4, 2, hair);
      rect(23, 24, 3, 2, hair);
    }
    if (spec.facial === "beard") {
      rect(16, 22, 3, 7, hair);
      rect(30, 22, 3, 7, hair);
      rect(18, 27, 13, 4, hair);
      rect(20, 31, 9, 2, hair);
      rect(22, 25, 6, 1, skinDark);
    }
    if (spec.facial === "glasses" || spec.facial === "glassesMustache") {
      rect(17, 15, 7, 5, ink);
      rect(18, 16, 5, 3, skinDark);
      rect(26, 15, 7, 5, ink);
      rect(27, 16, 5, 3, skinDark);
      rect(24, 17, 2, 1, ink);
      rect(14, 16, 3, 1, ink);
      rect(33, 16, 2, 1, ink);
      rect(19, 16, 1, 1, "#d8c9a8");
      rect(28, 16, 1, 1, "#d8c9a8");
    }

    if (spec.redScarf) {
      rect(15, 34, 18, 2, scarfDark);
      rect(17, 35, 14, 3, scarf);
      rect(22, 38, 5, 10, scarfDark);
      rect(23, 39, 3, 8, scarf);
    }

    // ---- Форма комиссара: шинель, петлицы с атомом, портупея, фуражка ----
    if (commissar) {
      const capGreen = "#5b6a3a";
      const capLite = "#71804c";
      const capBand = "#3f4c29";
      const capBandDark = "#2b331c";
      const visor = "#141109";
      const gold = "#d9b23a";
      const strap = "#5b3a1e";
      const strapLite = "#7a5028";

      // Диагональная портупея через грудь (правое плечо → левый бок).
      const strapCells: [number, number][] = [
        [30, 40], [28, 43], [26, 46], [24, 49], [22, 52], [20, 55], [19, 58],
      ];
      strapCells.forEach(([x, y]) => {
        rect(x, y, 3, 3, strap);
        rect(x, y, 1, 3, strapLite);
      });
      rect(26, 46, 1, 1, gold); // пряжка-блик

      // Петлицы на воротнике с золотым атомом.
      rect(15, 34, 6, 4, "#161009");
      rect(28, 34, 6, 4, "#161009");
      rect(17, 35, 2, 1, gold);
      rect(30, 35, 2, 1, gold);
      rect(17, 36, 2, 1, "#8a6a1c");
      rect(30, 36, 2, 1, "#8a6a1c");

      // Фуражка поверх головы. Тулья, околыш, козырёк, красная звезда.
      rect(14, 3, 18, 3, capGreen);   // тулья (верх)
      rect(13, 5, 20, 2, capGreen);
      rect(15, 3, 13, 1, capLite);    // блик тульи
      rect(13, 6, 20, 1, capBandDark); // кант
      rect(12, 7, 24, 3, capBand);    // околыш
      rect(12, 7, 3, 3, capBandDark);
      rect(33, 7, 3, 3, capBandDark);
      rect(11, 10, 26, 2, visor);     // козырёк
      rect(13, 12, 20, 1, "#0c0a06"); // тень под козырьком
      rect(16, 13, 16, 1, skinDark);  // тень козырька на лбу
      // Красная звезда на околыше.
      rect(22, 7, 4, 3, "#c0241f");
      rect(23, 7, 2, 1, "#e34b3f");
      rect(23, 9, 2, 1, "#7c1512");
    }
  }, [coat, coatDark, commissar, hair, skin, skinDark, spec]);

  return (
    <canvas
      ref={canvasRef}
      width={SPRITE_W}
      height={SPRITE_H}
      className={`pixel-person ${className}`}
      aria-hidden="true"
      style={{
        width,
        height: (width * SPRITE_H) / SPRITE_W,
        display: "block",
        imageRendering: "pixelated",
        filter: gray ? "grayscale(1) contrast(1.18) brightness(0.9)" : undefined,
      }}
    />
  );
}
