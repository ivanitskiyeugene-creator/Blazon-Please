import { country } from "../game/data";
import type {
  Decision,
  FieldKey,
  PartyCardData,
  PassportData,
  PermitData,
  PersonSpec,
  TalonData,
  VeteranData,
} from "../game/types";
import { useI18n } from "../i18n";
import { AtomEmblem, CountryEmblem, PartyEmblem } from "./Emblems";
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

function Row({
  k,
  label,
  value,
  s,
  className = "",
}: {
  k: FieldKey;
  label: string;
  value: string;
  s: SelProps;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`${cls(k, s)} doc-row w-full text-left text-[10px] ${className}`}
      onClick={(e) => {
        e.stopPropagation();
        s.onSel(k);
      }}
    >
      <span className="doc-label">{label}</span>
      <span className="font-bold">{value}</span>
    </button>
  );
}

// =============================================
// ПАСПОРТ — компактный вертикальный
// =============================================
export function PassportDoc({
  data,
  person,
  s,
  stampMarks,
}: {
  data: PassportData;
  person: PersonSpec;
  s: SelProps;
  stampMarks: { type: Decision; x: number; y: number }[];
}) {
  const { t, lang } = useI18n();
  const c = country(data.country, lang);

  return (
    <div className="select-none doc" style={{ width: 220, position: "relative", overflow: "hidden" }}>
      {/* ОБЛОЖКА */}
      <div
        style={{
          background: c.color,
          padding: "10px 12px 8px",
          borderBottom: "2px solid rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            type="button"
            className={`${cls("p.emblem", s)} shrink-0 p-0.5 rounded border border-transparent hover:border-[#e8c34a]`}
            onClick={(e) => {
              e.stopPropagation();
              s.onSel("p.emblem");
            }}
          >
            <CountryEmblem country={c} size={38} fake={data.fake} />
          </button>
          <button
            type="button"
            className={`${cls("p.country", s)} min-w-0 text-left`}
            onClick={(e) => {
              e.stopPropagation();
              s.onSel("p.country");
            }}
          >
            <div
              className="font-head text-[14px] tracking-[0.1em] text-[#e8c34a]"
              style={{ fontFamily: "var(--font-head)" }}
            >
              {t.ui.passport.title}
            </div>
            <div
              style={{
                fontSize: 7,
                color: "rgba(232,195,74,0.85)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                lineHeight: 1.2,
              }}
            >
              {c.name}
            </div>
          </button>
        </div>
      </div>

      {/* ВНУТРЕННЯЯ СТРАНИЦА */}
      <div className="paper-tex" style={{ color: "#2b241c", padding: "8px 10px 6px", position: "relative" }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            type="button"
            className={`${cls("p.photo", s)} shrink-0 block border border-[#5c4f3d] bg-[#c2b288]`}
            onClick={(e) => {
              e.stopPropagation();
              s.onSel("p.photo");
            }}
          >
            <Person spec={person} width={56} gray />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Row k="p.name" label={t.ui.passport.name} value={data.name} s={s} />
            <Row
              k="p.sex"
              label={t.ui.passport.sex}
              value={data.sex === "M" ? t.ui.passport.male : t.ui.passport.female}
              s={s}
            />
            <Row k="p.dob" label={t.ui.passport.dob} value={data.dob} s={s} />
          </div>
        </div>

        <div style={{ borderTop: "1px dotted rgba(43,36,28,0.3)", margin: "4px 0" }} />

        <Row k="p.id" label={t.ui.passport.id} value={data.id} s={s} />
        <Row k="p.expiry" label={t.ui.passport.expiry} value={data.expiry} s={s} />

        {/* MRZ */}
        <div style={{ borderTop: "1px dashed rgba(43,36,28,0.2)", marginTop: 3, paddingTop: 3 }}>
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 6.5,
              color: "rgba(43,36,28,0.35)",
              letterSpacing: "0.1em",
              lineHeight: 1.4,
            }}
          >
            P&lt;{data.country}&lt;{data.name.replace(" ", "<<")}
            <br />
            {data.id}&lt;{data.dob.replace(/\./g, "")}&lt;{data.expiry.replace(/\./g, "")}
          </div>
        </div>
      </div>

      {/* ОТТИСКИ ШТАМПОВ */}
      {stampMarks.map((m, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            left: m.x,
            top: m.y,
            zIndex: 100 + idx,
            pointerEvents: "none",
            transform: "translate(-50%, -50%) rotate(-11deg)",
            animation: "slam 0.25s cubic-bezier(0.2, 2.0, 0.4, 1) both",
            whiteSpace: "nowrap",
          }}
        >
          <span
            className="font-head uppercase"
            style={{
              fontFamily: "var(--font-head)",
              fontSize: 12,
              letterSpacing: "0.05em",
              padding: "3px 8px",
              display: "inline-block",
              color:
                m.type === "ADMIT"
                  ? "rgba(15,70,20,0.9)"
                  : m.type === "DENY"
                  ? "rgba(130,20,15,0.9)"
                  : "rgba(10,8,5,0.92)",
              border: `3px solid ${
                m.type === "ADMIT"
                  ? "rgba(15,70,20,0.7)"
                  : m.type === "DENY"
                  ? "rgba(130,20,15,0.7)"
                  : "rgba(10,8,5,0.7)"
              }`,
              background: "rgba(255,255,255,0.01)",
            }}
          >
            {m.type === "ADMIT" ? t.ui.stamps.ADMIT : m.type === "DENY" ? t.ui.stamps.DENY : t.ui.stamps.DETAIN}
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
  const { t } = useI18n();
  return (
    <div className="doc paper-tex w-[260px] select-none">
      <div className="px-2.5 py-2 relative">
        <div className="flex items-center justify-between mb-1">
          <div
            className="font-head text-[11px] tracking-widest"
            style={{ fontFamily: "var(--font-head)", color: "#7c1d18" }}
          >
            {t.ui.permit.title}
          </div>
          <div className="text-[7px] uppercase opacity-55">{t.ui.checkpoint}</div>
        </div>
        <Row k="w.name" label={t.ui.permit.name} value={data.name} s={s} />
        <Row k="w.passId" label={t.ui.permit.passId} value={data.passId} s={s} />
        <Row k="w.purpose" label={t.ui.permit.purpose} value={data.purpose} s={s} />
        <Row k="w.duration" label={t.ui.permit.duration} value={data.duration} s={s} />
        <Row k="w.expiry" label={t.ui.permit.expiry} value={data.expiry} s={s} />
        <div
          className="absolute right-2 top-7 w-12 h-12 opacity-30 grid place-items-center text-center pointer-events-none"
          style={{ border: "2px solid #7c1d18", color: "#7c1d18", transform: "rotate(12deg)" }}
        >
          <span className="text-[5px] font-bold uppercase leading-tight">{t.ui.permit.ministry}</span>
        </div>
      </div>
    </div>
  );
}

// =============================================
// УДОСТОВЕРЕНИЕ КПТА
// =============================================
export function PartyCardDoc({ data, s }: { data: PartyCardData; s: SelProps }) {
  const { t } = useI18n();
  return (
    <div className="doc select-none overflow-hidden w-[260px]" style={{ background: "#6e1613" }}>
      <div className="m-1 border-2 border-[#e8c34a55] px-2 py-1.5 flex items-center gap-2">
        <button
          type="button"
          className={`${cls("c.emblem", s)} shrink-0 p-0.5 rounded border border-transparent hover:border-[#e8c34a]`}
          onClick={(e) => {
            e.stopPropagation();
            s.onSel("c.emblem");
          }}
        >
          <PartyEmblem size={44} mirrored={data.mirrored} />
        </button>
        <div className="flex-1 min-w-0">
          <div
            className="font-head text-[10px] tracking-wider text-[#e8c34a]"
            style={{ fontFamily: "var(--font-head)" }}
          >
            {t.ui.partyCard.title}
          </div>
          <button
            type="button"
            className={`${cls("c.name", s)} doc-row w-full text-left text-[9px]`}
            style={{ color: "#e8c34a", borderColor: "#e8c34a44" }}
            onClick={(e) => {
              e.stopPropagation();
              s.onSel("c.name");
            }}
          >
            <span className="doc-label" style={{ color: "#e8c34a88" }}>
              {t.ui.partyCard.name}
            </span>
            <span className="font-bold">{data.name}</span>
          </button>
          <button
            type="button"
            className={`${cls("c.rank", s)} doc-row w-full text-left text-[9px]`}
            style={{ color: "#e8c34a", borderColor: "#e8c34a44" }}
            onClick={(e) => {
              e.stopPropagation();
              s.onSel("c.rank");
            }}
          >
            <span className="doc-label" style={{ color: "#e8c34a88" }}>
              {t.ui.partyCard.rank}
            </span>
            <span className="font-bold">{data.rank}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================
// НОВЫЙ ТАЛОН (Транзитный / Пайковый / ACPS)
// =============================================
export function TalonDoc({ data, s }: { data: TalonData; s: SelProps }) {
  const { t } = useI18n();
  const talonTitle =
    data.kind === "transit"
      ? t.ui.talons.transitTitle
      : data.kind === "ration"
      ? t.ui.talons.rationTitle
      : t.ui.talons.acpsTitle;

  const bgStyle =
    data.kind === "transit"
      ? "bg-[#253745] text-[#d6e2ec]"
      : data.kind === "ration"
      ? "bg-[#3d3224] text-[#f2dfba]"
      : "bg-[#232b2b] text-[#80ed99]";

  return (
    <div className={`doc select-none overflow-hidden w-[270px] ${bgStyle} border-2 border-dashed border-[#ffffff44]`}>
      <div className="p-2 relative">
        <div className="flex items-center justify-between border-b border-current pb-1 mb-1">
          <button
            type="button"
            className={`${cls("t.code", s)} font-head text-[11px] tracking-wider`}
            style={{ fontFamily: "var(--font-head)" }}
            onClick={(e) => {
              e.stopPropagation();
              s.onSel("t.code");
            }}
          >
            {talonTitle}
          </button>
          <span className="text-[8px] font-mono opacity-80">{data.code}</span>
        </div>

        <Row k="t.name" label={t.ui.talons.holder} value={data.name} s={s} />
        <Row k="t.passId" label={t.ui.talons.passId} value={data.passId} s={s} />
        <Row k="t.purpose" label={t.ui.talons.category} value={data.purpose} s={s} />
        {data.quota && <Row k="t.quota" label={t.ui.talons.quota} value={data.quota} s={s} />}
        <Row k="t.expiry" label={t.ui.talons.validUntil} value={data.expiry} s={s} />

        {/* Штемпель талона */}
        <div className="mt-2 flex items-center justify-between">
          <button
            type="button"
            className={`${cls("t.seal", s)} px-2 py-0.5 border border-current text-[8px] uppercase tracking-widest font-bold`}
            style={{ transform: "rotate(-3deg)" }}
            onClick={(e) => {
              e.stopPropagation();
              s.onSel("t.seal");
            }}
          >
            {data.sealValid ? t.ui.talons.sealValid : t.ui.talons.sealForged}
          </button>
          <span className="text-[6.5px] uppercase opacity-60">{t.ui.talons.easaControl}</span>
        </div>
      </div>
    </div>
  );
}

// =============================================
// ВЕТЕРАНСКОЕ УДОСТОВЕРЕНИЕ ВАВ (1938–1947)
// =============================================
export function VeteranDoc({ data, s }: { data: VeteranData; s: SelProps }) {
  const { t } = useI18n();
  return (
    <div className="doc select-none overflow-hidden w-[270px] bg-[#421412] text-[#f4d06f] border-2 border-[#f4d06f]">
      <div className="p-2 relative">
        <div className="flex items-center gap-2 border-b border-[#f4d06f66] pb-1.5 mb-1.5">
          <div className="shrink-0">
            <AtomEmblem size={34} color="#f4d06f" orbits={data.sealValid ? 3 : 2} badge />
          </div>
          <div>
            <div className="font-head text-[10.5px] tracking-wider leading-tight" style={{ fontFamily: "var(--font-head)" }}>
              {t.ui.veteran.title}
            </div>
            <div className="text-[7px] uppercase text-[#ffffff99]">{data.serviceYears}</div>
          </div>
        </div>

        <Row k="v.name" label={t.ui.veteran.name} value={data.name} s={s} />
        <Row k="v.rank" label={t.ui.veteran.rank} value={data.rank} s={s} />
        <Row k="v.unit" label={t.ui.veteran.unit} value={data.unit} s={s} />
        <Row k="v.medal" label={t.ui.veteran.medal} value={data.medal} s={s} />

        <div className="mt-1.5 flex justify-end">
          <button
            type="button"
            className={`${cls("v.seal", s)} text-[7.5px] uppercase border border-[#f4d06f] px-2 py-0.5 tracking-widest`}
            style={{ transform: "rotate(4deg)" }}
            onClick={(e) => {
              e.stopPropagation();
              s.onSel("v.seal");
            }}
          >
            {data.sealValid ? t.ui.veteran.sealAssr : t.ui.veteran.sealForged}
          </button>
        </div>
      </div>
    </div>
  );
}
