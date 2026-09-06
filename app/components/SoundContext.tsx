"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { SongId } from "../lib/sounds";

interface SoundState {
  volume: number;
  muted: boolean;
  song: SongId;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setSong: (id: SongId) => void;
}

const SoundContext = createContext<SoundState | null>(null);

function getStoredVolume(): number {
  if (typeof window === "undefined") return 0.7;
  const stored = localStorage.getItem("jocus_volume");
  if (stored) {
    const val = parseFloat(stored);
    if (!isNaN(val)) return Math.max(0, Math.min(1, val));
  }
  return 0.7;
}

function getStoredMuted(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("jocus_muted") === "true";
}

function getStoredSong(): SongId {
  if (typeof window === "undefined") return "bossa";
  return localStorage.getItem("jocus_song") || "bossa";
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [volume, setVolumeState] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [song, setSongState] = useState<SongId>("bossa");

  useEffect(() => {
    setVolumeState(getStoredVolume());
    setMuted(getStoredMuted());
    setSongState(getStoredSong());
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    localStorage.setItem("jocus_volume", String(clamped));
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem("jocus_muted", String(next));
      return next;
    });
  }, []);

  const setSong = useCallback((id: SongId) => {
    setSongState(id);
    localStorage.setItem("jocus_song", id);
  }, []);

  return (
    <SoundContext.Provider value={{ volume, muted, song, setVolume, toggleMute, setSong }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used within SoundProvider");
  return context;
}
