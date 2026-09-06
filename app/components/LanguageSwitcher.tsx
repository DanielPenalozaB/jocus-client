"use client";

import { useLanguage, type Language } from "./LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage, languageNames, t } = useLanguage();

  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      {t.language}
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-background text-foreground border border-foreground/20 rounded-lg px-2 py-1 text-sm cursor-pointer"
      >
        {(Object.entries(languageNames) as [Language, string][]).map(
          ([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          )
        )}
      </select>
    </label>
  );
}
