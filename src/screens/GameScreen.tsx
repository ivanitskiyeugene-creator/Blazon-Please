import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PixelGlyph } from "../components/PixelGlyph";
import { AudioSettings } from "../components/AudioSettings";
import { InspectionDevices } from "../components/InspectionDevices";
import { initAudio, isMuted, setMuted, sfx } from "../audio";
import { startMusic, stopMusic, isMusicPlaying } from "../music";
import { DETAIN_BONUS, EVIDENCE_BONUS } from "../game/data";
import { createCommissionerEntrant } from "../game/commissioner";
import { useI18n, LangSwitch } from "../i18n";
import type { AgentOption, DayConfig, DayResult, Decision, DocId, EntrantSpec, FieldKey } from "../game/types";
import { AtomEmblem } from "../components/Emblems";
import { BoothDecor } from "../components/Booth";
import { PartyCardDoc, PassportDoc, PermitDoc, type SelProps } from "../components/Docs";
import { EmploymentDoc, TransitDoc } from "../components/NewDocs";
import { DiplomaticDoc, VaccinationDoc, TranscriptDoc } from "../components/AdvancedDocs";
import { BookDoc, NewsDoc } from "../components/ReferenceDocs";
import { Person } from "../components/Person";
import { Rulebook } from "../components/Rulebook";
import { DraggableDoc } from "../components/DraggableDoc";
import { StampPad } from "../components/StampPad";
import type { InvItem } from "../game/types";

type Stage = "enter" | "review" | "stamped" | "exit";
interface DeskDoc {
  id: DocId;
  x: number;
  y: number;
  z: number;
}

function TypeLine({ text, className = "" }: { text: string; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = window.setInterval(() => {
      setN((v) => {
        if (v >= text.length) {
          window.clearInterval(id);
          return v;
        }
        if (v % 6 === 0) sfx.typeBlip();
        return v + 1;
      });
    }, 18);
    return () => window.clearInterval(id);
  }, [text]);
  return <span className={className}>{text.slice(0, n)}</span>;
}

export function GameScreen({
  day,
  entrants: initialEntrants,
  credits,
  onFinish,
  onExit,
}: {
  day: DayConfig;
  entrants: EntrantSpec[];
  credits: number;
  onFinish: (res: DayResult) => void;
  onExit: () => void;
}) {
  const { t, lang } = useI18n();
  const [entrants, setEntrants] = useState(initialEntrants);
  const [i, setI] = useState(0);
  const [stage, setStage] = useState<Stage>("enter");
  const [stamped, setStamped] = useState<Decision | null>(null);
  const [reaction, setReaction] = useState<string | null>(null);
  const [probed, setProbed] = useState(false);
  const [mute, setMute] = useState(isMuted());
  const [shaking, setShaking] = useState(false);
  const [shakeIntensity, setShakeIntensity] = useState(0);
  const [journal, setJournal] = useState<{ name: string; d: Decision }[]>([]);
  const [offerOpen, setOfferOpen] = useState(false);
  const [offerDone, setOfferDone] = useState(false);
  const [askExit, setAskExit] = useState(false);
  const [stampOpen, setStampOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [inventory, setInventory] = useState<InvItem[]>([]);
  const [rareMsg, setRareMsg] = useState<string | null>(null); // редкое событие
  const [musicOn, setMusicOn] = useState(isMusicPlaying());
  const [needCall, setNeedCall] = useState(true);
  const [entrantVisible, setEntrantVisible] = useState(false);
  const [offeredDocs, setOfferedDocs] = useState<DocId[]>([]);   // под человеком
  const [trayDocs, setTrayDocs] = useState<DocId[]>([]);         // взял у посетителя
  const [stampMarks, setStampMarks] = useState<{ type: Decision; x: number; y: number }[]>([]);
  const [shutterClosed, setShutterClosed] = useState(false); // железный занавес будки
  const [surveillance, setSurveillance] = useState(0);
  const [decisionSeconds, setDecisionSeconds] = useState<number | null>(null);
  const [wrongQueuePhase, setWrongQueuePhase] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [fingerprintsTaken, setFingerprintsTaken] = useState(false);
  const [instantCitation, setInstantCitation] = useState<string | null>(null);
  const [emergency, setEmergency] = useState(false);
  const [confiscated, setConfiscated] = useState(false);
  const [combat, setCombat] = useState(false);
  const [weaponArmed, setWeaponArmed] = useState(false);
  const [combatSeconds, setCombatSeconds] = useState(5);

  // документы на столе
  const [desk, setDesk] = useState<DeskDoc[]>([]);
  const deskRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<Record<string, HTMLDivElement | null>>({});

  const topZ = useRef(10);


  // выбор несоответствий
  const [sel, setSel] = useState<FieldKey[]>([]);
  const [proven, setProven] = useState<FieldKey[]>([]);
  const [hasEvidence, setHasEvidence] = useState(false);

  const result = useRef<DayResult>({
    correct: 0,
    errors: [],
    hidden: 0,
    bribeGain: 0,
    detains: 0,
    detainBonus: 0,
    evidence: 0,
    evidenceBonus: 0,
    agentCredits: 0,
    flags: {},
  });
  const timers = useRef<number[]>([]);
  const done = useRef(false);
  const finalizingEntrant = useRef(false);
  const decisionCommitted = useRef(false);
  // React-состояние штампа может быть ещё старым, если документ вернули сразу
  // после удара. Ref фиксирует фактический выбор синхронно в момент штампа.
  const pendingDecision = useRef<Decision | null>(null);

  const entrant: EntrantSpec | null = i < entrants.length ? entrants[i] : null;
  const detainUnlocked = day.n >= 3;
  const evidenceUnlocked = day.n >= 2;

  const doShake = (intensity = 1) => {
    setShakeIntensity(intensity);
    setShaking(true);
    setTimeout(() => { setShaking(false); setShakeIntensity(0); }, 250);
  };
  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  useEffect(() => {
    initAudio();
    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  // поток посетителей
  useEffect(() => {
    if (i >= entrants.length) {
      if (!done.current) {
        done.current = true;
        later(700, () => onFinish(result.current));
      }
      return;
    }
    setStage("enter");
    setStamped(null);
    setReaction(null);
    setProbed(false);
    setSel([]);
    setProven([]);
    setHasEvidence(false);
    setOfferDone(false);
    setOfferOpen(false);
    setStampOpen(false);
    setRareMsg(null);
    setDesk((prev) => prev.filter((d) => d.id === "book" || d.id === "news"));
    setTrayDocs([]);
    setOfferedDocs([]);
    setStampMarks([]);
    setShutterClosed(false);
    setWrongQueuePhase(false);
    setScanned(false); setFingerprintsTaken(false); setInstantCitation(null); setEmergency(false); setConfiscated(false); setCombat(false); setWeaponArmed(false); setCombatSeconds(5);
    setEntrantVisible(false);
    setNeedCall(true);
    finalizingEntrant.current = false;
    decisionCommitted.current = false;
    pendingDecision.current = null;
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (stage !== "review" || surveillance <= 0 || entrant?.special === "commissioner") { setDecisionSeconds(null); return; }
    setDecisionSeconds(45);
    const timer = window.setInterval(() => setDecisionSeconds((v) => {
      if (v === null) return null;
      if (v <= 1) {
        window.clearInterval(timer);
        result.current.errors.push(t.ui.game.commissionerDelay);
        setReaction(t.ui.game.commissionerPenalty);
        return 0;
      }
      if (v <= 10) sfx.typeBlip();
      return v - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [i, stage, surveillance]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (stage !== "review" || entrant?.special !== "attacker" || combat) return;
    setEmergency(true); setCombat(true); setCombatSeconds(5); sfx.alarm(); doShake(2);
  }, [stage, entrant?.special]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!combat) return;
    const timer = window.setInterval(() => setCombatSeconds((v) => {
      if (v <= 1) { window.clearInterval(timer); result.current.errors.push(entrant?.cite ?? t.ui.game.emergency); if (!done.current) { done.current = true; onFinish(result.current); } return 0; }
      return v - 1;
    }), 1000);
    return () => window.clearInterval(timer);
  }, [combat]); // eslint-disable-line react-hooks/exhaustive-deps

  const callNext = () => {
    if (i >= entrants.length) {
      if (!done.current) {
        done.current = true;
        later(700, () => onFinish(result.current));
      }
      return;
    }
    setNeedCall(false);
    setStage("enter");
    // Сначала команда из громкоговорителя, затем короткая пауза —
    // посетитель начинает входить только через секунду.
    later(1000, () => {
      setEntrantVisible(true);
      sfx.walk();
      later(850, () => {
        setStage("review");
        const docs: DocId[] = ["passport"];
      if (entrant?.permit && entrant.rareEvent !== "forgot_permit") docs.push("permit");
      if (entrant?.partyCard) docs.push("party");
      if (entrant?.employment) docs.push("employment");
      if (entrant?.transit) docs.push("transit");
      if (entrant?.diplomatic) docs.push("diplomatic");
      if (entrant?.vaccination) docs.push("vaccination");
      setOfferedDocs(docs);
      if (entrant?.rareEvent === "forgot_permit" && entrant.permit) {
        setRareMsg(t.rareStage.forgot);
        later(3800, () => {
          setOfferedDocs((v) => [...v, "permit"]);
          setRareMsg(null);
          sfx.paper();
        });
      } else if (entrant?.rareEvent === "nervous") {
        setRareMsg(t.rareStage.nervous);
        later(1800, () => setRareMsg(null));
      } else if (entrant?.rareEvent === "dual_passport") {
        setRareMsg(t.rareStage.dual);
        later(2200, () => setRareMsg(null));
      } else if (entrant?.rareEvent === "wrong_queue") {
        setWrongQueuePhase(true);
        setRareMsg(t.rareStage.wrongQueue);
        setOfferedDocs(["passport"]);
        // Человек действительно покидает окно и возвращается с правильным комплектом.
        later(1400, () => {
          setStage("exit"); setEntrantVisible(false); setOfferedDocs([]); setTrayDocs([]);
          setDesk((current) => current.filter((d) => d.id === "book" || d.id === "news"));
          sfx.walk();
        });
        later(2400, () => { setWrongQueuePhase(false); setStage("enter"); setEntrantVisible(true); sfx.walk(); });
        later(3250, () => { setStage("review"); setOfferedDocs(docs); setRareMsg(null); sfx.paper(); });
      } else if (entrant?.rareEvent === "bribed_guard") {
        setRareMsg(t.rareStage.bribed);
        result.current.flags.guardReported = false;
        later(3000, () => setRareMsg(null));
      }
        if (entrant?.agentOffer) later(1400, () => setOfferOpen(true));
      });
    });
  };

  const handoverDoc = (id: DocId) => {
    setOfferedDocs((v) => v.filter((x) => x !== id));
    setTrayDocs((v) => [...v, id]);
    sfx.paper();
  };

  const toggleDeskDoc = (id: DocId) => {
    const onDesk = desk.some((d) => d.id === id);
    if (stage === "stamped") {
      // Книжка и газета принадлежат инспектору: их просто убираем со стола.
      if (id === "book" || id === "news") {
        setDesk((v) => v.filter((d) => d.id !== id));
        sfx.paper();
        return;
      }

      // После штампа паспорт, разрешение и карточка уходят обратно посетителю.
      const remainingDocs = trayDocs.filter((x) => x !== id);
      setDesk((v) => v.filter((d) => d.id !== id));
      setTrayDocs(remainingDocs);
      sfx.paper();

      if (remainingDocs.length === 0) finishEntrantReturn();
      return;
    }
    if (onDesk) {
      // Кнопка в лотке и крестик на документе возвращают его со стола.
      // Поднять документ наверх можно обычным нажатием/перетаскиванием за него.
      setDesk((v) => v.filter((d) => d.id !== id));
      sfx.paper();
      return;
    }
    // Верх стола занимает кассета с машинами — документы кладём ниже неё.
    const pos: Record<string, { x: number; y: number }> = {
      passport: { x: 18, y: 226 },
      permit: { x: 252, y: 238 },
      party: { x: 236, y: 398 },
      employment: { x: 390, y: 226 },
      transit: { x: 390, y: 390 },
      diplomatic: { x: 420, y: 240 },
      vaccination: { x: 430, y: 410 },
      transcript: { x: 300, y: 250 },
      fingerprints: { x: 310, y: 390 },
      book: { x: 540, y: 226 },
      news: { x: 540, y: 440 },
    };
    const base = pos[id] || { x: 18, y: 226 };
    const maxY = Math.max(120, (deskRef.current?.clientHeight ?? 500) - 190);
    const maxX = Math.max(60, (deskRef.current?.clientWidth ?? 700) - 380);
    const spot = { x: Math.min(base.x, maxX), y: Math.min(base.y, maxY) };
    setDesk((v) => [...v, { id, ...spot, z: ++topZ.current }]);
  };

  const bringToFront = (id: DocId) =>
    setDesk((prev) => {
      const cur = prev.find((d) => d.id === id);
      if (!cur || cur.z === topZ.current) return prev;
      const z = ++topZ.current;
      return prev.map((d) => (d.id === id ? { ...d, z } : d));
    });


  const onSel = (k: FieldKey) => {
    if (stage !== "review" || !evidenceUnlocked) return;
    sfx.ui();
    setSel((prev) => {
      if (prev.includes(k)) return prev.filter((x) => x !== k);
      if (prev.length >= 2) return [prev[1], k];
      return [...prev, k];
    });
  };

  const selProps: SelProps = { sel, proven, onSel };

  const proveTool = (keys: FieldKey[], message: string) => {
    if (hasEvidence) return;
    setHasEvidence(true); setProven((p) => [...new Set([...p, ...keys])]); setReaction(message);
    result.current.evidence += 1; result.current.evidenceBonus += EVIDENCE_BONUS; sfx.alarm();
    later(2400, () => setReaction(null));
  };

  const present = () => {
    if (sel.length !== 2 || !entrant || stage !== "review") return;
    const pairs = entrant.mismatch ?? [];
    const selected = new Set(sel);
    // Проверяем не только таблицу пар, но и само видимое состояние. Это защищает
    // фотосверку от рассинхронизации сценарных посетителей и смены документов.
    const visiblePhotoMismatch = selected.has("p.photo") && selected.has("face") &&
      !!entrant.photo && JSON.stringify(entrant.photo) !== JSON.stringify(entrant.person);
    // Политические запреты проверяем и по фактической стране. Сценарные агенты
    // могут быть собраны не генератором и не иметь стандартной пары mismatch.
    const otepliaBan = selected.has("p.country") && selected.has("rule.r4") &&
      entrant.passport.country === "ZPS" && day.n >= 3;
    const ok = visiblePhotoMismatch || otepliaBan || pairs.some(
      (p) => (p[0] === sel[0] && p[1] === sel[1]) || (p[0] === sel[1] && p[1] === sel[0])
    );
    if (ok) {
      sfx.alarm();
      setProven((p) => [...new Set([...p, ...sel])]);
      setSel([]);
      setHasEvidence(true);
      setReaction(entrant.caught ?? t.generic.caught);
      result.current.evidence += 1;
      result.current.evidenceBonus += EVIDENCE_BONUS;
      setShaking(true);
      later(300, () => setShaking(false));
    } else {
      sfx.bad();
      setSel([]);
      setReaction(t.generic.wrongEvidence[i % t.generic.wrongEvidence.length]);
    }
    later(3000, () => setReaction(null));
  };

  const chooseOffer = (o: AgentOption) => {
    const f = result.current.flags;
    if (o.west) f.westTrust = (f.westTrust ?? 0) + o.west;
    if (o.neighbor) f.neighborTrust = (f.neighborTrust ?? 0) + o.neighbor;
    if (o.loyal) f.loyalty = (f.loyalty ?? 0) + o.loyal;
    if (o.commissionerScore) f.commissionerScore = (f.commissionerScore ?? 0) + o.commissionerScore;
    if (o.guardReported !== undefined) f.guardReported = o.guardReported;
    // Молчание о взятках резко повышает шанс проверки ещё в эту смену.
    if (entrant?.rareEvent === "bribed_guard" && o.guardReported === false && Math.random() < 0.7 && !entrants.slice(i + 1).some((e) => e.special === "commissioner")) {
      const visit = createCommissionerEntrant(lang, true);
      setEntrants((queue) => [...queue.slice(0, i + 2), visit, ...queue.slice(i + 2)]);
    }
    if (o.final && (o.final !== "loyal" || !f.finalChoice)) f.finalChoice = o.final;
    if (o.credits) {
      result.current.agentCredits += o.credits;
      sfx.coin();
    } else {
      sfx.ui();
    }
    if (entrant?.agent === "west") f.metWest = true;
    if (entrant?.agent === "neighbor") f.metNeighbor = true;
    // предметы от агентов
    if (o.credits && entrant?.agent === "west") {
      setInventory((inv) => [...inv, { id: "env_" + Date.now(), icon: "₳", name: t.ui.game.inv.envelope, desc: t.ui.game.inv.envelopeDesc(o.credits ?? 0), from: t.ui.game.inv.envelopeFrom }]);
    }
    if (entrant?.agent === "neighbor" && o.neighbor && o.neighbor >= 2) {
      setInventory((inv) => {
        if (inv.some((it) => it.id === "apple")) return inv;
        return [...inv, { id: "apple", icon: t.ui.game.inv.appleIcon, name: t.ui.game.inv.apple, desc: t.ui.game.inv.appleDesc, from: t.ui.game.inv.appleFrom }];
      });
    }
    setOfferOpen(false);
    setOfferDone(true);
    setReaction(o.reply);
    later(4200, () => setReaction(null));
  };

  const decide = (d: Decision, opts?: { bribe?: boolean }) => {
    if ((stage !== "review" && stage !== "stamped") || !entrant || decisionCommitted.current) return;
    decisionCommitted.current = true;
    const e0 = entrant;
    // При обычной проверке звук уже сыграл в момент физического удара штампа.
    // Отдельно озвучиваем только решение через взятку без кассеты.
    if (stage === "review") sfx.stamp();
    setStamped(d);
    setStage("stamped");
    setJournal((j) => [{ name: e0.passport.name, d }, ...j].slice(0, 12));
    setShaking(true);
    later(330, () => setShaking(false));

    const e = entrant;
    if (e.confiscatePassport && !confiscated) { result.current.errors.push(t.ui.game.confiscationMissed); setInstantCitation(t.ui.game.confiscationMissed); }
    setDecisionSeconds(null);
    if (e.special === "commissioner") setSurveillance(3);
    else if (surveillance > 0) setSurveillance((v) => Math.max(0, v - 1));

    if (d === "DETAIN") {
      later(250, () => sfx.alarm());
      if (e.detainable) {
        result.current.detains += 1;
        result.current.detainBonus += DETAIN_BONUS;
        setReaction(e.reactDeny ?? t.violations.reactDetainOk);
      } else {
        result.current.errors.push(t.violations.detainError);
        setInstantCitation(t.violations.detainError); sfx.bad();
        setReaction(e.reactDeny ?? t.violations.reactDetainBad);
      }
    } else {
      const pool = d === "ADMIT" ? t.generic.admit : t.generic.deny;
      const fallback = pool[(i + (d === "ADMIT" ? 1 : 2)) % pool.length];
      const react = d === "ADMIT" ? e.reactAdmit ?? fallback : e.reactDeny ?? fallback;

      if (opts?.bribe) {
        result.current.bribeGain += e.bribe ?? 0;
        result.current.hidden += 1;
        result.current.flags.bribe = true;
        later(360, () => sfx.coin());
        setInventory((inv) => [...inv, { id: "bribe_" + Date.now(), icon: "₳", name: t.ui.game.inv.notes, desc: t.ui.game.inv.notesDesc(e.bribe ?? 0), from: e.passport.name }]);
        setReaction(t.violations.bribeReact);
      } else if (d === e.expected) {
        result.current.correct += 1;
        setReaction(react);
      } else {
        result.current.errors.push(e.cite);
        setInstantCitation(e.cite); sfx.bad();
        setReaction(react);
      }

    }

    // После штампа игрок должен ВЕРНУТЬ все документы посетителю вручную.
    // Уход начнётся автоматически, когда trayDocs опустеет.
  };

  function finishEntrantReturn(force?: Decision) {
    if (finalizingEntrant.current) return;
    // force нужен, когда решение принято не через штамп (красная кнопка ареста):
    // таймер мог захватить устаревшее состояние этого рендера
    const finalDecision = force ?? pendingDecision.current ?? stampMarks.at(-1)?.type ?? stamped;
    if (!decisionCommitted.current && !finalDecision) return;

    finalizingEntrant.current = true;
    if (!decisionCommitted.current && finalDecision) decide(finalDecision);
    setStampOpen(false);
    later(800, () => {
      setStage("exit");
      sfx.walk();
      later(750, () => {
        setEntrantVisible(false);
        setNeedCall(true);
        setI((q) => q + 1);
      });
    });
  }

  const returnAllDocs = () => {
    if (stage !== "stamped" || trayDocs.length === 0) return;
    setDesk((docs) => docs.filter((doc) => doc.id === "book" || doc.id === "news"));
    setTrayDocs([]);
    sfx.paper();
    finishEntrantReturn();
  };

  const showDocs = entrantVisible && (stage === "review" || stage === "stamped" || stage === "exit");
  // locked блокирует только предъявление, НЕ штампы
  const locked = stage === "exit" || stage === "enter" || !entrantVisible;
  const canStamp = entrantVisible && (stage === "review" || stage === "stamped");

  // часы смены
  const step = 700 / entrants.length;
  const minutes = 360 + Math.min(i, entrants.length) * step + (stage === "stamped" ? step * 0.55 : probed ? step * 0.3 : 0);
  const hh = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mm = Math.floor(minutes % 60).toString().padStart(2, "0");

  const queue = [entrants[i + 1], entrants[i + 2]].filter(Boolean) as EntrantSpec[];
  const wantedTarget = entrants.find((e) => e.wanted);

  const renderDoc = (d: DeskDoc) => {
    if (!entrant) return null;
    switch (d.id) {
      case "passport":
        return <PassportDoc data={wrongQueuePhase && entrant.wrongQueuePassport ? entrant.wrongQueuePassport : entrant.passport} person={entrant.photo ?? entrant.person} s={selProps} stampMarks={stampMarks} />;
      case "permit":
        return entrant.permit ? <PermitDoc data={entrant.permit} s={selProps} /> : null;
      case "party":
        return entrant.partyCard ? <PartyCardDoc data={entrant.partyCard} s={selProps} /> : null;
      case "employment":
        return entrant.employment ? <EmploymentDoc data={entrant.employment} s={selProps} /> : null;
      case "transit": return entrant.transit ? <TransitDoc data={entrant.transit} s={selProps} /> : null;
      case "diplomatic": return entrant.diplomatic ? <DiplomaticDoc data={entrant.diplomatic} s={selProps} /> : null;
      case "vaccination": return entrant.vaccination ? <VaccinationDoc data={entrant.vaccination} s={selProps} /> : null;
      case "transcript": return entrant.transcript ? <TranscriptDoc data={entrant.transcript} s={selProps} /> : null;
      case "fingerprints": return null;
      case "book":
        return <BookDoc day={day} s={selProps} />;
      case "news":
        return <NewsDoc day={day} />;

    }
  };

  // Красная кнопка задержания: взводится сама, когда нарушение доказано.
  // Удар — створка будки захлопывается железным занавесом, документы изымаются.
  const arrestArmed = entrantVisible && stage === "review" && detainUnlocked && hasEvidence && !stamped;
  const arrest = () => {
    if (!arrestArmed || !entrant) return;
    sfx.alarm();
    doShake(1.6);
    setStampOpen(false);
    setShutterClosed(true);
    setStamped("DETAIN");
    setStage("stamped");
    setDesk((prev) => prev.filter((d) => d.id === "book" || d.id === "news"));
    setTrayDocs([]);
    setOfferedDocs([]);
    setRareMsg(t.ui.arrest.confiscated);
    later(2600, () => setRareMsg(null));
    // решение и протокол оформляются, когда занавес полностью закрыт
    later(950, () => finishEntrantReturn("DETAIN"));
  };

  const speakerNext = () => {
    if (!needCall) return;
    initAudio();
    // голос из громкоговорителя: загруженная команда «Следующий!»
    sfx.announce();
    setReaction(t.ui.game.nextCall);
    later(450, () => setReaction(null));
    callNext();
  };

  const serviceItems: { id: DocId; label: string; icon: string }[] = [
    { id: "book", label: t.ui.game.serviceBook, icon: t.ui.docIcons.book },
    { id: "news", label: t.ui.game.serviceNews, icon: t.ui.docIcons.news },
  ];

  const docLabel = (id: DocId) => t.ui.docTypes[id];
  const docIcon = (id: DocId) => t.ui.docIcons[id];

  return (
    <div className={`relative min-h-screen flex flex-col ${shaking ? "shake" : ""}`} style={shaking ? { "--shake-power": Math.max(0.2, shakeIntensity) } as CSSProperties : undefined}>
      {instantCitation && <motion.div initial={{ x: 360 }} animate={{ x: 0 }} className="instant-citation"><b>{t.ui.game.citationTitle}</b><span>{instantCitation}</span><button onClick={() => setInstantCitation(null)}>×</button></motion.div>}
      {combat && <div className="combat-overlay">
        <div className="combat-title">{t.ui.game.emergency} // {combatSeconds}</div>
        <div className="topdown-booth"><span className="topdown-inspector"/><button className={`service-pistol ${weaponArmed ? "is-armed" : ""}`} onClick={() => { setWeaponArmed(true); sfx.metalDragStart(); }} aria-label={t.ui.game.takeWeapon}>┛</button><button className="topdown-attacker" onClick={() => { if (!weaponArmed) return; sfx.stamp(); setCombat(false); setEmergency(false); setWeaponArmed(false); result.current.correct += 1; setReaction(t.ui.game.threatStopped); setStage("stamped"); setStamped("DENY"); decisionCommitted.current=true; setTrayDocs([]); later(900,()=>finishEntrantReturn("DENY")); }}><i/></button></div>
      </div>}
      {/* ШТАМПЫ — кассета прикручена к столу: балка лежит на столешнице,
          машины раскладываются из неё, рычаг — на правом конце балки */}
      <StampPad
        open={stampOpen}
        locked={!canStamp}
        onToggleOpen={(v) => setStampOpen(v)}
        onStamp={(type, px, py) => {
          if (type === "DENY" && entrant?.expected === "DENY" && (entrant.mismatch?.length ?? 0) > 0 && !hasEvidence) {
            sfx.bad(); setReaction(t.ui.game.denyReasonRequired); later(2200, () => setReaction(null)); return;
          }
          const passNode = nodes.current["passport"];
          if (!passNode) {
            sfx.bad();
            doShake(0.5);
            return;
          }
          // Машины стоят по центру экрана, поэтому печать ложится
          // в паспорт всегда — точка удара лишь сдвигает отметку.
          const pr = passNode.getBoundingClientRect();
          const gripH = 16;
          const localX = px - pr.left;
          const localY = py - pr.top - gripH;
          const x = Math.max(24, Math.min(localX, 196));
          const y = Math.max(18, Math.min(localY, 140));
          pendingDecision.current = type;
          setStampMarks((prev) => [...prev, { type, x, y }]);
          setStamped(type);
          setStage("stamped");
          doShake(1);
          // Итог записывается только после возврата всех документов.
        }}
      />

      {/* ---------- хедер ---------- */}
      <div className="relative z-20 border-b-2 border-[var(--color-line)] bg-[var(--color-coal)]">
        <div className="max-w-[1500px] mx-auto px-3 py-2 flex items-center gap-3 flex-wrap">
          <AtomEmblem size={28} />
          <div className="mr-auto">
            <div className="pixel-text text-[8px] sm:text-[9px] text-[var(--color-gold)]">{t.ui.game.header(day.n)}</div>
            <div className="text-[10px] text-[var(--color-ash)] uppercase tracking-widest">{day.date}</div>
          </div>

          {decisionSeconds !== null && (
            <div className={`panel px-2.5 py-1.5 pixel-text text-[9px] ${decisionSeconds <= 10 ? "text-[var(--color-state2)] animate-blink" : "text-[var(--color-gold)]"}`}>
              {t.ui.game.commissionerTimer(decisionSeconds)}
            </div>
          )}
          <div className="panel px-2.5 py-1.5 flex items-center gap-1.5">
            <PixelGlyph name="clock" size={13} className="text-[var(--color-gold)]" />
            <span className="pixel-text text-[9px] text-[var(--color-gold)]">
              {hh}:{mm}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            {entrants.map((_, k) => (
              <span
                key={k}
                className="w-2.5 h-2.5 border border-[var(--color-line)]"
                style={{ background: k < i ? "var(--color-ash)" : k === i ? "var(--color-gold)" : "transparent" }}
              />
            ))}
            <span className="text-[10px] text-[var(--color-ash)] ml-1 uppercase">
              {Math.min(i + 1, entrants.length)}/{entrants.length}
            </span>
          </div>

          <div className="panel px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-[var(--color-ash)]">
            {t.ui.game.settleEvening}
          </div>
          <div className="panel px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-[var(--color-ash)] hidden md:block">
            {t.ui.game.morningBalance} <span className="text-[var(--color-bone)] font-bold">{credits} ₳</span>
          </div>
          <AudioSettings />
          <LangSwitch />
          <button
            type="button"
            className={`arrest-btn ${arrestArmed ? "is-armed" : ""}`}
            disabled={!arrestArmed}
            title={t.ui.arrest.title}
            aria-label={t.ui.stamps.DETAIN}
            onClick={arrest}
          >
            <span className="arrest-btn__cap" />
            <span className="arrest-btn__label">{t.ui.stamps.DETAIN}</span>
          </button>
          <button className="btn-ghost p-1.5" title={t.ui.game.toMenu} onClick={() => setAskExit(true)}>
            <PixelGlyph name="home" size={15} />
          </button>
          <button
            className="btn-ghost p-1.5"
            title={musicOn ? t.ui.game.musicOff : t.ui.game.musicOn}
            onClick={() => {
              if (musicOn) { stopMusic(); setMusicOn(false); }
              else { startMusic(); setMusicOn(true); }
            }}
          >
            <span className="text-[10px]" style={{ opacity: musicOn ? 1 : 0.5 }}>♪</span>
          </button>
          <button
            className="btn-ghost p-1.5"
            onClick={() => {
              const m = !mute;
              setMute(m);
              setMuted(m);
              if (!m) sfx.ui();
            }}
          >
            {mute ? <PixelGlyph name="mute" size={15} /> : <PixelGlyph name="volume" size={15} />}
          </button>
        </div>
      </div>

      {/* ---------- сцена ---------- */}
      <div className="relative z-10 flex-1 w-full max-w-[1500px] mx-auto px-3 py-3 flex">
        <div className="grid lg:grid-cols-[minmax(340px,400px)_1fr] gap-3 items-stretch flex-1 w-full">
          {/* ---------------- БУДКА ---------------- */}
          <div className="panel relative flex flex-col">
            <span className="bolt" style={{ top: 5, left: 5 }} />
            <span className="bolt" style={{ top: 5, right: 5 }} />
            <div className="text-center py-1.5 border-b-2 border-[var(--color-line)] text-[10px] uppercase tracking-[0.3em] text-[var(--color-ash)]">
              {t.ui.game.window}
            </div>
            {/* вид сверху / наружу + громкоговоритель */}
            <div className="harsh-wall relative border-b-2 border-[var(--color-line)]" style={{ height: 90 }}>
              <div className="absolute inset-x-0 top-0 h-5 border-b-2 border-[#17120f]" style={{ background: "url('images/desk-tile.png') repeat" }} />
              <div className="absolute inset-x-6 top-8 h-8 border-y-2 border-[#6f6658] bg-[#7b766f] opacity-35" />
              <button
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 panel px-3 py-1.5 hover:border-[var(--color-gold)] transition-colors"
                style={{ cursor: needCall ? "pointer" : "not-allowed", opacity: needCall ? 1 : 0.45 }}
                onClick={speakerNext}
                disabled={!needCall}
              >
                <div className="flex items-center gap-2">
                  <span className="pixel-icon">{t.ui.game.callIcon}</span>
                  <span className="font-head text-[12px] uppercase tracking-widest text-[var(--color-gold)]" style={{ fontFamily: "var(--font-head)" }}>
                    {t.ui.game.next}
                  </span>
                </div>
              </button>
              <div className="absolute right-3 top-2 panel px-2 py-1 text-[9px] text-[var(--color-gold)] opacity-80">
                {day.dateShort}
              </div>
            </div>

            <div className="relative overflow-hidden flex-1 min-h-[420px] max-h-[600px]" style={{ background: "#201b16" }}>
              <BoothDecor date={day.dateShort} />

              {/* луч света */}
              <div
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-72 h-80 opacity-[0.13] pointer-events-none z-[6]"
                style={{
                  background: "linear-gradient(to bottom, rgba(210,170,56,.22) 0 22%, rgba(210,170,56,.12) 22% 48%, rgba(210,170,56,.05) 48% 72%, transparent 72%)",
                  clipPath: "polygon(36% 0, 64% 0, 100% 100%, 0% 100%)",
                }}
              />

              {/* очередь в тени */}
              {entrantVisible && queue.map((q, k) => (
                <div
                  key={`q-${i}-${k}`}
                  className="absolute bottom-8 z-[3] pointer-events-none"
                  style={{ right: -10 - k * 54, opacity: 0.28 - k * 0.11, filter: "brightness(0.26) contrast(1.1)" }}
                >
                  <Person spec={q.person} width={114 - k * 14} />
                </div>
              ))}

              {/* реплика */}
              <AnimatePresence mode="wait">
                {entrantVisible && entrant && showDocs && (
                  <motion.div
                    key={`bubble-${i}-${reaction ? "r" : probed ? "p" : "d"}`}
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="bubble absolute left-1/2 -translate-x-1/2 top-7 w-[88%] px-3 py-2 z-20"
                  >
                    {reaction ? (
                      <span className="text-[11px] sm:text-xs leading-snug block">{reaction}</span>
                    ) : (
                      <TypeLine
                        text={probed ? entrant.interrogate ?? t.probes[i % t.probes.length] : entrant.dialogue}
                        className="text-[11px] sm:text-xs leading-snug"
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* человек + кликабельное лицо */}
              <div className="absolute inset-x-0 bottom-0 h-[290px] overflow-hidden z-[4]">
                <div className="absolute bottom-0 inset-x-0 h-10 bg-[#16110d] border-t-2 border-[var(--color-line)] z-10" />
                <AnimatePresence>
                  {entrantVisible && entrant && (
                    <motion.div
                      key={`person-${i}`}
                      className="absolute left-1/2 bottom-7 z-[5]"
                      style={{ marginLeft: -95 }}
                      initial={{ x: 420, opacity: 0, scale: 0.94 }}
                      animate={stage === "exit" ? { x: stamped === "DENY" || stamped === "DETAIN" ? 420 : -420, opacity: 0, scale: 0.96 } : { x: 0, opacity: 1, scale: 1 }}
                      exit={{ x: stamped === "DENY" || stamped === "DETAIN" ? 420 : -420, opacity: 0 }}
                      transition={stage === "exit" ? { duration: 0.6, ease: "easeIn" } : { duration: 0.95, ease: [0.22, 0.9, 0.3, 1] }}
                    >
                      <div className="animate-sway origin-bottom relative">
                        <Person spec={entrant.person} width={190} />
                        {entrant.special === "commissioner" && <span className="commissioner-folder" aria-hidden="true"><i /><b /></span>}
                        {/* Для сверки можно выделить всего предъявителя, а не ловить маленький хотспот лица. */}
                        <button
                          type="button"
                          className={`person-select-target ${
                            proven.includes("face") ? "is-proven" : sel.includes("face") ? "is-selected" : ""
                          }`}
                          title={t.ui.game.faceTitle}
                          aria-label={t.ui.game.faceTitle}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSel("face");
                          }}
                        >
                          <span>{t.ui.game.faceTitle}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ДОКУМЕНТЫ В РУКАХ У ПОСЕТИТЕЛЯ — нужно забрать */}
              {entrantVisible && stage !== "exit" && offeredDocs.length > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-14 z-[20] flex gap-2">
                  {offeredDocs.map((id) => (
                    <motion.button
                      key={id}
                      initial={{ opacity: 0, y: 20, rotate: -2, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 360, damping: 24 }}
                      className="panel px-2.5 py-2 text-[10px] uppercase tracking-widest text-[var(--color-bone)] hover:border-[var(--color-gold)] transition-colors"
                      onClick={() => handoverDoc(id)}
                    >
                      <span className="pixel-icon mr-1">{docIcon(id)}</span>{t.ui.offerDoc[id as keyof typeof t.ui.offerDoc] ?? docLabel(id)}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* взятка */}
              <AnimatePresence>
                {entrant?.bribe !== undefined && stage === "review" && (
                  <motion.button
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 1 }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-3 z-20 px-3 py-2 text-[11px] font-bold uppercase tracking-wide border-2 border-[var(--color-gold)] text-[var(--color-gold)] bg-[rgba(30,24,14,0.92)] hover:bg-[var(--color-gold)] hover:text-[#241d0c] transition-colors"
                    onClick={() => decide("ADMIT", { bribe: true })}
                  >
                    {t.ui.game.takeBribe(entrant.bribe)}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* ЖЕЛЕЗНЫЙ ЗАНАВЕС — бьёт по кнопке задержания */}
            <div className={`booth-shutter ${shutterClosed ? "is-closed" : ""}`} aria-hidden="true">
              <span className="booth-shutter__slats" />
              <span className="booth-shutter__hazard" />
              <span className="booth-shutter__lamp" />
            </div>

            {/* имя + допрос */}
            <div className="border-t-2 border-[var(--color-line)] px-3 py-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-widest text-[var(--color-ash)]">
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <PixelGlyph name="fingerprint" size={12} className="shrink-0" />
                <span className="truncate">{entrant?.passport.name ?? t.ui.game.shiftOver}</span>
              </span>
              <button
                disabled={stage !== "review" || probed}
                className="btn-ghost px-2.5 py-1 text-[10px] inline-flex items-center gap-1.5 shrink-0 disabled:opacity-35 disabled:cursor-not-allowed"
                onClick={() => {
                  sfx.ui();
                  setProbed(true);
                  setReaction(null);
                  if (entrant?.transcript) { setTrayDocs((v) => v.includes("transcript") ? v : [...v, "transcript"]); sfx.paper(); }
                }}
              >
                <PixelGlyph name="message" size={12} /> {probed ? t.ui.game.interrogated : t.ui.game.interrogate}
              </button>
              {entrant?.agentOffer && !offerDone && !offerOpen && stage === "review" && (
                <button
                  className="btn-ghost px-2.5 py-1 text-[10px] inline-flex items-center gap-1.5 shrink-0"
                  style={{ borderColor: "var(--color-gold)", color: "var(--color-gold)" }}
                  onClick={() => setOfferOpen(true)}
                >
                  <PixelGlyph name="handshake" size={12} /> {t.ui.game.talkAction}
                </button>
              )}
            </div>

            {/* ЖУРНАЛ ПОСТА */}
            <div className="border-t-2 border-[var(--color-line)] px-3 py-2 flex-1 min-h-[96px] overflow-y-auto">
              <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--color-ash)] mb-1.5">
                {t.ui.game.journal(day.n)}
              </div>
              {journal.length === 0 ? (
                <div className="text-[10px] text-[var(--color-ash)] opacity-60 uppercase">{t.ui.game.journalEmpty}</div>
              ) : (
                <div className="space-y-0.5">
                  {journal.map((j, k) => (
                    <div key={k} className="flex items-center justify-between gap-2 text-[10px] leading-tight">
                      <span className="truncate text-[var(--color-bone)] opacity-80">{j.name}</span>
                      <span
                        className="shrink-0 px-1.5 py-[1px] border uppercase tracking-wide text-[8px]"
                        style={{
                          borderColor: j.d === "ADMIT" ? "#4c8a4d" : j.d === "DENY" ? "#a12622" : "#e8c34a",
                          color: j.d === "ADMIT" ? "#8fc190" : j.d === "DENY" ? "#e8a49b" : "#e8c34a",
                        }}
                      >
                        {j.d === "ADMIT" ? t.ui.game.admitted : j.d === "DENY" ? t.ui.game.denied : t.ui.game.detained}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ---------------- СТОЛ ---------------- */}
          <div className="relative panel p-2.5 sm:p-3 flex flex-col">
            <span className="bolt" style={{ top: 5, left: 5 }} />
            <span className="bolt" style={{ top: 5, right: 5 }} />

            {/* КНИЖКА ИНСПЕКТОРА */}
            <div className="pb-2 mb-2 border-b-2 border-[var(--color-line)]">
              <Rulebook
                day={day}
                open={bookOpen}
                onToggle={() => setBookOpen((v) => !v)}
                sel={sel}
                proven={proven}
                onSel={onSel}
              />
            </div>

            {/* ПОВЕРХНОСТЬ СТОЛА */}
            <div
              ref={deskRef}
              className="desk-surface relative flex-1 overflow-hidden min-h-[300px]"
            >
              <div className="absolute inset-0 dither opacity-50 pointer-events-none" />
              <div className="absolute right-4 bottom-4 opacity-[0.07] pointer-events-none">
                <AtomEmblem size={200} color="#e8c34a" />
              </div>
              <div className="absolute left-[58%] top-[8%] w-16 h-16 pointer-events-none"
                style={{ border: "4px dashed rgba(20,14,10,0.42)", transform: "rotate(9deg)" }} />
              {!showDocs && !rareMsg && (
                <div className="absolute inset-0 grid place-items-center text-[var(--color-ash)] text-xs uppercase tracking-[0.3em]">
                  {t.ui.game.deskEmpty}
                </div>
              )}
              {rareMsg && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] z-[55] paper-tex text-[#2b241c] px-3 py-2 border-2 border-[#7c1d18] shadow-[5px_5px_0_#070605] text-center text-xs italic">
                  {rareMsg}
                </div>
              )}

              {/* ДОКУМЕНТЫ — нативный drag без framer */}
              {desk.map((d) => {
                const body = renderDoc(d);
                if (!body) return null;
                return (
                  <DraggableDoc
                    key={`${d.id}-${i}`}
                    x={d.x} y={d.y} z={d.z}
                    label={docLabel(d.id)}
                    showClose
                    actionLabel={stage === "stamped" && d.id !== "book" && d.id !== "news" ? t.ui.giveBtn : t.ui.removeBtn}
                    onClose={() => toggleDeskDoc(d.id)}
                    containerRef={deskRef}
                    onFront={() => bringToFront(d.id)}
                    onMove={(nx, ny) =>
                      setDesk((prev) => prev.map((p) => p.id === d.id ? { ...p, x: nx, y: ny } : p))
                    }
                    onRef={(el) => { nodes.current[d.id] = el; }}
                  >
                    {body}
                  </DraggableDoc>
                );
              })}


            </div>

            {/* ПАНЕЛЬ РЕШЕНИЙ */}
            <div className="relative mt-2.5 pt-2.5 border-t-2 border-[var(--color-line)]">
              {entrant && entrantVisible && stage === "review" && day.n >= 2 && <InspectionDevices
                key={`devices-${i}`}
                entrant={entrant}
                wanted={wantedTarget}
                onWanted={() => { onSel("ref.wanted"); sfx.ui(); }}
                onScan={() => { setScanned(true); if (entrant.contraband) proveTool(["scan.cargo", "rule.contraband"], entrant.contraband); }}
                onFingerprints={() => { setFingerprintsTaken(true); if (entrant.fingerprintMismatch) proveTool(["fp.print", "p.id"], t.ui.game.fingerprintBad); }}
                onMeasure={() => { if (entrant.measuredHeight !== entrant.declaredHeight || entrant.measuredWeight !== entrant.declaredWeight) proveTool(["measure.actual", "measure.declared"], t.ui.game.measurements); }}
              />}
              {entrant?.confiscatePassport && stage === "review" && <div className={`confiscation-box ${confiscated ? "is-full" : ""}`} onClick={() => { if (confiscated) return; setConfiscated(true); setTrayDocs((v) => v.filter((id) => id !== "passport")); setDesk((v) => v.filter((d) => d.id !== "passport")); sfx.metalDragStop(); }}><span>{t.ui.game.confiscate}</span><i /></div>}
              {entrant?.asylum && <div className="asylum-note">{t.ui.game.asylumRequest}</div>}
              {entrant?.relation && <div className="relation-note">{entrant.relation}</div>}
              {/* предъявление */}
              {evidenceUnlocked && (
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[9px] uppercase tracking-widest text-[var(--color-ash)]">
                    {t.ui.game.mismatch}
                  </span>
                  {[0, 1].map((k) => (
                    <span
                      key={k}
                      className="px-2 py-1 text-[10px] border-2 min-w-[86px] text-center uppercase tracking-wide"
                      style={{
                        borderColor: sel[k] ? "var(--color-gold)" : "var(--color-line)",
                        color: sel[k] ? "var(--color-gold)" : "var(--color-ash)",
                        borderStyle: sel[k] ? "solid" : "dashed",
                      }}
                    >
                      {sel[k] ? t.ui.game.fieldN(k + 1) : t.ui.game.emptySlot}
                    </span>
                  ))}
                  <button
                    disabled={sel.length !== 2 || locked}
                    className="stamp-btn px-3 py-1.5 text-[11px] disabled:opacity-30"
                    style={{ borderColor: "#e8c34a", color: "#e8c34a", background: "rgba(232,195,74,0.12)" }}
                    onClick={present}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {t.ui.game.present}
                    </span>
                  </button>
                  {sel.length > 0 && (
                    <button className="btn-ghost px-2 py-1 text-[10px] inline-flex items-center gap-1" onClick={() => setSel([])}>
                      <PixelGlyph name="eraser" size={11} /> {t.ui.game.reset}
                    </button>
                  )}
                  {hasEvidence && (
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-state2)] font-bold animate-blink">
                      {t.ui.game.evidenceProven}
                    </span>
                  )}
                </div>
              )}

              {/* СЛУЖЕБНЫЕ ВЕЩИ — физические книга и газета */}
              <div className="mb-2 pt-2 border-t-2 border-[var(--color-line)]">
                <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--color-ash)] mb-1.5">{t.ui.game.service}</div>
                <div className="flex gap-1.5 flex-wrap">
                  {serviceItems.map((it) => (
                    <button
                      key={it.id}
                      className="inv-chip py-1.5 px-2"
                      data-on={desk.some((d) => d.id === it.id)}
                      onClick={() => toggleDeskDoc(it.id)}
                    >
                      <span className="pixel-icon mr-1">{it.icon}</span>{it.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* НОВЫЙ ЛОТОК ДОКУМЕНТОВ */}
              <div className="mt-auto mb-1">
                <div className="relative p-2.5 bg-[#1d1814] border-2 border-[#3a322a] shadow-[inset_0_0_0_3px_#100c09]" style={{ minHeight: 90 }}>
                  <div className="absolute top-1 left-2 text-[8px] uppercase tracking-widest text-[#5a5048]">{t.ui.game.trayTitle}</div>
                  <div className="flex gap-2 flex-wrap items-start mt-3">
                    {trayDocs.length === 0 ? (
                      <div className="text-[9px] text-[#4a4038] uppercase italic">{t.ui.game.trayEmpty}</div>
                    ) : trayDocs.map((id) => (
                      <button
                        key={id}
                        className="item-arrive panel px-3 py-2 bg-[#2a241e] border-[#4a4038] hover:border-[#e8c34a] transition-colors flex items-center gap-2 group"
                        style={{ borderStyle: desk.some(d => d.id === id) ? "dashed" : "solid", opacity: desk.some(d => d.id === id) ? 0.6 : 1 }}
                        onClick={() => toggleDeskDoc(id)}
                      >
                        <span className="pixel-icon">{docIcon(id)}</span>
                        <div className="text-left">
                          <div className="text-[9px] font-bold text-[#cbb89a] leading-tight">{docLabel(id).toUpperCase()}</div>
                          <div className="text-[7px] text-[#8a7e74] uppercase">
                            {stage === "stamped" ? t.ui.game.giveBack : desk.some(d => d.id === id) ? t.ui.game.removeDesk : t.ui.game.putDesk}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {stage === "stamped" && trayDocs.length > 0 && (
                    <button
                      type="button"
                      className="mt-2 w-full border-2 border-[#8f211d] bg-[#3b100e] px-3 py-2 text-[9px] uppercase tracking-wider text-[#e0b19e] hover:bg-[#5a1713]"
                      onClick={returnAllDocs}
                    >
                      {t.ui.game.returnAll}
                    </button>
                  )}
                </div>
              </div>

              {/* НОВЫЙ ИНВЕНТАРЬ ПРЕДМЕТОВ */}
              <div className="p-2.5 bg-[#1a1612] border-2 border-[#332c26] mt-2 relative">
                <div className="absolute -top-2 left-3 px-1 bg-[#1a1612] text-[7px] uppercase tracking-widest text-[#5a5048]">{t.ui.game.pocket}</div>
                <div className="flex gap-2 flex-wrap min-h-[40px]">
                  {inventory.length === 0 ? (
                    <div className="w-full flex items-center justify-center text-[8px] text-[#3a322a] uppercase tracking-widest">{t.ui.game.pocketEmpty}</div>
                  ) : inventory.map((it) => (
                    <div
                      key={it.id}
                      className="item-arrive group relative w-10 h-10 bg-[#241f1a] border border-[#3a322a] hover:border-[#e8c34a] flex items-center justify-center cursor-help transition-colors"
                    >
                      <span className="pixel-item">{it.icon}</span>
                      <div className="absolute bottom-full left-0 mb-2 w-40 p-2 bg-[#1d1815] border-2 border-[#4a3e33] text-[9px] text-[#cbb89a] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-[5px_5px_0_#070605]">
                        <div className="font-bold border-b border-[#3a322a] pb-1 mb-1 uppercase tracking-wider">{it.name}</div>
                        <div className="italic opacity-80">{it.desc}</div>
                        {it.from && <div className="mt-1 text-[#8a7e74] text-[8px]">{t.ui.game.from} {it.from}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Рычаг управляет штампами — в StampPad */}
            </div>
          </div>
        </div>
      </div>

      {/* ---------- ТАЙНОЕ ПРЕДЛОЖЕНИЕ ---------- */}
      <AnimatePresence>
        {offerOpen && entrant?.agentOffer && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.72 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[70]"
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed z-[71] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(620px,94vw)] max-h-[92vh] overflow-y-auto panel p-5 sm:p-6"
              style={{ borderColor: entrant.agent === "west" ? "#2e3450" : "#5c6e46", borderWidth: 3 }}
            >
              <span className="bolt" style={{ top: 6, left: 6 }} />
              <span className="bolt" style={{ top: 6, right: 6 }} />
              <div className="flex items-center gap-2 mb-3">
                <PixelGlyph name="handshake" size={17} color={entrant.agent === "west" ? "#8fa0d8" : "#a8c185"} />
                <span
                  className="font-head uppercase tracking-widest text-sm"
                  style={{ fontFamily: "var(--font-head)", color: entrant.agent === "west" ? "#8fa0d8" : "#a8c185" }}
                >
                  {entrant.agent === "west" ? t.ui.game.offerTitleWest : t.ui.game.offerTitleNeighbor}
                </span>
              </div>
              <div className="flex items-start gap-3 mb-4">
                <div className="shrink-0 border-2 border-[var(--color-line)] bg-[#1c1712] p-1">
                  <Person spec={entrant.person} width={78} />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] uppercase tracking-widest text-[var(--color-ash)] mb-1">
                    {entrant.passport.name}
                  </div>
                  <p className="text-[12.5px] sm:text-sm leading-relaxed text-[var(--color-bone)] italic">
                    {entrant.agentOffer.prompt}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                {entrant.agentOffer.options.map((o, k) => (
                  <button
                    key={k}
                    className="w-full text-left px-3.5 py-2.5 border-2 border-[var(--color-line)] hover:border-[var(--color-gold)] hover:bg-[rgba(232,195,74,0.08)] transition-colors text-[12.5px] sm:text-sm flex items-center justify-between gap-3"
                    onClick={() => chooseOffer(o)}
                  >
                    <span>{o.label}</span>
                    {o.credits ? <span className="text-[var(--color-gold)] font-bold shrink-0">+{o.credits} ₳</span> : null}
                  </button>
                ))}
              </div>
              <div className="text-[9.5px] uppercase tracking-widest text-[var(--color-ash)] mt-3 leading-relaxed">
                {t.ui.game.offerNote}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ---------- ВЫХОД В МЕНЮ ---------- */}
      <AnimatePresence>
        {askExit && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[80]"
              onClick={() => setAskExit(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[81] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(440px,92vw)] panel p-5 text-center"
            >
              <div className="font-head uppercase tracking-widest text-[var(--color-gold)] mb-2" style={{ fontFamily: "var(--font-head)" }}>
                {t.ui.game.exitTitle}
              </div>
              <p className="text-xs text-[var(--color-ash)] leading-relaxed mb-4">
                {t.ui.game.exitBody(day.n)}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-ghost px-4 py-2.5 text-sm" onClick={() => setAskExit(false)}>
                  {t.ui.game.stay}
                </button>
                <button className="btn-soviet px-4 py-2.5 text-sm" onClick={onExit}>
                  {t.ui.game.toMenuBtn}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
