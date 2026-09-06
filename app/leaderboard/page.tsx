"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "../components/LanguageContext";
import { Avatar, type AvatarStyle } from "../components/Avatar";
import { usePlayer } from "../components/PlayerContext";
import { api, type Player } from "../lib/api";

export default function LeaderboardPage() {
  const { t } = useLanguage();
  const { player: me } = usePlayer();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getLeaderboard(50).then(({ players }) => {
      setPlayers(players);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const medals = ["🥇", "🥈", "🥉"];

  function parseIcon(icon: string | undefined, fallback: string): { style: AvatarStyle; seed: string } {
    if (icon?.includes(":")) {
      const [style, seed] = icon.split(":");
      return { style: style as AvatarStyle, seed };
    }
    return { style: "adventurer", seed: fallback };
  }

  return (
    <main className="flex flex-col items-center p-6 max-w-lg mx-auto w-full">
      <div className="w-full space-y-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black">{t.leaderboard}</h1>
          <Link
            href="/"
            className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity px-3 py-1.5 rounded-lg border border-foreground/20 hover:border-foreground/40"
          >
            {t.back}
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : players.length === 0 ? (
          <p className="text-center opacity-50 py-12">{t.noGamesYet}</p>
        ) : (
          <div className="space-y-2">
            {players.map((player, i) => {
              const isMe = me && player.id === me.id;
              const { style, seed } = parseIcon(player.icon, player.id);
              return (
                <div
                  key={player.id}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 animate-slide-in-right border ${
                    isMe
                      ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]"
                      : "bg-foreground/5 border-foreground/10"
                  }`}
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <span className="w-8 text-center font-bold text-lg shrink-0">
                    {medals[i] || `${i + 1}`}
                  </span>
                  <Avatar seed={seed} style={style as AvatarStyle} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{player.nickname}</p>
                    <p className="text-xs opacity-50">
                      {player.games_won} {t.gamesWon} · {player.games_played} {t.gamesPlayed}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-lg text-[var(--color-primary)]">
                      {player.total_score}
                    </p>
                    <p className="text-[10px] opacity-40 uppercase">{t.totalScore}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
