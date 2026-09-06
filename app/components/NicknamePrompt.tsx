"use client";

import { useState } from "react";
import { Avatar, generateSeeds } from "./Avatar";
import { usePlayer } from "./PlayerContext";
import { useLanguage, type Language } from "./LanguageContext";
import { PillButton } from "./PillButton";

export function NicknamePrompt({ onDone }: { onDone: () => void }) {
  const { setNickname, setAvatar, identify } = usePlayer();
  const { language, setLanguage, languageNames, t } = useLanguage();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedSeed, setSelectedSeed] = useState("player-0");
  const [page, setPage] = useState(0);

  const seeds = generateSeeds(`player-${page}`, 3);

  function handleShuffle() {
    setPage((p) => p + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setLoading(true);
    setNickname(input.trim());
    setAvatar(selectedSeed, "adventurer");
    try {
      await new Promise((r) => setTimeout(r, 50));
      await identify();
    } catch {
      // Player will be identified on next action if this fails
    }
    setLoading(false);
    onDone();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-background rounded-2xl p-6 max-w-sm w-full space-y-5 shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold text-center animate-bounce-in">
          {t.welcome}
        </h2>

        {/* Language */}
        <div className="space-y-2">
          <label className="text-sm font-bold opacity-70 uppercase tracking-wide block">
            {t.language}
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="w-full bg-[var(--background)] text-foreground border-2 border-foreground/20 rounded-lg px-4 py-2 cursor-pointer focus:border-[var(--color-primary)] focus:outline-none"
          >
            {(Object.entries(languageNames) as [Language, string][]).map(
              ([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              )
            )}
          </select>
        </div>

        {/* Avatar */}
        <div className="space-y-3">
          <label className="text-sm font-bold opacity-70 uppercase tracking-wide block">
            {t.chooseAvatar}
          </label>
          <div className="flex justify-center">
            <div className="relative">
              <div className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 p-3">
                <Avatar seed={selectedSeed} style="adventurer" size={90} />
              </div>
              <button
                type="button"
                onClick={handleShuffle}
                className="absolute -right-12 top-1/2 -translate-y-1/2 flex items-center gap-1 px-2.5 py-2 rounded-lg border-2 border-foreground/20 hover:border-[var(--color-primary)] transition-colors cursor-pointer bg-[var(--background)]"
              >
                <span className="text-base">🎲</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {seeds.map((seed) => (
              <button
                key={seed}
                type="button"
                onClick={() => setSelectedSeed(seed)}
                className={`p-2 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                  selectedSeed === seed
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-105"
                    : "border-foreground/10 hover:border-foreground/25"
                }`}
              >
                <Avatar seed={seed} style="adventurer" size={44} />
              </button>
            ))}
          </div>
        </div>

        {/* Nickname */}
        <div className="space-y-2">
          <label className="text-sm font-bold opacity-70 uppercase tracking-wide block">
            {t.nickname}
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={20}
            autoFocus
            placeholder="Player"
            className="w-full bg-transparent border-2 border-foreground/20 rounded-lg px-4 py-3 text-foreground text-center text-lg placeholder:text-foreground/40 focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-center pt-1">
          <PillButton type="submit" size="lg" disabled={!input.trim() || loading}>
            {t.letsGo}
          </PillButton>
        </div>
      </form>
    </div>
  );
}
