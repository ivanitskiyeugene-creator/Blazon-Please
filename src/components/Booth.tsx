import { AtomEmblem, PartyEmblem } from "./Emblems";

/** Интерьер будки КПП-7: лампа, полка, чай, телефон, трубы, портрет */
export function BoothDecor({ date }: { date: string }) {
  return (
    <>
      {/* обои-стена с потёками */}
      <div className="harsh-wall absolute inset-0" />
      {/* мягкий свет от лампы по стене */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(210,170,56,.16) 0 18%, rgba(210,170,56,.08) 18% 36%, transparent 36%)" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-28 opacity-55 pointer-events-none"
        style={{ background: "linear-gradient(to top, #110d0a 0 38%, #1a130daa 38% 68%, transparent 68%)" }}
      />
      {/* трубы отопления справа */}
      <svg className="absolute right-0 top-0 h-full w-10 opacity-95 pointer-events-none" viewBox="0 0 40 400" preserveAspectRatio="none">
        <rect x="24" y="0" width="9" height="400" fill="#5d4d3a" />
        <rect x="24" y="0" width="3.5" height="400" fill="#7a664d" />
        {[60, 150, 240, 330].map((y) => (
          <rect key={y} x="21" y={y} width="15" height="9" fill="#6d5a44" />
        ))}
      </svg>

      {/* лампа на шнуре */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 pointer-events-none">
        <div className="w-[2px] h-7 bg-[#584833] mx-auto" />
        <svg width="54" height="26" viewBox="0 0 54 26">
          <path d="M27 0 L52 24 L2 24 Z" fill="#6b5a43" stroke="#8a7457" strokeWidth="1.5" />
          <ellipse cx="27" cy="24" rx="25" ry="3.5" fill="#ffd964" opacity="0.95" />
        </svg>
      </div>

      {/* полка с чаем и папками */}
      <div className="absolute left-2 top-[86px] w-[104px] pointer-events-none">
        <svg width="104" height="46" viewBox="0 0 104 46">
          {/* стопка папок */}
          <rect x="4" y="18" width="30" height="7" fill="#9c8757" stroke="#3a2f22" strokeWidth="1" />
          <rect x="6" y="11" width="28" height="7" fill="#b19a63" stroke="#3a2f22" strokeWidth="1" />
          <rect x="3" y="25" width="32" height="7" fill="#8a7650" stroke="#3a2f22" strokeWidth="1" />
          {/* стакан в подстаканнике */}
          <g transform="translate(46 4)">
            <rect x="6" y="6" width="17" height="24" fill="#93602c" opacity="0.95" />
            <rect x="6" y="6" width="17" height="6" fill="#b37c3d" opacity="0.95" />
            <rect x="4" y="4" width="21" height="28" fill="none" stroke="#c2b089" strokeWidth="2.5" />
            <path d="M25 12 q9 6 0 12" fill="none" stroke="#9a8a6a" strokeWidth="2.5" />
            <rect x="2" y="30" width="25" height="3" fill="#c2b089" />
          </g>
          {/* полка */}
          <rect x="0" y="33" width="104" height="5" fill="#6d5a44" />
          <rect x="0" y="38" width="104" height="2" fill="#4a3d2e" />
        </svg>
      </div>

      {/* телефон на стене */}
      <div className="absolute left-3 bottom-[124px] pointer-events-none opacity-100">
        <svg width="52" height="54" viewBox="0 0 52 54">
          <rect x="6" y="14" width="40" height="34" rx="3" fill="#4a3f34" stroke="#6d5d4a" strokeWidth="2" />
          <circle cx="26" cy="33" r="10" fill="none" stroke="#a08f76" strokeWidth="2.5" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle
              key={a}
              cx={26 + 7 * Math.cos((a * Math.PI) / 180)}
              cy={33 + 7 * Math.sin((a * Math.PI) / 180)}
              r="1.6"
              fill="#c0ad90"
            />
          ))}
          {/* трубка */}
          <rect x="4" y="4" width="44" height="9" rx="4" fill="#5b4c3b" stroke="#7d6a52" strokeWidth="1.5" />
          <rect x="2" y="2" width="12" height="12" rx="3" fill="#6b5a44" />
          <rect x="38" y="2" width="12" height="12" rx="3" fill="#6b5a44" />
        </svg>
      </div>

      {/* портрет председателя */}
      <div className="absolute right-[46px] top-[86px] pointer-events-none opacity-95">
        <div className="border-2 border-[#87704f] bg-[#33291f] p-1 rotate-[1.5deg] shadow-[4px_4px_0_#120e0b]">
          <svg width="46" height="54" viewBox="0 0 46 54">
            <rect width="46" height="54" fill="#4a3b2c" />
            <circle cx="23" cy="20" r="11" fill="#8a7157" />
            <rect x="19" y="14" width="9" height="4" fill="#2b241c" />
            <path d="M6 54 q4 -18 17 -18 q13 0 17 18 Z" fill="#5f4c39" />
            <rect x="19" y="36" width="8" height="8" fill="#7c1d18" />
          </svg>
          <div className="text-[6px] text-center text-[var(--color-ash)] uppercase mt-0.5 leading-none">
            председатель
          </div>
        </div>
      </div>

      {/* вентилятор-гвоздик и гвозди */}
      <div className="absolute left-[128px] top-[58px] opacity-45 pointer-events-none">
        <AtomEmblem size={34} />
      </div>

      {/* приколотые бумажки */}
      <div className="absolute right-[96px] bottom-[236px] rotate-[-6deg] opacity-70 pointer-events-none">
        <div className="paper-tex w-14 h-16 border border-[#5c4f3d] p-1">
          <div className="h-[2px] bg-[#2b241c55] mb-1" />
          <div className="h-[2px] bg-[#2b241c55] mb-1 w-3/4" />
          <div className="h-[2px] bg-[#2b241c55] mb-1" />
          <div className="h-[2px] bg-[#2b241c55] mb-1 w-1/2" />
          <div className="h-[2px] bg-[#2b241c55] w-2/3" />
        </div>
      </div>

      {/* плакат КПТА на стене */}
      <div className="absolute right-[13px] bottom-[218px] pointer-events-none">
        <div className="panel px-2 py-1.5 opacity-90 w-[84px] rotate-[1deg]">
          <PartyEmblem size={28} mirrored />
          <div className="text-[6px] text-[var(--color-ash)] uppercase leading-tight mt-1 text-center">
            порядок — атом в сердце
          </div>
        </div>
      </div>
      {/* отрывной календарь на стене */}
      <div className="absolute left-[14px] top-[152px] pointer-events-none">
        <div className="paper-tex border-2 border-[#5c4f3d] px-2 py-1 text-center rotate-[-2deg] shadow-[3px_3px_0_#120e0b]">
          <div className="text-[6px] uppercase text-[#2b241c99] leading-none">пост №7</div>
          <div className="font-head text-[11px] text-[#7c1d18] leading-tight" style={{ fontFamily: "var(--font-head)" }}>
            {date}
          </div>
        </div>
      </div>

      {/* батарея внизу слева */}
      <div className="absolute left-2 bottom-11 opacity-85 pointer-events-none">
        <svg width="66" height="34" viewBox="0 0 66 34">
          {[0, 11, 22, 33, 44, 55].map((x) => (
            <rect key={x} x={x} y="2" width="8" height="30" rx="2" fill="#6a5843" stroke="#453729" strokeWidth="1" />
          ))}
          <rect x="0" y="8" width="63" height="3" fill="#584734" />
          <rect x="0" y="23" width="63" height="3" fill="#584734" />
        </svg>
      </div>
    </>
  );
}
