import { COUNTRIES } from "../game/data";
import type { Decision, FieldKey, PartyCardData, PassportData, PermitData, PersonSpec } from "../game/types";
import { CountryEmblem, PartyEmblem } from "./Emblems";
import { Person } from "./Person";

export interface SelProps {
  sel: FieldKey[];
  proven: FieldKey[];
  onSel: (k: FieldKey) => void;
}

function cls(k: FieldKey, s: SelProps) {
  if (s.proven.includes(k)) return "fld fld-proven";
  if (s.sel.includes(k)) return "fld fld-sel";
  return "fld";
}

function Row({ k, label, value, s }: { k: FieldKey; label: string; value: string; s: SelProps }) {
  return (
    <button type="button" className={`${cls(k, s)} doc-row w-full text-left text-[10px]`}
      onClick={e => { e.stopPropagation(); s.onSel(k); }}>
      <span className="doc-label">{label}</span>
      <span className="font-bold">{value}</span>
    </button>
  );
}

// =============================================
// ПАСПОРТ — компактный вертикальный
// =============================================
export function PassportDoc({ data, person, s, stampMarks }: {
  data: PassportData; person: PersonSpec; s: SelProps;
  stampMarks: { type: Decision; x: number; y: number }[];
}) {
  const c = COUNTRIES[data.country];

  return (
    <div className="select-none doc" style={{ width: 220, position: "relative", overflow: "hidden" }}>
      {/* ОБЛОЖКА — компактная */}
      <div style={{
        background: c.color,
        padding: "10px 12px 8px",
        borderBottom: "2px solid rgba(0,0,0,0.4)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" className={`${cls("p.emblem", s)} rounded-full shrink-0`}
            onClick={e => { e.stopPropagation(); s.onSel("p.emblem"); }}>
            <CountryEmblem country={c} size={38} fake={data.fake} />
          </button>
          <button type="button" className={`${cls("p.country", s)} min-w-0 text-left`}
            onClick={e => { e.stopPropagation(); s.onSel("p.country"); }}>
            <div className="font-head text-[14px] tracking-[0.1em] text-[#e8c34a]"
              style={{ fontFamily: "var(--font-head)" }}>ПАСПОРТ</div>
            <div style={{ fontSize: 7, color: "rgba(232,195,74,0.8)", letterSpacing: "0.04em",
              textTransform: "uppercase", lineHeight: 1.2 }}>{c.name}</div>
          </button>
        </div>
      </div>

      {/* ВНУТРЕННЯЯ СТРАНИЦА */}
      <div style={{ background: "#d9c9a3", color: "#2b241c", padding: "8px 10px 6px", position: "relative" }}>
        {/* фото + основные данные */}
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" className={`${cls("p.photo", s)} shrink-0 block border border-[#5c4f3d] bg-[#c2b288]`}
            onClick={e => { e.stopPropagation(); s.onSel("p.photo"); }}>
            <Person spec={person} width={56} gray />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Row k="p.name" label="Имя" value={data.name} s={s} />
            <Row k="p.sex" label="Пол" value={data.sex === "M" ? "МУЖ" : "ЖЕН"} s={s} />
            <Row k="p.dob" label="Рожд." value={data.dob} s={s} />
          </div>
        </div>

        <div style={{ borderTop: "1px dotted rgba(43,36,28,0.3)", margin: "4px 0" }} />

        <Row k="p.id" label="Серия №" value={data.id} s={s} />
        <Row k="p.expiry" label="До" value={data.expiry} s={s} />

        {/* MRZ */}
        <div style={{ borderTop: "1px dashed rgba(43,36,28,0.2)", marginTop: 3, paddingTop: 3 }}>
          <div style={{ fontFamily: "monospace", fontSize: 6.5, color: "rgba(43,36,28,0.35)",
            letterSpacing: "0.1em", lineHeight: 1.4 }}>
            P&lt;{data.country}&lt;{data.name.replace(" ", "<<")}
            <br/>{data.id}&lt;{data.dob.replace(/\./g, "")}&lt;{data.expiry.replace(/\./g, "")}
          </div>
        </div>

      </div>

      {/* ОТТИСК ШТАМПА — теперь вне внутренней страницы, но внутри общего relative контейнера паспорта */}
            {/* ОТТИСКИ ШТАМПОВ */}
      {stampMarks.map((m, idx) => (
        <div key={idx} style={{
          position: "absolute",
          left: m.x,
          top: m.y,
          zIndex: 100 + idx,
          pointerEvents: "none",
          transform: "translate(-50%, -50%) rotate(-11deg)",
          animation: "slam 0.25s cubic-bezier(0.2, 2.0, 0.4, 1) both",
          whiteSpace: "nowrap",
        }}>
          <span className="font-head uppercase" style={{
            fontFamily: "var(--font-head)",
            fontSize: 12,
            letterSpacing: "0.05em",
            padding: "3px 8px",
            display: "inline-block",
            color: m.type === "ADMIT" ? "rgba(15,70,20,0.9)" : m.type === "DENY" ? "rgba(130,20,15,0.9)" : "rgba(10,8,5,0.92)",
            border: `3px solid ${m.type === "ADMIT" ? "rgba(15,70,20,0.7)" : m.type === "DENY" ? "rgba(130,20,15,0.7)" : "rgba(10,8,5,0.7)"}`,
            background: "rgba(255,255,255,0.01)",
            borderRadius: 2,
          }}>
            {m.type === "ADMIT" ? "ВХОД" : m.type === "DENY" ? "ОТКАЗ" : "АРЕСТ"}
          </span>
        </div>
      ))}
    </div>
  );
}

// =============================================
// РАЗРЕШЕНИЕ НА ВЪЕЗД
// =============================================
export function PermitDoc({ data, s }: { data: PermitData; s: SelProps }) {
  return (
    <div className="doc paper-tex w-[260px] select-none">
      <div className="px-2.5 py-2 relative">
        <div className="flex items-center justify-between mb-1">
          <div className="font-head text-[11px] tracking-widest" style={{ fontFamily: "var(--font-head)", color: "#7c1d18" }}>
            РАЗРЕШЕНИЕ НА ВЪЕЗД
          </div>
          <div className="text-[7px] uppercase opacity-55">КПП-7</div>
        </div>
        <Row k="w.name" label="Имя" value={data.name} s={s} />
        <Row k="w.passId" label="№ паспорта" value={data.passId} s={s} />
        <Row k="w.purpose" label="Цель" value={data.purpose} s={s} />
        <Row k="w.duration" label="Срок" value={data.duration} s={s} />
        <Row k="w.expiry" label="До" value={data.expiry} s={s} />
        <div className="absolute right-2 top-7 w-12 h-12 rounded-full opacity-20 grid place-items-center text-center pointer-events-none"
          style={{ border: "2px solid #7c1d18", color: "#7c1d18", transform: "rotate(12deg)" }}>
          <span className="text-[5px] font-bold uppercase leading-tight">Мин.<br/>пропусков</span>
        </div>
      </div>
    </div>
  );
}

// =============================================
// УДОСТОВЕРЕНИЕ КПТА
// =============================================
export function PartyCardDoc({ data, s }: { data: PartyCardData; s: SelProps }) {
  return (
    <div className="doc select-none overflow-hidden w-[260px]" style={{ background: "#6e1613" }}>
      <div className="m-1 border-2 border-[#e8c34a55] px-2 py-1.5 flex items-center gap-2">
        <button type="button" className={`${cls("c.emblem", s)} shrink-0 rounded-full`}
          onClick={e => { e.stopPropagation(); s.onSel("c.emblem"); }}>
          <PartyEmblem size={44} mirrored={data.mirrored} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-head text-[10px] tracking-wider text-[#e8c34a]" style={{ fontFamily: "var(--font-head)" }}>
            УДОСТОВЕРЕНИЕ КПТА
          </div>
          <button type="button" className={`${cls("c.name", s)} doc-row w-full text-left text-[9px]`}
            style={{ color: "#e8c34a", borderColor: "#e8c34a44" }}
            onClick={e => { e.stopPropagation(); s.onSel("c.name"); }}>
            <span className="doc-label" style={{ color: "#e8c34a88" }}>Имя</span>
            <span className="font-bold">{data.name}</span>
          </button>
          <button type="button" className={`${cls("c.rank", s)} doc-row w-full text-left text-[9px]`}
            style={{ color: "#e8c34a", borderColor: "#e8c34a44" }}
            onClick={e => { e.stopPropagation(); s.onSel("c.rank"); }}>
            <span className="doc-label" style={{ color: "#e8c34a88" }}>Звание</span>
            <span className="font-bold">{data.rank}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
