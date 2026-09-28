import { getDict, type Lang } from "../i18n";
import type { EntrantSpec, Flags, PersonSpec } from "./types";

// ---------------- ПОСТОЯННЫЕ ГОСТИ ----------------
export const WEST_AGENT = {
  id: "500141",
  country: "ZPS" as const,
  person: { skin: 0, hairStyle: "side", hairTone: 2, facial: "glasses", coat: 3 } as PersonSpec,
};

export const NEIGHBOR_AGENT = {
  id: "400227",
  country: "KRS" as const,
  person: { skin: 1, hairStyle: "ushanka", hairTone: 1, facial: "mustache", coat: 4 } as PersonSpec,
};

// ---------------- ПОСТРОЕНИЕ ВИЗИТА ----------------
export function agentEntrants(dayN: number, flags: Flags, dateShort: string, lang: Lang): { at: number; entrant: EntrantSpec }[] {
  const D = getDict(lang);
  const yy = dateShort.slice(-2);
  return D.story.visits
    .filter((v) => v.day === dayN)
    .filter((v) => {
      // финальные визиты — только если агент хоть немного «свой»
      if (v.day === 6 && v.agent === "west") return flags.westTrust >= 1;
      if (v.day === 6 && v.agent === "neighbor") return flags.neighborTrust >= 1;
      return true;
    })
    .map((v) => {
      const west = v.agent === "west";
      const a = west ? WEST_AGENT : NEIGHBOR_AGENT;
      const name = west ? D.story.westName : D.story.neighborName;
      const entrant: EntrantSpec = {
        person: a.person,
        dialogue: v.dialogue,
        interrogate: v.interrogate,
        passport: {
          country: a.country,
          name,
          sex: "M",
          dob: west ? "03.04.14" : "19.08.09",
          expiry: `28.12.${yy}`,
          id: a.id,
        },
        permit: {
          name,
          passId: a.id,
          purpose: D.story.purpose,
          duration: D.story.duration,
          expiry: `30.09.${Number(yy) + 1}`,
        },
        // западный агент после дня 3 формально невъездной — моральная дилемма
        expected: west && dayN >= 3 ? "DENY" : "ADMIT",
        cite: west && dayN >= 3 ? D.story.cites.westBanned : D.story.cites.clean,
        mismatch: west && dayN >= 3 ? [["p.country", "rule.r4"]] : [],
        caught: west ? D.story.caught.west : D.story.caught.neighbor,
        detainable: false,
        agent: v.agent,
        agentOffer: { prompt: v.prompt, options: v.options },
        reactAdmit: west ? D.story.reacts.westAdmit : D.story.reacts.neighborAdmit,
        reactDeny: west ? D.story.reacts.westDeny : D.story.reacts.neighborDeny,
      };
      return { at: v.at, entrant };
    });
}

// ---------------- КОНЦОВКИ ----------------
export interface Ending {
  key: "loyal" | "west" | "neighbor" | "suspect" | "shift";
  title: string;
  tone: string;
  lines: string[];
}

const TONES: Record<Ending["key"], string> = {
  loyal: "#e8c34a",
  west: "#c33a2b",
  neighbor: "#7f9059",
  suspect: "#b98f2e",
  shift: "#d8c9a8",
};

export function pickEnding(flags: Flags, totals: { errors: number; correct: number }, lang: Lang): Ending {
  const d = getDict(lang);
  let key: Ending["key"];
  if (flags.finalChoice === "west") key = "west";
  else if (flags.finalChoice === "neighbor") key = "neighbor";
  else if (flags.westTrust >= 4 || flags.bribe) key = "suspect";
  else if (totals.errors <= 6) key = "loyal";
  else key = "shift";
  const e = d.endings[key];
  return { key, title: e.title, tone: TONES[key], lines: e.lines };
}
