import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AtomEmblem, PartyEmblem } from "../components/Emblems";
import { PixelGlyph } from "../components/PixelGlyph";
import { AudioSettings } from "../components/AudioSettings";
import { sfx } from "../audio";
import { APP_VERSION, CHANGELOG } from "../game/changelog";
import { getDays } from "../game/data";
import { saveAge } from "../game/save";
import type { SaveData } from "../game/types";
import { LangSwitch, useI18n } from "../i18n";

export function TitleScreen({
  save,
  onStart,
  onContinue,
  onWipe,
}: {
  save: SaveData | null;
  onStart: () => void;
  onContinue: () => void;
  onWipe: () => void;
}) {
  const { t, lang } = useI18n();
  const [log, setLog] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

  const startNew = () => {
    sfx.coin();
    if (save && !confirmNew) {
      setConfirmNew(true);
      return;
    }
    onStart();
  };

  const days = getDays(lang);
  const saveDayN = save ? days[Math.min(save.dayIdx, days.length - 1)].n : 1;

  return (
    <div className="relative min-h-screen rays overflow-hidden flex flex-col">
      {/* верхняя лента */}
      <div className="relative z-10 border-b-2 border-[var(--color-line)] bg-[var(--color-coal)]">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-3 text-[10px] sm:text-xs uppercase tracking-widest text-[var(--color-ash)]">
          <span>{t.ui.title.ministry}</span>
          <span className="hidden lg:inline">{t.ui.title.archive}</span>
          <span className="flex items-center gap-3">
            {t.ui.title.version(APP_VERSION)}
            <AudioSettings />
            <LangSwitch />
          </span>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-4 py-8 w-full grid lg:grid-cols-[1.15fr_1fr] gap-10 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-3 mb-5"
            >
              <AtomEmblem size={44} />
              <div className="pixel-text text-[9px] sm:text-[10px] text-[var(--color-gold)] leading-relaxed">
                {t.ui.title.unionTop}
                <br />
                {t.ui.title.unionBottom}
              </div>
            </motion.div>

            <h1 className="font-head leading-[0.92] uppercase" style={{ fontFamily: "var(--font-head)" }}>
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="block fringe text-[14vw] lg:text-[6.6rem] text-[var(--color-paper)]"
              >
                {t.ui.title.logoTop}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.25 }}
                className="block fringe text-[9vw] lg:text-[4.1rem] text-[var(--color-state2)]"
              >
                {t.ui.title.logoBottom}
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-4 max-w-md text-sm text-[var(--color-ash)] leading-relaxed"
            >
              {t.ui.title.about}
            </motion.p>

            {/* МЕНЮ */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-7 flex flex-col gap-3 max-w-md"
            >
              {save && (
                <button
                  className="btn-soviet px-6 py-3.5 text-base inline-flex items-center justify-between gap-2"
                  onClick={() => {
                    sfx.stamp();
                    onContinue();
                  }}
                >
                  <span className="inline-flex items-center gap-2">
                    <PixelGlyph name="play" size={18} /> {t.ui.title.continueShift(saveDayN)}
                  </span>
                  <span className="text-[10px] opacity-80 normal-case tracking-normal">
                    {save.credits} ₳ · {saveAge(save.savedAt, t.ui.title)}
                  </span>
                </button>
              )}

              <div className="flex gap-3 flex-wrap">
                <button
                  className={`${save ? "btn-ghost" : "btn-soviet"} px-6 py-3.5 text-base inline-flex items-center gap-2 flex-1 justify-center`}
                  onClick={startNew}
                >
                  {confirmNew ? (
                    <>
                      <PixelGlyph name="list-restart" size={18} /> {t.ui.title.wipeStart}
                    </>
                  ) : (
                    <>
                      {t.ui.title.newService} <PixelGlyph name="next" size={18} />
                    </>
                  )}
                </button>
                <button
                  className="btn-ghost px-5 py-3.5 text-base inline-flex items-center gap-2"
                  onClick={() => {
                    sfx.ui();
                    setLog(true);
                  }}
                >
                  <PixelGlyph name="document" size={17} /> {t.ui.title.changes}
                </button>
              </div>

              {save && (
                <button
                  className="text-[10px] uppercase tracking-widest text-[var(--color-ash)] hover:text-[var(--color-state2)] transition-colors inline-flex items-center gap-1.5 self-start"
                  onClick={() => {
                    sfx.ui();
                    onWipe();
                    setConfirmNew(false);
                  }}
                >
                  <PixelGlyph name="trash" size={11} /> {t.ui.title.wipeSave}
                </button>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85 }}
              className="mt-7 flex items-center gap-5 opacity-80 flex-wrap"
            >
              <div className="flex items-center gap-2">
                <AtomEmblem size={32} />
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-ash)]">{t.ui.title.emblemAssr}</span>
              </div>
              <div className="flex items-center gap-2">
                <PartyEmblem size={32} mirrored />
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-ash)]">{t.ui.title.emblemKpta}</span>
              </div>
            </motion.div>
          </div>

          {/* плакат */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative frame block w-full max-w-[520px] mx-auto lg:max-w-none"
          >
            <div className="relative overflow-hidden bg-[#171716]">
              <img
                src="images/title-poster-pixel.png"
                alt={t.ui.title.posterAlt}
                className="pixel-art block w-full h-auto max-h-[600px] object-contain"
              />
            </div>
            <span className="bolt" style={{ top: 6, left: 6 }} />
            <span className="bolt" style={{ top: 6, right: 6 }} />
            <span className="bolt" style={{ bottom: 6, left: 6 }} />
            <span className="bolt" style={{ bottom: 6, right: 6 }} />
          </motion.div>
        </div>
      </div>

      {/* нижняя лента */}
      <div className="relative z-10 border-t-2 border-[var(--color-line)] bg-[var(--color-coal)] overflow-hidden">
        <div className="py-2 whitespace-nowrap">
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="inline-flex gap-10 text-[11px] uppercase tracking-widest text-[var(--color-ash)]"
          >
            {[0, 1].map((k) => (
              <span key={k} className="inline-flex gap-10">
                <span className="text-[var(--color-state2)]">{t.ui.title.marqueeLead}</span>
                {t.ui.title.marquee.map((line, i) => (
                  <span key={i}>{line}</span>
                ))}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ---------- CHANGELOG ---------- */}
      <AnimatePresence>
        {log && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[70]"
              onClick={() => setLog(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              className="fixed z-[71] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(720px,94vw)] max-h-[88vh] panel flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[var(--color-line)]">
                <div className="flex items-center gap-2">
                  <PixelGlyph name="document" size={17} className="text-[var(--color-gold)]" />
                  <span className="font-head uppercase tracking-widest text-[var(--color-gold)]" style={{ fontFamily: "var(--font-head)" }}>
                    {t.ui.title.logTitle}
                  </span>
                </div>
                <button
                  className="btn-ghost px-3 py-1 text-xs"
                  onClick={() => setLog(false)}
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto p-5 space-y-5">
                {CHANGELOG.map((c, idx) => (
                  <div key={c.version} className="relative pl-4">
                    <span
                      className="absolute left-0 top-1.5 w-2 h-2"
                      style={{ background: c.tone, boxShadow: `0 0 8px ${c.tone}` }}
                    />
                    <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
                      <span className="font-head text-base" style={{ fontFamily: "var(--font-head)", color: c.tone }}>
                        v{c.version}
                      </span>
                      <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider" style={{ background: c.tone, color: "#14100d" }}>
                        {c.tag[lang]}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-ash)]">{c.date[lang]}</span>
                      {idx === 0 && (
                        <span className="text-[9px] uppercase tracking-widest text-[var(--color-state2)] animate-blink">{t.ui.title.current}</span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {c.items[lang].map((it, k) => (
                        <li key={k} className="text-[12.5px] leading-relaxed text-[var(--color-bone)] flex gap-2">
                          <span className="text-[var(--color-ash)] shrink-0">—</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="text-[10px] uppercase tracking-widest text-[var(--color-ash)] text-center pt-2 border-t border-[var(--color-line)]">
                  {t.ui.title.logFooter}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
