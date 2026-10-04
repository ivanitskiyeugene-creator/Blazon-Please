import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { initAudio } from "./audio";
import { getDays, START_CREDITS } from "./game/data";
import { buildDay } from "./game/generator";
import { agentEntrants, pickEnding } from "./game/story";
import { commissionerVisit, createCommissionerEntrant } from "./game/commissioner";
import { DebugConsole, type DebugCase } from "./components/DebugConsole";
import { clearSave, EMPTY_FLAGS, loadSave, writeSave } from "./game/save";
import type { DayResult, EntrantSpec, Flags, Notice, RareEventKind, SaveData } from "./game/types";
import { I18nProvider, useI18n } from "./i18n";
import { TitleScreen } from "./screens/TitleScreen";
import { BriefingScreen } from "./screens/BriefingScreen";
import { GameScreen } from "./screens/GameScreen";
import { EndingScreen, GameOverScreen, LedgerScreen } from "./screens/EndScreens";

type Phase = "title" | "briefing" | "game" | "ledger" | "ending" | "gameover";
type Totals = { correct: number; errors: number; detains: number; evidence: number };

const ZERO_TOTALS: Totals = { correct: 0, errors: 0, detains: 0, evidence: 0 };

function Game() {
  const { lang, t } = useI18n();
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
  const [debugCase, setDebugCase] = useState<DebugCase>(null);
  const [debugRun, setDebugRun] = useState(0);
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

  const DAYS = useMemo(() => getDays(lang), [lang]);
  const day = DAYS[Math.min(dayIdx, DAYS.length - 1)];

  // очередь дня: процедурная генерация + сюжетные визиты.
  // Смена языка пересобирает очередь по тому же зерну — люди те же, текст другой.
  const baseEntrants = useMemo(
    () => {
      const visits = agentEntrants(day.n, flags, day.dateShort, lang);
      const commissioner = commissionerVisit(day.n, flags, lang, seed);
      if (commissioner) visits.push(commissioner);
      return buildDay(seed, day, visits, lang);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seed, day.n, lang, flags.westTrust, flags.neighborTrust]
  );

  const entrants = useMemo(() => {
    if (!debugCase || baseEntrants.length === 0) return baseEntrants;
    const makeRare = (kind: RareEventKind, index: number): EntrantSpec => {
      const original = baseEntrants[index % baseEntrants.length];
      const passport = { ...original.passport };
      let permit = original.permit ? { ...original.permit } : undefined;
      if (kind === "forgot_permit" && !permit) {
        passport.country = "KRS";
        permit = { name: passport.name, passId: passport.id, purpose: t.purposes[0], duration: t.durations[1], issued: "01.10.51", expiry: "30.12.52" };
      }
      const entrant: EntrantSpec = { ...original, passport, permit, rareEvent: kind, dialogue: t.rare[kind], agentOffer: undefined };
      if (kind === "wrong_queue") entrant.wrongQueuePassport = { ...passport, country: passport.country === "KRS" ? "UGS" : "KRS" };
      if (kind === "bribed_guard") entrant.agentOffer = { prompt: t.rareStage.bribed, options: [
        { label: t.rareStage.report, reply: t.rareStage.reportReply, loyal: 1, guardReported: true },
        { label: t.rareStage.silent, reply: t.rareStage.silentReply, loyal: -1, guardReported: false },
      ] };
      return entrant;
    };
    if (debugCase === "commissioner") return [createCommissionerEntrant(lang, true), ...baseEntrants];
    if (debugCase === "campaign13") {
      const make = (n: number) => ({ ...baseEntrants[n % baseEntrants.length], passport: { ...baseEntrants[n % baseEntrants.length].passport }, expected: "DENY" as const, mismatch: [] as [string,string][] });
      const talk = make(0); talk.transcript = { purpose: t.purposes[0], duration: t.durations[0] }; talk.permit = { name: talk.passport.name, passId: talk.passport.id, purpose: t.purposes[1], duration: t.durations[1], issued: "01.10.51", expiry: "01.10.52" }; talk.mismatch=[["talk.purpose","w.purpose"]];
      const dip = make(1); dip.diplomatic={name:dip.passport.name,passportId:dip.passport.id,countries:[dip.passport.country],seal:t.documents.diplomaticSeal}; dip.mismatch=[["d.countries","p.country"]];
      const vac = make(2); vac.vaccination={name:vac.passport.name,passportId:vac.passport.id,vaccine:t.documents.vaccines[0],date:"01.01.49",validUntil:"01.01.50",seal:t.documents.healthSeal}; vac.mismatch=[["v.valid","cal.today"]];
      const asylum=make(3); asylum.asylum=true;
      const confiscate=make(4); confiscate.confiscatePassport=true;
      const relation=make(5); relation.relation=t.documents.relations[0];
      const attack=make(6); attack.special="attacker";
      return [talk,dip,vac,asylum,confiscate,relation,attack];
    }
    if (debugCase === "inspection") {
      const sample = (n: number) => ({ ...baseEntrants[n % baseEntrants.length], mismatch: [] as [string, string][], expected: "DENY" as const });
      const wanted = sample(0); wanted.wanted = true; wanted.detainable = true; wanted.mismatch = [["face", "ref.wanted"]];
      const fp = sample(1); fp.fingerprintMismatch = true; fp.mismatch = [["fp.print", "p.id"]];
      const measure = sample(2); measure.declaredHeight = 170; measure.measuredHeight = 182; measure.declaredWeight = 70; measure.measuredWeight = 84; measure.mismatch = [["measure.actual", "measure.declared"]];
      const scan = sample(3); scan.contraband = t.systems.contrabandItems[0]; scan.detainable = true; scan.mismatch = [["scan.cargo", "rule.contraband"]];
      const attack = sample(4); attack.special = "attacker";
      return [wanted, fp, measure, scan, attack];
    }
    if (debugCase === "all") {
      const kinds: RareEventKind[] = ["forgot_permit", "nervous", "bribed_guard", "dual_passport", "wrong_queue"];
      return [createCommissionerEntrant(lang, true), ...kinds.map(makeRare)];
    }
    return [makeRare(debugCase, 0), ...baseEntrants.slice(1)];
  }, [baseEntrants, debugCase, debugRun, lang, t]);

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
      if (d.guardReported !== undefined) f.guardReported = d.guardReported;
      if (d.commissionerScore) f.commissionerScore += d.commissionerScore;
      if (d.finalChoice && (d.finalChoice !== "loyal" || !f.finalChoice)) f.finalChoice = d.finalChoice;
      return f;
    });
    setTotals((tt) => ({
      correct: tt.correct + res.correct,
      errors: tt.errors + res.errors.length,
      detains: tt.detains + res.detains,
      evidence: tt.evidence + res.evidence,
    }));
    setPhase("ledger");
  }, []);

  // ---------- ведомость → следующий день ----------
  const handleLedgerNext = useCallback(
    (newBalance: number, _fine: number, opts?: { heatSkipped?: boolean; skipped?: string[] }) => {
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
        list.push({ text: t.notices.heat1, amount: 0 });
      } else if (heatStreak.current >= 2) {
        list.push({ text: t.notices.heat2, amount: -6 });
        heatStreak.current = 0;
      }
      if (opts?.skipped?.includes("food")) list.push({ text: t.notices.hunger, amount: -4 });
      if (opts?.skipped?.includes("meds")) list.push({ text: t.notices.illness, amount: -7 });
      if (flags.westTrust >= 3 && DAYS[next].n >= 5) {
        list.push({ text: t.notices.vigilance, amount: 0 });
      }
      if (flags.neighborTrust >= 3 && DAYS[next].n >= 5) {
        list.push({ text: t.notices.river, amount: 0 });
      }
      if (flags.bribe) {
        list.push({ text: t.notices.denunciation, amount: -10 });
      }
      const sum = list.reduce((s, n) => s + (n.amount ?? 0), 0);
      const balance = newBalance + sum;

      setNotices(list);
      setCredits(balance);
      setDayIdx(next);
      persist({ seed, dayIdx: next, credits: balance, flags, totals, heat: heatStreak.current });
      setPhase("briefing");
    },
    [dayIdx, flags, persist, seed, totals, t, DAYS]
  );

  const ending = useMemo(() => pickEnding(flags, totals, lang), [flags, totals, lang]);

  return (
    <div className="min-h-screen bg-[var(--color-ink)]">
      <DebugConsole
        day={day.n}
        onDay={(n) => { setDebugCase(null); setDayIdx(n - 1); setNotices([]); setPhase("briefing"); }}
        onCase={(kind) => { setDebugCase(kind); setDebugRun((v) => v + 1); setPhase("game"); }}
        onCredits={() => setCredits(999)}
        onScreen={(screen) => { setDebugRun((v) => v + 1); setPhase(screen); }}
        onFlags={(preset) => setFlags(preset === "clean" ? { ...EMPTY_FLAGS } : preset === "suspicious" ? { ...EMPTY_FLAGS, bribe: true, westTrust: 4, commissionerScore: -2 } : { ...EMPTY_FLAGS, loyalty: 5, commissionerScore: 2 })}
        onClose={() => setDebugCase(null)}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={phase + dayIdx + lang + debugRun}
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
              gameover={t.gameover}
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

export default function App() {
  return (
    <I18nProvider>
      <Game />
    </I18nProvider>
  );
}
