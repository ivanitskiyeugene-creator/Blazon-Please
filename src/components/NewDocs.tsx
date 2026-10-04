import type { EmploymentData, TransitData } from "../game/types";
import { useI18n } from "../i18n";
import type { SelProps } from "./Docs";
import { DocumentWear } from "./DocumentWear";

function row(k: string, label: string, value: string, s: SelProps) {
  const state = s.proven.includes(k) ? "fld fld-proven" : s.sel.includes(k) ? "fld fld-sel" : "fld";
  return <button type="button" className={`${state} doc-row w-full text-left text-[10px]`} onClick={(e) => { e.stopPropagation(); s.onSel(k); }}><span className="doc-label">{label}</span><span className="font-bold">{value}</span></button>;
}

export function EmploymentDoc({ data, s }: { data: EmploymentData; s: SelProps }) {
  const { t } = useI18n();
  return <div className="doc paper-tex w-[270px] select-none p-3 text-[#2b241c]">
    <DocumentWear seed={`employment-${data.employer}-${data.issued}`} />
    <div className="font-head text-[11px] tracking-widest text-[#7c1d18] mb-2">{t.ui.employment.title}</div>
    {row("e.employer", t.ui.employment.employer, data.employer, s)}
    {row("e.position", t.ui.employment.position, data.position, s)}
    {row("e.issued", t.ui.employment.issued, data.issued, s)}
    {row("e.seal", t.ui.employment.seal, data.seal, s)}
  </div>;
}

export function TransitDoc({ data, s }: { data: TransitData; s: SelProps }) {
  const { t } = useI18n();
  return <div className="doc paper-tex w-[270px] select-none p-3 text-[#2b241c]">
    <DocumentWear seed={`transit-${data.route}-${data.cargo}`} />
    <div className="font-head text-[11px] tracking-widest text-[#24515b] mb-2">{t.ui.transit.title}</div>
    {row("t.cargo", t.ui.transit.cargo, data.cargo, s)}
    {row("t.route", t.ui.transit.route, data.route, s)}
    {row("t.destination", t.ui.transit.destination, data.destination, s)}
    {row("t.seal", t.ui.transit.seal, data.seal, s)}
  </div>;
}
