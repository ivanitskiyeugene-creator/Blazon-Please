import { getDict, type Lang } from "../i18n";
import type { Country, CountryCode, DayConfig } from "./types";

/**
 * Государства, способные выдать отдельный паспорт в октябре 1951 года.
 * Аргестан, Гартелия, Горностан, Балтелия и Остоляндия входят в АССР и
 * потому представлены только единым паспортом ASSR. Ондар в состав АССР НЕ
 * входит (его нет среди союзных республик в статье АССР), поэтому это
 * суверенное иностранное государство со своим паспортом и гербом.
 */
export const PASSPORT_ISSUERS = ["ASSR", "KRS", "UGS", "STV", "VIC", "ZPS", "OND"] as const satisfies readonly CountryCode[];
export const FOREIGN_PASSPORT_ISSUERS = PASSPORT_ISSUERS.filter((code) => code !== "ASSR");

/** Визуальная часть стран: тексты берутся из словаря (см. i18n). */
export const COUNTRIES: Record<CountryCode, Country> = {
  ASSR: { code: "ASSR", name: "", short: "", emblem: "atom", color: "#8f2320" },
  KRS: { code: "KRS", name: "", short: "", emblem: "star", color: "#6e2a2a" },
  ZPS: { code: "ZPS", name: "", short: "", emblem: "otep_eagle", color: "#2b1919" },
  UGS: { code: "UGS", name: "", short: "", emblem: "gear", color: "#33302e" },
  STV: { code: "STV", name: "", short: "", emblem: "wheat", color: "#5a4a2c" },
  VIC: { code: "VIC", name: "", short: "", emblem: "vic_eagle", color: "#132846" },
  OND: { code: "OND", name: "", short: "", emblem: "ond_sun", color: "#1a3b23" },
};

/** Страна с локализованными названиями. */
export function country(code: CountryCode, lang: Lang): Country {
  const base = COUNTRIES[code] ?? COUNTRIES.ASSR;
  const d = getDict(lang);
  const info = d.countries[code] ?? { name: code, short: code };
  return { ...base, name: info.name, short: info.short };
}

export const PER_PAY = 2;
export const ERROR_FINE = 3;
export const START_CREDITS = 25;
export const DETAIN_BONUS = 4;
export const EVIDENCE_BONUS = 1;
/** Сколько первых протоколов за смену — предупреждение без штрафа. */
export const FREE_CITATIONS = 2;

const DATE_SHORT = ["12.10.51", "13.10.51", "14.10.51", "15.10.51", "16.10.51", "17.10.51"];
const COUNT = [7, 8, 9, 10, 11, 12];
const VIOLATIONS: DayConfig["violations"][] = [
  ["foreignNoPermit"],
  ["foreignNoPermit", "passportExpired", "permitExpired", "nameMismatch"],
  [
    "foreignNoPermit",
    "passportExpired",
    "permitExpired",
    "nameMismatch",
    "idMismatch",
    "westBanned",
    "fakeAtom",
    "talonExpired",
    "talonIdMismatch",
  ],
  [
    "foreignNoPermit",
    "passportExpired",
    "permitExpired",
    "nameMismatch",
    "idMismatch",
    "westBanned",
    "fakeAtom",
    "fakeParty",
    "fakeEmblem",
    "talonExpired",
    "talonIdMismatch",
    "talonForged",
    "photoMismatch",
  ],
  [
    "foreignNoPermit",
    "passportExpired",
    "permitExpired",
    "nameMismatch",
    "idMismatch",
    "westBanned",
    "fakeAtom",
    "fakeParty",
    "fakeEmblem",
    "talonExpired",
    "talonIdMismatch",
    "talonForged",
    "contrabandCargo",
    "veteranForged",
    "photoMismatch",
    "sexMismatch",
  ],
  [
    "foreignNoPermit",
    "passportExpired",
    "permitExpired",
    "nameMismatch",
    "idMismatch",
    "westBanned",
    "fakeAtom",
    "fakeParty",
    "fakeEmblem",
    "talonExpired",
    "talonIdMismatch",
    "talonForged",
    "contrabandCargo",
    "veteranForged",
    "photoMismatch",
    "sexMismatch",
  ],
];

/** Полные конфиги дней с текстами на выбранном языке. */
export function getDays(lang: Lang): DayConfig[] {
  const d = getDict(lang);
  return d.days.map((day, i) => ({
    n: i + 1,
    date: day.date,
    dateShort: DATE_SHORT[i],
    headline: day.headline,
    subline: day.subline,
    body: day.body,
    rules: day.rules.map((r) => ({
      key: r.key,
      text: d.rules[r.key as keyof typeof d.rules] ?? r.key,
      isNew: r.isNew,
    })),
    expenses: day.expenses.map((e) => ({
      id: e.id,
      label: e.label,
      amount: e.id === "food" ? 6 : e.id === "heat" ? 3 : 4,
    })),
    count: COUNT[i],
    violations: VIOLATIONS[i],
  }));
}
