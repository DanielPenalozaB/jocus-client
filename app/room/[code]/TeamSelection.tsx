"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../../components/LanguageContext";
import { Avatar, type AvatarStyle } from "../../components/Avatar";
import { PillButton } from "../../components/PillButton";
import { useToast } from "../../components/ToastContext";
import { sounds } from "../../lib/sounds";
import type { Channel } from "phoenix";

interface RoomPlayer {
  id: string;
  nickname: string;
  icon: string;
  score: number;
}

interface TeamSelectionProps {
  teams: { x: string[]; o: string[] };
  players: Record<string, RoomPlayer>;
  myId: string;
  readyPlayers: Set<string>;
  timeRemaining: number;
  isSpectator: boolean;
  channel: Channel;
}

export function TeamSelection({
  teams,
  players,
  myId,
  readyPlayers,
  timeRemaining,
  isSpectator,
  channel,
}: TeamSelectionProps) {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [timer, setTimer] = useState(timeRemaining);
  const prevTimer = useRef(timeRemaining);

  const isReady = readyPlayers.has(myId);
  const myTeam = teams.x.includes(myId) ? "x" : teams.o.includes(myId) ? "o" : null;
  const totalPlayers = teams.x.length + teams.o.length;
  const readyCount = readyPlayers.size;

  useEffect(() => {
    setTimer(timeRemaining);
  }, [timeRemaining]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (timer < prevTimer.current && timer > 0 && timer <= 15) {
      sounds.timerTick();
    }
    prevTimer.current = timer;
  }, [timer]);

  function handleSwap() {
    channel.push("swap_team", {}).receive("error", (err: unknown) => {
      const e = err as { reason?: string };
      if (e.reason === "min_one_per_team") {
        showToast(t.minOnePerTeam, "error");
      }
    });
  }

  function handleReady() {
    if (isReady) {
      channel.push("unready", {});
    } else {
      channel.push("ready_up", {});
    }
  }

  function parseIcon(icon: string, fallbackName: string): [AvatarStyle, string] {
    if (icon && icon.includes(":")) {
      return icon.split(":", 2) as [AvatarStyle, string];
    }
    return ["adventurer", fallbackName];
  }

  function renderTeamColumn(teamKey: "x" | "o", playerIds: string[]) {
    const isMyColumn = myTeam === teamKey;
    const colorClass = teamKey === "x" ? "var(--color-primary)" : "var(--color-accent)";
    const label = teamKey === "x" ? t.teamX : t.teamO;

    return (
      <div
        className="flex-1 rounded-2xl border-2 p-4 transition-all"
        style={{
          borderColor: isMyColumn ? colorClass : "color-mix(in srgb, var(--foreground) 20%, transparent)",
          backgroundColor: isMyColumn
            ? `color-mix(in srgb, ${colorClass} 15%, color-mix(in srgb, var(--background) 90%, black))`
            : "color-mix(in srgb, var(--foreground) 5%, var(--background))",
        }}
      >
        <h3
          className="text-center font-bold text-lg mb-4"
          style={{ color: colorClass }}
        >
          {label}
        </h3>

        <div className="space-y-2 min-h-[120px]">
          {playerIds.map((id) => {
            const player = players[id];
            if (!player) return null;
            const [style, seed] = parseIcon(player.icon, player.nickname);
            const playerReady = readyPlayers.has(id);
            return (
              <div
                key={id}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                  playerReady ? "bg-foreground/10" : "bg-foreground/5"
                }`}
              >
                <Avatar seed={seed} style={style} size={28} />
                <span className="text-sm font-medium truncate flex-1">{player.nickname}</span>
                {playerReady && (
                  <span className="text-xs font-bold text-[var(--color-primary)]">✓</span>
                )}
              </div>
            );
          })}
        </div>

        {!isSpectator && !isMyColumn && (
          <button
            type="button"
            onClick={handleSwap}
            className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95"
            style={{
              backgroundColor: `color-mix(in srgb, ${colorClass} 30%, var(--background))`,
              color: "var(--foreground)",
              border: `1.5px solid color-mix(in srgb, ${colorClass} 60%, transparent)`,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m16 3 4 4-4 4" />
              <path d="M20 7H4" />
              <path d="m8 21-4-4 4-4" />
              <path d="M4 17h16" />
            </svg>
            {t.joinRoom}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto p-4 animate-fade-in-up">
      <h2 className="text-2xl font-bold">{t.teamSelection}</h2>

      {/* Timer bar */}
      <div className="w-full space-y-1">
        <div className="w-full h-2 bg-foreground/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-linear ${
              timer <= 15 ? "bg-[var(--color-warning)]" : "bg-[var(--color-primary)]"
            }`}
            style={{ width: `${(timer / 30) * 100}%` }}
          />
        </div>
        <p className={`text-xs text-center tabular-nums ${timer <= 15 ? "text-[var(--color-warning)] font-bold" : "opacity-50"}`}>
          {timer}s
        </p>
      </div>

      {/* Teams */}
      <div className="flex gap-4 w-full">
        {renderTeamColumn("x", teams.x)}
        {renderTeamColumn("o", teams.o)}
      </div>

      {/* Ready section */}
      {!isSpectator && (
        <div className="flex flex-col items-center gap-2">
          {isReady ? (
            <button
              type="button"
              onClick={handleReady}
              className="px-6 py-2.5 rounded-full font-bold text-sm bg-[var(--color-primary)] text-white shadow-[0_0_20px_color-mix(in_srgb,var(--color-primary)_50%,transparent)] cursor-pointer flex items-center gap-2 transition-all hover:opacity-90 active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t.ready}
            </button>
          ) : (
            <PillButton onClick={handleReady}>
              {t.ready}
            </PillButton>
          )}
          <p className="text-xs opacity-50">
            {readyCount}/{totalPlayers} {t.ready.toLowerCase()}
          </p>
        </div>
      )}

      {isSpectator && (
        <p className="text-sm opacity-60 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
          {t.watching}
        </p>
      )}
    </div>
  );
}
