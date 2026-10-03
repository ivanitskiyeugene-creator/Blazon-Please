import { getDict, type Lang } from "../i18n";
import type {
  CountryCode,
  DayConfig,
  EntrantSpec,
  FieldKey,
  PersonSpec,
  RareEventKind,
  Sex,
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
const HAIR_M: PersonSpec["hairStyle"][] = ["flat", "side", "mop", "bald", "cap", "ushanka", "crew", "wave"];
const HAIR_F: PersonSpec["hairStyle"][] = ["bun", "mop", "side", "ushanka", "braids", "wave", "scarf"];
const FACIAL_M: PersonSpec["facial"][] = ["none", "mustache", "beard", "glasses", "glassesMustache", "scar", "eyepatch"];
const FACIAL_F: PersonSpec["facial"][] = ["none", "none", "glasses", "scar"];

function makePerson(r: R, sex: Sex): PersonSpec {
  const female = sex === "F";
  return {
    skin: int(r, 0, 4),
    hairStyle: female ? pick(r, HAIR_F) : pick(r, HAIR_M),
    hairTone: int(r, 0, 2),
    facial: female ? pick(r, FACIAL_F) : pick(r, FACIAL_M),
    coat: int(r, 0, 7),
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
  const dict = getDict(lang);
  const base = dict.names[country];
  const extra = dict.extraNames[country];
  const pool = { ...base, m: [...base.m, ...extra.m], f: [...base.f, ...extra.f], last: [...base.last, ...extra.last] };
  const first = sex === "M" ? pick(r, pool.m) : pick(r, pool.f);
  let last = pick(r, pool.last);
  if (sex === "F" && pool.slavic) {
    if (lang === "ru") {
      if (last.endsWith("ИЙ") || last.endsWith("ЫЙ") || last.endsWith("ОЙ")) last = last.slice(0, -2) + "АЯ";
      else if (!last.endsWith("А") && !last.endsWith("Я")) last = last + "А";
    } else {
      // латиница: SIDOROV → SIDOROVA, STEPOVOY → STEPOVAYA, KOZAK → KOZAKA
      if (last.endsWith("OV") || last.endsWith("EV") || last.endsWith("IN")) last = last + "A";
      else if (last.endsWith("OY")) last = last.slice(0, -2) + "AYA";
      else if (!last.endsWith("A")) last = last + "A";
    }
  }
  return `${first} ${last}`;
}

const DETAINABLE: ViolationKind[] = ["fakeAtom", "fakeParty", "photoMismatch", "sexMismatch", "blockedEmployer", "forbiddenCargo"];

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

  // страна
  const foreignPool: CountryCode[] = ["KRS", "UGS", "STV", "ZPS"];
  const isLocal = chance(r, 0.45);
  const country: CountryCode = isLocal ? "ASSR" : pick(r, foreignPool);
  const sex: Sex = chance(r, 0.45) ? "F" : "M";
  const person = makePerson(r, sex);
  const name = makeName(r, country, sex, lang);
  const id = String(int(r, 100000, 999999));

  // нарушение
  const pool = day.violations.filter((v) => {
    const employmentViolation = v === "employmentExpired" || v === "blockedEmployer" || v === "invalidWorkSeal";
    const transitViolation = v === "forbiddenCargo" || v === "closedDestination" || v === "invalidCustomsSeal" || v === "routeMismatch";
    if (country === "ASSR") return !["foreignNoPermit", "permitExpired", "nameMismatch", "idMismatch", "westBanned", "forbiddenCargo", "closedDestination"].includes(v);
    if (employmentViolation) return false;
    if (country === "ZPS") return v !== "fakeParty" && v !== "fakeAtom";
    return v !== "fakeAtom" && v !== "fakeParty" && (!transitViolation || dayN >= 4);
  });
  const wantViolation = !forceClean && chance(r, 0.48) && pool.length > 0;
  let violation: ViolationKind | null = wantViolation ? pick(r, pool) : null;

  // ЗПС после дня 3 — всегда нарушитель по определению
  if (country === "ZPS" && day.violations.includes("westBanned")) violation = "westBanned";
  if (country !== "ASSR" && !day.violations.includes("foreignNoPermit") && violation === null) violation = null;

  const mismatch: [FieldKey, FieldKey][] = [];
  let expiry = futureDate(r, dayN);
  let dob = birthDate(r);
  let passportIssued = pastDate(r, dayN);
  let fake: "orb2" | undefined;
  let photo: PersonSpec | undefined;
  let passSex = sex;

  // разрешение нужно иностранцам со дня 2
  const permitsAllowed = day.violations.includes("permitExpired") || dayN >= 2;
  let permit:
    | { name: string; passId: string; purpose: string; duration: string; issued: string; expiry: string }
    | undefined;
  if (country !== "ASSR" && permitsAllowed && violation !== "foreignNoPermit") {
    permit = {
      name,
      passId: id,
      purpose: ["forbiddenCargo", "closedDestination", "invalidCustomsSeal", "routeMismatch"].includes(violation ?? "") ? D.purposes[3] : pick(r, D.purposes),
      duration: pick(r, D.durations),
      issued: pastDate(r, dayN),
      expiry: futureDate(r, dayN),
    };
  }

  // Новые документы 0.8: справка гражданина с дня 3 и транзитная декларация с дня 4.
  let employment = country === "ASSR" && dayN >= 3 ? {
    employer: pick(r, [D.documents.employers.factory, D.documents.employers.institute, D.documents.employers.reactor, D.documents.employers.depot]),
    position: pick(r, D.documents.positions), issued: fmt(int(r, 1, 28), int(r, 1, 9), 51), seal: D.documents.workSeal,
  } : undefined;
  let transit = country !== "ASSR" && dayN >= 4 && permit?.purpose === D.purposes[3] ? {
    cargo: pick(r, D.documents.cargo), route: `${country}—ASSR`, destination: pick(r, D.documents.destinations), seal: D.documents.customsSeal,
  } : undefined;

  // карточка КПТА — иногда у граждан АССР
  let partyCard: { name: string; rank: string; mirrored: boolean } | undefined;
  if (country === "ASSR" && (violation === "fakeParty" || chance(r, 0.18))) {
    partyCard = { name, rank: pick(r, D.ranks), mirrored: true };
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
    case "photoMismatch":
      photo = altPerson(r, person, sex);
      mismatch.push(["p.photo", "face"]);
      break;
    case "employmentExpired":
      if (employment) { employment.issued = fmt(1, 1, 49); mismatch.push(["e.issued", "cal.today"]); }
      break;
    case "blockedEmployer":
      if (employment) { employment.employer = D.documents.blockedEmployer; mismatch.push(["e.employer", "ref.blocked"]); }
      break;
    case "forbiddenCargo":
      if (transit) { transit.cargo = D.documents.forbiddenCargo; mismatch.push(["t.cargo", "ref.cargo"]); }
      else violation = null;
      break;
    case "closedDestination":
      if (transit) { transit.destination = D.documents.closedDestination; mismatch.push(["t.destination", "ref.closed"]); }
      else violation = null;
      break;
    case "futureBirth":
      dob = fmt(todayOf(dayN).d + 1, todayOf(dayN).m, todayOf(dayN).y);
      mismatch.push(["p.dob", "cal.today"]);
      break;
    case "passportDateConflict":
      passportIssued = fmt(20, 12, 60);
      mismatch.push(["p.issued", "p.expiry"]);
      break;
    case "permitDateConflict":
      if (permit) { permit.issued = fmt(20, 12, 60); mismatch.push(["w.issued", "w.expiry"]); }
      else violation = null;
      break;
    case "invalidWorkSeal":
      if (employment) { employment.seal = D.documents.invalidSeal; mismatch.push(["e.seal", "rule.r10"]); }
      break;
    case "invalidCustomsSeal":
      if (transit) { transit.seal = D.documents.invalidSeal; mismatch.push(["t.seal", "rule.r11"]); }
      else violation = null;
      break;
    case "routeMismatch":
      if (transit) { transit.route = `STV—ASSR`; mismatch.push(["t.route", "p.country"]); }
      else violation = null;
      break;
    case "sexMismatch":
      passSex = sex === "M" ? "F" : "M";
      photo = altPerson(r, person, passSex);
      mismatch.push(["p.photo", "face"], ["p.sex", "face"]);
      break;
  }

  let detainable = violation !== null && DETAINABLE.includes(violation);
  let expected: "ADMIT" | "DENY" = violation ? "DENY" : "ADMIT";
  let cite = violation ? D.violations.cite[violation] : D.violations.cleanCite;

  // Системы 1.0: розыск, биометрия, измерения, контрабанда и нападения.
  const declaredHeight = dayN >= 2 ? int(r, 158, 194) : undefined;
  const declaredWeight = dayN >= 2 ? int(r, 52, 104) : undefined;
  let measuredHeight = declaredHeight;
  let measuredWeight = declaredWeight;
  let wanted = false;
  let fingerprintMismatch = false;
  let contraband: string | undefined;
  let special: EntrantSpec["special"];
  if (!violation && dayN >= 2 && chance(r, 0.06)) {
    wanted = true; expected = "DENY"; detainable = true; cite = D.systems.wantedCite;
    mismatch.push(["face", "ref.wanted"]);
  } else if (!violation && dayN >= 3 && chance(r, 0.07)) {
    fingerprintMismatch = true; expected = "DENY"; detainable = true; cite = D.systems.fingerprintCite;
    mismatch.push(["fp.print", "p.id"]);
  } else if (!violation && dayN >= 2 && chance(r, 0.07) && measuredHeight && measuredWeight) {
    measuredHeight += 9; measuredWeight += 12; expected = "DENY"; cite = D.systems.measurementCite;
    mismatch.push(["measure.actual", "measure.declared"]);
  } else if (!violation && dayN >= 4 && chance(r, 0.08)) {
    contraband = pick(r, D.systems.contrabandItems); expected = "DENY"; detainable = true; cite = D.systems.contrabandCite;
    mismatch.push(["scan.cargo", "rule.contraband"]);
  } else if (dayN >= 5 && chance(r, 0.018)) {
    special = "attacker"; expected = "DENY"; cite = D.systems.attackCite;
  }

  // Редкое событие — 8% шанс, только со 2-го посетителя дня, только у иностранцев с пропуском или граждан АССР
  let rareEvent: RareEventKind | undefined;
  if (!forceClean && chance(r, 0.08)) {
    if (permit && violation === null) {
      rareEvent = "forgot_permit"; // есть разрешение но "забыл"
    } else if (violation === null && chance(r, 0.5)) {
      rareEvent = "nervous";
    } else if (violation === null) {
      rareEvent = pick(r, ["dual_passport", "bribed_guard", "wrong_queue"] as RareEventKind[]);
    }
  }

  const dialogue = rareEvent ? D.rare[rareEvent] : pick(r, sex === "F" ? D.smalltalkFemale : D.smalltalkMale);
  const wrongQueuePassport = rareEvent === "wrong_queue"
    ? { country: pick(r, foreignPool.filter((c) => c !== country)), name, sex: passSex, dob: birthDate(r), expiry, id }
    : undefined;
  const agentOffer = rareEvent === "bribed_guard" ? {
    prompt: D.rareStage.bribed,
    options: [
      { label: D.rareStage.report, reply: D.rareStage.reportReply, loyal: 1, guardReported: true },
      { label: D.rareStage.silent, reply: D.rareStage.silentReply, loyal: -1, guardReported: false },
    ],
  } : undefined;

  return {
    person,
    dialogue,
    interrogate: pick(r, D.probes),
    passport: { country, name, sex: passSex, dob, issued: passportIssued, expiry, id, fake },
    permit,
    partyCard,
    employment,
    transit,
    wrongQueuePassport,
    photo,
    detainable, expected, cite, mismatch,
    wanted, fingerprintMismatch, contraband, special,
    declaredHeight, measuredHeight, declaredWeight, measuredWeight,
    // Отсутствующий перевод реплики не должен валить целую смену пустым экраном.
    caught: violation ? pick(r, D.violations.caught[violation] ?? [D.generic.caught]) : undefined,
    rareEvent,
    agentOffer,
  };
}

/** очередь дня: обычные посетители + сюжетные агенты на своих местах */
export function buildDay(seed: number, day: DayConfig, storyVisits: { at: number; entrant: EntrantSpec }[], lang: Lang): EntrantSpec[] {
  const r = rng(seed * 7919 + day.n * 104729);
  const list: EntrantSpec[] = [];
  for (let k = 0; k < day.count; k++) {
    // первый посетитель дня всегда чистый — мягкий вход в смену
    list.push(makeEntrant(r, day, lang, k === 0));
  }
  // вставляем агентов
  [...storyVisits].sort((a, b) => a.at - b.at).forEach((v) => {
    const idx = Math.min(Math.max(1, v.at), list.length);
    list.splice(idx, 0, v.entrant);
  });
  return list;
}
