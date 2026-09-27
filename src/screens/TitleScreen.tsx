import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, ListRestart, Play, ScrollText, Trash2, X } from "lucide-react";
import { useState } from "react";
import { AtomEmblem, PartyEmblem } from "../components/Emblems";
import { sfx } from "../audio";
import { APP_VERSION, CHANGELOG } from "../game/changelog";
import { DAYS } from "../game/data";
import { saveAge } from "../game/save";
import type { SaveData } from "../game/types";

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

  return (
    <div className="relative min-h-screen rays overflow-hidden flex flex-col">
      {/* верхняя лента */}
      <div className="relative z-10 border-b-2 border-[var(--color-line)] bg-[var(--color-coal)]">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between text-[10px] sm:text-xs uppercase tracking-widest text-[var(--color-ash)]">
          <span>Министерство Пропусков Народа</span>
          <span className="hidden sm:inline">кабинет 7 // архив смен</span>
          <span>версия {APP_VERSION}</span>
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
                Аргелийская Советская
                <br />
                Социалистическая Республика
              </div>
            </motion.div>

            <h1 className="font-head leading-[0.92] uppercase" style={{ fontFamily: "var(--font-head)" }}>
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="block fringe text-[14vw] lg:text-[6.6rem] text-[var(--color-paper)]"
              >
                Гербы,
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, delay: 0.25 }}
                className="block fringe text-[9vw] lg:text-[4.1rem] text-[var(--color-state2)]"
              >
                пожалуйста
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="mt-4 max-w-md text-sm text-[var(--color-ash)] leading-relaxed"
            >
              Шесть смен на КПП-7. Очередь генерируется заново каждую игру, но двое приходят всегда:
              западный атташе и сосед из-за реки. Оба зовут к себе. Решать — тебе.
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
                    <Play size={18} /> Продолжить смену {DAYS[Math.min(save.dayIdx, DAYS.length - 1)].n}
                  </span>
                  <span className="text-[10px] opacity-80 normal-case tracking-normal">
                    {save.credits} ₳ · {saveAge(save.savedAt)}
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
                      <ListRestart size={18} /> Затереть и начать?
                    </>
                  ) : (
                    <>
                      Новая служба <ChevronRight size={18} />
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
                  <ScrollText size={17} /> Изменения
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
                  <Trash2 size={11} /> стереть сохранение
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
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-ash)]">Герб АССР</span>
              </div>
              <div className="flex items-center gap-2">
                <PartyEmblem size={32} mirrored />
                <span className="text-[10px] uppercase tracking-widest text-[var(--color-ash)]">Герб КПТА</span>
              </div>
            </motion.div>
          </div>

          {/* плакат */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="relative frame hidden lg:block"
          >
            <div className="relative overflow-hidden">
              <img
                src="images/poster.jpg"
                alt="Пропагандистский плакат АССР"
                className="w-full h-[500px] object-cover"
                style={{ filter: "saturate(0.9) contrast(1.05)" }}
              />
              <div className="absolute inset-0 dither" />
              <div className="absolute bottom-0 inset-x-0 bg-[var(--color-coal)] border-t-2 border-[var(--color-line)] px-4 py-3">
                <div className="pixel-text text-[8px] text-[var(--color-gold)] leading-relaxed">
                  «АТОМ СМОТРИТ НА ГРАНИЦУ. ГРАНИЦА — ЭТО ТЫ.»
                </div>
                <div className="text-[10px] text-[var(--color-ash)] mt-1 uppercase tracking-widest">
                  плакат // типография министерства
                </div>
              </div>
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
                <span className="text-[var(--color-state2)]">/// Голос Атома:</span>
                <span>реактор «Заря-1» готовится к Великому Запуску</span>
                <span>партия КПТА напоминает: молот — справа</span>
                <span>у атома три орбиты — считай внимательно</span>
                <span>гражданам Западного Союза следить за новостями</span>
                <span>очередь у КПП-7 обслуживается с 06:00</span>
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
                  <ScrollText size={17} className="text-[var(--color-gold)]" />
                  <span className="font-head uppercase tracking-widest text-[var(--color-gold)]" style={{ fontFamily: "var(--font-head)" }}>
                    Журнал изменений
                  </span>
                  <span className="pixel-text text-[8px] text-[var(--color-ash)] ml-2">v{APP_VERSION}</span>
                </div>
                <button className="btn-ghost p-1.5" onClick={() => setLog(false)}>
                  <X size={16} />
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
                        {c.tag}
                      </span>
                      <span className="text-[10px] uppercase tracking-widest text-[var(--color-ash)]">{c.date}</span>
                      {idx === 0 && (
                        <span className="text-[9px] uppercase tracking-widest text-[var(--color-state2)] animate-blink">текущая</span>
                      )}
                    </div>
                    <ul className="space-y-1">
                      {c.items.map((it, k) => (
                        <li key={k} className="text-[12.5px] leading-relaxed text-[var(--color-bone)] flex gap-2">
                          <span className="text-[var(--color-ash)] shrink-0">—</span>
                          <span>{it}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <div className="text-[10px] uppercase tracking-widest text-[var(--color-ash)] text-center pt-2 border-t border-[var(--color-line)]">
                  отпечатано в типографии «Третья Орбита» // не выносить за пределы блока
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
