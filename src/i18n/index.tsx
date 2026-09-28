import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en } from "./en";
import { ru, type Dict } from "./ru";

export type Lang = "ru" | "en";
export const LANGS: Lang[] = ["ru", "en"];

const STORAGE_KEY = "blazon_lang_v1";

export const DICTS: Record<Lang, Dict> = { ru, en };

/** Для не-реактовских модулей (генератор очереди и т.п.). */
export function getDict(lang: Lang): Dict {
  return DICTS[lang] ?? ru;
}

export function loadLang(): Lang {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "ru" || v === "en") return v;
  } catch {
    /* хранилище недоступно */
  }
  return "ru";
}

interface I18n {
  lang: Lang;
  t: Dict;
  setLang: (l: Lang) => void;
}

const Ctx = createContext<I18n>({ lang: "ru", t: ru, setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    document.title = getDict(lang).meta.title;
    document.documentElement.lang = getDict(lang).meta.htmlLang;
  }, [lang]);

  const value = useMemo<I18n>(() => ({ lang, t: getDict(lang), setLang }), [lang, setLang]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  return useContext(Ctx);
}

/** Компактный переключатель РУС/ENG — общий для меню и экрана смены. */
export function LangSwitch({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();
  return (
    <div
      className={`inline-flex items-stretch border-2 border-[var(--color-line)] ${className}`}
      role="group"
      aria-label={getDict(lang).ui.langLabel}
    >
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          className={`px-2 py-1 text-[9px] uppercase tracking-widest transition-colors ${
            lang === l
              ? "bg-[var(--color-gold)] text-[#241d0c]"
              : "text-[var(--color-ash)] hover:text-[var(--color-gold)]"
          }`}
          style={{ fontFamily: "var(--font-head)" }}
          aria-pressed={lang === l}
        >
          {l === "ru" ? "РУС" : "ENG"}
        </button>
      ))}
    </div>
  );
}
