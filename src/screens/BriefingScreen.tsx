import { motion } from "framer-motion";
import { useMemo } from "react";
import type { DayConfig, Notice } from "../game/types";
import { AtomEmblem } from "../components/Emblems";
import { PixelGlyph } from "../components/PixelGlyph";
import { getDays } from "../game/data";
import { sfx } from "../audio";
import { useI18n } from "../i18n";

export function BriefingScreen({
  day,
  notices,
  credits,
  onOpen,
}: {
  day: DayConfig;
  notices: (Notice & { amount?: number })[];
  credits: number;
  onOpen: () => void;
}) {
  const { t, lang } = useI18n();
  const total = useMemo(() => getDays(lang).length, [lang]);
  return (
    <div className="relative min-h-screen rays overflow-y-auto">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* шапка дня */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <AtomEmblem size={40} />
            <div>
              <div className="pixel-text text-[9px] text-[var(--color-gold)]">{t.ui.briefing.shiftOf(day.n, total)}</div>
              <div className="text-xs text-[var(--color-ash)] uppercase tracking-widest">{day.date}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 panel px-3 py-2">
            <PixelGlyph name="coin" size={15} className="text-[var(--color-gold)]" />
            <span className="font-bold text-[var(--color-gold)]">{credits} ₳</span>
            <span className="text-[10px] text-[var(--color-ash)] uppercase">{t.ui.briefing.atomRub}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6 items-start">
          {/* ГАЗЕТА */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: -1 }}
            transition={{ duration: 0.5 }}
            className="paper-tex text-[#2b241c] p-5 sm:p-7 shadow-[8px_8px_0_#070605] relative"
          >
            <div className="flex items-center justify-between border-b-4 border-double border-[#2b241c] pb-2 mb-3">
              <div className="font-head text-2xl sm:text-3xl tracking-wider" style={{ fontFamily: "var(--font-head)" }}>
                {t.ui.news.title}
              </div>
              <div className="text-[10px] text-right leading-tight opacity-70 uppercase">
                {t.ui.news.issuer}
                <br />
                {t.ui.briefing.price}
              </div>
            </div>
            <div className="text-[10px] uppercase tracking-widest mb-2 opacity-70">{t.ui.briefing.morningEd(day.date)}</div>
            <h2
              className="font-head text-xl sm:text-[1.7rem] leading-tight uppercase mb-2"
              style={{ fontFamily: "var(--font-head)" }}
            >
              {day.headline}
            </h2>
            <div className="text-xs font-bold uppercase mb-3 text-[#7c1d18]">{day.subline}</div>
            <p className="text-sm leading-relaxed text-justify" style={{ columns: 1 }}>
              {day.body}
            </p>
            <div className="mt-4 pt-3 border-t border-[#2b241c66] flex justify-between text-[9px] uppercase tracking-widest opacity-60">
              <span>{t.ui.briefing.printed}</span>
              <span>{t.ui.briefing.noCarry}</span>
            </div>
            {/* подпалина */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-[var(--color-ink)] opacity-20 rotate-45 pointer-events-none" />
          </motion.div>

          <div className="space-y-4">
            {/* ИЗВЕЩЕНИЯ */}
            {notices.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="panel p-4 border-l-4"
                style={{ borderLeftColor: "var(--color-state2)" }}
              >
                <div className="flex items-center gap-2 text-[var(--color-state2)] mb-2">
                  <PixelGlyph name="alert" size={16} />
                  <span className="font-head text-sm uppercase tracking-widest" style={{ fontFamily: "var(--font-head)" }}>
                    {t.ui.briefing.noticesTitle}
                  </span>
                </div>
                {notices.map((n, i) => (
                  <div key={i} className="text-xs leading-relaxed text-[var(--color-bone)] flex justify-between gap-3">
                    <span>{n.text}</span>
                    {n.amount !== undefined && n.amount !== 0 && (
                      <span className="font-bold text-[var(--color-state2)] shrink-0">{n.amount} ₳</span>
                    )}
                  </div>
                ))}
              </motion.div>
            )}

            {/* ДИРЕКТИВА */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="panel p-5 relative"
            >
              <span className="bolt" style={{ top: 5, left: 5 }} />
              <span className="bolt" style={{ top: 5, right: 5 }} />
              <div className="flex items-center gap-2 mb-4">
                <PixelGlyph name="document" size={17} className="text-[var(--color-gold)]" />
                <span className="font-head text-base uppercase tracking-widest text-[var(--color-gold)]" style={{ fontFamily: "var(--font-head)" }}>
                  {t.ui.briefing.directiveN(day.n)}
                </span>
              </div>
              <ul className="space-y-3">
                {day.rules.map((r, i) => (
                  <motion.li
                    key={r.key}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.12 }}
                    className="flex gap-3 text-sm leading-relaxed"
                  >
                    <span className="pixel-text text-[8px] text-[var(--color-ash)] mt-1 shrink-0 w-5">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{r.text}</span>
                    {r.isNew && (
                      <span className="shrink-0 px-1.5 py-0.5 text-[9px] font-bold uppercase bg-[var(--color-state2)] text-[var(--color-paper)] animate-blink h-fit">
                        {t.ui.briefing.newFlag}
                      </span>
                    )}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* расходы */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
              className="panel p-4"
            >
              <div className="text-[10px] uppercase tracking-widest text-[var(--color-ash)] mb-2">
                {t.ui.briefing.expensesTitle}
              </div>
              {day.expenses.map((e) => (
                <div key={e.label} className="flex justify-between text-xs py-0.5">
                  <span>{e.label}</span>
                  <span className="text-[var(--color-state2)] font-bold">-{e.amount} ₳</span>
                </div>
              ))}
              <div className="flex justify-between text-xs py-0.5 mt-1 pt-1 border-t border-[var(--color-line)]">
                <span className="text-[var(--color-moss)]">{t.ui.briefing.perCorrect}</span>
                <span className="text-[var(--color-moss)] font-bold">+5 ₳</span>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="btn-soviet w-full px-6 py-4 text-lg inline-flex items-center justify-center gap-2"
              onClick={() => {
                sfx.stamp();
                onOpen();
              }}
            >
              {t.ui.briefing.openPost} <PixelGlyph name="next" size={20} />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
