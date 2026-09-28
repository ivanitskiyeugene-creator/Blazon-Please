import { useState } from "react";
import type { BookTab, DayConfig, FieldKey, RuleItem } from "../game/types";
import { useI18n } from "../i18n";
import {
  AtomEmblem,
  BalteliaEmblem,
  GornostanEmblem,
  OndarEmblem,
  OstolandiaEmblem,
  OtepliaEmblem,
  PartyEmblem,
  VicteriaEmblem,
} from "./Emblems";
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

export function Rulebook({ day, open, onToggle, sel, proven, onSel }: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<BookTab>("rules");

  const TABS: { key: BookTab; label: string; icon: string }[] = [
    { key: "rules", label: t.ui.rulebook.tabs.rules, icon: t.ui.rulebook.icons.rules },
    { key: "emblems", label: t.ui.rulebook.tabs.emblems, icon: t.ui.rulebook.icons.emblems },
    { key: "calendar", label: t.ui.rulebook.tabs.calendar, icon: t.ui.rulebook.icons.calendar },
  ];

  if (!open) {
    return (
      <button
        className="w-full py-2 text-center text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] border-2 border-[var(--color-line)] hover:border-[var(--color-gold)] hover:bg-[rgba(232,195,74,0.06)] transition-colors cursor-pointer"
        onClick={() => {
          sfx.paper();
          onToggle();
        }}
      >
        [{t.ui.docIcons.book}] {t.ui.rulebook.openBtn}
      </button>
    );
  }

  return (
    <div className="border-2 border-[var(--color-line)] bg-[var(--color-panel)] shadow-[6px_6px_0_#070605]">
      {/* Закладки */}
      <div className="flex border-b-2 border-[var(--color-line)]">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            className="flex-1 py-2 px-2 text-[10px] sm:text-[11px] uppercase tracking-widest text-center transition-colors"
            style={{
              background: tab === tabItem.key ? "var(--color-panel2)" : "transparent",
              color: tab === tabItem.key ? "var(--color-gold)" : "var(--color-ash)",
              borderBottom: tab === tabItem.key ? "2px solid var(--color-gold)" : "2px solid transparent",
            }}
            onClick={() => {
              sfx.ui();
              setTab(tabItem.key);
            }}
          >
            <span className="pixel-icon mr-1">{tabItem.icon}</span> {tabItem.label}
          </button>
        ))}
        <button
          className="px-3 py-2 text-[var(--color-ash)] hover:text-[var(--color-state2)] transition-colors text-xs"
          onClick={() => {
            sfx.paper();
            onToggle();
          }}
          title={t.ui.rulebook.close}
        >
          ✕
        </button>
      </div>

      {/* Содержимое */}
      <div className="p-3 max-h-[290px] overflow-y-auto">
        {tab === "rules" && (
          <RulesPage rules={day.rules} dayN={day.n} sel={sel} proven={proven} onSel={onSel} />
        )}
        {tab === "emblems" && <EmblemsPage sel={sel} proven={proven} onSel={onSel} />}
        {tab === "calendar" && (
          <CalendarPage date={day.dateShort} dayN={day.n} sel={sel} proven={proven} onSel={onSel} />
        )}
      </div>
    </div>
  );
}

// =========== СТРАНИЦЫ ===========

function RulesPage({
  rules,
  dayN,
  sel,
  proven,
  onSel,
}: {
  rules: RuleItem[];
  dayN: number;
  sel: FieldKey[];
  proven: FieldKey[];
  onSel: (k: FieldKey) => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div
          className="font-head text-[12px] tracking-widest text-[var(--color-state2)]"
          style={{ fontFamily: "var(--font-head)" }}
        >
          {t.ui.rulebook.directiveN(dayN)}
        </div>
        <div className="text-[8px] uppercase opacity-60 text-[var(--color-ash)]">
          {t.ui.rulebook.ministry}
        </div>
      </div>
      <div className="space-y-1.5">
        {rules.map((r, i) => (
          <button
            key={r.key}
            type="button"
            className={`${cls(
              `rule.${r.key}`,
              sel,
              proven
            )} w-full text-left flex gap-2 text-[10px] sm:text-[11px] leading-snug py-1.5 px-1.5 border-b border-dotted border-[var(--color-line)]`}
            onClick={(e) => {
              e.stopPropagation();
              onSel(`rule.${r.key}`);
            }}
          >
            <span className="pixel-text text-[7px] text-[var(--color-ash)] mt-0.5 shrink-0 w-4">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[var(--color-bone)]">{r.text}</span>
            {r.isNew && (
              <span className="shrink-0 px-1 py-0.5 text-[8px] font-bold uppercase bg-[var(--color-state2)] text-[var(--color-paper)] animate-blink h-fit">
                {t.ui.rulebook.newShort}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function EmblemsPage({
  sel,
  proven,
  onSel,
}: {
  sel: FieldKey[];
  proven: FieldKey[];
  onSel: (k: FieldKey) => void;
}) {
  const { t } = useI18n();
  return (
    <div>
      <div
        className="font-head text-[12px] tracking-widest text-[var(--color-state2)] mb-2"
        style={{ fontFamily: "var(--font-head)" }}
      >
        {t.ui.book.refTitle}
      </div>
      <div className="text-[8.5px] uppercase text-[var(--color-ash)] mb-3 leading-tight">
        {t.ui.rulebook.refSubtitle}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {/* АССР */}
        <button
          type="button"
          className={`${cls(
            "ref.atom",
            sel,
            proven
          )} p-2 text-left border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors flex items-center gap-2`}
          onClick={(e) => {
            e.stopPropagation();
            onSel("ref.atom");
          }}
        >
          <div className="shrink-0">
            <AtomEmblem size={38} badge />
          </div>
          <div>
            <div className="text-[9.5px] font-bold text-[var(--color-gold)]">{t.ui.rulebook.emblems.assr}</div>
            <div className="text-[8px] text-[var(--color-moss)]">{t.ui.rulebook.emblems.assrOk}</div>
            <div className="text-[7.5px] text-[var(--color-state2)] opacity-80">{t.ui.rulebook.emblems.assrFake}</div>
          </div>
        </button>

        {/* КПТА */}
        <button
          type="button"
          className={`${cls(
            "ref.party",
            sel,
            proven
          )} p-2 text-left border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors flex items-center gap-2`}
          onClick={(e) => {
            e.stopPropagation();
            onSel("ref.party");
          }}
        >
          <div className="shrink-0">
            <PartyEmblem size={38} mirrored />
          </div>
          <div>
            <div className="text-[9.5px] font-bold text-[var(--color-gold)]">{t.ui.rulebook.emblems.party}</div>
            <div className="text-[8px] text-[var(--color-moss)]">{t.ui.rulebook.emblems.partyOk}</div>
            <div className="text-[7.5px] text-[var(--color-state2)] opacity-80">{t.ui.rulebook.emblems.partyFake}</div>
          </div>
        </button>

        {/* ГОРНОСТАН */}
        <button
          type="button"
          className={`${cls(
            "ref.emblem_ugs",
            sel,
            proven
          )} p-2 text-left border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors flex items-center gap-2`}
          onClick={(e) => {
            e.stopPropagation();
            onSel("ref.emblem_ugs");
          }}
        >
          <div className="shrink-0">
            <GornostanEmblem size={38} />
          </div>
          <div>
            <div className="text-[9.5px] font-bold text-[var(--color-gold)]">{t.ui.rulebook.emblems.gornostan}</div>
            <div className="text-[8px] text-[var(--color-moss)]">{t.ui.rulebook.emblems.gornOk}</div>
            <div className="text-[7.5px] text-[var(--color-state2)] opacity-80">{t.ui.rulebook.emblems.gornFake}</div>
          </div>
        </button>

        {/* ОСТОЛЯНДИЯ */}
        <button
          type="button"
          className={`${cls(
            "ref.emblem_stv",
            sel,
            proven
          )} p-2 text-left border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors flex items-center gap-2`}
          onClick={(e) => {
            e.stopPropagation();
            onSel("ref.emblem_stv");
          }}
        >
          <div className="shrink-0">
            <OstolandiaEmblem size={38} />
          </div>
          <div>
            <div className="text-[9.5px] font-bold text-[var(--color-gold)]">{t.ui.rulebook.emblems.ostolandia}</div>
            <div className="text-[8px] text-[var(--color-moss)]">{t.ui.rulebook.emblems.ostoOk}</div>
            <div className="text-[7.5px] text-[var(--color-state2)] opacity-80">{t.ui.rulebook.emblems.ostoFake}</div>
          </div>
        </button>

        {/* ВИКТЕРИЯ */}
        <button
          type="button"
          className={`${cls(
            "ref.emblem_vic",
            sel,
            proven
          )} p-2 text-left border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors flex items-center gap-2`}
          onClick={(e) => {
            e.stopPropagation();
            onSel("ref.emblem_vic");
          }}
        >
          <div className="shrink-0">
            <VicteriaEmblem size={38} />
          </div>
          <div>
            <div className="text-[9.5px] font-bold text-[var(--color-gold)]">{t.ui.rulebook.emblems.victeria}</div>
            <div className="text-[8px] text-[var(--color-moss)]">{t.ui.rulebook.emblems.vicOk}</div>
            <div className="text-[7.5px] text-[var(--color-state2)] opacity-80">{t.ui.rulebook.emblems.vicFake}</div>
          </div>
        </button>

        {/* ОНДАР */}
        <button
          type="button"
          className={`${cls(
            "ref.emblem_ond",
            sel,
            proven
          )} p-2 text-left border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors flex items-center gap-2`}
          onClick={(e) => {
            e.stopPropagation();
            onSel("ref.emblem_ond");
          }}
        >
          <div className="shrink-0">
            <OndarEmblem size={38} />
          </div>
          <div>
            <div className="text-[9.5px] font-bold text-[var(--color-gold)]">{t.ui.rulebook.emblems.ondar}</div>
            <div className="text-[8px] text-[var(--color-moss)]">{t.ui.rulebook.emblems.ondOk}</div>
            <div className="text-[7.5px] text-[var(--color-state2)] opacity-80">{t.ui.rulebook.emblems.ondFake}</div>
          </div>
        </button>

        {/* БАЛТЕЛИЯ */}
        <button
          type="button"
          className={`${cls(
            "ref.emblem_blt",
            sel,
            proven
          )} p-2 text-left border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors flex items-center gap-2`}
          onClick={(e) => {
            e.stopPropagation();
            onSel("ref.emblem_blt");
          }}
        >
          <div className="shrink-0">
            <BalteliaEmblem size={38} />
          </div>
          <div>
            <div className="text-[9.5px] font-bold text-[var(--color-gold)]">{t.ui.rulebook.emblems.baltelia}</div>
            <div className="text-[8px] text-[var(--color-moss)]">{t.ui.rulebook.emblems.bltOk}</div>
            <div className="text-[7.5px] text-[var(--color-state2)] opacity-80">{t.ui.rulebook.emblems.bltFake}</div>
          </div>
        </button>

        {/* ОТЕПЛИЯ */}
        <button
          type="button"
          className={`${cls(
            "ref.emblem_zps",
            sel,
            proven
          )} p-2 text-left border border-[var(--color-line)] hover:border-[var(--color-gold)] transition-colors flex items-center gap-2`}
          onClick={(e) => {
            e.stopPropagation();
            onSel("ref.emblem_zps");
          }}
        >
          <div className="shrink-0">
            <OtepliaEmblem size={38} />
          </div>
          <div>
            <div className="text-[9.5px] font-bold text-[var(--color-gold)]">{t.ui.rulebook.emblems.oteplia}</div>
            <div className="text-[8px] text-[var(--color-moss)]">{t.ui.rulebook.emblems.otepOk}</div>
            <div className="text-[7.5px] text-[var(--color-state2)] opacity-80">{t.ui.rulebook.emblems.otepFake}</div>
          </div>
        </button>
      </div>

      <div className="text-[9px] uppercase text-[var(--color-ash)] leading-relaxed tracking-wide">
        {t.ui.rulebook.refNote}
      </div>
    </div>
  );
}

function CalendarPage({
  date,
  dayN,
  sel,
  proven,
  onSel,
}: {
  date: string;
  dayN: number;
  sel: FieldKey[];
  proven: FieldKey[];
  onSel: (k: FieldKey) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="text-center py-4">
      <div className="text-[9px] uppercase tracking-widest text-[var(--color-ash)] mb-2">
        {t.ui.rulebook.calPost}
      </div>
      <button
        type="button"
        className={`${cls("cal.today", sel, proven)} inline-block py-3 px-6 border-4 border-[var(--color-state2)]`}
        onClick={(e) => {
          e.stopPropagation();
          onSel("cal.today");
        }}
      >
        <div
          className="font-head text-[32px] leading-none text-[var(--color-state2)]"
          style={{ fontFamily: "var(--font-head)" }}
        >
          {date}
        </div>
        <div className="text-[10px] uppercase mt-2 text-[var(--color-ash)]">
          {t.ui.rulebook.todayDate}
        </div>
      </button>
      <div className="text-[10px] uppercase mt-4 text-[var(--color-ash)] tracking-wide">
        {t.ui.rulebook.shiftYear(dayN)}
      </div>
      <div className="text-[9px] mt-2 text-[var(--color-ash)] opacity-70 leading-relaxed">
        {t.ui.rulebook.calNote}
      </div>
    </div>
  );
}
