import { useState } from "react";
import type { DayConfig, FieldKey, RuleItem } from "../game/types";
import { useI18n } from "../i18n";
import {
  AtomEmblem,
  GearEmblem,
  OtepliaEmblem,
  PartyEmblem,
  StarEmblem,
  VicteriaEmblem,
  WheatEmblem,
} from "./Emblems";

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
  const { t } = useI18n();
  const [tab, setTab] = useState<"rules" | "emblems" | "calendar">("rules");
  return (
    <div className="doc select-none w-[380px]" style={{ background: "#4b3b2b" }}>
      {/* обложка-корешок */}
      <div className="doc-grip !h-[18px] !text-[7px]">
        <span>{t.ui.book.title}</span>
      </div>
      {/* вкладки */}
      <div className="flex border-b border-[#2b241c66] bg-[#5a4a36]">
        {([
          ["rules", t.ui.book.tabs.rules],
          ["emblems", t.ui.book.tabs.emblems],
          ["calendar", t.ui.book.tabs.calendar],
        ] as const).map(([k, label]) => (
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
      <div className="paper-tex p-3 min-h-[260px] text-[#2b241c] max-h-[340px] overflow-y-auto">
        {tab === "rules" && <RulesPage rules={day.rules} s={s} />}
        {tab === "emblems" && <EmblemsPage s={s} />}
        {tab === "calendar" && <CalendarPage day={day} s={s} />}
      </div>
    </div>
  );
}

function RulesPage({ rules, s }: { rules: RuleItem[]; s: SelProps }) {
  const { t } = useI18n();
  return (
    <div className="space-y-1.5">
      <div
        className="font-head text-[14px] tracking-widest text-[#7c1d18] mb-2"
        style={{ fontFamily: "var(--font-head)" }}
      >
        {t.ui.book.directive}
      </div>
      {rules.map((r, i) => (
        <button
          key={r.key}
          type="button"
          className={`${cls(
            `rule.${r.key}`,
            s
          )} w-full text-left flex gap-2 py-1 border-b border-dotted border-[#2b241c55] text-[10px] leading-snug`}
          onClick={(e) => {
            e.stopPropagation();
            s.onSel(`rule.${r.key}`);
          }}
        >
          <span className="opacity-50 w-4 shrink-0">{String(i + 1).padStart(2, "0")}</span>
          <span>{r.text}</span>
        </button>
      ))}
    </div>
  );
}

function EmblemsPage({ s }: { s: SelProps }) {
  const { t } = useI18n();
  const entries = [
    { key: "ref.atom", icon: <AtomEmblem size={32} badge />, name: t.ui.rulebook.emblems.assr, detail: t.ui.rulebook.emblems.assrOk },
    { key: "ref.party", icon: <PartyEmblem size={32} mirrored />, name: t.ui.rulebook.emblems.party, detail: t.ui.rulebook.emblems.partyOk },
    { key: "ref.emblem_krs", icon: <StarEmblem size={32} />, name: t.ui.rulebook.emblems.krasnoslavia, detail: t.ui.rulebook.emblems.krsOk },
    { key: "ref.emblem_ugs", icon: <GearEmblem size={32} />, name: t.ui.rulebook.emblems.coalUnion, detail: t.ui.rulebook.emblems.ugsOk },
    { key: "ref.emblem_stv", icon: <WheatEmblem size={32} />, name: t.ui.rulebook.emblems.steppe, detail: t.ui.rulebook.emblems.stvOk },
    { key: "ref.emblem_vic", icon: <VicteriaEmblem size={32} />, name: t.ui.rulebook.emblems.victeria, detail: t.ui.rulebook.emblems.vicOk },
    { key: "ref.emblem_zps", icon: <OtepliaEmblem size={32} />, name: t.ui.rulebook.emblems.oteplia, detail: t.ui.rulebook.emblems.otepOk },
  ];

  return (
    <div>
      <div
        className="font-head text-[13px] tracking-widest text-[#7c1d18] mb-1"
        style={{ fontFamily: "var(--font-head)" }}
      >
        {t.ui.book.refTitle}
      </div>
      <div className="text-[8px] uppercase opacity-70 mb-2">{t.ui.rulebook.refSubtitle}</div>
      <div className="grid grid-cols-2 gap-2 text-left">
        {entries.map((entry) => (
          <button
            key={entry.key}
            type="button"
            className={`${cls(entry.key, s)} p-1.5 border border-[#2b241c44] flex items-center gap-1.5`}
            onClick={(e) => {
              e.stopPropagation();
              s.onSel(entry.key);
            }}
          >
            <div className="shrink-0">{entry.icon}</div>
            <div>
              <div className="text-[8.5px] font-bold">{entry.name}</div>
              <div className="text-[7px] text-[#2f5c33]">{entry.detail}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CalendarPage({ day, s }: { day: DayConfig; s: SelProps }) {
  const { t } = useI18n();
  return (
    <div className="text-center py-4">
      <div className="text-[9px] uppercase tracking-widest opacity-60 mb-2">{t.ui.book.calTitle}</div>
      <button
        type="button"
        className={`${cls("cal.today", s)} inline-block px-6 py-4 border-4 border-[#7c1d18]`}
        onClick={(e) => {
          e.stopPropagation();
          s.onSel("cal.today");
        }}
      >
        <div className="font-head text-[30px] text-[#7c1d18]" style={{ fontFamily: "var(--font-head)" }}>
          {day.dateShort}
        </div>
        <div className="text-[9px] uppercase mt-2 opacity-60">{t.ui.book.today}</div>
      </button>
    </div>
  );
}

export function NewsDoc({ day }: { day: DayConfig }) {
  const { t } = useI18n();
  return (
    <div className="doc paper-tex w-[360px] select-none text-[#2b241c]">
      <div className="doc-grip !h-[18px] !text-[7px]">{t.ui.news.grip}</div>
      <div className="p-4">
        <div className="flex items-center justify-between border-b-4 border-double border-[#2b241c] pb-2 mb-2">
          <div className="font-head text-[22px] tracking-wider" style={{ fontFamily: "var(--font-head)" }}>
            {t.ui.news.title}
          </div>
          <div className="text-[8px] uppercase opacity-60 text-right">
            {t.ui.news.issuer}
            <br />
            {t.ui.news.issue}
          </div>
        </div>
        <div className="text-[8px] uppercase tracking-widest opacity-60 mb-2">{day.date}</div>
        <div
          className="font-head text-[15px] leading-tight text-[#7c1d18] mb-2"
          style={{ fontFamily: "var(--font-head)" }}
        >
          {day.headline}
        </div>
        <div className="text-[10px] font-bold mb-2 italic text-[#4a3b2b]">{day.subline}</div>
        <div className="text-[9.5px] leading-relaxed border-t border-dotted border-[#2b241c55] pt-2">
          {day.body}
        </div>
      </div>
    </div>
  );
}
