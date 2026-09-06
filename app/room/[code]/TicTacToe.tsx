"use client";

import { useEffect, useRef, useState } from "react";
import { Confetti } from "../../components/Confetti";
import { GameOverLeaderboard } from "../../components/GameOverLeaderboard";
import { useLanguage } from "../../components/LanguageContext";
import { sounds } from "../../lib/sounds";
import type { Channel } from "phoenix";

interface TicTacToeState {
  board: (string | null)[];
  // Classic mode
  player_x?: string;
  player_o?: string;
  // Team mode
  team_x?: string[];
  team_o?: string[];
  team_x_index?: number;
  team_o_index?: number;
  current_team?: "x" | "o";
  winner_team?: "x" | "o" | null;
  mode: "classic" | "team";
  // Shared
  current_turn: string;
  winner: string | null;
  draw: boolean;
}

interface RoomPlayer {
  id: string;
  nickname: string;
  icon: string;
  score: number;
}

interface TicTacToeProps {
  gameState: TicTacToeState;
  myId: string;
  channel: Channel;
  players: Record<string, RoomPlayer>;
  isHost: boolean;
  isSpectator: boolean;
  onBackToLobby: () => void;
  onPlayAgain: () => void;
}

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const LINE_COORDS: Record<string, { x1: number; y1: number; x2: number; y2: number }> = {
  "0,1,2": { x1: 16, y1: 16, x2: 84, y2: 16 },
  "3,4,5": { x1: 16, y1: 50, x2: 84, y2: 50 },
  "6,7,8": { x1: 16, y1: 84, x2: 84, y2: 84 },
  "0,3,6": { x1: 16, y1: 16, x2: 16, y2: 84 },
  "1,4,7": { x1: 50, y1: 16, x2: 50, y2: 84 },
  "2,5,8": { x1: 84, y1: 16, x2: 84, y2: 84 },
  "0,4,8": { x1: 12, y1: 12, x2: 88, y2: 88 },
  "2,4,6": { x1: 88, y1: 12, x2: 12, y2: 88 },
};

function getWinLine(board: (string | null)[]): string | null {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return line.join(",");
    }
  }
  return null;
}

export function TicTacToe({
  gameState: initialState,
  myId,
  channel,
  players,
  isHost,
  isSpectator,
  onBackToLobby,
  onPlayAgain,
}: TicTacToeProps) {
  const { t } = useLanguage();
  const [board, setBoard] = useState<(string | null)[]>(initialState.board);
  const [currentTurn, setCurrentTurn] = useState(initialState.current_turn);
  const [winner, setWinner] = useState<string | null>(initialState.winner);
  const [draw, setDraw] = useState(initialState.draw);
  const [showWinConfetti, setShowWinConfetti] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const scoresAtStart = useRef<Record<string, number>>(
    Object.fromEntries(Object.entries(players).map(([id, p]) => [id, p.score]))
  );

  const isTeamMode = initialState.mode === "team";
  const [winnerTeam, setWinnerTeam] = useState<"x" | "o" | null>(initialState.winner_team || null);

  const myMark: "x" | "o" | null = isSpectator
    ? null
    : isTeamMode
    ? (initialState.team_x?.includes(myId) ? "x" : initialState.team_o?.includes(myId) ? "o" : null)
    : myId === initialState.player_x ? "x" : "o";

  const isMyTurn = !isSpectator && currentTurn === myId;
  const gameOver = !!winner || draw || !!winnerTeam;
  const winLine = gameOver ? getWinLine(board) : null;

  const iWon = !isSpectator && (
    isTeamMode
      ? (winnerTeam === myMark)
      : winner === myId
  );
  const iLost = !isSpectator && (
    isTeamMode
      ? (!!winnerTeam && winnerTeam !== myMark)
      : (!!winner && winner !== myId)
  );

  useEffect(() => {
    const ref = channel.on("game_event", (event: unknown) => {
      const e = event as { type: string; position?: number; mark?: string; winner?: string; winner_team?: string; result?: string; player_id?: string; next_turn?: string };

      if (e.type === "move" && e.position !== undefined) {
        setBoard((prev) => {
          const next = [...prev];
          next[e.position!] = e.mark!;
          return next;
        });
        if (e.next_turn) {
          setCurrentTurn(e.next_turn);
        } else {
          setCurrentTurn(
            e.mark === "x" ? initialState.player_o! : initialState.player_x!
          );
        }
        sounds.move();
      }

      if (e.type === "game_over") {
        if (e.result === "win") {
          if (e.winner_team) {
            setWinnerTeam(e.winner_team as "x" | "o");
          }
          if (e.winner) {
            setWinner(e.winner);
          }
          if (!isSpectator) {
            const myTeamWon = isTeamMode && e.winner_team === myMark;
            const iWonClassic = !isTeamMode && e.winner === myId;
            if (myTeamWon || iWonClassic) {
              sounds.win();
              setShowWinConfetti(true);
            } else {
              sounds.lose();
            }
          }
        }
        if (e.result === "draw") {
          setDraw(true);
        }
        setTimeout(() => setShowLeaderboard(true), 2000);
      }
    });

    return () => {
      (channel as any).off("game_event", ref);
    };
  }, [channel, initialState.player_o, initialState.player_x, myId, isSpectator, isTeamMode, myMark]);

  useEffect(() => {
    setBoard(initialState.board);
    setCurrentTurn(initialState.current_turn);
    setWinner(initialState.winner);
    setWinnerTeam(initialState.winner_team || null);
    setDraw(initialState.draw);
    setShowLeaderboard(false);
    setShowWinConfetti(false);
    scoresAtStart.current = Object.fromEntries(
      Object.entries(players).map(([id, p]) => [id, p.score])
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialState]);

  function handleCellClick(index: number) {
    if (isSpectator || !isMyTurn || board[index] || gameOver) return;
    channel.push("game_action", { position: index });
    sounds.move();
    setBoard((prev) => {
      const next = [...prev];
      next[index] = myMark!;
      return next;
    });
    // Clear our turn optimistically; server event will set the real next turn
    setCurrentTurn("");
  }

  function playerName(id: string) {
    return players[id]?.nickname || "Player";
  }

  const leaderboardPlayers = isSpectator
    ? Object.fromEntries(Object.entries(players).filter(([id]) => id !== myId))
    : players;

  if (showLeaderboard) {
    return (
      <GameOverLeaderboard
        players={leaderboardPlayers}
        previousScores={scoresAtStart.current}
        winnerId={winner}
        winnerTeam={winnerTeam}
        teams={isTeamMode ? { x: initialState.team_x!, o: initialState.team_o! } : null}
        isDraw={draw}
        isHost={isHost}
        isSpectator={isSpectator}
        onPlayAgain={onPlayAgain}
        onBackToLobby={onBackToLobby}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {showWinConfetti && <Confetti duration={5000} />}

      <h2 className="text-2xl font-bold">Tic Tac Toe</h2>
      {isSpectator ? (
        <p className="text-sm font-medium opacity-60 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
          {t.watching}
        </p>
      ) : (
        <p className="text-sm font-medium opacity-80">
          {t.youAre}{" "}
          <span className={`font-bold text-lg ${myMark === "x" ? "text-[var(--color-primary)]" : "text-[var(--color-accent)]"}`}>
            {isTeamMode ? (myMark === "x" ? t.teamX : t.teamO) : myMark!.toUpperCase()}
          </span>
        </p>
      )}

      {/* Game over result message */}
      {gameOver ? (
        <div className="text-center animate-bounce-in">
          {isSpectator ? (
            <>
              {(winner || winnerTeam) && (
                <>
                  <p className="text-3xl mb-1">🏆</p>
                  <p className="text-xl font-black">
                    {isTeamMode
                      ? `${winnerTeam === "x" ? t.teamX : t.teamO} ${t.teamWon}`
                      : `${playerName(winner!)} ${t.playerWon}!`}
                  </p>
                </>
              )}
              {draw && (
                <>
                  <p className="text-3xl mb-1">🤝</p>
                  <p className="text-xl font-black opacity-70">{t.itsADraw}</p>
                </>
              )}
            </>
          ) : (
            <>
              {iWon && (
                <>
                  <p className="text-3xl mb-1">🎉</p>
                  <p className="text-xl font-black text-[var(--color-accent)]">
                    {isTeamMode ? t.yourTeamWon : t.youWon}
                  </p>
                  <p className="text-sm opacity-60 mt-1">{t.congratulations}</p>
                </>
              )}
              {iLost && (
                <>
                  <p className="text-3xl mb-1">😔</p>
                  <p className="text-xl font-black text-[var(--color-danger)]">
                    {isTeamMode
                      ? t.yourTeamLost
                      : `${playerName(winner!)} ${t.playerWon}`}
                  </p>
                  <p className="text-sm opacity-60 mt-1">{t.betterLuck}</p>
                </>
              )}
              {draw && (
                <>
                  <p className="text-3xl mb-1">🤝</p>
                  <p className="text-xl font-black opacity-70">{t.itsADraw}</p>
                </>
              )}
            </>
          )}
        </div>
      ) : (
        <p
          className={`text-lg font-bold ${
            isMyTurn ? "text-[var(--color-primary)]" : "opacity-70"
          }`}
        >
          {isMyTurn ? t.yourTurn : `${playerName(currentTurn)}${t.turnOf}`}
        </p>
      )}

      <div className="relative">
        <div className="grid grid-cols-3 gap-3">
          {board.map((cell, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleCellClick(i)}
              disabled={isSpectator || !isMyTurn || !!cell || gameOver}
              className={`w-24 h-24 rounded-xl border-2 text-4xl font-bold flex items-center justify-center transition-all
                ${
                  cell
                    ? "border-foreground/30 bg-foreground/5"
                    : !isSpectator && isMyTurn && !gameOver
                    ? "border-foreground/20 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 cursor-pointer"
                    : "border-foreground/15 cursor-default"
                }
              `}
            >
              {cell === "x" && <span className="text-[var(--color-primary)]">X</span>}
              {cell === "o" && <span className="text-[var(--color-accent)]">O</span>}
            </button>
          ))}
        </div>

        {winLine && LINE_COORDS[winLine] && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <line
              x1={LINE_COORDS[winLine].x1}
              y1={LINE_COORDS[winLine].y1}
              x2={LINE_COORDS[winLine].x2}
              y2={LINE_COORDS[winLine].y2}
              stroke="var(--color-accent)"
              strokeWidth="3"
              strokeLinecap="round"
              className="animate-[draw_0.4s_ease-out_forwards]"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
