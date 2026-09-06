"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { api, type Player } from "../lib/api";
import type { AvatarStyle } from "./Avatar";

interface PlayerState {
  deviceToken: string;
  nickname: string;
  player: Player | null;
  isReady: boolean;
  avatarSeed: string;
  avatarStyle: AvatarStyle;
  setNickname: (name: string) => void;
  setAvatar: (seed: string, style: AvatarStyle) => void;
  identify: () => Promise<void>;
}

const PlayerContext = createContext<PlayerState | null>(null);

function generateToken(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function getOrCreateDeviceToken(): string {
  if (typeof window === "undefined") return "";
  let token = localStorage.getItem("jocus_device_token");
  if (!token) {
    token = generateToken();
    localStorage.setItem("jocus_device_token", token);
  }
  return token;
}

function getStoredNickname(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("jocus_nickname") || "";
}

function getStoredAvatarSeed(deviceToken: string): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("jocus_avatar_seed") || deviceToken;
}

function getStoredAvatarStyle(): AvatarStyle {
  if (typeof window === "undefined") return "adventurer";
  return (localStorage.getItem("jocus_avatar_style") as AvatarStyle) || "adventurer";
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [deviceToken, setDeviceToken] = useState("");
  const [nickname, setNicknameState] = useState("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [avatarSeed, setAvatarSeed] = useState("");
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>("adventurer");

  useEffect(() => {
    const token = getOrCreateDeviceToken();
    setDeviceToken(token);
    setNicknameState(getStoredNickname());
    setAvatarSeed(getStoredAvatarSeed(token));
    setAvatarStyle(getStoredAvatarStyle());
    setIsReady(true);
  }, []);

  const setNickname = useCallback((name: string) => {
    setNicknameState(name);
    localStorage.setItem("jocus_nickname", name);
  }, []);

  const setAvatar = useCallback((seed: string, style: AvatarStyle) => {
    setAvatarSeed(seed);
    setAvatarStyle(style);
    localStorage.setItem("jocus_avatar_seed", seed);
    localStorage.setItem("jocus_avatar_style", style);
  }, []);

  const identify = useCallback(async () => {
    if (!deviceToken || !nickname) return;
    const p = await api.identify(deviceToken, nickname);
    setPlayer(p);
  }, [deviceToken, nickname]);

  return (
    <PlayerContext.Provider
      value={{
        deviceToken,
        nickname,
        player,
        isReady,
        avatarSeed,
        avatarStyle,
        setNickname,
        setAvatar,
        identify,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used within PlayerProvider");
  return context;
}
