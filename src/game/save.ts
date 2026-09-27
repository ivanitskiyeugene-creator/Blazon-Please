import type { Flags, SaveData } from "./types";

const KEY = "assr_kpp7_save_v1";
export const SAVE_VERSION = 1;

export const EMPTY_FLAGS: Flags = {
  bribe: false,
  westTrust: 0,
  neighborTrust: 0,
  loyalty: 0,
  finalChoice: null,
  metWest: false,
  metNeighbor: false,
};

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    if (data.version !== SAVE_VERSION) return null;
    if (typeof data.dayIdx !== "number" || typeof data.credits !== "number") return null;
    return { ...data, flags: { ...EMPTY_FLAGS, ...data.flags } };
  } catch {
    return null;
  }
}

export function writeSave(data: Omit<SaveData, "version" | "savedAt">) {
  try {
    const payload: SaveData = { ...data, version: SAVE_VERSION, savedAt: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* хранилище недоступно — играем без сохранения */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

export function saveAge(ts: number) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин. назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч. назад`;
  return `${Math.floor(h / 24)} дн. назад`;
}
