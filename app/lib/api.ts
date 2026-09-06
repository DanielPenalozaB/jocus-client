const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export interface Player {
  id: string;
  nickname: string;
  icon: string;
  total_score: number;
  games_played: number;
  games_won: number;
}

export interface GameInfo {
  id: string;
  name: string;
  description: string;
  min_players: number;
  max_players: number;
  supports_host_only: boolean;
}

export interface RoomState {
  code: string;
  host_id: string;
  players: Record<string, { id: string; nickname: string; icon: string; score: number }>;
  current_game: string | null;
  status: "lobby" | "playing";
  max_players: number;
  host_mode: string;
  language: string;
}

export const api = {
  createRoom(params: {
    host_id: string;
    nickname?: string;
    password?: string;
    language?: string;
    max_players?: number;
    host_mode?: string;
  }) {
    return request<{ code: string }>("/api/rooms", {
      method: "POST",
      body: JSON.stringify(params),
    });
  },

  getRoom(code: string) {
    return request<RoomState>(`/api/rooms/${code}`);
  },

  identify(device_token: string, nickname: string) {
    return request<Player>("/api/players", {
      method: "POST",
      body: JSON.stringify({ device_token, nickname }),
    });
  },

  getGames() {
    return request<{ games: GameInfo[] }>("/api/games");
  },

  getLeaderboard(limit = 20) {
    return request<{ players: Player[] }>(`/api/leaderboard?limit=${limit}`);
  },

  getActiveRooms() {
    return request<{ rooms: ActiveRoom[] }>("/api/rooms/active");
  },
};

export interface ActiveRoom {
  code: string;
  host_nickname: string;
  player_count: number;
  max_players: number;
  language: string;
}
