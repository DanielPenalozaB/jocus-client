"use client";

import { useState, useRef, useEffect } from "react";
import { useLanguage, type Language } from "./LanguageContext";
import { useSound } from "./SoundContext";
import { SONGS } from "../lib/sounds";
import type { SongId } from "../lib/sounds";

interface RoomMenuProps {
  isHost: boolean;
  onLeaveRoom: () => void;
  onCloseRoom: () => void;
}

export function RoomMenu({ isHost, onLeaveRoom, onCloseRoom }: RoomMenuProps) {
  const { language, setLanguage, languageNames, t } = useLanguage();
  const { volume, muted, song, setVolume, toggleMute, setSong } = useSound();
  const [open, setOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-foreground/10 transition-colors cursor-pointer"
        title="Menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" />
          <circle cx="12" cy="5" r="1" />
          <circle cx="12" cy="19" r="1" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--background)] border border-foreground/15 rounded-xl p-4 shadow-lg w-72 animate-scale-in space-y-4">
          {/* Sound */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleMute}
                className="flex items-center gap-2 text-sm font-medium cursor-pointer hover:opacity-80"
              >
                <span className="text-lg">{muted ? "🔇" : "🔊"}</span>
                <span>{muted ? "Unmute" : "Mute"}</span>
              </button>
              <span className="text-xs opacity-50">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, var(--color-primary) ${volume * 100}%, color-mix(in srgb, var(--foreground) 20%, transparent) ${volume * 100}%)`,
              }}
            />
            <div className="grid grid-cols-3 gap-1.5 max-h-24 overflow-y-auto">
              {SONGS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSong(s.id as SongId)}
                  className={`text-[11px] py-1.5 px-1 rounded-lg border transition-all cursor-pointer truncate ${
                    song === s.id
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-bold"
                      : "border-foreground/15 hover:border-foreground/30 opacity-70 hover:opacity-100"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-foreground/10" />

          {/* Language */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium opacity-70">{t.language}</span>
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
          </div>

          <div className="border-t border-foreground/10" />

          {/* Leave / Close */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              if (isHost) {
                onCloseRoom();
              } else {
                onLeaveRoom();
              }
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {isHost ? t.closeRoom : t.leaveRoom}
          </button>
        </div>
      )}
    </div>
  );
}
