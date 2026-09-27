import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Eraser,
  Fingerprint,
  MessageSquare,
  Handshake,
  Home,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { initAudio, isMuted, setMuted, sfx } from "../audio";
import { startMusic, stopMusic, isMusicPlaying } from "../music";
import { DETAIN_BONUS, EVIDENCE_BONUS, GENERIC_ADMIT, GENERIC_CAUGHT, GENERIC_DENY, WRONG_EVIDENCE } from "../game/data";
import { PROBE_LINES } from "../game/names";
import type { AgentOption, DayConfig, DayResult, Decision, DocId, EntrantSpec, FieldKey } from "../game/types";
import { AtomEmblem } from "../components/Emblems";
import { BoothDecor } from "../components/Booth";
import { PartyCardDoc, PassportDoc, PermitDoc, type SelProps } from "../components/Docs";
import { BookDoc, NewsDoc } from "../components/ReferenceDocs";
import { Person } from "../components/Person";
import { Rulebook } from "../components/Rulebook";
import { DraggableDoc } from "../components/DraggableDoc";
import { StampPad, StampLever } from "../components/StampPad";
import type { InvItem } from "../game/types";

type Stage = "enter" | "review" | "stamped" | "exit";
interface DeskDoc {
  id: DocId;
  x: number;
  y: number;
  z: number;
}

const DOC_LABEL: Record<DocId, string> = {
  passport: "Паспорт",
  permit: "Разрешение",
  party: "Карточка КПТА",
  book: "Книжка",
  news: "Газета",
};

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
  entrants,
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
    setEntrantVisible(false);
    setNeedCall(true);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const callNext = () => {
    if (i >= entrants.length) {
      if (!done.current) {
        done.current = true;
        later(700, () => onFinish(result.current));
      }
      return;
    }
    setNeedCall(false);
    setEntrantVisible(true);
    setStage("enter");
    sfx.walk();
    later(850, () => {
      setStage("review");
      const docs: DocId[] = ["passport"];
      if (entrant?.permit && entrant.rareEvent !== "forgot_permit") docs.push("permit");
      if (entrant?.partyCard) docs.push("party");
      setOfferedDocs(docs);
      if (entrant?.rareEvent === "forgot_permit" && entrant.permit) {
        setRareMsg("Подождите... разрешение осталось в пальто. Сейчас достану.");
        later(3800, () => {
          setOfferedDocs((v) => [...v, "permit"]);
          setRareMsg(null);
          sfx.paper();
        });
      } else if (entrant?.rareEvent === "nervous") {
        setRareMsg("П-простите... руки дрожат.");
        later(1800, () => setRareMsg(null));
      } else if (entrant?.rareEvent === "dual_passport") {
        setRareMsg("У меня два паспорта... этот брать? Нет? Ладно, вот этот.");
        later(2200, () => setRareMsg(null));
      }
      if (entrant?.agentOffer) later(1400, () => setOfferOpen(true));
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
      // возврат документа посетителю
      setDesk((v) => v.filter((d) => d.id !== id));
      setTrayDocs((v) => {
        const nv = v.filter((x) => x !== id);
        if (nv.length === 0) {
          // Все документы возвращены — принимаем решение по ПОСЛЕДНЕМУ штампу
          if (stampMarks.length > 0) {
            const lastStamp = stampMarks[stampMarks.length - 1].type;
            decide(lastStamp);
          }
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
        return nv;
      });
      return;
    }
    if (onDesk) {
      bringToFront(id);
      return;
    }
    const pos: Record<string, { x: number; y: number }> = {
      passport: { x: 18, y: 28 },
      permit: { x: 210, y: 36 },
      party: { x: 226, y: 190 },
      book: { x: 520, y: 26 },
      news: { x: 520, y: 220 },
    };
    setDesk((v) => [...v, { id, ...(pos[id] || { x: 18, y: 28 }), z: ++topZ.current }]);
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

  const present = () => {
    if (sel.length !== 2 || !entrant || stage !== "review") return;
    const pairs = entrant.mismatch ?? [];
    const ok = pairs.some(
      (p) => (p[0] === sel[0] && p[1] === sel[1]) || (p[0] === sel[1] && p[1] === sel[0])
    );
    if (ok) {
      sfx.alarm();
      setProven((p) => [...new Set([...p, ...sel])]);
      setSel([]);
      setHasEvidence(true);
      setReaction(entrant.caught ?? GENERIC_CAUGHT);
      result.current.evidence += 1;
      result.current.evidenceBonus += EVIDENCE_BONUS;
      setShaking(true);
      later(300, () => setShaking(false));
    } else {
      sfx.bad();
      setSel([]);
      setReaction(WRONG_EVIDENCE[i % WRONG_EVIDENCE.length]);
    }
    later(3000, () => setReaction(null));
  };

  const chooseOffer = (o: AgentOption) => {
    const f = result.current.flags;
    if (o.west) f.westTrust = (f.westTrust ?? 0) + o.west;
    if (o.neighbor) f.neighborTrust = (f.neighborTrust ?? 0) + o.neighbor;
    if (o.loyal) f.loyalty = (f.loyalty ?? 0) + o.loyal;
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
      setInventory((inv) => [...inv, { id: "env_" + Date.now(), icon: "💰", name: "Конверт", desc: o.credits + " ₳ от Коула", from: "ЭДВАРД КОУЛ" }]);
    }
    if (entrant?.agent === "neighbor" && o.neighbor && o.neighbor >= 2) {
      setInventory((inv) => {
        if (inv.some((it) => it.id === "apple")) return inv;
        return [...inv, { id: "apple", icon: "🍎", name: "Яблоко", desc: "Белый налив из Краснославии", from: "БОГДАН ТИХИЙ" }];
      });
    }
    setOfferOpen(false);
    setOfferDone(true);
    setReaction(o.reply);
    later(4200, () => setReaction(null));
  };

  const decide = (d: Decision, opts?: { bribe?: boolean }) => {
    if (stage !== "review" || !entrant) return;
    const e0 = entrant;
    sfx.stamp();
    setStamped(d);
    setStage("stamped");
    setJournal((j) => [{ name: e0.passport.name, d }, ...j].slice(0, 12));
    setShaking(true);
    later(330, () => setShaking(false));

    const e = entrant;

    if (d === "DETAIN") {
      later(250, () => sfx.alarm());
      if (e.detainable) {
        result.current.detains += 1;
        result.current.detainBonus += DETAIN_BONUS;
        setReaction(e.reactDeny ?? "Меня свяжут с адвокатом!");
      } else {
        result.current.errors.push("Ошибочное задержание невиновного: жалоба ушла в Обком");
        setReaction(e.reactDeny ?? "Это произвол! Честный человек!");
      }
    } else {
      const pool = d === "ADMIT" ? GENERIC_ADMIT : GENERIC_DENY;
      const fallback = pool[(i + (d === "ADMIT" ? 1 : 2)) % pool.length];
      const react = d === "ADMIT" ? e.reactAdmit ?? fallback : e.reactDeny ?? fallback;

      if (opts?.bribe) {
        result.current.bribeGain += e.bribe ?? 0;
        result.current.hidden += 1;
        result.current.flags.bribe = true;
        later(360, () => sfx.coin());
        setInventory((inv) => [...inv, { id: "bribe_" + Date.now(), icon: "💵", name: "Купюры", desc: (e.bribe ?? 0) + " ₳ — взятка", from: e.passport.name }]);
        setReaction("Кто заметит один денёк? Никто. Приятно иметь дело.");
      } else if (d === e.expected) {
        result.current.correct += 1;
        setReaction(react);
      } else {
        result.current.errors.push(e.cite);
        setReaction(react);
      }

    }

    // После штампа игрок должен ВЕРНУТЬ все документы посетителю вручную.
    // Уход начнётся автоматически, когда trayDocs опустеет.
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

  const renderDoc = (d: DeskDoc) => {
    if (!entrant) return null;
    switch (d.id) {
      case "passport":
        return <PassportDoc data={entrant.passport} person={entrant.photo ?? entrant.person} s={selProps} stampMarks={stampMarks} />;
      case "permit":
        return entrant.permit ? <PermitDoc data={entrant.permit} s={selProps} /> : null;
      case "party":
        return entrant.partyCard ? <PartyCardDoc data={entrant.partyCard} s={selProps} /> : null;
      case "book":
        return <BookDoc day={day} s={selProps} />;
      case "news":
        return <NewsDoc day={day} />;

    }
  };

  const speakerNext = () => {
    if (!needCall) return;
    initAudio();
    // легендарный грубый вызов через "громкоговоритель"
    sfx.ui();
    setReaction("СЛЕДУЮЩИЙ!");
    later(450, () => setReaction(null));
    callNext();
  };

  const serviceItems: { id: DocId; label: string; icon: string }[] = [
    { id: "book", label: "КНИЖКА", icon: "📘" },
    { id: "news", label: "ГАЗЕТА", icon: "📰" },
  ];

  const docIcon = (id: DocId) => ({
    passport: "📕",
    permit: "📄",
    party: "🪪",
    book: "📘",
    news: "📰",
  }[id]);

  return (
    <div className={`relative min-h-screen flex flex-col ${shaking ? "shake" : ""}`} style={shaking ? { transform: `translate(${Math.random()*shakeIntensity*10-5}px, ${Math.random()*shakeIntensity*10-5}px)` } : {}}>
      {/* ---------- хедер ---------- */}
      <div className="relative z-20 border-b-2 border-[var(--color-line)] bg-[var(--color-coal)]">
        <div className="max-w-[1500px] mx-auto px-3 py-2 flex items-center gap-3 flex-wrap">
          <AtomEmblem size={28} />
          <div className="mr-auto">
            <div className="pixel-text text-[8px] sm:text-[9px] text-[var(--color-gold)]">КПП-7 // СМЕНА {day.n}</div>
            <div className="text-[10px] text-[var(--color-ash)] uppercase tracking-widest">{day.date}</div>
          </div>

          <div className="panel px-2.5 py-1.5 flex items-center gap-1.5">
            <Clock size={13} className="text-[var(--color-gold)]" />
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
            расчёт — вечером
          </div>
          <div className="panel px-2.5 py-1.5 text-[10px] uppercase tracking-widest text-[var(--color-ash)] hidden md:block">
            баланс утра: <span className="text-[var(--color-bone)] font-bold">{credits} ₳</span>
          </div>
          <button className="btn-ghost p-1.5" title="В главное меню" onClick={() => setAskExit(true)}>
            <Home size={15} />
          </button>
          <button
            className="btn-ghost p-1.5"
            title={musicOn ? "Выключить музыку" : "Включить музыку"}
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
            {mute ? <VolumeX size={15} /> : <Volume2 size={15} />}
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
              окно приёма
            </div>

            {/* вид сверху / наружу + громкоговоритель */}
            <div className="relative border-b-2 border-[var(--color-line)]" style={{ background: "linear-gradient(180deg,#46382c,#31261d)", height: 90 }}>
              <div className="absolute inset-x-0 top-0 h-5" style={{ background: "repeating-linear-gradient(90deg,#5a4a3c 0 18px,#4a3a2c 18px 36px)" }} />
              <div className="absolute inset-x-6 top-8 h-8 border-y-2 border-[#6f6658] bg-[#7b766f] opacity-35" />
              <button
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 panel px-3 py-1.5 hover:border-[var(--color-gold)] transition-colors"
                style={{ cursor: needCall ? "pointer" : "not-allowed", opacity: needCall ? 1 : 0.45 }}
                onClick={speakerNext}
                disabled={!needCall}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[18px]">📢</span>
                  <span className="font-head text-[12px] uppercase tracking-widest text-[var(--color-gold)]" style={{ fontFamily: "var(--font-head)" }}>
                    СЛЕДУЮЩИЙ
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
                  background: "linear-gradient(to bottom, #e8c34a, transparent 75%)",
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
                        text={probed ? entrant.interrogate ?? PROBE_LINES[i % PROBE_LINES.length] : entrant.dialogue}
                        className="text-[11px] sm:text-xs leading-snug"
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* человек + кликабельное лицо */}
              <div className="absolute inset-x-0 bottom-0 h-[290px] overflow-hidden z-[4]">
                <div className="absolute bottom-0 inset-x-0 h-10 bg-[#16110d] border-t-2 border-[var(--color-line)] z-10" />
                <motion.div
                  key={`person-${i}`}
                  className="absolute left-1/2 bottom-7 z-[5]"
                  style={{ marginLeft: -95 }}
                  initial={{ x: 380 }}
                  animate={stage === "exit" ? { x: stamped === "DENY" || stamped === "DETAIN" ? 420 : -420 } : { x: 0 }}
                  transition={stage === "exit" ? { duration: 0.6, ease: "easeIn" } : { duration: 0.95, ease: [0.22, 0.9, 0.3, 1] }}
                >
                  {entrantVisible && entrant && (
                    <div className="animate-sway origin-bottom relative">
                      <Person spec={entrant.person} width={190} />
                      {/* хотспот лица для сверки с фото */}
                      <button
                        type="button"
                        className={`absolute rounded ${
                          proven.includes("face") ? "fld fld-proven" : sel.includes("face") ? "fld fld-sel" : "fld"
                        }`}
                        style={{ left: "31%", top: "13%", width: "38%", height: "26%" }}
                        title="Лицо предъявителя"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSel("face");
                        }}
                      />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* ДОКУМЕНТЫ В РУКАХ У ПОСЕТИТЕЛЯ — нужно забрать */}
              {entrantVisible && stage !== "exit" && offeredDocs.length > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-14 z-[20] flex gap-2">
                  {offeredDocs.map((id) => (
                    <button
                      key={id}
                      className="panel px-2.5 py-2 text-[10px] uppercase tracking-widest text-[var(--color-bone)] hover:border-[var(--color-gold)] transition-colors"
                      onClick={() => handoverDoc(id)}
                    >
                      <span className="mr-1">{docIcon(id)}</span>{id === "passport" ? "паспорт" : id === "permit" ? "пропуск" : "карточка"}
                    </button>
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
                    взять {entrant.bribe} ₳ и пропустить
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            {/* имя + допрос */}
            <div className="border-t-2 border-[var(--color-line)] px-3 py-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-widest text-[var(--color-ash)]">
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <Fingerprint size={12} className="shrink-0" />
                <span className="truncate">{entrant?.passport.name ?? "смена завершена"}</span>
              </span>
              <button
                disabled={stage !== "review" || probed}
                className="btn-ghost px-2.5 py-1 text-[10px] inline-flex items-center gap-1.5 shrink-0 disabled:opacity-35 disabled:cursor-not-allowed"
                onClick={() => {
                  sfx.ui();
                  setProbed(true);
                  setReaction(null);
                }}
              >
                <MessageSquare size={12} /> {probed ? "Допрошен" : "Допрос"}
              </button>
              {entrant?.agentOffer && !offerDone && !offerOpen && stage === "review" && (
                <button
                  className="btn-ghost px-2.5 py-1 text-[10px] inline-flex items-center gap-1.5 shrink-0"
                  style={{ borderColor: "var(--color-gold)", color: "var(--color-gold)" }}
                  onClick={() => setOfferOpen(true)}
                >
                  <Handshake size={12} /> Разговор
                </button>
              )}
            </div>

            {/* ЖУРНАЛ ПОСТА */}
            <div className="border-t-2 border-[var(--color-line)] px-3 py-2 flex-1 min-h-[96px] overflow-y-auto">
              <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--color-ash)] mb-1.5">
                журнал поста — смена {day.n}
              </div>
              {journal.length === 0 ? (
                <div className="text-[10px] text-[var(--color-ash)] opacity-60 uppercase">записей пока нет</div>
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
                        {j.d === "ADMIT" ? "пропущен" : j.d === "DENY" ? "отказано" : "задержан"}
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

            {/* РЫЧАГ — над столом, снаружи overflow-hidden */}
            <div className="relative flex justify-center" style={{ height: 60, zIndex: 90 }}>
              <StampLever active={stampOpen} onToggle={(v) => setStampOpen(v)} />
            </div>

            {/* ПОВЕРХНОСТЬ СТОЛА */}
            <div
              ref={deskRef}
              className="relative flex-1 overflow-hidden min-h-[300px]"
              style={{
                background: "repeating-linear-gradient(94deg, #4a3c2b 0 38px, #453827 38px 76px), linear-gradient(160deg,#4a3c2b,#3a2f21)",
                boxShadow: "inset 0 0 60px rgba(0,0,0,0.55)",
              }}
            >
              <div className="absolute inset-0 dither opacity-50 pointer-events-none" />
              <div className="absolute right-4 bottom-4 opacity-[0.07] pointer-events-none">
                <AtomEmblem size={200} color="#e8c34a" />
              </div>
              <div className="absolute left-[58%] top-[8%] w-16 h-16 rounded-full pointer-events-none"
                style={{ border: "3px solid rgba(40,28,16,0.35)" }} />
              {!showDocs && !rareMsg && (
                <div className="absolute inset-0 grid place-items-center text-[var(--color-ash)] text-xs uppercase tracking-[0.3em]">
                  — стол пуст —
                </div>
              )}
              {rareMsg && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] z-[55] paper-tex text-[#2b241c] px-3 py-2 border-2 border-[#7c1d18] shadow-xl text-center text-xs italic">
                  {rareMsg}
                </div>
              )}

              {/* ШТАМПЫ — выезжают снизу */}
              <StampPad
                open={stampOpen}
                locked={!canStamp}
                hasEvidence={hasEvidence}
                detainUnlocked={detainUnlocked}
                                onStamp={(type, px, py) => {
                  const passNode = nodes.current["passport"];
                  if (!passNode) {
                    sfx.bad();
                    doShake(0.5);
                    return;
                  }
                  const pr = passNode.getBoundingClientRect();
                  const gripH = 16;
                  if (px < pr.left || px > pr.right || py < pr.top + gripH || py > pr.bottom) {
                    sfx.bad();
                    doShake(0.5);
                    return;
                  }
                  const localX = px - pr.left;
                  const localY = py - pr.top - gripH;
                  const x = Math.max(24, Math.min(localX, 196));
                  const y = Math.max(18, Math.min(localY, 140));
                  setStampMarks((prev) => [...prev, { type, x, y }]);
                  doShake(1);
                  // НЕ вызываем decide — решение принимается при возврате документов
                }}
              />

              {/* ДОКУМЕНТЫ — нативный drag без framer */}
              {desk.map((d) => {
                const body = renderDoc(d);
                if (!body) return null;
                return (
                  <DraggableDoc
                    key={`${d.id}-${i}`}
                    x={d.x} y={d.y} z={d.z}
                    label={DOC_LABEL[d.id]} showClose={d.id === "book" || d.id === "news"} onClose={() => toggleDeskDoc(d.id)}
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
              {/* предъявление */}
              {evidenceUnlocked && (
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[9px] uppercase tracking-widest text-[var(--color-ash)]">
                    несоответствие:
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
                      {sel[k] ? "поле " + (k + 1) : "— пусто —"}
                    </span>
                  ))}
                  <button
                    disabled={sel.length !== 2 || locked}
                    className="stamp-btn px-3 py-1.5 text-[11px] disabled:opacity-30"
                    style={{ borderColor: "#e8c34a", color: "#e8c34a", background: "rgba(232,195,74,0.12)" }}
                    onClick={present}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      🔍 Предъявить
                    </span>
                  </button>
                  {sel.length > 0 && (
                    <button className="btn-ghost px-2 py-1 text-[10px] inline-flex items-center gap-1" onClick={() => setSel([])}>
                      <Eraser size={11} /> Сброс
                    </button>
                  )}
                  {hasEvidence && (
                    <span className="text-[10px] uppercase tracking-widest text-[var(--color-state2)] font-bold animate-blink">
                      нарушение доказано
                    </span>
                  )}
                </div>
              )}

              {/* СЛУЖЕБНЫЕ ВЕЩИ — физические книга и газета */}
              <div className="mb-2 pt-2 border-t-2 border-[var(--color-line)]">
                <div className="text-[9px] uppercase tracking-[0.25em] text-[var(--color-ash)] mb-1.5">служебные вещи</div>
                <div className="flex gap-1.5 flex-wrap">
                  {serviceItems.map((it) => (
                    <button
                      key={it.id}
                      className="inv-chip py-1.5 px-2"
                      data-on={desk.some((d) => d.id === it.id)}
                      onClick={() => toggleDeskDoc(it.id)}
                    >
                      <span className="text-sm mr-1">{it.icon}</span>{it.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* НОВЫЙ ЛОТОК ДОКУМЕНТОВ */}
              <div className="mt-auto mb-1">
                <div className="relative p-2.5 bg-[#1d1814] border-2 border-[#3a322a] shadow-inner" style={{ minHeight: 90 }}>
                  <div className="absolute top-1 left-2 text-[8px] uppercase tracking-widest text-[#5a5048]">Документы на лотке</div>
                  <div className="flex gap-2 flex-wrap items-start mt-3">
                    {trayDocs.length === 0 ? (
                      <div className="text-[9px] text-[#4a4038] uppercase italic">лоток пуст</div>
                    ) : trayDocs.map((id) => (
                      <button
                        key={id}
                        className="panel px-3 py-2 bg-[#2a241e] border-[#4a4038] hover:border-[#e8c34a] transition-colors flex items-center gap-2 group"
                        style={{ borderStyle: desk.some(d => d.id === id) ? "dashed" : "solid", opacity: desk.some(d => d.id === id) ? 0.6 : 1 }}
                        onClick={() => toggleDeskDoc(id)}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">{docIcon(id)}</span>
                        <div className="text-left">
                          <div className="text-[9px] font-bold text-[#cbb89a] leading-tight">{DOC_LABEL[id].toUpperCase()}</div>
                          <div className="text-[7px] text-[#8a7e74] uppercase">{desk.some(d => d.id === id) ? "на столе" : "в лотке"}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {stage === "stamped" && trayDocs.length > 0 && (
                    <div className="absolute bottom-1 right-2 text-[8px] uppercase font-bold text-[#cc2020] animate-pulse">верни документы</div>
                  )}
                </div>
              </div>

              {/* НОВЫЙ ИНВЕНТАРЬ ПРЕДМЕТОВ */}
              <div className="p-2.5 bg-[#1a1612] border-2 border-[#332c26] mt-2 relative">
                <div className="absolute -top-2 left-3 px-1 bg-[#1a1612] text-[7px] uppercase tracking-widest text-[#5a5048]">Карман</div>
                <div className="flex gap-2 flex-wrap min-h-[40px]">
                  {inventory.length === 0 ? (
                    <div className="w-full flex items-center justify-center text-[8px] text-[#3a322a] uppercase tracking-widest">пусто</div>
                  ) : inventory.map((it) => (
                    <div
                      key={it.id}
                      className="group relative w-10 h-10 bg-[#241f1a] border border-[#3a322a] hover:border-[#e8c34a] flex items-center justify-center cursor-help transition-colors"
                    >
                      <span className="text-xl">{it.icon}</span>
                      <div className="absolute bottom-full left-0 mb-2 w-40 p-2 bg-[#1d1815] border-2 border-[#4a3e33] text-[9px] text-[#cbb89a] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                        <div className="font-bold border-b border-[#3a322a] pb-1 mb-1 uppercase tracking-wider">{it.name}</div>
                        <div className="italic opacity-80">{it.desc}</div>
                        {it.from && <div className="mt-1 text-[#8a7e74] text-[8px]">ОТ: {it.from}</div>}
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
                <Handshake size={17} style={{ color: entrant.agent === "west" ? "#8fa0d8" : "#a8c185" }} />
                <span
                  className="font-head uppercase tracking-widest text-sm"
                  style={{ fontFamily: "var(--font-head)", color: entrant.agent === "west" ? "#8fa0d8" : "#a8c185" }}
                >
                  {entrant.agent === "west" ? "Разговор вполголоса // Западный Союз" : "Разговор вполголоса // Краснославия"}
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
                разговор не заменяет решения: документы всё равно придётся проштамповать
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
                Покинуть пост?
              </div>
              <p className="text-xs text-[var(--color-ash)] leading-relaxed mb-4">
                Текущая смена не засчитается. Прогресс сохранён на утро смены {day.n} — продолжить можно из главного меню.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button className="btn-ghost px-4 py-2.5 text-sm" onClick={() => setAskExit(false)}>
                  Остаться
                </button>
                <button className="btn-soviet px-4 py-2.5 text-sm" onClick={onExit}>
                  В меню
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
