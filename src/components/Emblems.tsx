import type { Country } from "../game/types";

const GOLD = "#d2aa38";
const DARK = "#4a100d";

/** Герб АССР — намеренно отрисован на сетке 32×32, без сглаженных деталей. */
export function AtomEmblem({
  size = 48,
  color = GOLD,
  orbits = 3,
  badge = false,
}: {
  size?: number;
  color?: string;
  orbits?: 2 | 3;
  badge?: boolean;
}) {
  const turns = [0, 60, 120].slice(0, orbits);
  return (
    <svg
      className="pixel-art"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {badge && (
        <>
          <rect x="1" y="1" width="30" height="30" fill="#7b1c18" stroke={DARK} strokeWidth="2" />
          <rect x="3" y="3" width="26" height="26" fill="none" stroke="#a3442c" strokeWidth="1" />
        </>
      )}
      <g stroke={color} strokeWidth="2" fill="none">
        {turns.map((turn) => (
          <ellipse key={turn} cx="16" cy="16" rx="12" ry="4" transform={`rotate(${turn} 16 16)`} />
        ))}
      </g>
      <rect x="14" y="14" width="5" height="5" fill="#0d0b09" />
      <rect x="15" y="15" width="3" height="3" fill={color} />
      <rect x="27" y="15" width="3" height="3" fill={color} />
      {orbits === 3 && <rect x="8" y="24" width="3" height="3" fill={color} />}
    </svg>
  );
}

/**
 * Герб КПТА. Базовый знак — грубая пиксельная конструкция из молота и серпа.
 * mirrored=true — каноничный партийный вариант с молотом справа.
 */
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
  return (
    <svg
      className="pixel-art"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {badge && (
        <>
          <rect x="1" y="1" width="30" height="30" fill="#711713" stroke={GOLD} strokeWidth="2" />
          <rect x="4" y="4" width="24" height="24" fill="none" stroke="#3f0c0a" strokeWidth="1" />
        </>
      )}
      <g transform={mirrored ? "translate(32 0) scale(-1 1)" : undefined} fill={GOLD}>
        {/* серп — ступенчатая дуга */}
        <path d="M20 5h4v2h2v3h2v7h-2v4h-3v3h-4v2h-7v-2H8v-3H6v-4h3v3h3v2h6v-2h3v-3h2v-6h-2V8h-1z" />
        {/* молот */}
        <path d="M6 6h9v3h-2l13 13-4 4L9 12v2H6z" />
        <rect x="4" y="5" width="5" height="6" />
      </g>
    </svg>
  );
}

export function CountryEmblem({
  country,
  size = 48,
  fake,
}: {
  country: Country;
  size?: number;
  fake?: "orb2";
}) {
  if (country.emblem === "atom") {
    return <AtomEmblem size={size} color={GOLD} orbits={fake === "orb2" ? 2 : 3} badge />;
  }

  return (
    <svg
      className="pixel-art"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="30" height="30" fill={country.color} stroke="#120e0b" strokeWidth="2" />
      <rect x="4" y="4" width="24" height="24" fill="none" stroke="#ffffff22" strokeWidth="1" />

      {country.emblem === "star" && (
        <polygon points="16,5 19,12 27,12 21,17 23,26 16,21 9,26 11,17 5,12 13,12" fill={GOLD} />
      )}

      {country.emblem === "wings" && (
        <g stroke={GOLD} fill="none" strokeWidth="2">
          <polygon points="16,5 22,16 16,27 10,16" />
          <path d="M10 11H4v3h6M10 17H3v3h7M22 11h6v3h-6M22 17h7v3h-7" />
        </g>
      )}

      {country.emblem === "gear" && (
        <g fill={GOLD}>
          <rect x="13" y="5" width="6" height="22" />
          <rect x="5" y="13" width="22" height="6" />
          <rect x="8" y="8" width="16" height="16" />
          <rect x="12" y="12" width="8" height="8" fill={country.color} />
        </g>
      )}

      {country.emblem === "wheat" && (
        <g fill={GOLD}>
          <rect x="15" y="6" width="3" height="22" />
          <rect x="9" y="8" width="6" height="3" />
          <rect x="18" y="11" width="6" height="3" />
          <rect x="8" y="15" width="7" height="3" />
          <rect x="18" y="18" width="7" height="3" />
          <rect x="10" y="22" width="5" height="3" />
        </g>
      )}
    </svg>
  );
}
