import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { initAudio } from "./audio";
import { DAYS, GAMEOVER, START_CREDITS } from "./game/data";
import { buildDay } from "./game/generator";
import { agentEntrants, pickEnding } from "./game/story";
import { clearSave, EMPTY_FLAGS, loadSave, writeSave } from "./game/save";
import type { DayResult, Flags, Notice, SaveData } from "./game/types";
import { TitleScreen } from "./screens/TitleScreen";
import { BriefingScreen } from "./screens/BriefingScreen";
import { GameScreen } from "./screens/GameScreen";
import { EndingScreen, GameOverScreen, LedgerScreen } from "./screens/EndScreens";

type Phase = "title" | "briefing" | "game" | "ledger" | "ending" | "gameover";
type Totals = { correct: number; errors: number; detains: number; evidence: number };

const ZERO_TOTALS: Totals = { correct: 0, errors: 0, detains: 0, evidence: 0 };

export default function App() {
  const [phase, setPhase] = useState<Phase>("title");
  const [save, setSave] = useState<SaveData | null>(() => loadSave());

  const [seed, setSeed] = useState(1);
  const [dayIdx, setDayIdx] = useState(0);
  const [credits, setCredits] = useState(START_CREDITS);
  const [flags, setFlags] = useState<Flags>({ ...EMPTY_FLAGS });
  const [totals, setTotals] = useState<Totals>({ ...ZERO_TOTALS });
  const [notices, setNotices] = useState<(Notice & { amount?: number })[]>([]);
  const [lastResult, setLastResult] = useState<DayResult | null>(null);
  const [lastBalance, setLastBalance] = useState(START_CREDITS);
  const heatStreak = useRef(0);

  // Полноэкранный режим: F11 переключает окно (в браузере F11 обрабатывает сам браузер).
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "F11" || !("__TAURI_INTERNALS__" in window)) return;
      event.preventDefault();
      const win = getCurrentWindow();
      void win
        .isFullscreen()
        .then((full) => win.setFullscreen(!full))
        .catch(() => {});
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const day = DAYS[Math.min(dayIdx, DAYS.length - 1)];

  // очередь дня: процедурная генерация + сюжетные визиты
  const entrants = useMemo(
    () => buildDay(seed, day, agentEntrants(day.n, flags, day.dateShort)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, day.n, flags.westTrust, flags.neighborTrust]
  );

  const persist = useCallback(
    (d: { seed: number; dayIdx: number; credits: number; flags: Flags; totals: Totals; heat: number }) => {
      writeSave({
        seed: d.seed,
        dayIdx: d.dayIdx,
        credits: d.credits,
        flags: d.flags,
        totals: d.totals,
        heatStreak: d.heat,
      });
      setSave(loadSave());
    },
    []
  );

  // ---------- новая игра ----------
  const startGame = useCallback(() => {
    initAudio();
    const s = Math.floor(Math.random() * 1_000_000) + 1;
    const f = { ...EMPTY_FLAGS };
    setSeed(s);
    setDayIdx(0);
    setCredits(START_CREDITS);
    setFlags(f);
    setTotals({ ...ZERO_TOTALS });
    setNotices([]);
    setLastResult(null);
    setLastBalance(START_CREDITS);
    heatStreak.current = 0;
    persist({ seed: s, dayIdx: 0, credits: START_CREDITS, flags: f, totals: { ...ZERO_TOTALS }, heat: 0 });
    setPhase("briefing");
  }, [persist]);

  // ---------- продолжить ----------
  const continueGame = useCallback(() => {
    const s = loadSave();
    if (!s) return;
    initAudio();
    setSeed(s.seed);
    setDayIdx(s.dayIdx);
    setCredits(s.credits);
    setFlags({ ...EMPTY_FLAGS, ...s.flags });
    setTotals({ ...ZERO_TOTALS, ...s.totals });
    heatStreak.current = s.heatStreak ?? 0;
    setNotices([]);
    setLastResult(null);
    setPhase("briefing");
  }, []);

  const wipe = useCallback(() => {
    clearSave();
    setSave(null);
  }, []);

  const toMenu = useCallback(() => {
    setSave(loadSave());
    setPhase("title");
  }, []);

  // ---------- конец смены ----------
  const handleFinish = useCallback((res: DayResult) => {
    setLastResult(res);
    setFlags((prev) => {
      const f = { ...prev };
      const d = res.flags;
      if (d.bribe) f.bribe = true;
      if (d.westTrust) f.westTrust += d.westTrust;
      if (d.neighborTrust) f.neighborTrust += d.neighborTrust;
      if (d.loyalty) f.loyalty += d.loyalty;
      if (d.metWest) f.metWest = true;
      if (d.metNeighbor) f.metNeighbor = true;
      if (d.finalChoice && (d.finalChoice !== "loyal" || !f.finalChoice)) f.finalChoice = d.finalChoice;
      return f;
    });
    setTotals((t) => ({
      correct: t.correct + res.correct,
      errors: t.errors + res.errors.length,
      detains: t.detains + res.detains,
      evidence: t.evidence + res.evidence,
    }));
    setPhase("ledger");
  }, []);

  // ---------- ведомость → следующий день ----------
  const handleLedgerNext = useCallback(
    (newBalance: number, _fine: number, opts?: { heatSkipped?: boolean }) => {
      setCredits(newBalance);
      setLastBalance(newBalance);
      if (newBalance < 0) {
        clearSave();
        setSave(null);
        setPhase("gameover");
        return;
      }
      heatStreak.current = opts?.heatSkipped ? heatStreak.current + 1 : 0;

      if (dayIdx >= DAYS.length - 1) {
        clearSave();
        setSave(null);
        setPhase("ending");
        return;
      }

      const next = dayIdx + 1;
      const list: Notice[] = [];
      if (heatStreak.current === 1) {
        list.push({ text: "Печь в бараке холодная. Семья куталась всю ночь. Ещё одна такая — простуда.", amount: 0 });
      } else if (heatStreak.current >= 2) {
        list.push({ text: "СЫН ПРОСТУДИЛСЯ. Лекарства добываются по-мародёрски дорого.", amount: -6 });
        heatStreak.current = 0;
      }
      if (flags.westTrust >= 3 && DAYS[next].n >= 5) {
        list.push({ text: "СЛУЖБА БДИТЕЛЬНОСТИ. С поста №7 замечены частые беседы с иностранным атташе. Проверка продолжается.", amount: 0 });
      }
      if (flags.neighborTrust >= 3 && DAYS[next].n >= 5) {
        list.push({ text: "ПАТРУЛЬ У РЕКИ УСИЛЕН. На третьем причале видели чужую лодку.", amount: 0 });
      }
      if (flags.bribe) {
        list.push({ text: "АНОНИМНЫЙ ДОНОС. Министерство изъяло подозрительные средства соратника поста.", amount: -10 });
      }
      const sum = list.reduce((s, n) => s + (n.amount ?? 0), 0);
      const balance = newBalance + sum;

      setNotices(list);
      setCredits(balance);
      setDayIdx(next);
      persist({ seed, dayIdx: next, credits: balance, flags, totals, heat: heatStreak.current });
      setPhase("briefing");
    },
    [dayIdx, flags, persist, seed, totals]
  );

  const ending = pickEnding(flags, totals);

  return (
    <div className="crt min-h-screen bg-[var(--color-ink)]">
      <div className="noise-layer" />
      <AnimatePresence mode="wait">
        <motion.div
          key={phase + dayIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          {phase === "title" && (
            <TitleScreen save={save} onStart={startGame} onContinue={continueGame} onWipe={wipe} />
          )}
          {phase === "briefing" && (
            <BriefingScreen day={day} notices={notices} credits={credits} onOpen={() => setPhase("game")} />
          )}
          {phase === "game" && (
            <GameScreen day={day} entrants={entrants} credits={credits} onFinish={handleFinish} onExit={toMenu} />
          )}
          {phase === "ledger" && lastResult && (
            <LedgerScreen
              day={day}
              result={lastResult}
              creditsBefore={credits}
              isLast={dayIdx >= DAYS.length - 1}
              onNext={handleLedgerNext}
            />
          )}
          {phase === "ending" && (
            <EndingScreen
              ending={ending}
              stats={{
                correct: totals.correct,
                errors: totals.errors,
                credits: lastBalance,
                detains: totals.detains,
                evidence: totals.evidence,
              }}
              onRestart={() => {
                setSave(loadSave());
                setPhase("title");
              }}
            />
          )}
          {phase === "gameover" && (
            <GameOverScreen
              gameover={GAMEOVER}
              onRestart={() => {
                setSave(loadSave());
                setPhase("title");
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
