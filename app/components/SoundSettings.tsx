"use client";

import { useState, useRef, useEffect } from "react";
import { useSound } from "./SoundContext";
import { SONGS } from "../lib/sounds";
import type { SongId } from "../lib/sounds";

export function SoundSettings() {
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

  const icon = muted || volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊";

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-lg hover:scale-110 transition-transform px-2 py-1 cursor-pointer"
        title="Sound settings"
      >
        {icon}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-[var(--background)] border border-foreground/15 rounded-xl p-4 shadow-lg w-64 animate-scale-in">
          <div className="space-y-3">
            <button
              type="button"
              onClick={toggleMute}
              className="flex items-center gap-2 w-full text-left text-sm font-medium cursor-pointer hover:opacity-80"
            >
              <span className="text-lg">{muted ? "🔇" : "🔊"}</span>
              <span>{muted ? "Unmute" : "Mute"}</span>
            </button>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs opacity-60">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
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
            </div>

            <div className="space-y-1.5">
              <span className="text-xs opacity-60">Music</span>
              <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
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
          </div>
        </div>
      )}
    </div>
  );
}
