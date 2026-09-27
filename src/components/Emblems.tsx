import type { Country } from "../game/types";

// ---------- ГЕРБ АССР: АТОМ ----------
export function AtomEmblem({
  size = 48,
  color = "#e8c34a",
  orbits = 3,
  badge = false,
}: {
  size?: number;
  color?: string;
  orbits?: 2 | 3;
  badge?: boolean;
}) {
  const els = [0, 60, 120].slice(0, orbits);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      {badge && <circle cx="50" cy="50" r="48" fill="#8f2320" stroke="#5e1715" strokeWidth="3" />}
      <g stroke={color} strokeWidth="5.5" fill="none">
        {els.map((r) => (
          <ellipse key={r} cx="50" cy="50" rx="37" ry="13.5" transform={`rotate(${r} 50 50)`} />
        ))}
      </g>
      <circle cx="50" cy="50" r="7.5" fill={color} />
      {/* электроны */}
      <circle cx="87" cy="50" r="4" fill={color} />
      {orbits === 3 && <circle cx="31.5" cy="79.7" r="4" fill={color} />}
    </svg>
  );
}

// ---------- ГЕРБ КПТА: PNG вписанный в круг ----------
// PNG содержит КЛАССИЧЕСКИЙ серп и молот (как в СССР).
// mirrored=true  → настоящий КПТА: зеркалим по горизонтали (scaleX -1)
// mirrored=false → подделка: показываем как есть (классический СССР)

export function PartyEmblem({
  size = 48,
  mirrored = true,
  badge = true,
}: {
  size?: number;
  color?: string;
  mirrored?: boolean;
  badge?: boolean;
}) {
  // Используем clipPath для круглой обрезки вместо квадратной image
  const uid = `kpta-clip-${Math.random().toString(36).slice(2, 6)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <defs>
        <clipPath id={uid}>
          <circle cx="50" cy="50" r="46" />
        </clipPath>
      </defs>
      {badge && (
        <circle cx="50" cy="50" r="48" fill="#7c1d18" stroke="#e8c34a" strokeWidth="3" />
      )}
      {/* PNG вписан в круг через clipPath, зеркалим для КПТА */}
      <g clipPath={`url(#${uid})`}>
        <image
          href="images/kpta_emblem.png"
          x="5" y="5"
          width="90" height="90"
          preserveAspectRatio="xMidYMid meet"
          transform={mirrored ? "translate(100, 0) scale(-1, 1)" : undefined}
        />
      </g>
    </svg>
  );
}

// ---------- Эмблемы стран ----------
export function CountryEmblem({
  country,
  size = 48,
  fake,
}: {
  country: Country;
  size?: number;
  fake?: "orb2";
}) {
  const gold = "#e8c34a";
  if (country.emblem === "atom") {
    return <AtomEmblem size={size} color={gold} orbits={fake === "orb2" ? 2 : 3} badge />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
      <circle cx="50" cy="50" r="48" fill={country.color} stroke="rgba(0,0,0,0.5)" strokeWidth="3" />
      {country.emblem === "star" && (
        <polygon
          points="50,24 55.9,41.9 74.7,42 59.5,53.1 65.3,71 50,60 34.7,71 40.5,53.1 25.3,42 44.1,41.9"
          fill={gold}
        />
      )}
      {country.emblem === "wings" && (
        <g stroke={gold} fill={gold}>
          <polygon points="50,22 68,50 50,78 32,50" fill="none" strokeWidth="5" />
          <g strokeWidth="5" strokeLinecap="round">
            <line x1="30" y1="42" x2="11" y2="32" />
            <line x1="29" y1="52" x2="9" y2="52" />
            <line x1="30" y1="62" x2="11" y2="72" />
            <line x1="70" y1="42" x2="89" y2="32" />
            <line x1="71" y1="52" x2="91" y2="52" />
            <line x1="70" y1="62" x2="89" y2="72" />
          </g>
        </g>
      )}
      {country.emblem === "gear" && (
        <g fill={gold}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((r) => (
            <rect key={r} x="45" y="13" width="10" height="15" transform={`rotate(${r} 50 50)`} />
          ))}
          <circle cx="50" cy="50" r="17" />
          <circle cx="50" cy="50" r="8" fill={country.color} />
        </g>
      )}
      {country.emblem === "wheat" && (
        <g stroke={gold} strokeWidth="5" strokeLinecap="round" fill="none">
          <line x1="50" y1="30" x2="50" y2="82" />
          <line x1="50" y1="40" x2="33" y2="28" />
          <line x1="50" y1="40" x2="67" y2="28" />
          <line x1="50" y1="54" x2="31" y2="43" />
          <line x1="50" y1="54" x2="69" y2="43" />
          <line x1="50" y1="68" x2="31" y2="58" />
          <line x1="50" y1="68" x2="69" y2="58" />
          <ellipse cx="50" cy="24" rx="5" ry="8" fill={gold} stroke="none" />
        </g>
      )}
    </svg>
  );
}
