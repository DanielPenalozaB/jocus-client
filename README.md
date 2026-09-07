# Jocus Client

Next.js frontend for [Jocus](https://github.com/DanielPenalozaB/jocus) — a real-time multiplayer game platform.

## Tech Stack

- **Next.js 16** (App Router) with React 19
- **Tailwind CSS v4** with CSS custom properties for theming
- **Phoenix Channels** (WebSocket) for real-time game communication
- **PWA** — installable with offline support via service worker
- **Web Audio API** — synthesized game sounds (no audio files)

## Project Structure

```
app/
├── page.tsx                    # Home / landing
├── create-room/page.tsx        # Room creation flow
├── join/[code]/page.tsx        # Join room by code
├── leaderboard/page.tsx        # Global leaderboard
├── offline/page.tsx            # Offline fallback
├── room/[code]/
│   ├── page.tsx                # Room lobby, game host, spectator view
│   ├── TicTacToe.tsx           # TicTacToe game (classic + team mode)
│   └── TeamSelection.tsx       # Pre-game team selection phase
├── components/
│   ├── Avatar.tsx              # DiceBear avatar rendering
│   ├── Confetti.tsx            # Celebration particle effects
│   ├── Countdown.tsx           # 3-2-1 countdown overlay
│   ├── FullscreenToggle.tsx    # Mobile fullscreen button
│   ├── GameOverLeaderboard.tsx # Post-game scoreboard (podium + team views)
│   ├── LanguageContext.tsx      # i18n (EN, ES, FR, DE, PT)
│   ├── LanguageSwitcher.tsx    # Language selector dropdown
│   ├── NicknamePrompt.tsx      # Player name + avatar picker
│   ├── PillButton.tsx          # Styled button component
│   ├── PlayerContext.tsx       # Player identity persistence
│   ├── ProfileModal.tsx        # Profile editing modal
│   ├── RoomMenu.tsx            # Kebab menu (settings, leave room)
│   ├── SoundContext.tsx        # Sound preferences provider
│   ├── SoundSettings.tsx       # Volume/mute controls
│   ├── SoundSync.tsx           # Cross-tab sound state sync
│   ├── ServiceWorkerRegistration.tsx
│   └── ToastContext.tsx        # Toast notification system
├── lib/
│   ├── api.ts                  # REST API client
│   ├── socket.ts               # Phoenix WebSocket connection
│   └── sounds.ts               # Synthesized sound effects
├── providers.tsx               # Root context providers
├── manifest.ts                 # PWA manifest
└── globals.css                 # Theme, animations, game effects
```

## Getting Started

### Standalone (development)

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). Requires the backend running on port 4000.

### With Docker (via manager repo)

From the [manager repo](https://github.com/DanielPenalozaB/jocus):

```bash
git clone --recurse-submodules https://github.com/DanielPenalozaB/jocus.git
cd jocus
make setup
```

## Features

### Room System
- Create password-protected rooms (up to 16 players)
- Join via room code or direct link
- Host controls: kick players, select games, start/stop
- Real-time player list with avatars

### Game Modes
- **Classic** (2 players) — standard 1v1
- **Team** (3+ players) — players split into teams, rotate turns within their team

### Games
- **TicTacToe** — with animated X/O marks, win line detection, team support

### Spectator Mode
- Host-only mode: host watches without playing
- Real-time game state for spectators
- Spectator count visible to all players

### Team Selection
- Auto-balanced team assignment
- Swap teams with one tap
- Ready-up system with 30-second countdown
- Timer tick sounds in final 15 seconds

### Post-Game
- Animated podium leaderboard (classic mode)
- Team scoreboard with grouped players (team mode)
- Score animation, confetti, MVP highlight

### Internationalization
5 languages: English, Spanish, French, German, Portuguese.

### Progressive Web App
- Installable on mobile devices
- Offline fallback page
- Service worker for caching

## Theme

Dark mode with a purple-abyss palette:

| Token       | Color     | Hex       |
|-------------|-----------|-----------|
| background  | Abyss     | `#1f0f3f` |
| foreground  | Peach     | `#f4d1b5` |
| primary     | Indigo    | `#5c3a8e` |
| secondary   | Purple    | `#8d4c9f` |
| accent      | Pink      | `#f2a3c7` |
| danger      | Coral     | `#ce7d6c` |
| warning     | Berry     | `#a45d7c` |

Uses `color-mix(in srgb, ...)` for contrast-safe color blending.

## Scripts

```bash
yarn dev       # Start dev server
yarn build     # Production build
yarn start     # Start production server
yarn lint      # Run ESLint
```

## Related Repos

- **Manager**: [github.com/DanielPenalozaB/jocus](https://github.com/DanielPenalozaB/jocus)
- **Server**: [github.com/DanielPenalozaB/jocus-server](https://github.com/DanielPenalozaB/jocus-server)
