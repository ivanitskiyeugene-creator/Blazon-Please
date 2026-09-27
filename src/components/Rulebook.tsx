import { useState } from "react";
import type { BookTab, DayConfig, FieldKey, RuleItem } from "../game/types";
import { AtomEmblem, PartyEmblem } from "./Emblems";
import { sfx } from "../audio";

interface Props {
  day: DayConfig;
  open: boolean;
  onToggle: () => void;
  sel: FieldKey[];
  proven: FieldKey[];
  onSel: (k: FieldKey) => void;
}

function cls(k: FieldKey, sel: FieldKey[], proven: FieldKey[]) {
  if (proven.includes(k)) return "fld fld-proven";
  if (sel.includes(k)) return "fld fld-sel";
  return "fld";
}

const TABS: { key: BookTab; label: string; icon: string }[] = [
  { key: "rules", label: "Директива", icon: "ДР" },
  { key: "emblems", label: "Гербы", icon: "ГР" },
  { key: "calendar", label: "Календарь", icon: "КЛ" },
];

export function Rulebook({ day, open, onToggle, sel, proven, onSel }: Props) {
  const [tab, setTab] = useState<BookTab>("rules");

  if (!open) {
    return (
      <button
        className="w-full py-2 text-center text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] border-2 border-[var(--color-line)] hover:border-[var(--color-gold)] hover:bg-[rgba(232,195,74,0.06)] transition-colors cursor-pointer"
        onClick={() => { sfx.paper(); onToggle(); }}
      >
        [КН] Открыть книжку инспектора
      </button>
    );
  }

  return (
    <div className="border-2 border-[var(--color-line)] bg-[var(--color-panel)] shadow-[6px_6px_0_#070605]">
      {/* Закладки */}
      <div className="flex border-b-2 border-[var(--color-line)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            className="flex-1 py-2 px-2 text-[10px] sm:text-[11px] uppercase tracking-widest text-center transition-colors"
            style={{
              background: tab === t.key ? "var(--color-panel2)" : "transparent",
              color: tab === t.key ? "var(--color-gold)" : "var(--color-ash)",
              borderBottom: tab === t.key ? "2px solid var(--color-gold)" : "2px solid transparent",
            }}
            onClick={() => { sfx.ui(); setTab(t.key); }}
          >
            <span className="pixel-icon mr-1">{t.icon}</span> {t.label}
          </button>
        ))}
        <button
          className="px-3 py-2 text-[var(--color-ash)] hover:text-[var(--color-state2)] transition-colors text-xs"
          onClick={() => { sfx.paper(); onToggle(); }}
          title="Закрыть книжку"
        >
          ✕
        </button>
      </div>

      {/* Содержимое */}
      <div className="p-3 max-h-[260px] overflow-y-auto">
        {tab === "rules" && (
          <RulesPage rules={day.rules} dayN={day.n} sel={sel} proven={proven} onSel={onSel} />
        )}
        {tab === "emblems" && (
          <EmblemsPage sel={sel} proven={proven} onSel={onSel} />
        )}
        {tab === "calendar" && (
          <CalendarPage date={day.dateShort} dayN={day.n} sel={sel} proven={proven} onSel={onSel} />
        )}
      </div>
    </div>
  );
}

// =========== СТРАНИЦЫ ===========

function RulesPage({ rules, dayN, sel, proven, onSel }: { rules: RuleItem[]; dayN: number; sel: FieldKey[]; proven: FieldKey[]; onSel: (k: FieldKey) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-head text-[12px] tracking-widest text-[var(--color-state2)]" style={{ fontFamily: "var(--font-head)" }}>
          ДИРЕКТИВА — СМЕНА {dayN}
        </div>
        <div className="text-[8px] uppercase opacity-60 text-[var(--color-ash)]">министерство пропусков</div>
      </div>
      <div className="space-y-1.5">
        {rules.map((r, i) => (
          <button
            key={r.key}
            type="button"
            className={`${cls(`rule.${r.key}`, sel, proven)} w-full text-left flex gap-2 text-[10px] sm:text-[11px] leading-snug py-1.5 px-1.5 border-b border-dotted border-[var(--color-line)]`}
            onClick={(e) => { e.stopPropagation(); onSel(`rule.${r.key}`); }}
          >
            <span className="pixel-text text-[7px] text-[var(--color-ash)] mt-0.5 shrink-0 w-4">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[var(--color-bone)]">{r.text}</span>
            {r.isNew && (
              <span className="shrink-0 px-1 py-0.5 text-[8px] font-bold uppercase bg-[var(--color-state2)] text-[var(--color-paper)] animate-blink h-fit">
                ново
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmblemsPage({ sel, proven, onSel }: { sel: FieldKey[]; proven: FieldKey[]; onSel: (k: FieldKey) => void }) {
  return (
    <div>
      <div className="font-head text-[12px] tracking-widest text-[var(--color-state2)] mb-3" style={{ fontFamily: "var(--font-head)" }}>
        СПРАВОЧНИК ГЕРБОВ
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <button
          type="button"
          className={`${cls("ref.atom", sel, proven)} p-2 text-center border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors`}
          onClick={(e) => { e.stopPropagation(); onSel("ref.atom"); }}
        >
          <div className="grid place-items-center mb-1">
            <AtomEmblem size={56} badge />
          </div>
          <div className="text-[9px] uppercase font-bold text-[var(--color-moss)] leading-tight">
            АССР — ВЕРНО<br />три орбиты
          </div>
        </button>
        <button
          type="button"
          className={`${cls("ref.atom_fake", sel, proven)} p-2 text-center border border-[var(--color-line)] hover:border-[var(--color-state2)] transition-colors`}
          onClick={(e) => { e.stopPropagation(); onSel("ref.atom"); }}
        >
          <div className="grid place-items-center mb-1">
            <AtomEmblem size={56} badge orbits={2} />
          </div>
          <div className="text-[9px] uppercase font-bold text-[var(--color-state2)] leading-tight">
            ПОДДЕЛКА<br />две орбиты
          </div>
        </button>
        <button
          type="button"
          className={`${cls("ref.party", sel, proven)} p-2 text-center border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors`}
          onClick={(e) => { e.stopPropagation(); onSel("ref.party"); }}
        >
          <div className="grid place-items-center mb-1">
            <PartyEmblem size={56} mirrored />
          </div>
          <div className="text-[9px] uppercase font-bold text-[var(--color-moss)] leading-tight">
            КПТА — ВЕРНО<br />молот справа
          </div>
        </button>
        <button
          type="button"
          className={`${cls("ref.party_fake", sel, proven)} p-2 text-center border border-[var(--color-line)] hover:border-[var(--color-state2)] transition-colors`}
          onClick={(e) => { e.stopPropagation(); onSel("ref.party"); }}
        >
          <div className="grid place-items-center mb-1">
            <PartyEmblem size={56} mirrored={false} />
          </div>
          <div className="text-[9px] uppercase font-bold text-[var(--color-state2)] leading-tight">
            ПОДДЕЛКА<br />молот слева
          </div>
        </button>
      </div>
      <div className="text-[9px] uppercase text-[var(--color-ash)] leading-relaxed tracking-wide">
        образцы утверждены ЦК — сверяй с документом на столе
      </div>
    </div>
  );
}

function CalendarPage({ date, dayN, sel, proven, onSel }: { date: string; dayN: number; sel: FieldKey[]; proven: FieldKey[]; onSel: (k: FieldKey) => void }) {
  return (
    <div className="text-center py-4">
      <div className="text-[9px] uppercase tracking-widest text-[var(--color-ash)] mb-2">
        календарь поста КПП-7
      </div>
      <button
        type="button"
        className={`${cls("cal.today", sel, proven)} inline-block py-3 px-6 border-4 border-[var(--color-state2)]`}
        onClick={(e) => { e.stopPropagation(); onSel("cal.today"); }}
      >
        <div className="font-head text-[32px] leading-none text-[var(--color-state2)]" style={{ fontFamily: "var(--font-head)" }}>
          {date}
        </div>
        <div className="text-[10px] uppercase mt-2 text-[var(--color-ash)]">
          сегодняшняя дата
        </div>
      </button>
      <div className="text-[10px] uppercase mt-4 text-[var(--color-ash)] tracking-wide">
        смена {dayN} // год 51-й
      </div>
      <div className="text-[9px] mt-2 text-[var(--color-ash)] opacity-70 leading-relaxed">
        документы со сроком раньше этой даты — недействительны
      </div>
    </div>
  );
}
