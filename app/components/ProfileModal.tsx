"use client";

import { useState } from "react";
import { Avatar, generateSeeds } from "./Avatar";
import { usePlayer } from "./PlayerContext";
import { useLanguage, type Language } from "./LanguageContext";
import { sounds } from "../lib/sounds";

interface ProfileModalProps {
  onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
  const { nickname, setNickname, avatarSeed, setAvatar } = usePlayer();
  const { language, setLanguage, languageNames, t } = useLanguage();
  const [nameInput, setNameInput] = useState(nickname);
  const [selectedSeed, setSelectedSeed] = useState(avatarSeed);
  const [page, setPage] = useState(0);

  const seeds = generateSeeds(`${nickname || "player"}-${page}`, 3);

  function handleSave() {
    const trimmed = nameInput.trim();
    if (trimmed && trimmed !== nickname) {
      setNickname(trimmed);
    }
    setAvatar(selectedSeed, "adventurer");
    onClose();
  }

  function handleShuffle() {
    setPage((p) => p + 1);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[var(--background)] border border-foreground/20 rounded-2xl p-6 max-w-sm w-full space-y-5 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold">Profile</h2>

        {/* Avatar — large centered + floating shuffle */}
        <div className="space-y-3">
          <label className="text-sm font-bold opacity-70 uppercase tracking-wide block">
            Avatar
          </label>
          <div className="flex justify-center">
            <div className="relative">
              <div className="rounded-2xl border-2 border-[var(--color-primary)] bg-[var(--color-primary)]/10 p-3">
                <Avatar seed={selectedSeed} style="adventurer" size={110} />
              </div>
              <button
                type="button"
                onClick={handleShuffle}
                className="absolute -right-14 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-2 rounded-lg border-2 border-foreground/20 hover:border-[var(--color-primary)] transition-colors cursor-pointer bg-[var(--background)]"
              >
                <span className="text-base">🎲</span>
              </button>
            </div>
          </div>

          {/* Avatar options */}
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
                <Avatar seed={seed} style="adventurer" size={48} />
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
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            maxLength={20}
            className="w-full bg-transparent border-2 border-foreground/20 rounded-lg px-4 py-2 text-foreground focus:border-[var(--color-primary)] focus:outline-none transition-colors"
          />
        </div>

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

        {/* Sound test */}
        <div className="space-y-2">
          <label className="text-sm font-bold opacity-70 uppercase tracking-wide block">
            Sounds
          </label>
          <div className="grid grid-cols-4 gap-2">
            {([
              ["🔔", "Hover", sounds.buttonHover],
              ["🖱️", "Click", sounds.buttonClick],
              ["👋", "Join", sounds.playerJoin],
              ["⏱️", "Tick", sounds.countdownTick],
              ["🚀", "Go!", sounds.countdownGo],
              ["🎮", "Start", sounds.gameStart],
              ["✅", "Move", sounds.move],
              ["🏆", "Win", sounds.win],
              ["😔", "Lose", sounds.lose],
              ["🚫", "Kick", sounds.kick],
            ] as [string, string, () => void][]).map(([icon, label, fn]) => (
              <button
                key={label}
                type="button"
                onClick={fn}
                className="flex flex-col items-center gap-0.5 p-2 rounded-lg border border-foreground/10 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors cursor-pointer"
              >
                <span className="text-base">{icon}</span>
                <span className="text-[10px] opacity-60">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm font-medium opacity-60 hover:opacity-100 cursor-pointer border border-foreground/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2 rounded-lg text-sm font-bold bg-[var(--color-primary)] text-white cursor-pointer hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
