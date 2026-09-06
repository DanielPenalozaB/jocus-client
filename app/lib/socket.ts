import { Socket, Channel } from "phoenix";

function getWsUrl(): string {
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return process.env.NEXT_PUBLIC_WS_URL || `${protocol}//${window.location.host}/socket`;
}

let socket: Socket | null = null;
let onSocketClose: (() => void) | null = null;
let onSocketOpen: (() => void) | null = null;

export function getSocket(params: {
  device_token: string;
  nickname: string;
  avatar_seed?: string;
  avatar_style?: string;
}): Socket {
  if (!socket) {
    socket = new Socket(getWsUrl(), {
      params,
      reconnectAfterMs: (tries: number) => {
        return [1000, 2000, 4000, 8000, 10000][Math.min(tries - 1, 4)];
      },
    });
    socket.onClose(() => onSocketClose?.());
    socket.onOpen(() => onSocketOpen?.());
    socket.connect();
  }
  return socket;
}

export function setSocketCallbacks(callbacks: {
  onClose?: () => void;
  onOpen?: () => void;
}) {
  onSocketClose = callbacks.onClose || null;
  onSocketOpen = callbacks.onOpen || null;
}

export function joinRoom(
  params: {
    device_token: string;
    nickname: string;
    avatar_seed?: string;
    avatar_style?: string;
  },
  roomCode: string,
  callbacks: {
    onJoin?: (state: unknown) => void;
    onError?: (reason: unknown) => void;
    onPlayerJoined?: (player: unknown) => void;
    onPlayerLeft?: (data: unknown) => void;
    onGameSelected?: (data: unknown) => void;
    onGameStarted?: (data: unknown) => void;
    onGameEvent?: (data: unknown) => void;
    onBackToLobby?: () => void;
    onRoomClosed?: () => void;
  },
  password?: string
): Channel {
  const sock = getSocket(params);
  const channelParams: Record<string, string> = {};
  if (password) channelParams.password = password;
  const channel = sock.channel(`room:${roomCode}`, channelParams);

  channel
    .join()
    .receive("ok", (state) => callbacks.onJoin?.(state))
    .receive("error", (reason) => callbacks.onError?.(reason));

  channel.on("player_joined", (data) => callbacks.onPlayerJoined?.(data));
  channel.on("player_left", (data) => callbacks.onPlayerLeft?.(data));
  channel.on("game_selected", (data) => callbacks.onGameSelected?.(data));
  channel.on("game_started", (data) => callbacks.onGameStarted?.(data));
  channel.on("game_event", (data) => callbacks.onGameEvent?.(data));
  channel.on("back_to_lobby", () => callbacks.onBackToLobby?.());
  channel.on("room_closed", () => callbacks.onRoomClosed?.());

  return channel;
}

export function disconnectSocket() {
  if (socket) {
    onSocketClose = null;
    onSocketOpen = null;
    socket.disconnect();
    socket = null;
  }
}
