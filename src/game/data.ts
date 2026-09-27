import type { Country, CountryCode, DayConfig } from "./types";

export const COUNTRIES: Record<CountryCode, Country> = {
  ASSR: { code: "ASSR", name: "Аргелийская Советская Социалистическая Республика", short: "АССР", emblem: "atom", color: "#8f2320" },
  KRS: { code: "KRS", name: "Народная Республика Краснославия", short: "КРАСНОСЛАВИЯ", emblem: "star", color: "#6e2a2a" },
  ZPS: { code: "ZPS", name: "Королевство Отеплия", short: "ОТЕПЛИЯ", emblem: "wings", color: "#2e3450" },
  UGS: { code: "UGS", name: "Угольный Союз Трудовых Шахт", short: "УГОЛЬНЫЙ СОЮЗ", emblem: "gear", color: "#33302e" },
  STV: { code: "STV", name: "Степная Вольница Объединённых Куреней", short: "СТЕПНАЯ ВОЛЬНИЦА", emblem: "wheat", color: "#5a4a2c" },
};

export const PARTY_NAME = "КПТА";
export const PARTY_FULL = "Коммунистическая Партия Труда и Атома";

export const PER_PAY = 5;
export const ERROR_FINE = 3;
export const START_CREDITS = 25;
export const DETAIN_BONUS = 8;
export const EVIDENCE_BONUS = 2;

export const GENERIC_ADMIT = ["Слава Атому.", "Порядок — это атом в сердце.", "Республика благодарит.", "Открытой дороги."];
export const GENERIC_DENY = ["Как же так...", "Я ещё вернусь. С другими бумагами.", "Очередь вас не простит.", "Протокол порву."];
export const GENERIC_CAUGHT = "Это... это ничего не значит! Ничего!";
export const WRONG_EVIDENCE = [
  "И что? Тут всё совпадает, товарищ.",
  "Вы держите меня за дурака? Смотрите внимательнее.",
  "Это одно и то же. Очередь за мной смеётся.",
  "Проверяйте сколько хотите. Бумаги чисты.",
];

const R = {
  r1: "Граждан АССР — пропускать. Герб паспорта: атом с ТРЕМЯ орбитями.",
  r2: "Иностранцы — только с действительным разрешением на въезд. Имя и № — как в паспорте.",
  r3: "Просроченный паспорт — отказ. Для всех.",
  r4: "Гражданам ОТЕПЛИИ — отказ всегда. Разрешения не действуют.",
  r5: "Серийный № в разрешении должен совпадать с № паспорта.",
  r6: "Подделка: у настоящего герба АССР — 3 орбиты. Две орбиты — вражеская типография.",
  r7: "Карточка КПТА: настоящий герб — молот СПРАВА. Классический серп и молот = подделка.",
  r8: "Задержание работает только с ДОКАЗАННЫМ несоответствием. Враг народа: +8 ₳.",
  r9: "Сверяй лицо и пол: ФОТО в паспорте должно совпадать с человеком в окне.",
  rX: "НЕСООТВЕТСТВИЯ: выдели поле в одном документе и противоречащее ему в другом → «ПРЕДЪЯВИТЬ». +2 ₳.",
};

export const DAYS: DayConfig[] = [
  {
    n: 1,
    date: "12 ОКТЯБРЯ, ГОД 51-Й",
    dateShort: "12.10.51",
    headline: "ГРАНИЦА ОТКРЫТА. АТОМ НЕ СПИТ.",
    subline: "Министерство Пропусков назначает инспектора // КПП-7",
    body: "Трудящийся! Тебе доверен пост №7 — ворота Аргелийской Республики. Пропускай своих. Преграждай путь чужим. Герб с атомом — пропуск в будущее. Партия помнит каждого.",
    rules: [
      { key: "r1", text: R.r1, isNew: true },
      { key: "r2x", text: "Иностранцам въезд запрещён.", isNew: true },
    ],
    expenses: [{ label: "Еда для семьи", amount: 8 }, { label: "Отопление барака", amount: 4 }],
    count: 7,
    violations: ["foreignNoPermit"],
  },
  {
    n: 2,
    date: "13 ОКТЯБРЯ, ГОД 51-Й",
    dateShort: "13.10.51",
    headline: "ИНОСТРАНЦЫ — ПО РАЗРЕШЕНИЮ",
    subline: "Новая директива Министерства // очередь у КПП-7 удвоилась",
    body: "С сегодняшнего дня гости дружественных стран могут войти — если их бумаги безупречны. Просроченный паспорт превращает гражданина в никого. Сверяй даты с календарём поста.",
    rules: [
      { key: "r1", text: R.r1 },
      { key: "r2", text: R.r2, isNew: true },
      { key: "r3", text: R.r3, isNew: true },
      { key: "rX", text: R.rX, isNew: true },
    ],
    expenses: [{ label: "Еда для семьи", amount: 8 }, { label: "Отопление барака", amount: 4 }],
    count: 8,
    violations: ["foreignNoPermit", "passportExpired", "permitExpired", "nameMismatch"],
  },
  {
    n: 3,
    date: "14 ОКТЯБРЯ, ГОД 51-Й",
    dateShort: "14.10.51",
    headline: "ЗАПАДНЫЙ СОЮЗ — ПЕРСОНА НОН ГРАТА",
    subline: "Диверсия у реактора №3 // комиссары усиливают контроль",
    body: "Ночью агенты Отеплии пытались остановить сердце республики. Атом устоял. Двери для Королевства Отеплия закрыты. Особое внимание — поддельным гербам: у вражеской типографии всего две орбиты.",
    rules: [
      { key: "r1", text: R.r1 },
      { key: "r2", text: R.r2 },
      { key: "r4", text: R.r4, isNew: true },
      { key: "r5", text: R.r5, isNew: true },
      { key: "r6", text: R.r6, isNew: true },
      { key: "r8", text: R.r8, isNew: true },
    ],
    expenses: [{ label: "Еда для семьи", amount: 8 }, { label: "Отопление барака", amount: 4 }, { label: "Лекарства для матери", amount: 6 }],
    count: 9,
    violations: ["foreignNoPermit", "passportExpired", "permitExpired", "nameMismatch", "idMismatch", "westBanned", "fakeAtom"],
  },
  {
    n: 4,
    date: "15 ОКТЯБРЯ, ГОД 51-Й",
    dateShort: "15.10.51",
    headline: "КАРТОЧКА ПАРТИИ — ЛИЦО ПАРТИИ",
    subline: "КПТА предупреждает: враги печатают фальшивые удостоверения",
    body: "Герб Партии священен и перевёрнут: молот — справа, серп тянется влево. Кто покажет классический знак — самозванец из чужой типографии. И сверяй лица: фото не лжёт, лгут люди.",
    rules: [
      { key: "r1", text: R.r1 },
      { key: "r2", text: R.r2 },
      { key: "r4", text: R.r4 },
      { key: "r6", text: R.r6 },
      { key: "r7", text: R.r7, isNew: true },
      { key: "r9", text: R.r9, isNew: true },
    ],
    expenses: [{ label: "Еда для семьи", amount: 8 }, { label: "Отопление барака", amount: 4 }, { label: "Лекарства для матери", amount: 6 }],
    count: 9,
    violations: ["foreignNoPermit", "passportExpired", "permitExpired", "nameMismatch", "idMismatch", "westBanned", "fakeAtom", "fakeParty", "photoMismatch"],
  },
  {
    n: 5,
    date: "16 ОКТЯБРЯ, ГОД 51-Й",
    dateShort: "16.10.51",
    headline: "ПРОВЕРКА НА ВСЕ ГЛАЗА",
    subline: "Перед Великим Запуском граница просвечивается насквозь",
    body: "Завтра реактор «ЗАРЯ-1» выйдет на полную мощность. Сегодня враг попытается просочиться в последний раз. Проверяй всё: орбиты, молот, лица, пол, даты, номера. Ошибка сегодня — приговор завтра.",
    rules: [
      { key: "r1", text: R.r1 },
      { key: "r2", text: R.r2 },
      { key: "r4", text: R.r4 },
      { key: "r6", text: R.r6 },
      { key: "r7", text: R.r7 },
      { key: "r9", text: R.r9 },
      { key: "r8", text: R.r8 },
    ],
    expenses: [{ label: "Еда для семьи", amount: 8 }, { label: "Отопление барака", amount: 4 }, { label: "Лекарства для матери", amount: 6 }],
    count: 10,
    violations: ["foreignNoPermit", "passportExpired", "permitExpired", "nameMismatch", "idMismatch", "westBanned", "fakeAtom", "fakeParty", "photoMismatch", "sexMismatch"],
  },
  {
    n: 6,
    date: "17 ОКТЯБРЯ, ГОД 51-Й",
    dateShort: "17.10.51",
    headline: "ВЕЛИКИЙ ЗАПУСК СЕГОДНЯ",
    subline: "Реактор «ЗАРЯ-1» выходит на полную мощность в полночь",
    body: "Вся республика смотрит в небо. Сегодня Атом заговорит голосом АССР. К вечеру решится и твоя судьба: Министерство рассматривает представление на высшего инспектора. Говорят, у поста №7 в последние дни было слишком много гостей.",
    rules: [
      { key: "r1", text: R.r1 },
      { key: "r2", text: R.r2 },
      { key: "r4", text: R.r4 },
      { key: "r6", text: R.r6 },
      { key: "r7", text: R.r7 },
      { key: "r9", text: R.r9 },
    ],
    expenses: [{ label: "Еда для семьи", amount: 8 }, { label: "Отопление барака", amount: 4 }, { label: "Лекарства для матери", amount: 6 }],
    count: 10,
    violations: ["foreignNoPermit", "passportExpired", "permitExpired", "nameMismatch", "idMismatch", "westBanned", "fakeAtom", "fakeParty", "photoMismatch", "sexMismatch"],
  },
];

export const GAMEOVER = {
  title: "ЛИШЕНИЕ ПАЁКА",
  lines: [
    "Баланс семьи ушёл в минус. Министерство не прощает должников.",
    "Квартира отошла блоку. Сын плачет у остывшей печки. Комиссар смотрит в сторону.",
    "Тебя перевели. Есть один пост, куда добровольцы не идут: урановый рудник за Северным Тупиком.",
    "Там тоже проверяют документы. Только очередь — из вагонеток.",
  ],
};
