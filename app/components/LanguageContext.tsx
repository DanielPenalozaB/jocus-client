"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type Language = "en" | "es" | "fr" | "pt" | "de";

interface Translations {
  welcome: string;
  chooseAvatar: string;
  createRoom: string;
  joinRoom: string;
  roomSettings: string;
  password: string;
  passwordPlaceholder: string;
  requirePassword: string;
  maxPlayers: string;
  roomLanguage: string;
  create: string;
  roomCode: string;
  scanToJoin: string;
  shareCode: string;
  waiting: string;
  language: string;
  back: string;
  nickname: string;
  letsGo: string;
  hostMode: string;
  hostAndPlay: string;
  hostOnly: string;
  selectGame: string;
  startGame: string;
  players: string;
  minPlayers: string;
  youAre: string;
  yourTurn: string;
  turnOf: string;
  youWon: string;
  congratulations: string;
  playerWon: string;
  betterLuck: string;
  itsADraw: string;
  lobby: string;
  playAgain: string;
  waitingForHost: string;
  closeRoom: string;
  leaveRoom: string;
  closeRoomConfirm: string;
  roomEnded: string;
  hostClosedRoom: string;
  backToHome: string;
  youWereKicked: string;
  hostKickedYou: string;
  passwordRequired: string;
  enterRoomPassword: string;
  wrongPassword: string;
  leaderboard: string;
  gamesWon: string;
  gamesPlayed: string;
  totalScore: string;
  rank: string;
  noGamesYet: string;
  errorStartGame: string;
  errorConnection: string;
  errorGeneric: string;
  spectating: string;
  watching: string;
  teamSelection: string;
  teamX: string;
  teamO: string;
  ready: string;
  cancelReady: string;
  minOnePerTeam: string;
  yourTeamWon: string;
  yourTeamLost: string;
  teamWon: string;
}

const translations: Record<Language, Translations> = {
  en: {
    welcome: "Welcome to Jocus!",
    chooseAvatar: "Choose your avatar",
    createRoom: "Create a room",
    joinRoom: "Join a room",
    roomSettings: "Room settings",
    password: "Password",
    passwordPlaceholder: "Enter password",
    requirePassword: "Require password",
    maxPlayers: "Max players",
    roomLanguage: "Room language",
    create: "Create",
    roomCode: "Room code",
    scanToJoin: "Scan to join",
    shareCode: "Share this code with your players",
    waiting: "Waiting for players...",
    language: "Language",
    back: "Back",
    nickname: "What's your name?",
    letsGo: "Let's go!",
    hostMode: "Host mode",
    hostAndPlay: "Host & Play",
    hostOnly: "Host only (shared screen)",
    selectGame: "Select a game",
    startGame: "Start game",
    players: "Players",
    minPlayers: "min. players",
    youAre: "You are",
    yourTurn: "Your turn",
    turnOf: "'s turn",
    youWon: "You won!",
    congratulations: "Congratulations!",
    playerWon: "won",
    betterLuck: "Better luck next time!",
    itsADraw: "It's a draw!",
    lobby: "Lobby",
    playAgain: "Play again",
    waitingForHost: "Waiting for host...",
    closeRoom: "Close room",
    leaveRoom: "Leave room",
    closeRoomConfirm: "This will end the session and remove all players from the room.",
    roomEnded: "This room has ended",
    hostClosedRoom: "The host closed the room",
    backToHome: "Back to home",
    youWereKicked: "You were removed from the room",
    hostKickedYou: "The host kicked you",
    passwordRequired: "Password Required",
    enterRoomPassword: "Enter the room password to join",
    wrongPassword: "Wrong password, try again",
    leaderboard: "Leaderboard",
    gamesWon: "Won",
    gamesPlayed: "Played",
    totalScore: "Score",
    rank: "Rank",
    noGamesYet: "No games played yet. Start a game!",
    errorStartGame: "Could not start the game",
    errorConnection: "Connection error",
    errorGeneric: "Something went wrong",
    spectating: "Spectating",
    watching: "Watching",
    teamSelection: "Choose your team",
    teamX: "Team X",
    teamO: "Team O",
    ready: "Ready",
    cancelReady: "Cancel",
    minOnePerTeam: "Each team needs at least 1 player",
    yourTeamWon: "Your team won!",
    yourTeamLost: "Your team lost",
    teamWon: "won!",
  },
  es: {
    welcome: "¡Bienvenido a Jocus!",
    chooseAvatar: "Elige tu avatar",
    createRoom: "Crear sala",
    joinRoom: "Unirse a sala",
    roomSettings: "Configuración de sala",
    password: "Contraseña",
    passwordPlaceholder: "Ingresa contraseña",
    requirePassword: "Requiere contraseña",
    maxPlayers: "Máx. jugadores",
    roomLanguage: "Idioma de la sala",
    create: "Crear",
    roomCode: "Código de sala",
    scanToJoin: "Escanea para unirte",
    shareCode: "Comparte este código con tus jugadores",
    waiting: "Esperando jugadores...",
    language: "Idioma",
    back: "Volver",
    nickname: "¿Cómo te llamas?",
    letsGo: "¡Vamos!",
    hostMode: "Modo anfitrión",
    hostAndPlay: "Anfitrión y jugar",
    hostOnly: "Solo anfitrión (pantalla compartida)",
    selectGame: "Selecciona un juego",
    startGame: "Iniciar juego",
    players: "Jugadores",
    minPlayers: "mín. jugadores",
    youAre: "Eres",
    yourTurn: "Tu turno",
    turnOf: " juega",
    youWon: "¡Ganaste!",
    congratulations: "¡Felicidades!",
    playerWon: "ganó",
    betterLuck: "¡Mejor suerte la próxima!",
    itsADraw: "¡Empate!",
    lobby: "Sala",
    playAgain: "Jugar de nuevo",
    waitingForHost: "Esperando al anfitrión...",
    closeRoom: "Cerrar sala",
    leaveRoom: "Salir de sala",
    closeRoomConfirm: "Esto finalizará la sesión y eliminará a todos los jugadores de la sala.",
    roomEnded: "Esta sala ha terminado",
    hostClosedRoom: "El anfitrión cerró la sala",
    backToHome: "Volver al inicio",
    youWereKicked: "Te han eliminado de la sala",
    hostKickedYou: "El anfitrión te expulsó",
    passwordRequired: "Contraseña requerida",
    enterRoomPassword: "Ingresa la contraseña de la sala para unirte",
    wrongPassword: "Contraseña incorrecta, intenta de nuevo",
    leaderboard: "Tabla de posiciones",
    gamesWon: "Ganados",
    gamesPlayed: "Jugados",
    totalScore: "Puntaje",
    rank: "Posición",
    noGamesYet: "No se han jugado partidas aún. ¡Inicia un juego!",
    errorStartGame: "No se pudo iniciar el juego",
    errorConnection: "Error de conexión",
    errorGeneric: "Algo salió mal",
    spectating: "Espectando",
    watching: "Mirando",
    teamSelection: "Elige tu equipo",
    teamX: "Equipo X",
    teamO: "Equipo O",
    ready: "Listo",
    cancelReady: "Cancelar",
    minOnePerTeam: "Cada equipo necesita al menos 1 jugador",
    yourTeamWon: "¡Tu equipo ganó!",
    yourTeamLost: "Tu equipo perdió",
    teamWon: "¡ganó!",
  },
  fr: {
    welcome: "Bienvenue sur Jocus !",
    chooseAvatar: "Choisis ton avatar",
    createRoom: "Créer une salle",
    joinRoom: "Rejoindre",
    roomSettings: "Paramètres",
    password: "Mot de passe",
    passwordPlaceholder: "Entrer le mot de passe",
    requirePassword: "Mot de passe requis",
    maxPlayers: "Joueurs max",
    roomLanguage: "Langue de la salle",
    create: "Créer",
    roomCode: "Code de salle",
    scanToJoin: "Scanner pour rejoindre",
    shareCode: "Partagez ce code avec vos joueurs",
    waiting: "En attente de joueurs...",
    language: "Langue",
    back: "Retour",
    nickname: "Comment tu t'appelles ?",
    letsGo: "C'est parti !",
    hostMode: "Mode hôte",
    hostAndPlay: "Hôte et jouer",
    hostOnly: "Hôte seul (écran partagé)",
    selectGame: "Choisir un jeu",
    startGame: "Lancer le jeu",
    players: "Joueurs",
    minPlayers: "joueurs min.",
    youAre: "Tu es",
    yourTurn: "Ton tour",
    turnOf: " joue",
    youWon: "Tu as gagné !",
    congratulations: "Félicitations !",
    playerWon: "a gagné",
    betterLuck: "Plus de chance la prochaine fois !",
    itsADraw: "Match nul !",
    lobby: "Salon",
    playAgain: "Rejouer",
    waitingForHost: "En attente de l'hôte...",
    closeRoom: "Fermer la salle",
    leaveRoom: "Quitter la salle",
    closeRoomConfirm: "Cela terminera la session et supprimera tous les joueurs de la salle.",
    roomEnded: "Cette salle est terminée",
    hostClosedRoom: "L'hôte a fermé la salle",
    backToHome: "Retour à l'accueil",
    youWereKicked: "Vous avez été retiré de la salle",
    hostKickedYou: "L'hôte vous a expulsé",
    passwordRequired: "Mot de passe requis",
    enterRoomPassword: "Entrez le mot de passe de la salle pour rejoindre",
    wrongPassword: "Mot de passe incorrect, réessayez",
    leaderboard: "Classement",
    gamesWon: "Gagnés",
    gamesPlayed: "Joués",
    totalScore: "Score",
    rank: "Rang",
    noGamesYet: "Aucune partie jouée. Lancez un jeu !",
    errorStartGame: "Impossible de lancer le jeu",
    errorConnection: "Erreur de connexion",
    errorGeneric: "Quelque chose s'est mal passé",
    spectating: "Spectateur",
    watching: "En observation",
    teamSelection: "Choisis ton équipe",
    teamX: "Équipe X",
    teamO: "Équipe O",
    ready: "Prêt",
    cancelReady: "Annuler",
    minOnePerTeam: "Chaque équipe doit avoir au moins 1 joueur",
    yourTeamWon: "Ton équipe a gagné !",
    yourTeamLost: "Ton équipe a perdu",
    teamWon: "a gagné !",
  },
  pt: {
    welcome: "Bem-vindo ao Jocus!",
    chooseAvatar: "Escolha seu avatar",
    createRoom: "Criar sala",
    joinRoom: "Entrar na sala",
    roomSettings: "Configurações",
    password: "Senha",
    passwordPlaceholder: "Digite a senha",
    requirePassword: "Exigir senha",
    maxPlayers: "Máx. jogadores",
    roomLanguage: "Idioma da sala",
    create: "Criar",
    roomCode: "Código da sala",
    scanToJoin: "Escaneie para entrar",
    shareCode: "Compartilhe este código com seus jogadores",
    waiting: "Aguardando jogadores...",
    language: "Idioma",
    back: "Voltar",
    nickname: "Qual é o seu nome?",
    letsGo: "Vamos!",
    hostMode: "Modo anfitrião",
    hostAndPlay: "Anfitrião e jogar",
    hostOnly: "Apenas anfitrião (tela compartilhada)",
    selectGame: "Escolha um jogo",
    startGame: "Iniciar jogo",
    players: "Jogadores",
    minPlayers: "mín. jogadores",
    youAre: "Você é",
    yourTurn: "Sua vez",
    turnOf: " joga",
    youWon: "Você ganhou!",
    congratulations: "Parabéns!",
    playerWon: "ganhou",
    betterLuck: "Mais sorte na próxima!",
    itsADraw: "Empate!",
    lobby: "Sala",
    playAgain: "Jogar de novo",
    waitingForHost: "Aguardando o anfitrião...",
    closeRoom: "Fechar sala",
    leaveRoom: "Sair da sala",
    closeRoomConfirm: "Isso encerrará a sessão e removerá todos os jogadores da sala.",
    roomEnded: "Esta sala foi encerrada",
    hostClosedRoom: "O anfitrião fechou a sala",
    backToHome: "Voltar ao início",
    youWereKicked: "Você foi removido da sala",
    hostKickedYou: "O anfitrião te expulsou",
    passwordRequired: "Senha necessária",
    enterRoomPassword: "Digite a senha da sala para entrar",
    wrongPassword: "Senha incorreta, tente novamente",
    leaderboard: "Classificação",
    gamesWon: "Vitórias",
    gamesPlayed: "Jogados",
    totalScore: "Pontuação",
    rank: "Posição",
    noGamesYet: "Nenhuma partida jogada ainda. Inicie um jogo!",
    errorStartGame: "Não foi possível iniciar o jogo",
    errorConnection: "Erro de conexão",
    errorGeneric: "Algo deu errado",
    spectating: "Assistindo",
    watching: "Assistindo",
    teamSelection: "Escolha seu time",
    teamX: "Time X",
    teamO: "Time O",
    ready: "Pronto",
    cancelReady: "Cancelar",
    minOnePerTeam: "Cada time precisa de pelo menos 1 jogador",
    yourTeamWon: "Seu time venceu!",
    yourTeamLost: "Seu time perdeu",
    teamWon: "venceu!",
  },
  de: {
    welcome: "Willkommen bei Jocus!",
    chooseAvatar: "Wähle deinen Avatar",
    createRoom: "Raum erstellen",
    joinRoom: "Raum beitreten",
    roomSettings: "Raumeinstellungen",
    password: "Passwort",
    passwordPlaceholder: "Passwort eingeben",
    requirePassword: "Passwort erforderlich",
    maxPlayers: "Max. Spieler",
    roomLanguage: "Raumsprache",
    create: "Erstellen",
    roomCode: "Raumcode",
    scanToJoin: "Scannen zum Beitreten",
    shareCode: "Teile diesen Code mit deinen Spielern",
    waiting: "Warte auf Spieler...",
    language: "Sprache",
    back: "Zurück",
    nickname: "Wie heißt du?",
    letsGo: "Los geht's!",
    hostMode: "Host-Modus",
    hostAndPlay: "Hosten & Spielen",
    hostOnly: "Nur hosten (geteilter Bildschirm)",
    selectGame: "Spiel auswählen",
    startGame: "Spiel starten",
    players: "Spieler",
    minPlayers: "Min. Spieler",
    youAre: "Du bist",
    yourTurn: "Dein Zug",
    turnOf: " ist dran",
    youWon: "Du hast gewonnen!",
    congratulations: "Glückwunsch!",
    playerWon: "hat gewonnen",
    betterLuck: "Mehr Glück beim nächsten Mal!",
    itsADraw: "Unentschieden!",
    lobby: "Lobby",
    playAgain: "Nochmal spielen",
    waitingForHost: "Warte auf den Host...",
    closeRoom: "Raum schließen",
    leaveRoom: "Raum verlassen",
    closeRoomConfirm: "Dies beendet die Sitzung und entfernt alle Spieler aus dem Raum.",
    roomEnded: "Dieser Raum wurde beendet",
    hostClosedRoom: "Der Host hat den Raum geschlossen",
    backToHome: "Zurück zur Startseite",
    youWereKicked: "Du wurdest aus dem Raum entfernt",
    hostKickedYou: "Der Host hat dich entfernt",
    passwordRequired: "Passwort erforderlich",
    enterRoomPassword: "Gib das Raumpasswort ein, um beizutreten",
    wrongPassword: "Falsches Passwort, versuche es erneut",
    leaderboard: "Rangliste",
    gamesWon: "Gewonnen",
    gamesPlayed: "Gespielt",
    totalScore: "Punkte",
    rank: "Rang",
    noGamesYet: "Noch keine Spiele gespielt. Starte ein Spiel!",
    errorStartGame: "Spiel konnte nicht gestartet werden",
    errorConnection: "Verbindungsfehler",
    errorGeneric: "Etwas ist schiefgelaufen",
    spectating: "Zuschauend",
    watching: "Zuschauend",
    teamSelection: "Wähle dein Team",
    teamX: "Team X",
    teamO: "Team O",
    ready: "Bereit",
    cancelReady: "Abbrechen",
    minOnePerTeam: "Jedes Team braucht mindestens 1 Spieler",
    yourTeamWon: "Dein Team hat gewonnen!",
    yourTeamLost: "Dein Team hat verloren",
    teamWon: "hat gewonnen!",
  },
};

const languageNames: Record<Language, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  pt: "Português",
  de: "Deutsch",
};

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  languageNames: Record<Language, string>;
} | null>(null);

function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem("jocus_language");
  if (stored && stored in translations) return stored as Language;
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    setLanguageState(getStoredLanguage());
  }, []);

  function setLanguage(lang: Language) {
    setLanguageState(lang);
    localStorage.setItem("jocus_language", lang);
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        languageNames,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
}
