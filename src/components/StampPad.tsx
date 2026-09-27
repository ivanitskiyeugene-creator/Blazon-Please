import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
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
  const dy = pressed ? 9 : 0;
  return (
    <svg className="pixel-art" width="96" height="108" viewBox="0 0 96 108" shapeRendering="crispEdges" aria-hidden="true">
      {/* направляющая соединяет штамп с верхней балкой кассеты */}
      <rect x="39" y="0" width="18" height="57" fill="#221b16" />
      <rect x="42" y="0" width="12" height="57" fill="#756658" />
      <rect x="45" y="0" width="4" height="57" fill="#aa977c" />
      <rect x="51" y="0" width="3" height="57" fill="#4b3e33" />

      <g transform={`translate(0 ${dy})`}>
        {/* тяжёлая шляпка */}
        <rect x="25" y="16" width="46" height="15" fill="#2a211b" />
        <rect x="22" y="13" width="46" height="14" fill="#766653" stroke="#17110d" strokeWidth="3" />
        <rect x="27" y="16" width="36" height="4" fill="#ac987a" />
        {/* корпус */}
        <rect x="13" y="46" width="70" height="38" fill={dark} stroke="#0a0806" strokeWidth="3" />
        <rect x="17" y="49" width="62" height="31" fill={color} />
        <rect x="17" y="49" width="62" height="5" fill={textColor} opacity="0.25" />
        <text
          x="48"
          y="68"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          fontSize="11"
          fontFamily="var(--font-pixel)"
        >
          {label}
        </text>
        {/* печатная подошва */}
        <rect x="8" y="82" width="80" height="12" fill="#17110d" />
        <rect x="12" y="82" width="72" height="7" fill={dark} />
        <rect x="17" y="94" width="62" height="5" fill="#080604" opacity="0.72" />
      </g>
    </svg>
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

  return (
    <div className="stamp-drawer-layer" aria-hidden={!open}>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="left-stamp-cassette"
              className="stamp-rig stamp-rig--left"
              initial={{ x: "-110%" }}
              animate={{ x: 0 }}
              exit={{ x: "-110%" }}
              transition={{ type: "spring", stiffness: 250, damping: 28 }}
            >
              <div className="stamp-rig__scaler">
                <div className="stamp-rig__rail"><i /><i /><i /></div>
                <div className="stamp-rig__shell">
                  <div className="stamp-rig__caption">ЛЕВАЯ КАССЕТА // ОТКАЗ</div>
                  <div className="stamp-rig__machines">
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
                  </div>
                  <span className="stamp-rig__bolt stamp-rig__bolt--a" />
                  <span className="stamp-rig__bolt stamp-rig__bolt--b" />
                </div>
              </div>
            </motion.div>

            <motion.div
              key="right-stamp-cassette"
              className="stamp-rig stamp-rig--right"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 250, damping: 28 }}
            >
              <div className="stamp-rig__scaler">
                <div className="stamp-rig__rail"><i /><i /><i /></div>
                <div className="stamp-rig__shell">
                  <div className="stamp-rig__caption">ПРАВАЯ КАССЕТА // ВХОД</div>
                  <div className="stamp-rig__machines">
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
                  </div>
                  <span className="stamp-rig__bolt stamp-rig__bolt--a" />
                  <span className="stamp-rig__bolt stamp-rig__bolt--b" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
