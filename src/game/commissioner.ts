import type { EntrantSpec, Flags } from "./types";
import { getDict, type Lang } from "../i18n";

export function createCommissionerEntrant(lang: Lang, suspicious = true): EntrantSpec {
  const C = getDict(lang).commissioner;
  return {
    person: { skin: 0, hairStyle: "cap", hairTone: 2, facial: "mustache", coat: 5, redScarf: true },
    dialogue: C.dialogue,
    passport: { country: "ASSR", name: C.name, sex: "M", dob: "07.11.12", issued: "01.01.50", expiry: "01.01.60", id: "000007" },
    expected: "ADMIT", cite: C.cite, mismatch: [], special: "commissioner",
    agentOffer: suspicious ? { prompt: C.prompt, options: [
      { ...C.options[0], loyal: 2, commissionerScore: 2 },
      { ...C.options[1], loyal: -1, commissionerScore: -1 },
      { ...C.options[2], loyal: -2, commissionerScore: -2 },
    ] } : undefined,
  };
}

export function commissionerVisit(day: number, flags: Flags, lang: Lang, seed = 0): { at: number; entrant: EntrantSpec } | null {
  const mandatory = day === 3 || day === 5;
  const suspicious = flags.bribe || flags.westTrust >= 3;
  // Дополнительные визиты воспроизводимы для сохранения, но проходят как шанс 55%.
  const roll = ((seed * 9301 + day * 49297 + flags.westTrust * 233 + (flags.bribe ? 71 : 0)) % 233280) / 233280;
  const randomVisit = suspicious && roll < 0.55;
  if (!mandatory && !randomVisit) return null;
  return { at: day === 3 ? 2 : 3, entrant: createCommissionerEntrant(lang, suspicious) };
}
