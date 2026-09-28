import { useState } from "react";
import type { DayConfig, FieldKey, RuleItem } from "../game/types";
import { AtomEmblem, PartyEmblem } from "./Emblems";

interface SelProps {
  sel: FieldKey[];
  proven: FieldKey[];
  onSel: (k: FieldKey) => void;
}
function cls(k: FieldKey, s: SelProps) {
  if (s.proven.includes(k)) return "fld fld-proven";
  if (s.sel.includes(k)) return "fld fld-sel";
  return "fld";
}

export function BookDoc({ day, s }: { day: DayConfig; s: SelProps }) {
  const [tab, setTab] = useState<"rules" | "emblems" | "calendar">("rules");
  return (
    <div className="doc select-none w-[360px]" style={{ background: "#4b3b2b" }}>
      {/* обложка-корешок */}
      <div className="doc-grip !h-[18px] !text-[7px]">
        <span>КНИЖКА ИНСПЕКТОРА</span>
      </div>
      {/* вкладки */}
      <div className="flex border-b border-[#2b241c66] bg-[#5a4a36]">
        {[
          ["rules", "ДИРЕКТИВА"],
          ["emblems", "ГЕРБЫ"],
          ["calendar", "КАЛЕНДАРЬ"],
        ].map(([k, label]) => (
          <button
            key={k}
            className="flex-1 py-1.5 text-[10px] uppercase tracking-wide"
            style={{
              background: tab === k ? "#d9c9a3" : "transparent",
              color: tab === k ? "#2b241c" : "#cbb89a",
            }}
            onClick={() => setTab(k as any)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="paper-tex p-3 min-h-[260px] text-[#2b241c]">
        {tab === "rules" && <RulesPage rules={day.rules} s={s} />}
        {tab === "emblems" && <EmblemsPage s={s} />}
        {tab === "calendar" && <CalendarPage day={day} s={s} />}
      </div>
    </div>
  );
}

function RulesPage({ rules, s }: { rules: RuleItem[]; s: SelProps }) {
  return (
    <div className="space-y-1.5">
      <div className="font-head text-[14px] tracking-widest text-[#7c1d18] mb-2" style={{ fontFamily: "var(--font-head)" }}>
        ДИРЕКТИВА
      </div>
      {rules.map((r, i) => (
        <button key={r.key} type="button" className={`${cls(`rule.${r.key}`, s)} w-full text-left flex gap-2 py-1 border-b border-dotted border-[#2b241c55] text-[10px] leading-snug`}
          onClick={(e) => { e.stopPropagation(); s.onSel(`rule.${r.key}`); }}>
          <span className="opacity-50 w-4 shrink-0">{String(i + 1).padStart(2, "0")}</span>
          <span>{r.text}</span>
        </button>
      ))}
    </div>
  );
}

function EmblemsPage({ s }: { s: SelProps }) {
  return (
    <div>
      <div className="font-head text-[14px] tracking-widest text-[#7c1d18] mb-3" style={{ fontFamily: "var(--font-head)" }}>
        СПРАВОЧНИК ГЕРБОВ
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className={`${cls("ref.atom", s)} p-2 border border-[#2b241c44] text-center`} onClick={(e) => { e.stopPropagation(); s.onSel("ref.atom"); }}>
          <div className="grid place-items-center mb-1"><AtomEmblem size={56} badge /></div>
          <div className="text-[9px] uppercase font-bold text-[#2f5c33]">АССР — ВЕРНО</div>
          <div className="text-[8px] uppercase opacity-60">3 орбиты</div>
        </button>
        <button type="button" className={`${cls("ref.party", s)} p-2 border border-[#2b241c44] text-center`} onClick={(e) => { e.stopPropagation(); s.onSel("ref.party"); }}>
          <div className="grid place-items-center mb-1"><PartyEmblem size={56} mirrored /></div>
          <div className="text-[9px] uppercase font-bold text-[#2f5c33]">КПТА — ВЕРНО</div>
          <div className="text-[8px] uppercase opacity-60">молот справа</div>
        </button>
      </div>
    </div>
  );
}

function CalendarPage({ day, s }: { day: DayConfig; s: SelProps }) {
  return (
    <div className="text-center py-4">
      <div className="text-[9px] uppercase tracking-widest opacity-60 mb-2">календарь поста</div>
      <button type="button" className={`${cls("cal.today", s)} inline-block px-6 py-4 border-4 border-[#7c1d18]`}
        onClick={(e) => { e.stopPropagation(); s.onSel("cal.today"); }}>
        <div className="font-head text-[30px] text-[#7c1d18]" style={{ fontFamily: "var(--font-head)" }}>{day.dateShort}</div>
        <div className="text-[9px] uppercase mt-2 opacity-60">сегодня</div>
      </button>
    </div>
  );
}

export function NewsDoc({ day }: { day: DayConfig }) {
  return (
    <div className="doc paper-tex w-[360px] select-none text-[#2b241c]">
      <div className="doc-grip !h-[18px] !text-[7px]">ГАЗЕТА «ГОЛОС АТОМА»</div>
      <div className="p-4">
        <div className="flex items-center justify-between border-b-4 border-double border-[#2b241c] pb-2 mb-2">
          <div className="font-head text-[22px] tracking-wider" style={{ fontFamily: "var(--font-head)" }}>ГОЛОС АТОМА</div>
          <div className="text-[8px] uppercase opacity-60 text-right">орган ЦК КПТА<br />утренний выпуск</div>
        </div>
        <div className="text-[8px] uppercase tracking-widest opacity-60 mb-2">{day.date}</div>
        <div className="font-head text-[16px] leading-tight mb-2 uppercase" style={{ fontFamily: "var(--font-head)" }}>{day.headline}</div>
        <div className="text-[9px] uppercase font-bold text-[#7c1d18] mb-2">{day.subline}</div>
        <p className="text-[11px] leading-relaxed">{day.body}</p>
      </div>
    </div>
  );
}
