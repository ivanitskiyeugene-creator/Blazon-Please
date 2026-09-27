import { NAMES, PROBE_LINES, PURPOSES, DURATIONS, RANKS, SMALLTALK } from "./names";
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

const RARE_EVENT_DIALOGUES: Record<RareEventKind, string> = {
  forgot_permit: "Одну секунду, я его где-то... сейчас найду...",
  nervous: "Д-документы... вот. Простите за руки, товарищ.",
  bribed_guard: "Предыдущий пост пропустил. Непонятно, за что тут очередь.",
  dual_passport: "У меня два. Какой нужен — старый или новый?",
  wrong_queue: "Мне сказали — вот сюда. Это правильная очередь?",
};

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

function makeName(r: R, country: CountryCode, sex: Sex) {
  const pool = NAMES[country];
  const first = sex === "M" ? pick(r, pool.m) : pick(r, pool.f);
  let last = pick(r, pool.last);
  if (sex === "F" && pool.slavic) {
    if (last.endsWith("ИЙ") || last.endsWith("ЫЙ") || last.endsWith("ОЙ")) last = last.slice(0, -2) + "АЯ";
    else if (!last.endsWith("А") && !last.endsWith("Я")) last = last + "А";
  }
  return `${first} ${last}`;
}

const CAUGHT_LINES: Record<ViolationKind, string[]> = {
  foreignNoPermit: ["Ну нельзя так нельзя. Обратно поеду.", "А я думал, пустят по-человечески...", "Границы, границы. Везде границы."],
  passportExpired: ["Да я ж помню эту дату наизусть... и забыл.", "Просрочен? Он же вчера был хорош!", "Дату вижу. Стыдно."],
  permitExpired: ["Бумажка кончилась, а дела остались.", "Поймал. Печки остынут без меня.", "Продлить не успел. Очередь была."],
  nameMismatch: ["Опечатка машинистки! Я не виноват!", "Одна буква! Одна буква, товарищ!", "В деревне все так пишут..."],
  idMismatch: ["Цифры... цифры пляшут. Всегда пляшут.", "Номер переписывали от руки, вот и вышло.", "Ошибка канцелярии, клянусь Атомом."],
  westBanned: ["Это нарушение дипломатического протокола!", "Отеплия запомнит этот пост!", "Вы пожалеете об этом, инспектор."],
  fakeAtom: ["Две орбиты, три орбиты... Вы их считаете?!", "Мне сказали — сойдёт. Меня обманули!", "Вы слишком внимательны. Слишком."],
  fakeParty: ["Молот слева! Я перепутал сторону!", "Герб — партийная тайна! Вы не уполномочены!", "Печатали в спешке, товарищ..."],
  photoMismatch: ["Хорошо-хорошо. Грипп тут ни при чём.", "Фото старое. Совсем старое. Ладно, не моё.", "Меня просили передать паспорт. Просто передать."],
  sexMismatch: ["...Это паспорт сестры. Простите.", "Я думал, вы не заметите такую мелочь.", "В очереди сказали — сработает. Не сработало."],
};

const VIOLATION_CITE: Record<ViolationKind, string> = {
  foreignNoPermit: "Иностранец без разрешения на въезд",
  passportExpired: "Паспорт просрочен",
  permitExpired: "Разрешение на въезд просрочено",
  nameMismatch: "Имя в разрешении не совпадает с паспортом",
  idMismatch: "Номер в разрешении не совпадает с № паспорта",
  westBanned: "Гражданам Западного Союза въезд запрещён",
  fakeAtom: "Поддельный герб АССР (две орбиты)",
  fakeParty: "Поддельное удостоверение КПТА (классический герб)",
  photoMismatch: "Фото в паспорте не соответствует предъявителю",
  sexMismatch: "Пол и фото не соответствуют предъявителю",
};

const DETAINABLE: ViolationKind[] = ["fakeAtom", "fakeParty", "photoMismatch", "sexMismatch"];

function mutateName(r: R, name: string) {
  const [first, last] = name.split(" ");
  if (chance(r, 0.5) && last) {
    const i = int(r, 0, Math.max(0, last.length - 2));
    const letters = "АОЕИУВНРСТЛК";
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
export function makeEntrant(r: R, day: DayConfig, forceClean = false): EntrantSpec {
  const dayN = day.n;

  // страна
  const foreignPool: CountryCode[] = ["KRS", "UGS", "STV", "ZPS"];
  const isLocal = chance(r, 0.45);
  const country: CountryCode = isLocal ? "ASSR" : pick(r, foreignPool);
  const sex: Sex = chance(r, 0.45) ? "F" : "M";
  const person = makePerson(r, sex);
  const name = makeName(r, country, sex);
  const id = String(int(r, 100000, 999999));

  // нарушение
  const pool = day.violations.filter((v) => {
    if (country === "ASSR") return !["foreignNoPermit", "permitExpired", "nameMismatch", "idMismatch", "westBanned"].includes(v);
    if (country === "ZPS") return v !== "fakeParty" && v !== "fakeAtom";
    return v !== "fakeAtom" && v !== "fakeParty";
  });
  const wantViolation = !forceClean && chance(r, 0.48) && pool.length > 0;
  let violation: ViolationKind | null = wantViolation ? pick(r, pool) : null;

  // ЗПС после дня 3 — всегда нарушитель по определению
  if (country === "ZPS" && day.violations.includes("westBanned")) violation = "westBanned";
  if (country !== "ASSR" && !day.violations.includes("foreignNoPermit") && violation === null) violation = null;

  const mismatch: [FieldKey, FieldKey][] = [];
  let expiry = futureDate(r, dayN);
  let fake: "orb2" | undefined;
  let photo: PersonSpec | undefined;
  let passSex = sex;

  // разрешение нужно иностранцам со дня 2
  const permitsAllowed = day.violations.includes("permitExpired") || dayN >= 2;
  let permit:
    | { name: string; passId: string; purpose: string; duration: string; expiry: string }
    | undefined;
  if (country !== "ASSR" && permitsAllowed && violation !== "foreignNoPermit") {
    permit = {
      name,
      passId: id,
      purpose: pick(r, PURPOSES),
      duration: pick(r, DURATIONS),
      expiry: futureDate(r, dayN),
    };
  }

  // карточка КПТА — иногда у граждан АССР
  let partyCard: { name: string; rank: string; mirrored: boolean } | undefined;
  if (country === "ASSR" && (violation === "fakeParty" || chance(r, 0.18))) {
    partyCard = { name, rank: pick(r, RANKS), mirrored: true };
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
        permit.name = mutateName(r, name);
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
      partyCard = { name, rank: pick(r, RANKS), mirrored: false };
      mismatch.push(["c.emblem", "ref.party"]);
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

  // Редкое событие — 8% шанс, только со 2-го посетителя дня, только у иностранцев с пропуском или граждан АССР
  let rareEvent: RareEventKind | undefined;
  if (!forceClean && chance(r, 0.08)) {
    if (permit && violation === null) {
      rareEvent = "forgot_permit"; // есть разрешение но "забыл"
    } else if (violation === null && chance(r, 0.5)) {
      rareEvent = "nervous";
    } else if (violation === null) {
      rareEvent = "dual_passport";
    }
  }

  const dialogue = rareEvent
    ? RARE_EVENT_DIALOGUES[rareEvent]
    : pick(r, SMALLTALK);

  return {
    person,
    dialogue,
    interrogate: pick(r, PROBE_LINES),
    passport: { country, name, sex: passSex, dob: birthDate(r), expiry, id, fake },
    permit,
    partyCard,
    photo,
    detainable,
    expected,
    cite: violation ? VIOLATION_CITE[violation] : "Документы были в порядке — решение без основания",
    mismatch,
    caught: violation ? pick(r, CAUGHT_LINES[violation]) : undefined,
    rareEvent,
  };
}

/** очередь дня: обычные посетители + сюжетные агенты на своих местах */
export function buildDay(seed: number, day: DayConfig, storyVisits: { at: number; entrant: EntrantSpec }[]): EntrantSpec[] {
  const r = rng(seed * 7919 + day.n * 104729);
  const list: EntrantSpec[] = [];
  for (let k = 0; k < day.count; k++) {
    // первый посетитель дня всегда чистый — мягкий вход в смену
    list.push(makeEntrant(r, day, k === 0));
  }
  // вставляем агентов
  [...storyVisits].sort((a, b) => a.at - b.at).forEach((v) => {
    const idx = Math.min(Math.max(1, v.at), list.length);
    list.splice(idx, 0, v.entrant);
  });
  return list;
}
