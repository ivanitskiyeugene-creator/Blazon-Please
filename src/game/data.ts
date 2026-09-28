import { getDict, type Lang } from "../i18n";
import type { Country, CountryCode, DayConfig } from "./types";

/** Визуальная часть стран: тексты берутся из словаря (см. i18n). */
export const COUNTRIES: Record<CountryCode, Country> = {
  ASSR: { code: "ASSR", name: "", short: "", emblem: "atom", color: "#8f2320" },
  KRS: { code: "KRS", name: "", short: "", emblem: "star", color: "#6e2a2a" },
  ZPS: { code: "ZPS", name: "", short: "", emblem: "wings", color: "#2e3450" },
  UGS: { code: "UGS", name: "", short: "", emblem: "gear", color: "#33302e" },
  STV: { code: "STV", name: "", short: "", emblem: "wheat", color: "#5a4a2c" },
};

/** Страна с локализованными названиями. */
export function country(code: CountryCode, lang: Lang): Country {
  const base = COUNTRIES[code];
  const d = getDict(lang);
  return { ...base, name: d.countries[code].name, short: d.countries[code].short };
}

export const PER_PAY = 5;
export const ERROR_FINE = 3;
export const START_CREDITS = 25;
export const DETAIN_BONUS = 8;
export const EVIDENCE_BONUS = 2;

const DATE_SHORT = ["12.10.51", "13.10.51", "14.10.51", "15.10.51", "16.10.51", "17.10.51"];
const COUNT = [7, 8, 9, 9, 10, 10];
const VIOLATIONS: DayConfig["violations"][] = [
  ["foreignNoPermit"],
  ["foreignNoPermit", "passportExpired", "permitExpired", "nameMismatch"],
  ["foreignNoPermit", "passportExpired", "permitExpired", "nameMismatch", "idMismatch", "westBanned", "fakeAtom"],
  ["foreignNoPermit", "passportExpired", "permitExpired", "nameMismatch", "idMismatch", "westBanned", "fakeAtom", "fakeParty", "photoMismatch"],
  ["foreignNoPermit", "passportExpired", "permitExpired", "nameMismatch", "idMismatch", "westBanned", "fakeAtom", "fakeParty", "photoMismatch", "sexMismatch"],
  ["foreignNoPermit", "passportExpired", "permitExpired", "nameMismatch", "idMismatch", "westBanned", "fakeAtom", "fakeParty", "photoMismatch", "sexMismatch"],
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
      amount: e.id === "food" ? 8 : e.id === "heat" ? 4 : 6,
    })),
    count: COUNT[i],
    violations: VIOLATIONS[i],
  }));
}
