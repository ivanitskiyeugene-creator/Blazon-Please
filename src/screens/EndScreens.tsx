import { motion } from "framer-motion";
import { AlertTriangle, ChevronRight, Coins, Flame, RotateCcw, Siren } from "lucide-react";
import { useState } from "react";
import { DETAIN_BONUS, ERROR_FINE, EVIDENCE_BONUS, PER_PAY } from "../game/data";
import type { DayConfig, DayResult } from "../game/types";
import { AtomEmblem } from "../components/Emblems";
import { sfx } from "../audio";

// ---------- ВЕДОМОСТЬ В КОНЦЕ СМЕНЫ ----------
export function LedgerScreen({
  day,
  result,
  creditsBefore,
  isLast,
  onNext,
}: {
  day: DayConfig;
  result: DayResult;
  creditsBefore: number;
  isLast: boolean;
  onNext: (newBalance: number, fine: number, opts?: { heatSkipped?: boolean }) => void;
}) {
  const [heatSkipped, setHeatSkipped] = useState(false);

  const pay = result.correct * PER_PAY;
  const fine = result.errors.length * ERROR_FINE;
  const isHeating = (label: string) => label.toLowerCase().startsWith("отоплен");
  const expenses = day.expenses.reduce((s, e) => s + (heatSkipped && isHeating(e.label) ? 0 : e.amount), 0);
  const total = creditsBefore + pay + result.bribeGain + result.detainBonus + result.evidenceBonus + result.agentCredits - fine - expenses;
  const broke = total < 0;

  const rows: { label: string; value: string; tone?: string }[] = [
    { label: `Верных решений: ${result.correct} × ${PER_PAY}₳`, value: `+${pay} ₳`, tone: "var(--color-moss)" },
    ...(result.evidence > 0
      ? [{ label: `Доказано несоответствий: ${result.evidence} × ${EVIDENCE_BONUS}₳`, value: `+${result.evidenceBonus} ₳`, tone: "var(--color-moss)" }]
      : []),
    ...(result.detains > 0
      ? [{ label: `Задержано врагов народа: ${result.detains} × ${DETAIN_BONUS}₳`, value: `+${result.detainBonus} ₳`, tone: "var(--color-moss)" }]
      : []),
    ...(result.bribeGain > 0
      ? [{ label: "«Один денёк. Кто заметит?»", value: `+${result.bribeGain} ₳`, tone: "var(--color-gold)" }]
      : []),
    ...(result.agentCredits > 0
      ? [{ label: "Конверты за разговоры через стекло", value: `+${result.agentCredits} ₳`, tone: "var(--color-gold)" }]
      : []),
    ...(result.errors.length > 0
      ? [{ label: `Протоколы нарушений: ${result.errors.length} × ${ERROR_FINE}₳`, value: `-${fine} ₳`, tone: "var(--color-state2)" }]
      : []),
    ...day.expenses.map((e) =>
      heatSkipped && isHeating(e.label)
        ? { label: `${e.label} — ОТКЛЮЧЕНО`, value: "0 ₳", tone: "var(--color-ash)" }
        : { label: e.label, value: `-${e.amount} ₳`, tone: "var(--color-state2)" }
    ),
  ];

  return (
    <div className="min-h-screen rays flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24, rotate: 0.6 }}
        animate={{ opacity: 1, y: 0, rotate: 0.6 }}
        className="paper-tex text-[#2b241c] w-[min(620px,94vw)] p-6 sm:p-8 shadow-[8px_8px_0_#070605] relative"
      >
        <div className="flex items-center justify-between border-b-4 border-double border-[#2b241c] pb-2 mb-4">
          <div className="font-head text-lg sm:text-xl uppercase tracking-wider" style={{ fontFamily: "var(--font-head)" }}>
            Ведомость смены {day.n}
          </div>
          <div className="text-[10px] uppercase opacity-70 text-right">
            КПП-7 // {day.dateShort}
          </div>
        </div>

        <div className="text-[10px] uppercase tracking-[0.25em] opacity-60 mb-2">
          Расчёт произведён по закрытии поста — результаты дня:
        </div>
        <div className="space-y-1.5">
          {rows.map((r, k) => (
            <motion.div
              key={r.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + k * 0.14 }}
              className="flex justify-between gap-4 text-sm border-b border-dotted border-[#2b241c55] pb-1"
            >
              <span>{r.label}</span>
              <span
                className="font-bold shrink-0"
                style={{
                  color:
                    r.tone === "var(--color-moss)"
                      ? "#2f5c33"
                      : r.tone === "var(--color-gold)"
                        ? "#8a6a1c"
                        : r.tone === "var(--color-ash)"
                          ? "#6b5d4e"
                          : "#7c1d18",
                }}
              >
                {r.value}
              </span>
            </motion.div>
          ))}
        </div>

        {result.errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 + rows.length * 0.14 }}
            className="mt-4 p-3 border-2 border-[#7c1d18] bg-[#7c1d1812]"
          >
            <div className="flex items-center gap-2 text-[#7c1d18] text-xs font-bold uppercase mb-1.5">
              <AlertTriangle size={14} /> протоколы дня
            </div>
            {result.errors.map((e, k) => (
              <div key={k} className="text-[11px] leading-snug py-0.5">— {e}</div>
            ))}
          </motion.div>
        )}

        {/* переключатель отопления */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 + rows.length * 0.14 }}
          className="mt-4 w-full text-left px-3 py-2 border-2 border-dashed transition-colors text-xs sm:text-sm"
          style={{
            borderColor: heatSkipped ? "#2e3450" : "#7c1d18",
            background: heatSkipped ? "#2e345020" : "#7c1d1810",
          }}
          onClick={() => {
            sfx.ui();
            setHeatSkipped((v) => !v);
          }}
        >
          <span className="flex items-center gap-2 font-bold uppercase tracking-wide">
            <Flame size={15} style={{ color: heatSkipped ? "#5a6490" : "#b93a25" }} />
            {heatSkipped ? "Отопление отключено — семья мёрзнет (экономия 4 ₳)" : "Отопление включено: −4 ₳. Нажми, чтобы сэкономить и помёрзнуть"}
          </span>
        </motion.button>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 + rows.length * 0.14 }}
          className="mt-5 flex items-center justify-between flex-wrap gap-2"
        >
          <div className="flex items-center gap-2">
            <Coins size={18} />
            <span className="font-head uppercase text-sm" style={{ fontFamily: "var(--font-head)" }}>
              Итог дома: {total} ₳
            </span>
          </div>
          <div
            className="font-head uppercase px-3 py-1 border-4 rotate-[-4deg]"
            style={{
              fontFamily: "var(--font-head)",
              color: broke ? "#7c1d18" : "#2f5c33",
              borderColor: broke ? "#7c1d18" : "#2f5c33",
            }}
          >
            {broke ? "Долг блоку" : "Смена закрыта"}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95 + rows.length * 0.14 }}
          className="btn-soviet w-full mt-6 px-6 py-3.5 text-base inline-flex items-center justify-center gap-2"
          onClick={() => {
            sfx.stamp();
            onNext(total, fine, { heatSkipped });
          }}
        >
          {broke ? "Сверить долг..." : isLast ? "Итоги службы" : "Лечь спать // смена " + (day.n + 1)}
          <ChevronRight size={18} />
        </motion.button>
      </motion.div>
    </div>
  );
}

// ---------- ФИНАЛ ----------
export function EndingScreen({
  ending,
  stats,
  onRestart,
}: {
  ending: { title: string; tone: string; lines: string[] };
  stats: { correct: number; errors: number; credits: number; detains?: number; evidence?: number };
  onRestart: () => void;
}) {
  return (
    <div className="min-h-screen rays flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none">
        <div className="animate-spin-slow">
          <AtomEmblem size={640} color="#e8c34a" />
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative max-w-2xl w-full panel p-7 sm:p-10 text-center"
      >
        <span className="bolt" style={{ top: 6, left: 6 }} />
        <span className="bolt" style={{ top: 6, right: 6 }} />
        <span className="bolt" style={{ bottom: 6, left: 6 }} />
        <span className="bolt" style={{ bottom: 6, right: 6 }} />

        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="inline-block mb-5">
          <AtomEmblem size={72} />
        </motion.div>

        <div className="pixel-text text-[9px] text-[var(--color-ash)] mb-3 uppercase">итог службы на кпп-7</div>
        <h1
          className="font-head text-3xl sm:text-5xl uppercase fringe mb-6"
          style={{ fontFamily: "var(--font-head)", color: ending.tone }}
        >
          {ending.title}
        </h1>
        <div className="space-y-3 text-left text-sm sm:text-base leading-relaxed text-[var(--color-bone)] mb-8">
          {ending.lines.map((l, k) => (
            <motion.p key={k} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + k * 0.35 }}>
              {l}
            </motion.p>
          ))}
        </div>
        <div className="flex justify-center gap-5 text-[11px] uppercase tracking-widest text-[var(--color-ash)] mb-7 flex-wrap">
          <span>верных: {stats.correct}</span>
          <span>протоколов: {stats.errors}</span>
          {stats.evidence !== undefined && <span>доказано: {stats.evidence}</span>}
          {stats.detains !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Siren size={11} /> задержано: {stats.detains}
            </span>
          )}
          <span>на руках: {stats.credits} ₳</span>
        </div>
        <button className="btn-soviet px-8 py-4 text-base inline-flex items-center gap-2" onClick={onRestart}>
          <RotateCcw size={18} /> В главное меню
        </button>
        <div className="text-[10px] uppercase tracking-widest text-[var(--color-ash)] mt-4">
          очередь и нарушители генерируются заново — следующая служба будет другой
        </div>
      </motion.div>
    </div>
  );
}

// ---------- ПРОИГРЫШ ----------
export function GameOverScreen({
  gameover,
  onRestart,
}: {
  gameover: { title: string; lines: string[] };
  onRestart: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#0d0a08" }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="max-w-xl w-full text-center"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-6"
        >
          <AtomEmblem size={64} color="#5e1715" />
        </motion.div>
        <h1
          className="font-head text-3xl sm:text-5xl uppercase text-[var(--color-state2)] text-glow-red mb-8"
          style={{ fontFamily: "var(--font-head)" }}
        >
          {gameover.title}
        </h1>
        <div className="space-y-3 text-sm sm:text-base leading-relaxed text-[var(--color-ash)] mb-10">
          {gameover.lines.map((l, k) => (
            <motion.p key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + k * 0.5 }}>
              {l}
            </motion.p>
          ))}
        </div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6 }}
          className="btn-soviet px-8 py-4 text-base inline-flex items-center gap-2"
          onClick={onRestart}
        >
          <RotateCcw size={18} /> В главное меню
        </motion.button>
      </motion.div>
    </div>
  );
}
