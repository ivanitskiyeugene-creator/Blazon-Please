import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { sfx } from "../audio";
import type { Decision } from "../game/types";
import { useI18n } from "../i18n";

/* Толщина несущей балки — как сам штамп (104px). */
export const BEAM_H = 104;

// ── РЫЧАГ: длинная железная рукоять, прикрученная к краю стола ─────────────
export function StampLever({ active, onToggle }: { active: boolean; onToggle: (v: boolean) => void }) {
  const { t } = useI18n();
  const travel = 62;
  const y = useMotionValue(active ? travel : 0);

  useEffect(() => {
    y.set(active ? travel : 0);
  }, [active, y]);

  const settle = () => {
    const next = y.get() > travel / 2;
    y.set(next ? travel : 0);
    if (next !== active) {
      sfx.ui();
      onToggle(next);
    }
  };

  return (
    <div className="stamp-lever" aria-label={t.ui.lever.aria}>
      <div className="stamp-lever__mount">
        <i />
        <span>{t.ui.lever.label}</span>
        <i />
      </div>

      <div className="stamp-lever__slot">
        <div className="stamp-lever__groove" />
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: travel }}
          dragElastic={0.04}
          dragMomentum={false}
          style={{ y }}
          className="stamp-lever__handle"
          role="switch"
          aria-checked={active}
          tabIndex={0}
          onDragEnd={settle}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              y.set(active ? 0 : travel);
              sfx.ui();
              onToggle(!active);
            }
          }}
        >
          <div className="stamp-lever__stem">
            <i />
          </div>
          <div className="stamp-lever__grip">
            <i />
          </div>
        </motion.div>
      </div>

      <div className={`stamp-lever__state ${active ? "is-open" : ""}`}>
        {active ? t.ui.lever.open : t.ui.lever.closed}
      </div>
    </div>
  );
}

// ── ШТАМП: сам блок закреплён внутри металлической кассеты ─────────────────
function StampObj({ color, dark, textColor, label, pressed }: {
  color: string;
  dark: string;
  textColor: string;
  label: string;
  pressed: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const dy = pressed ? 9 : 0;

  useLayoutEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, 96, 108);
    ctx.imageSmoothingEnabled = false;
    const block = (x: number, y: number, w: number, h: number, fill: string) => {
      ctx.fillStyle = fill;
      ctx.fillRect(x, y, w, h);
    };

    // Направляющая и ручка — только прямоугольные bitmap-блоки.
    block(39, 0, 18, 57, "#221b16");
    block(42, 0, 12, 57, "#756658");
    block(45, 0, 4, 57, "#aa977c");
    block(51, 0, 3, 57, "#4b3e33");
    block(20, 10 + dy, 52, 20, "#17110d");
    block(23, 13 + dy, 46, 14, "#766653");
    block(27, 16 + dy, 36, 4, "#ac987a");
    block(10, 43 + dy, 76, 44, "#0a0806");
    block(13, 46 + dy, 70, 38, dark);
    block(17, 49 + dy, 62, 31, color);
    ctx.globalAlpha = 0.25;
    block(17, 49 + dy, 62, 5, textColor);
    ctx.globalAlpha = 1;
    block(8, 82 + dy, 80, 12, "#17110d");
    block(12, 82 + dy, 72, 7, dark);
    block(17, 94 + dy, 62, 5, "#080604");
  }, [color, dark, dy, textColor]);

  return (
    <span className="stamp-object" aria-hidden="true">
      <canvas ref={ref} width="96" height="108" />
      <b style={{ top: 59 + dy, color: textColor }}>{label}</b>
    </span>
  );
}

interface StampButtonProps {
  type: Decision;
  label: string;
  color: string;
  dark: string;
  textColor: string;
  pressed: boolean;
  disabled: boolean;
  onHit: (type: Decision, event: React.PointerEvent<HTMLButtonElement>) => void;
}

function StampButton({ type, label, color, dark, textColor, pressed, disabled, onHit }: StampButtonProps) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      className={`stamp-machine ${pressed ? "is-pressing" : ""}`}
      disabled={disabled}
      aria-label={t.ui.stampAria(label)}
      onPointerDown={(event) => onHit(type, event)}
    >
      <span className="stamp-machine__beam"><i /><i /></span>
      <span className="stamp-machine__support stamp-machine__support--left" />
      <span className="stamp-machine__support stamp-machine__support--right" />
      <span className="stamp-machine__body">
        <StampObj color={color} dark={dark} textColor={textColor} label={label} pressed={pressed} />
      </span>
    </button>
  );
}

/** Половина кассеты: свой кусок толстой балки + прикрученные машины. */
function StampUnit({ side, children }: { side: "left" | "right"; children: React.ReactNode }) {
  return (
    <div className={`stamp-unit stamp-unit--${side}`}>
      <div className="stamp-unit__slab" aria-hidden="true">
        <span className="stamp-unit__bolts">
          <i /><i /><i /><i /><i /><i /><i /><i />
        </span>
        {side === "right" && (
          // стыковая накладка: когда половины сходятся, шов закрыт болтами
          <span className="stamp-unit__splice" aria-hidden="true">
            <i /><i /><i /><i />
          </span>
        )}
      </div>
      <div className="stamp-unit__machines">{children}</div>
    </div>
  );
}

interface Props {
  open: boolean;
  locked: boolean;
  onToggleOpen: (v: boolean) => void;
  onStamp: (type: Decision, strikeX: number, strikeY: number) => void;
}

export function StampPad({ open, locked, onToggleOpen, onStamp }: Props) {
  const { t } = useI18n();
  const [pressing, setPressing] = useState<Decision | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [rig, setRig] = useState<{ left: number; top: number; width: number; height: number } | null>(null);

  // Кассета живёт внутри силуэта СТОЛА: пока штампы не вызваны, стол пуст.
  // Позицию считаем от .desk-surface и держим актуальной (книжка меняет
  // высоту стола — ловим ResizeObserver-ом).
  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    let desk: Element | null = null;
    const place = () => {
      desk = document.querySelector(".desk-surface");
      if (!desk) return;
      const lr = layer.getBoundingClientRect();
      const dr = desk.getBoundingClientRect();
      setRig({ left: dr.left - lr.left, top: dr.top - lr.top, width: dr.width, height: dr.height });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    let ro: ResizeObserver | undefined;
    if (desk && typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(place);
      ro.observe(desk);
    }
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      ro?.disconnect();
    };
  }, []);

  const hit = (type: Decision, event: React.PointerEvent<HTMLButtonElement>) => {
    if (locked) return;
    event.preventDefault();
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const strikeX = rect.left + rect.width / 2;
    const strikeY = rect.bottom - 11;
    setPressing(type);
    window.setTimeout(() => {
      sfx.stamp();
      onStamp(type, strikeX, strikeY);
      setPressing(null);
    }, 100);
  };

  // Половины выезжают из-за краёв СТОЛА и смыкаются посередине.
  const slide = rig ? rig.width : 1200;
  const spring = { type: "spring", stiffness: 200, damping: 26 } as const;

  return (
    <div className="stamp-drawer-layer" ref={layerRef} aria-hidden={!open}>
      {rig && (
        <div
          className="stamp-rig"
          style={{ left: rig.left, top: rig.top, width: rig.width, height: rig.height }}
        >
          {/* Рычаг прикручен к правому краю столешницы — всегда под рукой */}
          <StampLever active={open} onToggle={onToggleOpen} />

          <AnimatePresence>
            {open && (
              <motion.div
                key="stamp-train"
                className="stamp-train"
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={spring}
              >
                <motion.div
                  className="stamp-unit-wrap stamp-unit-wrap--left"
                  variants={{ hidden: { x: -slide }, visible: { x: 0 } }}
                >
                  <StampUnit side="left">
                    <StampButton
                      type="DENY"
                      label={t.ui.stamps.DENY}
                      color="#741713"
                      dark="#3b0907"
                      textColor="#f0a18e"
                      pressed={pressing === "DENY"}
                      disabled={locked}
                      onHit={hit}
                    />
                  </StampUnit>
                </motion.div>
                <motion.div
                  className="stamp-unit-wrap stamp-unit-wrap--right"
                  variants={{ hidden: { x: slide }, visible: { x: 0 } }}
                >
                  <StampUnit side="right">
                    <StampButton
                      type="ADMIT"
                      label={t.ui.stamps.ADMIT}
                      color="#24551f"
                      dark="#0d2d0b"
                      textColor="#a6d887"
                      pressed={pressing === "ADMIT"}
                      disabled={locked}
                      onHit={hit}
                    />
                  </StampUnit>
                </motion.div>
                {/* Табличка на балке — проявляется, когда половины сошлись */}
                <motion.div
                  className="stamp-train__plate"
                  variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
                >
                  {t.ui.beamPlate}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
