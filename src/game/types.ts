export type CountryCode = "ASSR" | "KRS" | "ZPS" | "UGS" | "STV";
export type Sex = "M" | "F";
export type Decision = "ADMIT" | "DENY" | "DETAIN";

/** ключи кликабельных полей документов для предъявления несоответствий */
export type FieldKey = string;
export type DocId = "passport" | "permit" | "party" | "employment" | "transit" | "fingerprints" | "book" | "news";

/** Предмет в инвентаре */
export interface InvItem {
  id: string;
  icon: string; // emoji
  name: string;
  desc: string;
  from?: string; // кто дал
}

/** Вкладка книжки */
export type BookTab = "rules" | "emblems" | "stoplist" | "cities" | "calendar";

export interface Country {
  code: CountryCode;
  name: string;
  short: string;
  emblem: "atom" | "star" | "wings" | "gear" | "wheat";
  color: string;
}

export interface PersonSpec {
  skin: number;
  hairStyle: "bald" | "flat" | "side" | "mop" | "bun" | "ushanka" | "cap" | "braids" | "crew" | "wave" | "scarf";
  hairTone: number;
  facial: "none" | "mustache" | "beard" | "glasses" | "glassesMustache" | "scar" | "eyepatch";
  coat: number;
  redScarf?: boolean;
  female?: boolean;
}

export interface PassportData {
  country: CountryCode;
  name: string;
  sex: Sex;
  dob: string;
  issued: string;
  expiry: string;
  id: string;
  fake?: "orb2";
}

export interface PermitData {
  name: string;
  passId: string;
  purpose: string;
  duration: string;
  issued: string;
  expiry: string;
}

export interface EmploymentData { employer: string; position: string; issued: string; seal: string; }
export interface TransitData { cargo: string; route: string; destination: string; seal: string; }

export interface PartyCardData {
  name: string;
  rank: string;
  mirrored: boolean; // true = настоящий герб КПТА (молот справа)
}

export type AgentKind = "west" | "neighbor";

export interface AgentOption {
  label: string;
  reply: string;
  west?: number;
  neighbor?: number;
  loyal?: number;
  guardReported?: boolean;
  commissionerScore?: number;
  credits?: number;
  final?: "west" | "neighbor" | "loyal";
}

export interface AgentOffer {
  prompt: string;
  options: AgentOption[];
}

/** Редкое событие */
export type RareEventKind =
  | "forgot_permit"   // забыл разрешение — уходит и возвращается
  | "nervous"         // трясётся, роняет документы
  | "bribed_guard"    // пытается подкупить у предыдущей будки — слух
  | "dual_passport"   // предъявляет сразу два паспорта (один фальшивый)
  | "wrong_queue";    // стоял не в той очереди — документы чужой страны

export interface EntrantSpec {
  person: PersonSpec;
  dialogue: string;
  reactAdmit?: string;
  reactDeny?: string;
  passport: PassportData;
  permit?: PermitData;
  partyCard?: PartyCardData;
  employment?: EmploymentData;
  transit?: TransitData;
  wanted?: boolean;
  fingerprintMismatch?: boolean;
  contraband?: string;
  declaredHeight?: number; measuredHeight?: number;
  declaredWeight?: number; measuredWeight?: number;
  /** Для события неправильной очереди: первый, ошибочно поданный паспорт. */
  wrongQueuePassport?: PassportData;
  photo?: PersonSpec;
  interrogate?: string;
  detainable?: boolean;
  bribe?: number;
  expected: Decision;
  cite: string;
  mismatch?: [FieldKey, FieldKey][];
  caught?: string;
  agent?: AgentKind;
  agentOffer?: AgentOffer;
  special?: "bribe" | "redScarf" | "commissioner" | "attacker";
  /** редкое событие */
  rareEvent?: RareEventKind;
  /** допдокументы которые посетитель достаёт только по просьбе */
  hiddenDocs?: DocId[];
}

export interface RuleItem {
  key: string;
  text: string;
  isNew?: boolean;
}

export interface Notice {
  text: string;
  amount?: number;
}

export interface Expense {
  /** идентификатор строки расходов: food / heat / meds */
  id: string;
  label: string;
  amount: number;
}

export interface DayConfig {
  n: number;
  date: string;
  dateShort: string;
  headline: string;
  subline: string;
  body: string;
  rules: RuleItem[];
  expenses: Expense[];
  /** сколько обычных посетителей за смену */
  count: number;
  /** какие нарушения возможны */
  violations: ViolationKind[];
}

export type ViolationKind =
  | "foreignNoPermit"
  | "passportExpired"
  | "permitExpired"
  | "nameMismatch"
  | "idMismatch"
  | "westBanned"
  | "fakeAtom"
  | "fakeParty"
  | "photoMismatch"
  | "sexMismatch"
  | "employmentExpired"
  | "blockedEmployer"
  | "forbiddenCargo"
  | "closedDestination"
  | "futureBirth"
  | "passportDateConflict"
  | "permitDateConflict"
  | "invalidWorkSeal"
  | "invalidCustomsSeal"
  | "routeMismatch";

export interface Flags {
  bribe: boolean;
  westTrust: number;
  neighborTrust: number;
  loyalty: number;
  finalChoice: "west" | "neighbor" | "loyal" | null;
  metWest: boolean;
  metNeighbor: boolean;
  guardReported: boolean;
  commissionerScore: number;
}

export interface DayResult {
  correct: number;
  errors: string[];
  hidden: number;
  bribeGain: number;
  detains: number;
  detainBonus: number;
  evidence: number;
  evidenceBonus: number;
  flags: Partial<Flags>;
  agentCredits: number;
}

export interface SaveData {
  version: number;
  seed: number;
  dayIdx: number;
  credits: number;
  flags: Flags;
  totals: { correct: number; errors: number; detains: number; evidence: number };
  heatStreak: number;
  savedAt: number;
}
