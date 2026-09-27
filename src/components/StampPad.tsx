import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { sfx } from "../audio";
import type { Decision } from "../game/types";

// ── РЫЧАГ: длинная железная рукоять, которую надо протянуть вниз ────────────
export function StampLever({ active, onToggle }: { active: boolean; onToggle: (v: boolean) => void }) {
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
    <div className="stamp-lever" aria-label="Рычаг кассет со штампами">
      <div className="stamp-lever__mount">
        <i />
        <span>КАССЕТЫ</span>
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
        {active ? "ВЫДВИНУТО" : "ЗАКРЫТО"}
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
  return (
    <button
      type="button"
      className={`stamp-machine ${pressed ? "is-pressing" : ""}`}
      disabled={disabled}
      aria-label={`Поставить штамп «${label}»`}
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

interface Props {
  open: boolean;
  locked: boolean;
  hasEvidence: boolean;
  detainUnlocked: boolean;
  onStamp: (type: Decision, strikeX: number, strikeY: number) => void;
}

export function StampPad({ open, locked, hasEvidence, detainUnlocked, onStamp }: Props) {
  const [pressing, setPressing] = useState<Decision | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const [beamTop, setBeamTop] = useState<number | null>(null);
  const [rigLeft, setRigLeft] = useState<number | null>(null);
  const [rigTop, setRigTop] = useState<number | null>(null);

  // Балка и машины стоят ровно на середине ЭКРАНА — по центру буквально.
  // Слой абсолютный внутри корня игры, поэтому центр вьюпорта считаем сами.
  useLayoutEffect(() => {
    const place = () => {
      const layer = layerRef.current;
      if (!layer) return;
      const rect = layer.getBoundingClientRect();
      const cx = window.innerWidth / 2 - rect.left;
      const cy = window.innerHeight / 2 - rect.top;
      setBeamTop(cy - 78); // балка (26) + машины (130) — вся сборка серединой на центр
      setRigLeft(cx);
      setRigTop(cy - 52);
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, []);

  const hit = (type: Decision, event: React.PointerEvent<HTMLButtonElement>) => {
    if (locked || (type === "DETAIN" && !hasEvidence)) return;
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

  // Вылет по промышленной балке: группы машин съезжают с боков поста к центру.
  const slide = typeof window === "undefined" ? 1200 : window.innerWidth;

  return (
    <div className="stamp-drawer-layer" ref={layerRef} aria-hidden={!open}>
      {/* Несущая балка через весь экран — видна всегда, машины ездят по ней */}
      <div className="stamp-beam" style={{ top: beamTop ?? undefined }}>
        <span className="stamp-beam__bolts">
          <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
        </span>
        <span className="stamp-beam__plate">ШТЕМПЕЛЬНАЯ КАССЕТА // КПП-7</span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            key="beam-stamp-train"
            ref={rigRef}
            className="stamp-rig stamp-rig--center"
            style={{ left: rigLeft ?? undefined, top: rigTop ?? undefined }}
            initial={false}
            animate={{ x: "-50%" }}
            exit={{ x: "-50%", transition: { duration: 0.85 } }}
          >
            <div className="stamp-rig__scaler">
              <div className="stamp-rig__machines">
                <motion.div
                  className="stamp-rig__group"
                  initial={{ x: -slide }}
                  animate={{ x: 0 }}
                  exit={{ x: -slide }}
                  transition={{ type: "spring", stiffness: 210, damping: 27 }}
                >
                  <StampButton
                    type="DENY"
                    label="ОТКАЗ"
                    color="#741713"
                    dark="#3b0907"
                    textColor="#f0a18e"
                    pressed={pressing === "DENY"}
                    disabled={locked}
                    onHit={hit}
                  />
                  {detainUnlocked && (
                    <StampButton
                      type="DETAIN"
                      label="АРЕСТ"
                      color="#605514"
                      dark="#302806"
                      textColor="#e3c94c"
                      pressed={pressing === "DETAIN"}
                      disabled={locked || !hasEvidence}
                      onHit={hit}
                    />
                  )}
                </motion.div>
                <motion.div
                  className="stamp-rig__group"
                  initial={{ x: slide }}
                  animate={{ x: 0 }}
                  exit={{ x: slide }}
                  transition={{ type: "spring", stiffness: 210, damping: 27 }}
                >
                  <StampButton
                    type="ADMIT"
                    label="ВХОД"
                    color="#24551f"
                    dark="#0d2d0b"
                    textColor="#a6d887"
                    pressed={pressing === "ADMIT"}
                    disabled={locked}
                    onHit={hit}
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
