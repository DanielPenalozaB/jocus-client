"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "./LanguageContext";
import { Avatar, type AvatarStyle } from "./Avatar";
import { Confetti } from "./Confetti";
import { PillButton } from "./PillButton";

interface LeaderboardPlayer {
  id: string;
  nickname: string;
  icon: string;
  score: number;
}

interface GameOverLeaderboardProps {
  players: Record<string, LeaderboardPlayer>;
  previousScores?: Record<string, number>;
  winnerId: string | null;
  winnerTeam?: "x" | "o" | null;
  teams?: { x: string[]; o: string[] } | null;
  isDraw: boolean;
  isHost: boolean;
  isSpectator?: boolean;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

function parseIcon(icon: string, fallbackName: string): [AvatarStyle, string] {
  if (icon && icon.includes(":")) {
    return icon.split(":", 2) as [AvatarStyle, string];
  }
  return ["adventurer", fallbackName];
}

function AnimatedScore({ from, target, delay }: { from: number; target: number; delay: number }) {
  const [value, setValue] = useState(from);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (from === target) {
      setValue(target);
      return;
    }
    const timeout = setTimeout(() => {
      const duration = 800;
      const steps = 20;
      const diff = target - from;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step >= steps) {
          setValue(target);
          setFlash(true);
          clearInterval(interval);
        } else {
          const progress = step / steps;
          const eased = 1 - Math.pow(1 - progress, 3);
          setValue(Math.round(from + diff * eased));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [from, target, delay]);

  return (
    <span className={flash ? "leaderboard-score-flash" : ""}>
      {value.toLocaleString()}
    </span>
  );
}

const PODIUM_COLORS = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-accent)",
];

const PODIUM_BORDER_COLORS = [
  "var(--color-navy)",
  "var(--color-indigo)",
  "var(--color-coral)",
];

const PODIUM_FLOAT_CLASSES = [
  "leaderboard-podium-float-1",
  "leaderboard-podium-float-2",
  "leaderboard-podium-float-3",
];

const RANK_LABELS = ["1st", "2nd", "3rd"];
const RANK_EMOJIS = ["🥇", "🥈", "🥉"];

const SPARKLE_POSITIONS = [
  { top: "8%", left: "15%", delay: "0s", size: "1rem" },
  { top: "14%", right: "18%", delay: "0.3s", size: "0.75rem" },
  { top: "28%", left: "8%", delay: "0.6s", size: "0.6rem" },
  { top: "10%", right: "8%", delay: "0.9s", size: "0.9rem" },
  { top: "32%", right: "12%", delay: "1.2s", size: "0.5rem" },
  { top: "20%", left: "25%", delay: "0.4s", size: "0.7rem" },
];

export function GameOverLeaderboard({
  players,
  previousScores,
  winnerId,
  winnerTeam,
  teams,
  isDraw,
  isHost,
  isSpectator,
  onPlayAgain,
  onBackToLobby,
}: GameOverLeaderboardProps) {
  const { t } = useLanguage();
  const [showPodium, setShowPodium] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowPodium(true), 400);
    const t2 = setTimeout(() => setShowDetails(true), 1600);
    const t3 = setTimeout(() => setShowActions(true), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const sorted = Object.values(players)
    .slice()
    .sort((a, b) => b.score - a.score);

  const podiumPlayers = sorted.slice(0, 3);
  const podiumOrder = podiumPlayers.length >= 3
    ? [podiumPlayers[1], podiumPlayers[0], podiumPlayers[2]]
    : podiumPlayers.length === 2
    ? [podiumPlayers[1], podiumPlayers[0]]
    : podiumPlayers;

  const podiumHeights = [120, 160, 90];
  const podiumHeights2 = [120, 160];

  return (
    <div className="relative flex flex-col items-center gap-5 w-full max-w-md mx-auto px-4 pb-8">
      <Confetti duration={6000} />

      {/* Floating sparkles */}
      {SPARKLE_POSITIONS.map((pos, i) => (
        <span
          key={i}
          className="absolute pointer-events-none leaderboard-sparkle z-0"
          style={{
            ...pos,
            fontSize: pos.size,
            animationDelay: pos.delay,
          }}
        >
          ✦
        </span>
      ))}

      {/* Title */}
      <div className="text-center leaderboard-title-enter relative z-10">
        <div className="leaderboard-trophy-bounce inline-block">
          <span className="text-5xl block">🏆</span>
        </div>
        <h2 className="text-3xl font-black mt-2 leaderboard-title-glow">
          {isDraw ? t.itsADraw : "Game Over!"}
        </h2>
        {(winnerId || winnerTeam) && (
          <p className="text-sm opacity-70 mt-1 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            {winnerTeam
              ? `${winnerTeam === "x" ? t.teamX : t.teamO} ${t.teamWon}`
              : `${players[winnerId!]?.nickname} ${t.playerWon}!`}
          </p>
        )}
      </div>

      {/* Team-based scoreboard */}
      {teams && showPodium && (
        <div className="flex flex-col gap-4 w-full pt-2 relative z-10 leaderboard-card-enter">
          {(winnerTeam ? [winnerTeam, winnerTeam === "x" ? "o" : "x"] as const : ["x", "o"] as const).map((teamKey) => {
            const teamPlayerIds = teams[teamKey];
            const teamPlayers = teamPlayerIds.map((id) => players[id]).filter(Boolean);
            const teamWins = teamPlayers.length > 0 ? teamPlayers[0].score : 0;
            const isWinningTeam = winnerTeam === teamKey;
            const color = teamKey === "x" ? "var(--color-primary)" : "var(--color-accent)";
            const label = teamKey === "x" ? t.teamX : t.teamO;

            return (
              <div
                key={teamKey}
                className={`rounded-lg border-2 px-5 py-4 transition-all ${
                  isWinningTeam ? "leaderboard-winner-glow" : ""
                }`}
                style={{
                  borderColor: isWinningTeam
                    ? `color-mix(in srgb, ${color} 80%, white)`
                    : "color-mix(in srgb, var(--foreground) 20%, transparent)",
                  backgroundColor: isWinningTeam
                    ? `color-mix(in srgb, ${color} 15%, var(--background))`
                    : "color-mix(in srgb, var(--foreground) 5%, var(--background))",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {isWinningTeam && <span className="text-base">👑</span>}
                    <span className="font-bold text-sm" style={{ color: isWinningTeam ? `color-mix(in srgb, ${color} 60%, white)` : color }}>{label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm">⭐</span>
                    <span className="font-black text-xl tabular-nums" style={{ color: isWinningTeam ? `color-mix(in srgb, ${color} 60%, white)` : color }}>
                      {teamWins}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {teamPlayers.map((player) => {
                    const [avatarStyle, avatarSeed] = parseIcon(player.icon, player.nickname);
                    return (
                      <div
                        key={player.id}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
                        style={{ backgroundColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}
                      >
                        <Avatar seed={avatarSeed} style={avatarStyle} size={24} />
                        <span className="text-xs font-medium truncate max-w-[80px]">{player.nickname}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Individual Podium (classic mode) */}
      {!teams && showPodium && (
        <div className="flex items-end justify-center gap-3 w-full pt-2 relative z-10">
          {podiumOrder.map((player, i) => {
            const actualRank = sorted.indexOf(player);
            const [avatarStyle, avatarSeed] = parseIcon(player.icon, player.nickname);
            const heights = podiumPlayers.length >= 3 ? podiumHeights : podiumHeights2;
            const height = heights[i] || 90;
            const isWinner = actualRank === 0;
            const podiumDelay = i === 1 ? 0.3 : i === 0 ? 0.1 : 0.5;

            return (
              <div
                key={player.id}
                className="flex flex-col items-center"
              >
                {/* Winner crown */}
                {isWinner && (
                  <span className="text-xl mb-1 leaderboard-crown-float">👑</span>
                )}

                {/* Avatar */}
                <div
                  className={`relative mb-2 leaderboard-avatar-enter ${isWinner ? "leaderboard-winner-glow" : ""}`}
                  style={{ animationDelay: `${podiumDelay}s` }}
                >
                  <div
                    className="rounded-full p-0.5"
                    style={{
                      background: PODIUM_COLORS[actualRank] || "var(--foreground)",
                    }}
                  >
                    <Avatar
                      seed={avatarSeed}
                      style={avatarStyle}
                      size={isWinner ? 64 : 48}
                      className="border-2 border-[var(--background)]"
                    />
                  </div>
                  {/* Rank badge */}
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap shadow-md"
                    style={{ backgroundColor: PODIUM_COLORS[actualRank] }}
                  >
                    {RANK_LABELS[actualRank]}
                  </span>
                </div>

                {/* Podium block with bottom border */}
                <div
                  className={`w-20 sm:w-24 rounded-t-2xl overflow-hidden leaderboard-podium-rise ${PODIUM_FLOAT_CLASSES[i]}`}
                  style={{
                    "--podium-height": `${height}px`,
                    animationDelay: `${podiumDelay + 0.2}s`,
                  } as React.CSSProperties}
                >
                  <div
                    className="w-full h-full flex flex-col items-center justify-center relative"
                    style={{ backgroundColor: PODIUM_COLORS[actualRank] }}
                  >
                    {/* Diagonal stripes — winner only */}
                    {isWinner && (
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `repeating-linear-gradient(
                            -45deg,
                            transparent,
                            transparent 10px,
                            rgba(255,255,255,0.35) 10px,
                            rgba(255,255,255,0.35) 14px
                          )`,
                        }}
                      />
                    )}
                    {/* Shimmer — winner only */}
                    {isWinner && (
                      <div className="absolute inset-0 leaderboard-shimmer" />
                    )}
                    <span className={`relative font-black text-white ${isWinner ? "text-2xl" : "text-base"}`}>
                      <AnimatedScore
                        from={player.id === winnerId && previousScores ? (previousScores[player.id] ?? 0) : player.score}
                        target={player.score}
                        delay={(podiumDelay + 0.5) * 1000}
                      />
                    </span>
                  </div>
                  {/* Bottom border strip */}
                  <div
                    className="w-full h-2 shrink-0"
                    style={{ backgroundColor: PODIUM_BORDER_COLORS[actualRank] }}
                  />
                </div>

                {/* Name */}
                <p
                  className={`mt-2 font-bold text-center truncate max-w-20 sm:max-w-24 animate-fade-in-up ${isWinner ? "text-base" : "text-sm opacity-80"}`}
                  style={{ animationDelay: `${podiumDelay + 0.6}s` }}
                >
                  {player.nickname}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Scores (classic mode only) */}
      {!teams && showDetails && sorted.length > 0 && (
        <div className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 p-4 space-y-3 leaderboard-card-enter relative z-10">
          <h3 className="text-sm font-bold opacity-70 flex items-center gap-2">
            <span>📊</span> {t.leaderboard}
          </h3>
          <div className="space-y-2">
            {sorted.map((player, rank) => {
              const [avatarStyle, avatarSeed] = parseIcon(player.icon, player.nickname);
              const isMVP = rank === 0 && !isDraw;
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 leaderboard-row-enter ${
                    isMVP ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 leaderboard-mvp-shimmer" : ""
                  }`}
                  style={{ animationDelay: `${rank * 0.1}s` }}
                >
                  <span className="text-sm font-bold w-7 text-center">
                    {rank < 3 ? RANK_EMOJIS[rank] : `${rank + 1}.`}
                  </span>
                  <Avatar seed={avatarSeed} style={avatarStyle} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{player.nickname}</p>
                    {isMVP && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--color-primary)]/20 text-[var(--color-primary)] mt-0.5">
                        ⭐ MVP
                      </span>
                    )}
                  </div>
                  <span className="font-black text-base tabular-nums">
                    {player.score.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="relative z-10">
          {isHost ? (
            <div className="flex gap-4 pt-2 leaderboard-actions-enter">
              <PillButton variant="secondary" onClick={onBackToLobby}>
                {t.lobby}
              </PillButton>
              <PillButton onClick={onPlayAgain}>
                {t.playAgain}
              </PillButton>
            </div>
          ) : isSpectator ? (
            <p className="text-sm opacity-60 pt-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              {t.watching}
            </p>
          ) : (
            <p className="text-sm opacity-60 pt-2 animate-pulse">
              {t.waitingForHost}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
