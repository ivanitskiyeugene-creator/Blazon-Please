import type { PersonSpec } from "../game/types";

const SKINS = ["#b88f70", "#9e7454", "#815238"];
const SKIN_DARK = ["#8d674d", "#785139", "#643d2a"];
const HAIRS = ["#17120f", "#625b54", "#8a6a3d"];
const COATS = ["#332c27", "#29362f", "#3a2828", "#27313b", "#4a3c28", "#2c251f"];

export function Person({
  spec,
  width = 150,
  gray = false,
  className = "",
}: {
  spec: PersonSpec;
  width?: number;
  gray?: boolean;
  className?: string;
}) {
  const skin = SKINS[spec.skin % SKINS.length];
  const skinDark = SKIN_DARK[spec.skin % SKINS.length];
  const hair = HAIRS[spec.hairTone % HAIRS.length];
  const coat = COATS[spec.coat % COATS.length];
  const ink = "#1c1712";

  return (
    <svg
      width={width}
      height={(width * 150) / 120}
      viewBox="0 0 120 150"
      shapeRendering="crispEdges"
      className={className}
      style={gray ? { filter: "grayscale(1) contrast(1.15) brightness(0.92)" } : undefined}
    >
      {/* body / coat */}
      <polygon points="14,150 24,96 42,84 78,84 96,96 106,150" fill={coat} />
      <polygon points="78,84 96,96 106,150 60,150 60,84" fill="rgba(0,0,0,0.18)" />
      {/* lapels */}
      <polygon points="52,84 60,96 48,102" fill="rgba(0,0,0,0.4)" />
      <polygon points="68,84 60,96 72,102" fill="rgba(0,0,0,0.55)" />
      {/* buttons */}
      <rect x="58" y="108" width="4" height="4" fill="rgba(216,201,168,0.5)" />
      <rect x="58" y="124" width="4" height="4" fill="rgba(216,201,168,0.5)" />

      {/* neck */}
      <rect x="53" y="70" width="14" height="16" fill={skinDark} />

      {/* head */}
      <rect x="42" y="28" width="36" height="42" fill={skin} />
      <rect x="66" y="28" width="12" height="42" fill="rgba(0,0,0,0.10)" />
      {/* ears */}
      <rect x="38" y="44" width="5" height="9" fill={skin} />
      <rect x="77" y="44" width="5" height="9" fill={skin} />

      {/* eyes */}
      <rect x="49" y="46" width="5" height="5" fill={ink} />
      <rect x="66" y="46" width="5" height="5" fill={ink} />
      {/* brows */}
      <rect x="48" y="41" width="8" height="2.5" fill={hair} />
      <rect x="64" y="41" width="8" height="2.5" fill={hair} />
      {/* nose */}
      <rect x="58" y="50" width="4" height="7" fill={skinDark} />
      {/* mouth */}
      <rect x="53" y="62" width="13" height="2.5" fill={skinDark} />

      {/* hair */}
      {spec.hairStyle === "flat" && <rect x="40" y="22" width="40" height="10" fill={hair} />}
      {spec.hairStyle === "side" && (
        <g fill={hair}>
          <rect x="40" y="22" width="40" height="9" />
          <rect x="40" y="28" width="9" height="14" />
        </g>
      )}
      {spec.hairStyle === "mop" && (
        <g fill={hair}>
          <rect x="38" y="20" width="44" height="12" />
          <rect x="38" y="30" width="7" height="16" />
          <rect x="75" y="30" width="7" height="16" />
        </g>
      )}
      {spec.hairStyle === "bun" && (
        <g fill={hair}>
          <rect x="40" y="21" width="40" height="11" />
          <rect x="40" y="30" width="6" height="20" />
          <rect x="74" y="30" width="6" height="20" />
          <rect x="54" y="14" width="12" height="9" />
        </g>
      )}
      {spec.hairStyle === "bald" && <rect x="40" y="34" width="5" height="14" fill={hair} />}
      {spec.hairStyle === "cap" && (
        <g>
          <rect x="39" y="18" width="42" height="12" fill="#3a3129" />
          <rect x="42" y="30" width="30" height="5" fill="#2c251f" />
        </g>
      )}
      {spec.hairStyle === "ushanka" && (
        <g>
          <rect x="37" y="12" width="46" height="15" fill="#5d5245" />
          <rect x="37" y="12" width="46" height="5" fill="#6e6252" />
          <rect x="37" y="24" width="9" height="26" fill="#5d5245" />
          <rect x="74" y="24" width="9" height="26" fill="#5d5245" />
          <rect x="57" y="16" width="6" height="6" fill="#8f211d" />
        </g>
      )}

      {/* facial */}
      {(spec.facial === "mustache" || spec.facial === "glassesMustache") && (
        <rect x="52" y="58" width="16" height="4.5" fill={hair} />
      )}
      {spec.facial === "beard" && (
        <g fill={hair}>
          <rect x="44" y="60" width="32" height="11" />
          <rect x="44" y="46" width="5" height="18" />
          <rect x="71" y="46" width="5" height="18" />
          <rect x="52" y="61.5" width="16" height="2.5" fill={skinDark} />
        </g>
      )}
      {(spec.facial === "glasses" || spec.facial === "glassesMustache") && (
        <g stroke={ink} strokeWidth="2" fill="none">
          <rect x="45" y="43" width="13" height="10" />
          <rect x="62" y="43" width="13" height="10" />
          <path d="M58 47h4M45 46h-5M75 46h5" />
        </g>
      )}

      {/* красный шарф */}
      {spec.redScarf && (
        <g>
          <polygon points="38,84 82,84 78,94 42,94" fill="#a12622" />
          <polygon points="52,94 64,94 60,120 50,118" fill="#8c1f1c" />
        </g>
      )}
    </svg>
  );
}
