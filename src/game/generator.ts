import { getDict, type Lang } from "../i18n";
import type {
  CountryCode,
  DayConfig,
  EntrantSpec,
  FakeEmblemKind,
  FieldKey,
  PersonSpec,
  RareEventKind,
  Sex,
  TalonData,
  VeteranData,
  ViolationKind,
} from "./types";

// ---------- seeded RNG (mulberry32) ----------
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type R = () => number;
const pick = <T,>(r: R, arr: T[]): T => arr[Math.floor(r() * arr.length)];
const int = (r: R, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
const chance = (r: R, p: number) => r() < p;
const pad = (n: number) => String(n).padStart(2, "0");

// ---------- даты ----------
/** dayN 1..6 → 12..17 октября 51 */
const todayOf = (dayN: number) => ({ d: 11 + dayN, m: 10, y: 51 });
const fmt = (d: number, m: number, y: number) => `${pad(d)}.${pad(m)}.${pad(y)}`;

function futureDate(r: R, dayN: number) {
  const t = todayOf(dayN);
  const addM = int(r, 1, 13);
  const m = ((t.m - 1 + addM) % 12) + 1;
  const y = t.y + Math.floor((t.m - 1 + addM) / 12);
  return fmt(int(r, 1, 28), m, y);
}
function pastDate(r: R, dayN: number) {
  const t = todayOf(dayN);
  const subM = int(r, 0, 9);
  let m = t.m - subM;
  let y = t.y;
  if (m <= 0) {
    m += 12;
    y -= 1;
  }
  const maxD = m === t.m && y === t.y ? Math.max(1, t.d - 1) : 28;
  return fmt(int(r, 1, maxD), m, y);
}
function birthDate(r: R) {
  return fmt(int(r, 1, 28), int(r, 1, 12), int(r, 0, 33));
}

// ---------- внешность ----------
const HAIR_M: PersonSpec["hairStyle"][] = ["flat", "side", "mop", "bald", "cap", "ushanka"];
const HAIR_F: PersonSpec["hairStyle"][] = ["bun", "mop", "side", "ushanka"];
const FACIAL_M: PersonSpec["facial"][] = ["none", "mustache", "beard", "glasses", "glassesMustache"];
const FACIAL_F: PersonSpec["facial"][] = ["none", "none", "glasses"];

function makePerson(r: R, sex: Sex): PersonSpec {
  const female = sex === "F";
  return {
    skin: int(r, 0, 2),
    hairStyle: female ? pick(r, HAIR_F) : pick(r, HAIR_M),
    hairTone: int(r, 0, 2),
    facial: female ? pick(r, FACIAL_F) : pick(r, FACIAL_M),
    coat: int(r, 0, 5),
    female,
  };
}
/** заметно другое лицо — для самозванцев */
function altPerson(r: R, base: PersonSpec, sex: Sex): PersonSpec {
  let p = makePerson(r, sex);
  let guard = 0;
  while (guard++ < 12 && p.hairStyle === base.hairStyle && p.facial === base.facial) {
    p = makePerson(r, sex);
  }
  return p;
}

function makeName(r: R, country: CountryCode, sex: Sex, lang: Lang) {
  const pool = getDict(lang).names[country] ?? getDict(lang).names.ASSR;
  const first = sex === "M" ? pick(r, pool.m) : pick(r, pool.f);
  let last = pick(r, pool.last);
  if (sex === "F" && pool.slavic) {
    if (lang === "ru") {
      if (last.endsWith("ИЙ") || last.endsWith("ЫЙ") || last.endsWith("ОЙ")) last = last.slice(0, -2) + "АЯ";
      else if (!last.endsWith("А") && !last.endsWith("Я")) last = last + "А";
    } else {
      if (last.endsWith("OV") || last.endsWith("EV") || last.endsWith("IN")) last = last + "A";
      else if (last.endsWith("OY")) last = last.slice(0, -2) + "AYA";
      else if (!last.endsWith("A")) last = last + "A";
    }
  }
  return `${first} ${last}`;
}

const DETAINABLE: ViolationKind[] = [
  "fakeAtom",
  "fakeParty",
  "fakeEmblem",
  "talonForged",
  "acpsBanned",
  "veteranForged",
  "photoMismatch",
  "sexMismatch",
];

function mutateName(r: R, name: string, lang: Lang) {
  const [first, last] = name.split(" ");
  if (chance(r, 0.5) && last) {
    const i = int(r, 0, Math.max(0, last.length - 2));
    const letters = getDict(lang).mutate.letters;
    return `${first} ${last.slice(0, i)}${pick(r, letters.split(""))}${last.slice(i + 1)}`;
  }
  return `${first.slice(0, Math.max(3, first.length - 1))} ${last ?? ""}`.trim();
}

function mutateId(r: R, id: string) {
  const arr = id.split("");
  const i = int(r, 0, arr.length - 1);
  const j = i === arr.length - 1 ? i - 1 : i + 1;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  const out = arr.join("");
  return out === id ? id.slice(0, -1) + String((Number(id.slice(-1)) + 3) % 10) : out;
}

// ---------- генерация одного посетителя ----------
export function makeEntrant(r: R, day: DayConfig, lang: Lang, forceClean = false): EntrantSpec {
  const dayN = day.n;
  const D = getDict(lang);

  // пул стран
  const foreignPool: CountryCode[] =
    dayN >= 4
      ? ["KRS", "UGS", "STV", "VIC", "OND", "BLT", "ZPS"]
      : dayN >= 2
      ? ["KRS", "UGS", "STV", "ZPS"]
      : ["KRS", "UGS", "ZPS"];

  const isLocal = chance(r, 0.4);
  const country: CountryCode = isLocal ? "ASSR" : pick(r, foreignPool);
  const sex: Sex = chance(r, 0.45) ? "F" : "M";
  const person = makePerson(r, sex);
  const name = makeName(r, country, sex, lang);
  const id = String(int(r, 100000, 999999));

  // выбор нарушения
  const pool = day.violations.filter((v) => {
    if (country === "ASSR") {
      return ![
        "foreignNoPermit",
        "permitExpired",
        "nameMismatch",
        "idMismatch",
        "westBanned",
        "fakeEmblem",
      ].includes(v);
    }
    if (country === "ZPS") return v !== "fakeParty" && v !== "fakeAtom" && v !== "veteranForged";
    return v !== "fakeAtom" && v !== "fakeParty" && v !== "veteranForged";
  });

  const wantViolation = !forceClean && chance(r, 0.5) && pool.length > 0;
  let violation: ViolationKind | null = wantViolation ? pick(r, pool) : null;

  // Отеплия (ZPS) после дня 3 — всегда невъездной по директиве
  if (country === "ZPS" && day.violations.includes("westBanned")) violation = "westBanned";
  if (country !== "ASSR" && !day.violations.includes("foreignNoPermit") && violation === null) violation = null;

  const mismatch: [FieldKey, FieldKey][] = [];
  let expiry = futureDate(r, dayN);
  let fake: FakeEmblemKind | undefined;
  let photo: PersonSpec | undefined;
  let passSex = sex;

  // Разрешение иностранцам
  const permitsAllowed = day.violations.includes("permitExpired") || dayN >= 2;
  let permit:
    | { name: string; passId: string; purpose: string; duration: string; expiry: string }
    | undefined;
  if (country !== "ASSR" && permitsAllowed && violation !== "foreignNoPermit") {
    permit = {
      name,
      passId: id,
      purpose: pick(r, D.purposes),
      duration: pick(r, D.durations),
      expiry: futureDate(r, dayN),
    };
  }

  // Карточка КПТА — со дня 4 у граждан АССР
  let partyCard: { name: string; rank: string; mirrored: boolean } | undefined;
  if (country === "ASSR" && (violation === "fakeParty" || (dayN >= 4 && chance(r, 0.25)))) {
    partyCard = { name, rank: pick(r, D.ranks), mirrored: true };
  }

  // Талоны (Транзитный / Пайковый / ACPS) со дня 3+
  let talon: TalonData | undefined;
  const wantTalon =
    violation === "talonExpired" ||
    violation === "talonIdMismatch" ||
    violation === "talonForged" ||
    violation === "acpsBanned" ||
    (dayN >= 3 && chance(r, 0.35));

  if (wantTalon) {
    const isAcps = violation === "acpsBanned" || (country === "VIC" || country === "ZPS" || country === "UGS");
    const kind = isAcps ? "acps" : country === "ASSR" ? "ration" : "transit";
    const prefix = kind === "acps" ? "ACPS-" : kind === "ration" ? "PK-" : "TR-";
    const talonCode = `${prefix}${int(r, 10000, 99999)}`;
    const talonPurposes =
      kind === "acps"
        ? D.talons.purposesAcps
        : kind === "ration"
        ? D.talons.purposesRation
        : D.talons.purposesTransit;

    talon = {
      kind,
      code: talonCode,
      name,
      passId: id,
      purpose: pick(r, talonPurposes),
      expiry: futureDate(r, dayN),
      sealValid: true,
      quota: kind === "ration" ? `${int(r, 15, 50)} кг / месяц` : undefined,
    };
  }

  // Ветеранское удостоверение ВАВ 1938-1947 со дня 5+
  let veteran: VeteranData | undefined;
  if (country === "ASSR" && (violation === "veteranForged" || (dayN >= 5 && chance(r, 0.2)))) {
    veteran = {
      name,
      rank: pick(r, D.veterans.ranks),
      unit: pick(r, D.veterans.units),
      serviceYears: "1938–1947 (ВАВ)",
      medal: pick(r, D.veterans.medals),
      sealValid: true,
    };
  }

  // Подделка гербов чужих стран
  if (violation === "fakeEmblem") {
    switch (country) {
      case "UGS":
        fake = "gorn_left";
        mismatch.push(["p.emblem", "ref.emblem_ugs"]);
        break;
      case "STV":
        fake = "osto_left";
        mismatch.push(["p.emblem", "ref.emblem_stv"]);
        break;
      case "VIC":
        fake = "vic_5star";
        mismatch.push(["p.emblem", "ref.emblem_vic"]);
        break;
      case "OND":
        fake = "ond_5ray";
        mismatch.push(["p.emblem", "ref.emblem_ond"]);
        break;
      case "BLT":
        fake = "blt_1beam";
        mismatch.push(["p.emblem", "ref.emblem_blt"]);
        break;
      case "ZPS":
        fake = "otep_sword_left";
        mismatch.push(["p.emblem", "ref.emblem_zps"]);
        break;
      default:
        fake = "orb2";
        mismatch.push(["p.emblem", "ref.atom"]);
        break;
    }
  }

  switch (violation) {
    case "foreignNoPermit":
      permit = undefined;
      mismatch.push(["p.country", dayN >= 2 ? "rule.r2" : "rule.r2x"]);
      break;
    case "passportExpired":
      expiry = pastDate(r, dayN);
      mismatch.push(["p.expiry", "cal.today"]);
      break;
    case "permitExpired":
      if (permit) {
        permit.expiry = pastDate(r, dayN);
        mismatch.push(["w.expiry", "cal.today"]);
      }
      break;
    case "nameMismatch":
      if (permit) {
        permit.name = mutateName(r, name, lang);
        mismatch.push(["p.name", "w.name"]);
      }
      break;
    case "idMismatch":
      if (permit) {
        permit.passId = mutateId(r, id);
        mismatch.push(["p.id", "w.passId"]);
      }
      break;
    case "westBanned":
      mismatch.push(["p.country", "rule.r4"]);
      break;
    case "fakeAtom":
      fake = "orb2";
      mismatch.push(["p.emblem", "ref.atom"]);
      break;
    case "fakeParty":
      partyCard = { name, rank: pick(r, D.ranks), mirrored: false };
      mismatch.push(["c.emblem", "ref.party"]);
      break;
    case "talonExpired":
      if (talon) {
        talon.expiry = pastDate(r, dayN);
        mismatch.push(["t.expiry", "cal.today"]);
      }
      break;
    case "talonIdMismatch":
      if (talon) {
        talon.passId = mutateId(r, id);
        mismatch.push(["t.passId", "p.id"]);
      }
      break;
    case "talonForged":
      if (talon) {
        talon.sealValid = false;
        mismatch.push(["t.seal", "rule.rTalon"]);
      }
      break;
    case "acpsBanned":
      if (talon) {
        talon.purpose = D.talons.bannedAcpsPurpose;
        mismatch.push(["t.purpose", "rule.rAcps"]);
      }
      break;
    case "veteranForged":
      if (veteran) {
        veteran.sealValid = false;
        mismatch.push(["v.seal", "ref.atom"]);
      }
      break;
    case "photoMismatch":
      photo = altPerson(r, person, sex);
      mismatch.push(["p.photo", "face"]);
      break;
    case "sexMismatch":
      passSex = sex === "M" ? "F" : "M";
      photo = altPerson(r, person, passSex);
      mismatch.push(["p.photo", "face"], ["p.sex", "face"]);
      break;
  }

  const detainable = violation !== null && DETAINABLE.includes(violation);
  const expected = violation ? "DENY" : "ADMIT";

  // Редкое событие
  let rareEvent: RareEventKind | undefined;
  if (!forceClean && chance(r, 0.08)) {
    if (permit && violation === null) {
      rareEvent = "forgot_permit";
    } else if (violation === null && chance(r, 0.5)) {
      rareEvent = "nervous";
    } else if (violation === null) {
      rareEvent = "dual_passport";
    }
  }

  const dialogue = rareEvent ? D.rare[rareEvent] : pick(r, D.smalltalk);

  return {
    person,
    dialogue,
    interrogate: pick(r, D.probes),
    passport: { country, name, sex: passSex, dob: birthDate(r), expiry, id, fake },
    permit,
    partyCard,
    talon,
    veteran,
    photo,
    detainable,
    expected,
    cite: violation ? D.violations.cite[violation] : D.violations.cleanCite,
    mismatch,
    caught: violation ? pick(r, D.violations.caught[violation]) : undefined,
    rareEvent,
  };
}

/** очередь дня: обычные посетители + сюжетные агенты на своих местах */
export function buildDay(
  seed: number,
  day: DayConfig,
  storyVisits: { at: number; entrant: EntrantSpec }[],
  lang: Lang
): EntrantSpec[] {
  const r = rng(seed * 7919 + day.n * 104729);
  const list: EntrantSpec[] = [];
  for (let k = 0; k < day.count; k++) {
    list.push(makeEntrant(r, day, lang, k === 0));
  }
  [...storyVisits]
    .sort((a, b) => a.at - b.at)
    .forEach((v) => {
      const idx = Math.min(Math.max(1, v.at), list.length);
      list.splice(idx, 0, v.entrant);
    });
  return list;
}
