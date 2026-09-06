"use client";

import { useEffect } from "react";
import { useSound } from "./SoundContext";
import { setSoundVolume, setSoundMuted, setCurrentSong, startBackgroundMusic, stopBackgroundMusic } from "../lib/sounds";

export function useSoundSync() {
  const { volume, muted, song } = useSound();

  useEffect(() => {
    setSoundVolume(volume);
  }, [volume]);

  useEffect(() => {
    setSoundMuted(muted);
  }, [muted]);

  useEffect(() => {
    setCurrentSong(song);
  }, [song]);
}

export function useBackgroundMusic() {
  const { muted } = useSound();

  useEffect(() => {
    if (!muted) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
    return () => {
      stopBackgroundMusic();
    };
  }, [muted]);
}
