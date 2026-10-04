import { useState } from "react";
import type { RareEventKind } from "../game/types";

type DebugCase = RareEventKind | "commissioner" | "inspection" | "campaign13" | "all" | null;

export function DebugConsole({ day, onDay, onCase, onCredits, onScreen, onFlags, onClose }: {
  day: number;
  onDay: (day: number) => void;
  onCase: (kind: DebugCase) => void;
  onCredits: () => void;
  onScreen: (screen: "briefing" | "game" | "ending" | "gameover") => void;
  onFlags: (preset: "clean" | "suspicious" | "loyal") => void;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);

  if (!open) return <form className="debug-lock" onSubmit={(e) => { e.preventDefault(); if (password === "0207") { setOpen(true); setPassword(""); } else setPassword(""); }}>
    <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" aria-label="Debug password" type="password" maxLength={4} />
    <button type="submit">DBG</button>
  </form>;

  const cases: [Exclude<DebugCase, null>, string][] = [
    ["all", "ВСЕ СЛУЧАИ"], ["inspection", "СИСТЕМЫ 1.0"], ["campaign13", "СИСТЕМЫ 1.3"], ["commissioner", "КОМИССАР"], ["forgot_permit", "ЗАБЫЛ ПРОПУСК"],
    ["nervous", "НЕРВНЫЙ"], ["bribed_guard", "ВЗЯТКА ПОСТ №6"], ["dual_passport", "ДВА ПАСПОРТА"], ["wrong_queue", "НЕ ТА ОЧЕРЕДЬ"],
  ];
  return <aside className="debug-console">
    <header><b>ОТЛАДКА // 0207</b><button onClick={() => { setOpen(false); onClose(); }}>×</button></header>
    <div className="debug-title">СМЕНА: {day}</div>
    <div className="debug-grid">{[1,2,3,4,5,6].map((n) => <button data-on={day === n} key={n} onClick={() => onDay(n)}>{n}</button>)}</div>
    <div className="debug-title">ВЫЗОВ СЦЕНАРИЯ</div>
    <div className="debug-list">{cases.map(([key,label]) => <button key={key} onClick={() => onCase(key)}>{label}</button>)}</div>
    <div className="debug-title">ЭКРАН</div>
    <div className="debug-list"><button onClick={() => onScreen("briefing")}>ДИРЕКТИВА</button><button onClick={() => onScreen("game")}>ПОСТ</button><button onClick={() => onScreen("ending")}>ФИНАЛ</button><button onClick={() => onScreen("gameover")}>GAME OVER</button></div>
    <div className="debug-title">СОСТОЯНИЕ</div>
    <div className="debug-list"><button onClick={onCredits}>+999 ₳</button><button onClick={() => onFlags("suspicious")}>ПОДОЗРЕНИЕ</button><button onClick={() => onFlags("loyal")}>ЛОЯЛЬНОСТЬ</button><button onClick={() => onFlags("clean")}>СБРОС ФЛАГОВ</button></div>
  </aside>;
}

export type { DebugCase };
