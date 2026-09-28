import { AtomEmblem, PartyEmblem } from "./Emblems";
import { Person } from "./Person";

const LEADER = {
  skin: 1,
  hairStyle: "flat" as const,
  hairTone: 0,
  facial: "mustache" as const,
  coat: 0,
};

/** Интерьер КПП-7, собранный вручную из жёстких пиксельных блоков. */
export function BoothDecor({ date }: { date: string }) {
  return (
    <>
      <div className="harsh-wall absolute inset-0" />
      <div className="booth-light absolute inset-0 pointer-events-none" />
      <div className="booth-floor-shadow absolute inset-x-0 bottom-0 h-28 pointer-events-none" />

      {/* трубы отопления */}
      <div className="booth-pipe absolute right-1 top-0 h-full w-4 pointer-events-none">
        {[15, 38, 61, 84].map((top) => <i key={top} style={{ top: `${top}%` }} />)}
      </div>

      {/* лампа — ступенчатый абажур без кривых */}
      <div className="booth-lamp absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none">
        <div className="booth-lamp__cord" />
        <div className="booth-lamp__shade"><i /><i /><i /><i /></div>
        <div className="booth-lamp__bulb" />
      </div>

      {/* полка, папки и чай */}
      <div className="booth-shelf absolute left-2 top-[86px] w-[104px] h-[46px] pointer-events-none">
        <div className="booth-folders"><i /><i /><i /></div>
        <div className="booth-tea"><i /><b /><span /></div>
        <div className="booth-shelf__board" />
      </div>

      {/* пиксельный телефон */}
      <div className="booth-phone absolute left-3 bottom-[124px] pointer-events-none">
        <div className="booth-phone__handset"><i /><i /></div>
        <div className="booth-phone__box">
          <div className="booth-phone__dial">
            <i /><i /><i /><i /><i /><i /><i /><i />
          </div>
        </div>
      </div>

      {/* портрет председателя использует тот же настоящий bitmap-спрайт */}
      <div className="absolute right-[46px] top-[86px] pointer-events-none opacity-95">
        <div className="border-2 border-[#87704f] bg-[#33291f] p-1 rotate-[1deg] shadow-[4px_4px_0_#120e0b]">
          <div className="h-[54px] w-[46px] overflow-hidden bg-[#4a3b2c]">
            <Person spec={LEADER} width={46} gray />
          </div>
          <div className="text-[6px] text-center text-[var(--color-ash)] uppercase mt-0.5 leading-none">председатель</div>
        </div>
      </div>

      <div className="absolute left-[128px] top-[58px] opacity-45 pointer-events-none">
        <AtomEmblem size={34} />
      </div>

      {/* приколотая бумажка */}
      <div className="absolute right-[96px] bottom-[236px] rotate-[-6deg] opacity-70 pointer-events-none">
        <div className="paper-tex w-14 h-16 border border-[#5c4f3d] p-1">
          <div className="h-[2px] bg-[#2b241c55] mb-1" />
          <div className="h-[2px] bg-[#2b241c55] mb-1 w-3/4" />
          <div className="h-[2px] bg-[#2b241c55] mb-1" />
          <div className="h-[2px] bg-[#2b241c55] mb-1 w-1/2" />
          <div className="h-[2px] bg-[#2b241c55] w-2/3" />
        </div>
      </div>

      <div className="absolute right-[13px] bottom-[218px] pointer-events-none">
        <div className="panel px-2 py-1.5 opacity-90 w-[84px] rotate-[1deg]">
          <PartyEmblem size={28} mirrored />
          <div className="text-[6px] text-[var(--color-ash)] uppercase leading-tight mt-1 text-center">порядок — атом в сердце</div>
        </div>
      </div>

      <div className="absolute left-[14px] top-[152px] pointer-events-none">
        <div className="paper-tex border-2 border-[#5c4f3d] px-2 py-1 text-center rotate-[-2deg] shadow-[3px_3px_0_#120e0b]">
          <div className="text-[6px] uppercase text-[#2b241c99] leading-none">пост №7</div>
          <div className="font-head text-[11px] text-[#7c1d18] leading-tight" style={{ fontFamily: "var(--font-head)" }}>{date}</div>
        </div>
      </div>

      {/* батарея из квадратных секций */}
      <div className="booth-radiator absolute left-2 bottom-11 pointer-events-none">
        {[0, 1, 2, 3, 4, 5].map((n) => <i key={n} />)}
        <b /><b />
      </div>
    </>
  );
}
