import { AnimatePresence, motion, useMotionValue } from "framer-motion";
import { useEffect, useState } from "react";
import { sfx } from "../audio";
import type { Decision } from "../game/types";

// ── РЫЧАГ: справа, тянуть вниз ─────────────────────
export function StampLever({ active, onToggle }: { active: boolean; onToggle: (v: boolean) => void }) {
  const y = useMotionValue(active ? 44 : 0);

  useEffect(() => {
    y.set(active ? 44 : 0);
  }, [active, y]);

  return (
    <div style={{
      position: "absolute", right: 12, top: 10, zIndex: 100,
      width: 44, height: 110,
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>
      {/* Крепление */}
      <div style={{
        width: 38, height: 18,
        background: "linear-gradient(180deg,#3a3028,#2a221a)",
        border: "2px solid #1a1410",
        borderRadius: 3,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12,
      }}>
        <div style={{ width: 5, height: 5, background: "#1a1410", borderRadius: 1 }} />
        <div style={{ width: 5, height: 5, background: "#1a1410", borderRadius: 1 }} />
      </div>

      {/* Паз */}
      <div style={{
        width: 12, height: 56,
        background: "#120e0a",
        borderRadius: 2,
        position: "relative",
        marginTop: -2,
      }}>
        {/* Рукоятка */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 44 }}
          dragElastic={0.08}
          dragMomentum={false}
          style={{
            y,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "grab",
            zIndex: 2,
            touchAction: "none",
          }}
          onDragEnd={() => {
            const val = y.get();
            if (val > 22) {
              y.set(44);
              if (!active) onToggle(true);
            } else {
              y.set(0);
              if (active) onToggle(false);
            }
          }}
        >
          {/* Стержень */}
          <div style={{
            width: 8, height: 28,
            background: "linear-gradient(90deg,#6a6058,#9a8e82,#6a6058)",
            border: "1px solid #3a322a",
            margin: "0 auto",
          }} />
          {/* Шар */}
          <div style={{
            width: 28, height: 28,
            borderRadius: "50%",
            background: "radial-gradient(circle at 38% 35%, #e83030, #901818 70%, #601010)",
            border: "2px solid #500c0c",
            margin: "-4px auto 0",
            boxShadow: "0 3px 8px rgba(0,0,0,0.6)",
          }} />
        </motion.div>
      </div>

      {/* Метка */}
      <div style={{
        marginTop: 4, fontSize: 7,
        fontFamily: "var(--font-pixel)",
        color: active ? "#e8c34a" : "#4a4038",
        textTransform: "uppercase", letterSpacing: "0.1em",
        textAlign: "center", pointerEvents: "none",
      }}>
        {active ? "ON" : "OFF"}
      </div>
    </div>
  );
}

// ── ШТАМП (грубый индустриальный) ───────────────────
function StampObj({ color, dark, textColor, label, pressed }:
  { color: string; dark: string; textColor: string; label: string; pressed: boolean }) {
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ display: "block" }}>
      {/* Тень */}
      <ellipse cx="50" cy="96" rx="36" ry="4" fill="rgba(0,0,0,0.5)" />
      {/* Подошва */}
      <rect x="10" y="80" width="80" height="10" rx="2" fill={dark} stroke="#0a0806" strokeWidth="1" />
      {/* Корпус */}
      <rect x="14" y="52" width="72" height="32" rx="3" fill={color} stroke="#0a0806" strokeWidth="1.5" />
      {/* Надпись */}
      <text x="50" y="72" textAnchor="middle" dominantBaseline="middle"
        fill={textColor} fontSize="10" fontFamily="var(--font-pixel)" fontWeight="bold">{label}</text>
      {/* Ручка */}
      <rect x="42" y={pressed ? 22 : 10} width="16" height={pressed ? 32 : 44} rx="2"
        fill="linear-gradient(90deg,#6a6058,#9a8e82,#6a6058)" stroke="#3a322a" strokeWidth="1" />
      <rect x="42" y={pressed ? 22 : 10} width="16" height={pressed ? 32 : 44} rx="2"
        fill="#8a7e74" />
      <rect x="44" y={pressed ? 24 : 12} width="4" height={pressed ? 28 : 40} rx="1"
        fill="rgba(255,255,255,0.12)" />
      {/* Шляпка */}
      <ellipse cx="50" cy={pressed ? 22 : 10} rx="20" ry="7" fill="#a09484" stroke="#3a322a" strokeWidth="1" />
      <ellipse cx="50" cy={pressed ? 20 : 8} rx="16" ry="5" fill="#bab0a4" />
    </svg>
  );
}

// ── ПАНЕЛЬ ───────────────────────────────────────────
interface Props {
  open: boolean;
  locked: boolean;
  hasEvidence: boolean;
  detainUnlocked: boolean;
  onStamp: (type: Decision, strikeX: number, strikeY: number) => void;
}

export function StampPad({ open, locked, hasEvidence, detainUnlocked, onStamp }: Props) {
  const [pressing, setPressing] = useState<Decision | null>(null);

  const hit = (type: Decision, e: React.MouseEvent) => {
    if (locked) return;
    if (type === "DETAIN" && !hasEvidence) return;
    setPressing(type);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const sx = r.left + r.width / 2;
    const sy = r.bottom - 8;
    setTimeout(() => {
      sfx.stamp();
      onStamp(type, sx, sy);
      setPressing(null);
    }, 90);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: -120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          style={{
            position: "absolute",
            top: 16, left: 0, right: 60,
            margin: "0 auto",
            width: "fit-content",
            zIndex: 65,
            display: "flex", alignItems: "flex-end", gap: 20,
            pointerEvents: "none",
          }}
        >
          <div style={{ pointerEvents: "auto", cursor: locked ? "not-allowed" : "pointer" }}
            onMouseDown={(e) => hit("DENY", e)}>
            <StampObj color="#6a1010" dark="#3a0808" textColor="#ff9090" label="ОТКАЗ" pressed={pressing === "DENY"} />
          </div>

          {detainUnlocked && (
            <div style={{ pointerEvents: hasEvidence && !locked ? "auto" : "none", opacity: hasEvidence ? 1 : 0.35, cursor: "pointer" }}
              onMouseDown={(e) => hit("DETAIN", e)}>
              <StampObj color="#504808" dark="#282204" textColor="#d8b840" label="АРЕСТ" pressed={pressing === "DETAIN"} />
            </div>
          )}

          <div style={{ pointerEvents: "auto", cursor: locked ? "not-allowed" : "pointer" }}
            onMouseDown={(e) => hit("ADMIT", e)}>
            <StampObj color="#105010" dark="#083008" textColor="#90ff90" label="ВХОД" pressed={pressing === "ADMIT"} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
