"use client";

import { use, useEffect, useState, useRef, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FullscreenToggle } from "../../components/FullscreenToggle";
import { RoomMenu } from "../../components/RoomMenu";
import { useSoundSync, useBackgroundMusic } from "../../components/SoundSync";
import { PillButton } from "../../components/PillButton";
import { Countdown } from "../../components/Countdown";
import { Confetti } from "../../components/Confetti";
import { useLanguage } from "../../components/LanguageContext";
import { usePlayer } from "../../components/PlayerContext";
import { Avatar, type AvatarStyle } from "../../components/Avatar";
import { api, type GameInfo } from "../../lib/api";
import { joinRoom, disconnectSocket, setSocketCallbacks } from "../../lib/socket";
import { sounds } from "../../lib/sounds";
import { useToast } from "../../components/ToastContext";
import { TicTacToe } from "./TicTacToe";
import { TeamSelection } from "./TeamSelection";
import type { Channel } from "phoenix";

interface RoomPlayer {
  id: string;
  nickname: string;
  icon: string;
  score: number;
}

const GAME_ICONS: Record<string, string> = {
  "tic-tac-toe": "⭕",
  "stop": "✋",
  "hangman": "💀",
  "impostor": "🕵️",
  "charades": "🎭",
  "parques": "🎲",
};

export default function RoomPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { t } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();
  useSoundSync();
  useBackgroundMusic();
  const { deviceToken, nickname, setNickname, avatarSeed, avatarStyle } = usePlayer();
  const [players, setPlayers] = useState<Record<string, RoomPlayer>>({});
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [hostId, setHostId] = useState("");
  const [myId, setMyId] = useState("");
  const [games, setGames] = useState<GameInfo[]>([]);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameState, setGameState] = useState<unknown>(null);
  const [status, setStatus] = useState<"lobby" | "team_selection" | "playing">("lobby");
  const [teams, setTeams] = useState<{ x: string[]; o: string[] } | null>(null);
  const [readyPlayers, setReadyPlayers] = useState<Set<string>>(new Set());
  const [teamSelectionTimer, setTeamSelectionTimer] = useState(30);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(nickname);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [newPlayerId, setNewPlayerId] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [hostMode, setHostMode] = useState<string>("host_and_play");
  const [reconnecting, setReconnecting] = useState(false);
  const channelRef = useRef<Channel | null>(null);
  const prevPlayerCountRef = useRef(0);
  const myIdRef = useRef("");
  const hostIdRef = useRef("");

  const [joinUrl, setJoinUrl] = useState("");

  useEffect(() => {
    setJoinUrl(`${window.location.origin}/join/${code}`);
  }, [code]);

  const isHost = !!(myId && myId === hostId);
  const isSpectator = isHost && hostMode === "host_only";
  const playerList = Object.values(players);
  const visiblePlayers = isSpectator
    ? playerList.filter(p => p.id !== myId)
    : playerList;

  const myRank = (() => {
    if (!myId || isSpectator) return 0;
    const sorted = [...playerList].sort((a, b) => b.score - a.score);
    return sorted.findIndex(p => p.id === myId) + 1;
  })();
  const myNickname = players[myId]?.nickname || nickname;

  useEffect(() => {
    const count = playerList.length;
    if (count > prevPlayerCountRef.current && prevPlayerCountRef.current > 0) {
      setShowConfetti(true);
      sounds.playerJoin();
      setTimeout(() => setShowConfetti(false), 4500);
    }
    prevPlayerCountRef.current = count;
  }, [playerList.length]);

  useEffect(() => {
    api.getGames().then(({ games }) => setGames(games));
  }, []);

  useEffect(() => {
    if (!deviceToken || !nickname) return;

    const channel = joinRoom(
      { device_token: deviceToken, nickname, avatar_seed: avatarSeed, avatar_style: avatarStyle },
      code,
      {
      onJoin: (state: unknown) => {
        const roomState = state as {
          players: Record<string, RoomPlayer>;
          host_id: string;
          your_id: string;
          current_game: string | null;
          status: "lobby" | "playing";
          game_state: unknown;
          host_mode?: string;
        };
        setPlayers(roomState.players || {});
        setHostId(roomState.host_id);
        hostIdRef.current = roomState.host_id;
        setMyId(roomState.your_id);
        myIdRef.current = roomState.your_id;
        setHostMode(roomState.host_mode || "host_and_play");
        setCurrentGame(roomState.current_game);
        setSelectedGame(roomState.current_game);
        setStatus(roomState.status);
        if (roomState.status === "playing" && roomState.game_state) {
          setGameState(roomState.game_state);
        }
        setConnected(true);
        prevPlayerCountRef.current = Object.keys(roomState.players || {}).length;
      },
      onError: (reason: unknown) => {
        const err = reason as { reason?: string };
        const msg = err.reason || "Failed to join room";
        if (msg === "room_not_found" || msg === ":room_not_found") {
          setError("room_closed");
        } else if (msg === "password_required") {
          setPasswordRequired(true);
        } else {
          setError(msg);
        }
      },
      onPlayerJoined: (player: unknown) => {
        const p = player as RoomPlayer;
        setPlayers((prev) => ({ ...prev, [p.id]: p }));
        setNewPlayerId(p.id);
        setTimeout(() => setNewPlayerId(null), 600);
      },
      onPlayerLeft: (data: unknown) => {
        const { player_id } = data as { player_id: string };
        setPlayers((prev) => {
          const next = { ...prev };
          delete next[player_id];
          return next;
        });
      },
      onGameSelected: (data: unknown) => {
        const { game_id } = data as { game_id: string };
        setSelectedGame(game_id);
        setCurrentGame(game_id);
      },
      onGameStarted: (data: unknown) => {
        const { game_state } = data as { game_state: unknown };
        setGameState(game_state);
        setShowCountdown(false);
        setStatus("playing");
        sounds.gameStart();
      },
      onBackToLobby: () => {
        setStatus("lobby");
        setGameState(null);
      },
      onRoomClosed: () => {
        setError("room_closed");
        setConnected(false);
      },
    },
    );

    channelRef.current = channel;

    // Socket-level reconnection indicators
    setSocketCallbacks({
      onClose: () => {
        if (error !== "kicked" && error !== "room_closed") {
          setReconnecting(true);
        }
      },
      onOpen: () => {
        setReconnecting(false);
      },
    });

    // Listen for countdown and kick events
    channel.on("countdown_started", () => {
      setStatus("lobby");
      setShowCountdown(true);
    });

    channel.on("team_selection_started", (data: unknown) => {
      const { teams: t, timeout_seconds } = data as { teams: { x: string[]; o: string[] }; timeout_seconds: number };
      setTeams(t);
      setReadyPlayers(new Set());
      setTeamSelectionTimer(timeout_seconds);
      setStatus("team_selection");
    });

    channel.on("teams_updated", (data: unknown) => {
      const { teams: t } = data as { teams: { x: string[]; o: string[] } };
      setTeams(t);
    });

    channel.on("player_ready", (data: unknown) => {
      const { player_id } = data as { player_id: string };
      setReadyPlayers(prev => new Set([...prev, player_id]));
    });

    channel.on("player_unready", (data: unknown) => {
      const { player_id } = data as { player_id: string };
      setReadyPlayers(prev => {
        const next = new Set(prev);
        next.delete(player_id);
        return next;
      });
    });

    channel.on("team_selection_complete", (data: unknown) => {
      const { teams: t } = data as { teams: { x: string[]; o: string[] } };
      setTeams(t);
    });

    channel.on("player_kicked", (data: unknown) => {
      const { player_id } = data as { player_id: string };
      if (player_id === myIdRef.current) {
        sounds.kick();
        setError("kicked");
        setConnected(false);
        setReconnecting(false);
        channel.leave();
        disconnectSocket();
      }
    });

    channel.on("scores_updated", (data: unknown) => {
      const { players: updatedPlayers } = data as { players: Record<string, RoomPlayer> };
      setPlayers(updatedPlayers);
    });

    return () => {
      setSocketCallbacks({});
      channel.leave();
      disconnectSocket();
    };
  }, [deviceToken, nickname, code]);

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    setPasswordRequired(false);
    setError("");

    const channel = joinRoom(
      { device_token: deviceToken, nickname, avatar_seed: avatarSeed, avatar_style: avatarStyle },
      code,
      {
        onJoin: (state: unknown) => {
          const roomState = state as {
            players: Record<string, RoomPlayer>;
            host_id: string;
            your_id: string;
            current_game: string | null;
            status: "lobby" | "playing";
            game_state: unknown;
            host_mode?: string;
          };
          setPlayers(roomState.players || {});
          setHostId(roomState.host_id);
          hostIdRef.current = roomState.host_id;
          setMyId(roomState.your_id);
          myIdRef.current = roomState.your_id;
          setHostMode(roomState.host_mode || "host_and_play");
          setCurrentGame(roomState.current_game);
          setSelectedGame(roomState.current_game);
          setStatus(roomState.status);
          if (roomState.status === "playing" && roomState.game_state) {
            setGameState(roomState.game_state);
          }
          setConnected(true);
          prevPlayerCountRef.current = Object.keys(roomState.players || {}).length;
        },
        onError: (reason: unknown) => {
          const err = reason as { reason?: string };
          const msg = err.reason || "Failed to join room";
          if (msg === "password_required") {
            setPasswordRequired(true);
            setError("wrong_password");
          } else {
            setError(msg);
          }
        },
        onPlayerJoined: (player: unknown) => {
          const p = player as RoomPlayer;
          setPlayers((prev) => ({ ...prev, [p.id]: p }));
          setNewPlayerId(p.id);
          setTimeout(() => setNewPlayerId(null), 600);
        },
        onPlayerLeft: (data: unknown) => {
          const { player_id } = data as { player_id: string };
          setPlayers((prev) => {
            const next = { ...prev };
            delete next[player_id];
            return next;
          });
        },
        onGameSelected: (data: unknown) => {
          const { game_id } = data as { game_id: string };
          setSelectedGame(game_id);
          setCurrentGame(game_id);
        },
        onGameStarted: (data: unknown) => {
          const { game_state } = data as { game_state: unknown };
          setGameState(game_state);
          setShowCountdown(false);
          setStatus("playing");
          sounds.gameStart();
        },
        onBackToLobby: () => {
          setStatus("lobby");
          setGameState(null);
        },
        onRoomClosed: () => {
          setError("room_closed");
          setConnected(false);
        },
      },
      passwordInput.trim()
    );

    channelRef.current = channel;

    channel.on("countdown_started", () => {
      setShowCountdown(true);
    });

    channel.on("player_kicked", (data: unknown) => {
      const { player_id } = data as { player_id: string };
      if (player_id === myIdRef.current) {
        sounds.kick();
        setError("kicked");
        setConnected(false);
        channel.leave();
        disconnectSocket();
      }
    });

    channel.on("scores_updated", (data: unknown) => {
      const { players: updatedPlayers } = data as { players: Record<string, RoomPlayer> };
      setPlayers(updatedPlayers);
    });
  }

  function handleSelectGame(gameId: string) {
    setSelectedGame(gameId);
    channelRef.current?.push("select_game", { game_id: gameId });
    sounds.buttonClick();
  }

  function handleStartGame() {
    if (!selectedGame) return;
    setShowCountdown(true);
    channelRef.current?.push("countdown", {}).receive("error", () => {
      setShowCountdown(false);
      showToast(t.errorStartGame, "error");
    });
  }

  const handleCountdownComplete = useCallback(() => {
    setShowCountdown(false);
    if (myIdRef.current === hostIdRef.current) {
      channelRef.current?.push("start_game", {}).receive("error", () => {
        showToast(t.errorStartGame, "error");
      });
    }
  }, [showToast, t.errorStartGame]);

  function handleBackToLobby() {
    channelRef.current?.push("back_to_lobby", {});
  }

  function handlePlayAgain() {
    channelRef.current?.push("countdown", {});
  }

  function handleCloseRoom() {
    channelRef.current?.push("close_room", {}).receive("error", () => {
      showToast(t.errorGeneric, "error");
    });
    router.push("/");
  }

  function handleLeaveRoom() {
    channelRef.current?.leave();
    disconnectSocket();
    router.push("/");
  }

  function handleKickPlayer(playerId: string) {
    channelRef.current?.push("kick_player", { player_id: playerId }).receive("error", () => {
      showToast(t.errorGeneric, "error");
    });
  }

  function handleNicknameSubmit() {
    const trimmed = nicknameInput.trim();
    if (trimmed && trimmed !== nickname) {
      setNickname(trimmed);
    }
    setEditingNickname(false);
  }

  const selectedGameInfo = games.find((g) => g.id === selectedGame);
  const activePlayers = isSpectator
    ? playerList.filter(p => p.id !== myId)
    : playerList;
  const canStart =
    selectedGame &&
    selectedGameInfo &&
    activePlayers.length >= selectedGameInfo.min_players &&
    activePlayers.length <= selectedGameInfo.max_players;

  // Kicked screen
  if (error === "kicked") {
    return (
      <main className="flex items-center justify-center flex-1 p-8 min-h-screen">
        <div className="text-center space-y-4 animate-scale-in">
          <p className="text-4xl">🚫</p>
          <p className="text-lg font-bold">{t.youWereKicked}</p>
          <p className="text-sm opacity-60">{t.hostKickedYou}</p>
          <Link href="/">
            <PillButton>{t.backToHome}</PillButton>
          </Link>
        </div>
      </main>
    );
  }

  // Room closed screen
  if (error === "room_closed") {
    return (
      <main className="flex items-center justify-center flex-1 p-8 min-h-screen">
        <div className="text-center space-y-4 animate-scale-in">
          <p className="text-4xl">👋</p>
          <p className="text-lg font-bold">{t.roomEnded}</p>
          <p className="text-sm opacity-60">{t.hostClosedRoom}</p>
          <Link href="/">
            <PillButton>{t.backToHome}</PillButton>
          </Link>
        </div>
      </main>
    );
  }

  // Password required screen
  if (passwordRequired) {
    return (
      <main className="flex items-center justify-center flex-1 p-8 min-h-screen">
        <div className="text-center space-y-5 animate-scale-in max-w-sm w-full">
          <p className="text-4xl">🔒</p>
          <h2 className="text-lg font-bold">{t.passwordRequired}</h2>
          <p className="text-sm opacity-60">{t.enterRoomPassword}</p>
          {error === "wrong_password" && (
            <p className="text-sm text-[var(--color-danger)]">{t.wrongPassword}</p>
          )}
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder={t.password}
              className="w-full bg-transparent border-2 border-foreground/20 rounded-lg px-4 py-3 text-foreground focus:border-[var(--color-primary)] focus:outline-none transition-colors text-center"
              autoFocus
            />
            <div className="flex gap-3 justify-center">
              <Link href="/">
                <PillButton variant="secondary" size="sm">{t.back}</PillButton>
              </Link>
              <PillButton size="sm" onClick={() => handlePasswordSubmit({ preventDefault: () => {} } as React.FormEvent)}>
                {t.joinRoom}
              </PillButton>
            </div>
          </form>
        </div>
      </main>
    );
  }

  // Team selection state
  if (status === "team_selection" && teams && channelRef.current) {
    return (
      <>
        {reconnecting && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-warning)] text-white text-center py-2 text-xs font-bold animate-fade-in-up">
            Reconectando...
          </div>
        )}
        <header className="flex justify-between items-center p-4">
          {isHost ? (
            <span className="text-foreground font-bold opacity-50">{code}</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold truncate max-w-[120px]">{myNickname}</span>
              {myRank > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-foreground/10 opacity-60">#{myRank}</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1">
            <FullscreenToggle />
            <RoomMenu isHost={isHost} onLeaveRoom={handleLeaveRoom} onCloseRoom={() => setShowCloseConfirm(true)} />
          </div>
        </header>
        <main className="flex items-start justify-center flex-1 p-4 sm:p-8 overflow-y-auto">
          <TeamSelection
            teams={teams}
            players={players}
            myId={myId}
            readyPlayers={readyPlayers}
            timeRemaining={teamSelectionTimer}
            isSpectator={isSpectator}
            channel={channelRef.current}
          />
        </main>
      </>
    );
  }

  // Playing state
  if (status === "playing" && gameState && channelRef.current) {
    return (
      <>
        {reconnecting && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-warning)] text-white text-center py-2 text-xs font-bold animate-fade-in-up">
            Reconectando...
          </div>
        )}
        <header className="flex justify-between items-center p-4">
          {isHost ? (
            <span className="text-foreground font-bold opacity-50">{code}</span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold truncate max-w-[120px]">{myNickname}</span>
              {myRank > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-foreground/10 opacity-60">#{myRank}</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1">
            <FullscreenToggle />
            <RoomMenu isHost={isHost} onLeaveRoom={handleLeaveRoom} onCloseRoom={() => setShowCloseConfirm(true)} />
          </div>
        </header>
        <main className="flex items-start justify-center flex-1 p-4 sm:p-8 overflow-y-auto">
          {currentGame === "tic-tac-toe" && (
            <TicTacToe
              gameState={gameState as any}
              myId={myId}
              channel={channelRef.current}
              players={players}
              isHost={isHost}
              isSpectator={isSpectator}
              onBackToLobby={handleBackToLobby}
              onPlayAgain={handlePlayAgain}
            />
          )}
        </main>
      </>
    );
  }

  // Close room confirmation modal
  const closeConfirmModal = showCloseConfirm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[var(--background)] border border-foreground/20 rounded-2xl p-6 max-w-sm w-full space-y-4 animate-scale-in">
        <h3 className="text-lg font-bold">{t.closeRoom}?</h3>
        <p className="text-sm opacity-70">
          {t.closeRoomConfirm}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => setShowCloseConfirm(false)}
            className="px-4 py-2 rounded-lg text-sm font-medium opacity-70 hover:opacity-100 cursor-pointer"
          >
            {t.back}
          </button>
          <PillButton variant="danger" size="sm" onClick={handleCloseRoom}>
            {t.closeRoom}
          </PillButton>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {closeConfirmModal}
      {showCountdown && <Countdown onComplete={handleCountdownComplete} />}
      {showConfetti && <Confetti />}
      {reconnecting && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-warning)] text-white text-center py-2 text-xs font-bold animate-fade-in-up">
          Reconectando...
        </div>
      )}
      <header className="flex justify-between items-center p-4">
        {isHost ? (
          <span className="text-foreground font-bold opacity-50">{code}</span>
        ) : (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold truncate max-w-[120px]">{myNickname}</span>
            {myRank > 0 && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-foreground/10 opacity-60">#{myRank}</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1">
          <FullscreenToggle />
          <RoomMenu isHost={isHost} onLeaveRoom={handleLeaveRoom} onCloseRoom={() => setShowCloseConfirm(true)} />
        </div>
      </header>
      <main className="flex items-center justify-center flex-1 p-4 sm:p-8">
        <div className="flex flex-col items-center gap-6 w-full max-w-lg">
          {isHost ? (
            <div className="animate-fade-in-up">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium opacity-70">{t.roomCode}</p>
                <h1 className="text-5xl font-bold tracking-widest select-all">
                  {code}
                </h1>
                <p className="text-sm opacity-50">{t.shareCode}</p>
              </div>

              <div className="flex justify-center mt-5">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg animate-pulse-ring">
                  <QRCodeSVG
                    value={joinUrl}
                    size={160}
                    level="M"
                    bgColor="#ffffff"
                    fgColor="#292524"
                  />
                </div>
              </div>
              <p className="text-sm font-medium opacity-70 text-center mt-3">{t.scanToJoin}</p>
            </div>
          ) : (
            <div className="text-center space-y-1 animate-fade-in-up">
              <p className="text-sm font-medium opacity-50">{t.roomCode}</p>
              <h1 className="text-3xl font-bold tracking-widest">{code}</h1>
            </div>
          )}

          {isSpectator && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/10 text-sm font-medium opacity-70 animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
              <span>{t.spectating}</span>
            </div>
          )}

          {error && error !== "room_closed" && error !== "kicked" && (
            <p className="text-sm text-[var(--color-danger)]">{error}</p>
          )}

          {connected && (
            <>
              {/* Players section with capacity bar */}
              <div className="w-full space-y-3 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold opacity-70 uppercase tracking-wide">
                    {t.players} ({visiblePlayers.length})
                  </h2>
                </div>

                {/* Capacity bar */}
                <div className="w-full h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${Math.min((visiblePlayers.length / 8) * 100, 100)}%` }}
                  />
                </div>

                {/* Scoreboard / Player list */}
                <div className="space-y-2">
                  {visiblePlayers
                    .slice()
                    .sort((a, b) => b.score - a.score)
                    .map((p, rank) => {
                    const [pStyle, pSeed] = (p.icon || "").includes(":")
                      ? p.icon.split(":", 2) as [AvatarStyle, string]
                      : ["adventurer" as AvatarStyle, p.nickname];
                    const isNew = p.id === newPlayerId;
                    const isLeader = rank === 0 && p.score > 0;
                    return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                        isNew ? "animate-slide-in-right" : ""
                      } ${
                        isLeader
                          ? "bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20"
                          : "bg-foreground/5"
                      }`}
                    >
                      <span className="text-sm font-bold w-6 text-center shrink-0">
                        {rank === 0 ? "🥇" : rank === 1 ? "🥈" : rank === 2 ? "🥉" : `${rank + 1}.`}
                      </span>
                      <Avatar seed={pSeed} style={pStyle} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium truncate">{p.nickname}</span>
                          {p.id === myId && !editingNickname && (
                            <button
                              type="button"
                              onClick={() => {
                                setNicknameInput(nickname);
                                setEditingNickname(true);
                              }}
                              className="text-xs opacity-40 hover:opacity-70 cursor-pointer shrink-0"
                              title="Edit nickname"
                            >
                              ✎
                            </button>
                          )}
                        </div>
                        {p.id === hostId && (
                          <span className="text-[10px] font-bold uppercase opacity-50">
                            Host
                          </span>
                        )}
                      </div>
                      <span className={`font-black text-base tabular-nums shrink-0 ${
                        isLeader ? "text-[var(--color-primary)]" : "opacity-60"
                      }`}>
                        {p.score}
                      </span>
                      {isHost && p.id !== hostId && (
                        <button
                          type="button"
                          onClick={() => handleKickPlayer(p.id)}
                          className="text-xs opacity-30 hover:opacity-80 hover:text-[var(--color-danger)] cursor-pointer transition-opacity shrink-0"
                          title="Kick player"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    );
                  })}
                </div>
                {editingNickname && (
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleNicknameSubmit(); }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      maxLength={20}
                      className="min-w-0 flex-1 bg-transparent border-2 border-foreground/20 rounded-lg px-3 py-2 text-sm text-foreground focus:border-[var(--color-primary)] focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="shrink-0 px-3 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-bold cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingNickname(false)}
                      className="shrink-0 px-3 py-2 rounded-lg text-sm font-medium opacity-60 hover:opacity-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>

              {isHost && (
                <div className="w-full space-y-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                  <h2 className="text-sm font-bold opacity-70 uppercase tracking-wide">
                    {t.selectGame}
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {games.map((game, i) => (
                      <button
                        key={game.id}
                        type="button"
                        onClick={() => handleSelectGame(game.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer animate-scale-in ${
                          selectedGame === game.id
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 scale-[1.02]"
                            : "border-foreground/10 hover:border-foreground/30"
                        }`}
                        style={{ animationDelay: `${i * 0.05}s` }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{GAME_ICONS[game.id] || "🎮"}</span>
                          <p className="font-bold text-sm">{game.name}</p>
                        </div>
                        <p className="text-xs opacity-60 mt-1">
                          {game.description}
                        </p>
                        <p className="text-xs opacity-40 mt-2">
                          {game.min_players}-{game.max_players} {t.minPlayers}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-center gap-4 pt-2">
                    <PillButton
                      variant="danger"
                      size="sm"
                      onClick={() => setShowCloseConfirm(true)}
                    >
                      {t.closeRoom}
                    </PillButton>
                    <PillButton
                      size="lg"
                      onClick={handleStartGame}
                      disabled={!canStart}
                    >
                      {t.startGame}
                    </PillButton>
                  </div>
                  {selectedGame && !canStart && selectedGameInfo && (
                    <p className="text-center text-xs text-[var(--color-warning)]">
                      {activePlayers.length > selectedGameInfo.max_players
                        ? `${t.maxPlayers}: ${selectedGameInfo.max_players}`
                        : `${selectedGameInfo.min_players} ${t.minPlayers}`}
                    </p>
                  )}
                </div>
              )}

              {!isHost && (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm opacity-50 animate-pulse">
                    {t.waiting}
                  </p>
                  <button
                    type="button"
                    onClick={handleLeaveRoom}
                    className="text-sm font-medium opacity-50 hover:opacity-100 cursor-pointer px-4 py-2 rounded-lg border border-foreground/20 hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] transition-all"
                  >
                    {t.leaveRoom}
                  </button>
                </div>
              )}
            </>
          )}

          {!connected && !error && (
            <p className="text-sm opacity-50 animate-pulse">{t.waiting}</p>
          )}
        </div>
      </main>
    </>
  );
}
