"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PillButton } from "./components/PillButton";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { NicknamePrompt } from "./components/NicknamePrompt";
import { ProfileModal } from "./components/ProfileModal";
import { Avatar } from "./components/Avatar";
import { useLanguage } from "./components/LanguageContext";
import { usePlayer } from "./components/PlayerContext";
import { api, type ActiveRoom } from "./lib/api";

export default function Home() {
  const { t } = useLanguage();
  const { nickname, isReady, avatarSeed, avatarStyle } = usePlayer();
  const router = useRouter();
  const [showNicknamePrompt, setShowNicknamePrompt] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [activeRooms, setActiveRooms] = useState<ActiveRoom[]>([]);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    if (showJoin) {
      api.getActiveRooms().then(({ rooms }) => setActiveRooms(rooms)).catch(() => {});
    }
  }, [showJoin]);

  useEffect(() => {
    if (isReady && !nickname) {
      setShowNicknamePrompt(true);
    }
  }, [isReady, nickname]);

  if (!isReady) return null;

  const needsNickname = !nickname;

  function handleJoinSubmit() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setJoinError("");
    router.push(`/join/${code}`);
  }

  function handleRoomClick(code: string) {
    router.push(`/join/${code}`);
  }

  return (
    <>
      <header className="flex justify-between items-center p-4">
        {nickname && (
          <button
            type="button"
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Avatar seed={avatarSeed} style={avatarStyle} size={32} />
            <span className="text-sm font-medium opacity-70">{nickname}</span>
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/leaderboard"
            className="text-lg hover:scale-110 transition-transform px-2 py-1"
            title={t.leaderboard}
          >
            🏆
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex items-center justify-center flex-1 p-8">
        <div className="flex flex-col items-center gap-8 w-full max-w-md">
          {/* Logo + tagline */}
          <div className="text-center animate-bounce-in">
            <h1 className="text-5xl font-black tracking-tight">Jocus</h1>
            <p className="text-sm opacity-50 mt-2 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              Play together, anywhere
            </p>
          </div>

          {/* Avatar preview (when user has nickname) */}
          {nickname && !showJoin && (
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              className="animate-scale-in cursor-pointer group"
            >
              <div className="relative">
                <Avatar seed={avatarSeed} style={avatarStyle} size={72} className="group-hover:scale-105 transition-transform" />
                <span className="absolute -bottom-1 -right-1 text-xs bg-[var(--color-primary)] text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  ✎
                </span>
              </div>
            </button>
          )}

          {!showJoin ? (
            <div className="flex flex-col items-center gap-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex flex-wrap justify-center gap-6">
                {needsNickname ? (
                  <>
                    <PillButton size="lg" onClick={() => setShowNicknamePrompt(true)}>
                      {t.createRoom}
                    </PillButton>
                    <PillButton
                      variant="secondary"
                      size="lg"
                      onClick={() => setShowNicknamePrompt(true)}
                    >
                      {t.joinRoom}
                    </PillButton>
                  </>
                ) : (
                  <>
                    <Link href="/create-room">
                      <PillButton size="lg">{t.createRoom}</PillButton>
                    </Link>
                    <PillButton
                      variant="secondary"
                      size="lg"
                      onClick={() => setShowJoin(true)}
                    >
                      {t.joinRoom}
                    </PillButton>
                  </>
                )}
              </div>
              <Link
                href="/leaderboard"
                className="text-sm font-medium opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1.5"
              >
                🏆 {t.leaderboard}
              </Link>
            </div>
          ) : (
            <div className="w-full space-y-6 animate-fade-in-up">
              <div className="space-y-3">
                <label className="text-sm font-bold opacity-70 uppercase tracking-wide block">
                  {t.roomCode}
                </label>
                <form
                  onSubmit={(e) => { e.preventDefault(); handleJoinSubmit(); }}
                  className="flex gap-2 items-stretch"
                >
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    maxLength={6}
                    className="min-w-0 flex-1 bg-transparent border-2 border-foreground/20 rounded-lg px-4 py-3 text-2xl font-bold tracking-widest text-center text-foreground placeholder:text-foreground/30 focus:border-[var(--color-primary)] focus:outline-none transition-colors uppercase"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!joinCode.trim()}
                    className="shrink-0 px-5 py-3 rounded-lg bg-[var(--color-primary)] text-white font-bold text-lg disabled:opacity-30 hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    Go
                  </button>
                </form>
                {joinError && (
                  <p className="text-sm text-[var(--color-danger)]">{joinError}</p>
                )}
              </div>

              {activeRooms.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold opacity-70 uppercase tracking-wide">
                    Rooms on this network
                  </p>
                  <div className="space-y-2">
                    {activeRooms.map((room, i) => (
                      <button
                        key={room.code}
                        type="button"
                        onClick={() => handleRoomClick(room.code)}
                        className="w-full flex items-center justify-between bg-foreground/5 border border-foreground/15 rounded-lg px-4 py-3 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all cursor-pointer animate-slide-in-right"
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <div className="text-left">
                          <p className="font-bold">{room.host_nickname}&apos;s room</p>
                          <p className="text-xs opacity-50">{room.code}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {room.player_count}/{room.max_players}
                          </p>
                          <p className="text-xs opacity-50">{t.players}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowJoin(false)}
                  className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity cursor-pointer px-4 py-2 rounded-lg border border-foreground/20 hover:border-foreground/40"
                >
                  {t.back}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {showNicknamePrompt && (
        <NicknamePrompt onDone={() => setShowNicknamePrompt(false)} />
      )}
      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
    </>
  );
}
