let audioContext: AudioContext | null = null;

let _masterVolume = 0.7;
let _muted = false;

export function setSoundVolume(v: number) {
  _masterVolume = Math.max(0, Math.min(1, v));
}

export function setSoundMuted(m: boolean) {
  _muted = m;
}

function getEffectiveVolume(base: number): number {
  if (_muted) return 0;
  return base * _masterVolume;
}

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = "sine", volume = 0.3) {
  const effectiveVol = getEffectiveVolume(volume);
  if (effectiveVol <= 0) return;

  const ctx = getContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(effectiveVol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + duration);
}

function playSequence(notes: { freq: number; dur: number; delay: number }[], type: OscillatorType = "sine", volume = 0.3) {
  notes.forEach(({ freq, dur, delay }) => {
    setTimeout(() => playTone(freq, dur, type, volume), delay * 1000);
  });
}

export const sounds = {
  playerJoin() {
    playSequence([
      { freq: 523, dur: 0.1, delay: 0 },
      { freq: 659, dur: 0.15, delay: 0.08 },
    ], "sine", 0.2);
  },

  buttonHover() {
    playTone(1200, 0.03, "sine", 0.06);
  },

  buttonClick() {
    playTone(800, 0.05, "square", 0.1);
  },

  countdownTick() {
    playTone(440, 0.15, "sine", 0.25);
  },

  timerTick() {
    playTone(600, 0.08, "sine", 0.12);
  },

  countdownGo() {
    playSequence([
      { freq: 523, dur: 0.1, delay: 0 },
      { freq: 659, dur: 0.1, delay: 0.1 },
      { freq: 784, dur: 0.2, delay: 0.2 },
    ], "sine", 0.35);
  },

  win() {
    playSequence([
      { freq: 523, dur: 0.15, delay: 0 },
      { freq: 659, dur: 0.15, delay: 0.15 },
      { freq: 784, dur: 0.15, delay: 0.3 },
      { freq: 1047, dur: 0.4, delay: 0.45 },
    ], "sine", 0.3);
  },

  lose() {
    playSequence([
      { freq: 392, dur: 0.2, delay: 0 },
      { freq: 349, dur: 0.2, delay: 0.2 },
      { freq: 311, dur: 0.3, delay: 0.4 },
    ], "sine", 0.2);
  },

  kick() {
    playTone(200, 0.2, "sawtooth", 0.15);
  },

  gameStart() {
    playSequence([
      { freq: 392, dur: 0.1, delay: 0 },
      { freq: 523, dur: 0.1, delay: 0.1 },
      { freq: 659, dur: 0.15, delay: 0.2 },
      { freq: 784, dur: 0.25, delay: 0.35 },
    ], "triangle", 0.3);
  },

  move() {
    playTone(600, 0.06, "sine", 0.15);
  },

  error() {
    playSequence([
      { freq: 300, dur: 0.1, delay: 0 },
      { freq: 200, dur: 0.2, delay: 0.1 },
    ], "sawtooth", 0.15);
  },

  notification() {
    playSequence([
      { freq: 880, dur: 0.08, delay: 0 },
      { freq: 1100, dur: 0.12, delay: 0.1 },
    ], "sine", 0.2);
  },
};

// --- Background Music ---

interface MusicState {
  playing: boolean;
  gainNode: GainNode | null;
  timeouts: ReturnType<typeof setTimeout>[];
  stopped: boolean;
}

const musicState: MusicState = {
  playing: false,
  gainNode: null,
  timeouts: [],
  stopped: false,
};

type MelodyNote = { freq: number; dur: number; delay: number };

type SongStyle = "single" | "warm" | "pad";

interface SongDef {
  id: string;
  name: string;
  notes: MelodyNote[];
  duration: number;
  oscillator: OscillatorType;
  volume: number;
  style: SongStyle;
}

// --- KEPT SONGS ---

// Retro — fast 8-bit arcade arpeggios
const MELODY_RETRO: MelodyNote[] = [
  { freq: 262, dur: 0.2, delay: 0 }, { freq: 330, dur: 0.2, delay: 0.25 },
  { freq: 392, dur: 0.2, delay: 0.5 }, { freq: 523, dur: 0.3, delay: 0.75 },
  { freq: 392, dur: 0.2, delay: 1.25 }, { freq: 330, dur: 0.2, delay: 1.5 },
  { freq: 262, dur: 0.3, delay: 1.75 }, { freq: 294, dur: 0.2, delay: 2.25 },
  { freq: 349, dur: 0.2, delay: 2.5 }, { freq: 440, dur: 0.3, delay: 2.75 },
  { freq: 523, dur: 0.2, delay: 3.25 }, { freq: 440, dur: 0.2, delay: 3.5 },
  { freq: 349, dur: 0.3, delay: 3.75 }, { freq: 294, dur: 0.4, delay: 4.25 },
  { freq: 262, dur: 0.2, delay: 5.0 }, { freq: 392, dur: 0.2, delay: 5.25 },
  { freq: 523, dur: 0.2, delay: 5.5 }, { freq: 659, dur: 0.3, delay: 5.75 },
  { freq: 523, dur: 0.2, delay: 6.25 }, { freq: 392, dur: 0.2, delay: 6.5 },
  { freq: 523, dur: 0.3, delay: 6.75 }, { freq: 659, dur: 0.2, delay: 7.25 },
  { freq: 784, dur: 0.4, delay: 7.5 }, { freq: 659, dur: 0.2, delay: 8.0 },
  { freq: 523, dur: 0.2, delay: 8.25 }, { freq: 440, dur: 0.3, delay: 8.5 },
  { freq: 392, dur: 0.2, delay: 9.0 }, { freq: 349, dur: 0.2, delay: 9.25 },
  { freq: 330, dur: 0.3, delay: 9.5 }, { freq: 262, dur: 0.5, delay: 10.0 },
  { freq: 330, dur: 0.3, delay: 10.75 }, { freq: 392, dur: 0.5, delay: 11.25 },
];

// Ambient — dreamy, slow-evolving sine pads (chords played simultaneously)
const MELODY_AMBIENT: MelodyNote[] = [
  { freq: 220, dur: 2.5, delay: 0 }, { freq: 277, dur: 2.5, delay: 0 },
  { freq: 330, dur: 2.5, delay: 0 },
  { freq: 247, dur: 2.5, delay: 3.0 }, { freq: 311, dur: 2.5, delay: 3.0 },
  { freq: 370, dur: 2.5, delay: 3.0 },
  { freq: 262, dur: 2.5, delay: 6.0 }, { freq: 330, dur: 2.5, delay: 6.0 },
  { freq: 392, dur: 2.5, delay: 6.0 },
  { freq: 220, dur: 2.5, delay: 9.0 }, { freq: 294, dur: 2.5, delay: 9.0 },
  { freq: 349, dur: 2.5, delay: 9.0 },
  { freq: 233, dur: 2.5, delay: 12.0 }, { freq: 294, dur: 2.5, delay: 12.0 },
  { freq: 349, dur: 2.5, delay: 12.0 },
  { freq: 262, dur: 3.0, delay: 15.0 }, { freq: 330, dur: 3.0, delay: 15.0 },
  { freq: 392, dur: 3.0, delay: 15.0 },
];

// Bossa — warm syncopated Brazilian feel
const MELODY_BOSSA: MelodyNote[] = [
  { freq: 330, dur: 0.3, delay: 0 }, { freq: 392, dur: 0.2, delay: 0.35 },
  { freq: 440, dur: 0.5, delay: 0.7 }, { freq: 392, dur: 0.3, delay: 1.4 },
  { freq: 330, dur: 0.2, delay: 1.8 }, { freq: 349, dur: 0.4, delay: 2.2 },
  { freq: 330, dur: 0.5, delay: 2.8 }, { freq: 294, dur: 0.3, delay: 3.5 },
  { freq: 262, dur: 0.4, delay: 4.0 }, { freq: 294, dur: 0.2, delay: 4.5 },
  { freq: 330, dur: 0.3, delay: 4.8 }, { freq: 392, dur: 0.5, delay: 5.3 },
  { freq: 440, dur: 0.3, delay: 6.0 }, { freq: 392, dur: 0.2, delay: 6.4 },
  { freq: 349, dur: 0.4, delay: 6.8 }, { freq: 330, dur: 0.3, delay: 7.4 },
  { freq: 294, dur: 0.5, delay: 7.9 }, { freq: 262, dur: 0.3, delay: 8.6 },
  { freq: 294, dur: 0.2, delay: 9.0 }, { freq: 330, dur: 0.4, delay: 9.4 },
  { freq: 349, dur: 0.5, delay: 10.0 }, { freq: 392, dur: 0.6, delay: 10.7 },
  { freq: 349, dur: 0.3, delay: 11.5 }, { freq: 330, dur: 0.8, delay: 12.0 },
];

// Tropical — upbeat island rhythm, major key
const MELODY_TROPICAL: MelodyNote[] = [
  { freq: 523, dur: 0.2, delay: 0 }, { freq: 659, dur: 0.2, delay: 0.25 },
  { freq: 784, dur: 0.3, delay: 0.5 }, { freq: 659, dur: 0.2, delay: 0.9 },
  { freq: 523, dur: 0.2, delay: 1.15 }, { freq: 587, dur: 0.3, delay: 1.4 },
  { freq: 523, dur: 0.2, delay: 1.8 }, { freq: 440, dur: 0.3, delay: 2.1 },
  { freq: 523, dur: 0.2, delay: 2.5 }, { freq: 659, dur: 0.2, delay: 2.75 },
  { freq: 784, dur: 0.3, delay: 3.0 }, { freq: 880, dur: 0.2, delay: 3.4 },
  { freq: 784, dur: 0.2, delay: 3.7 }, { freq: 659, dur: 0.3, delay: 3.95 },
  { freq: 523, dur: 0.2, delay: 4.35 }, { freq: 440, dur: 0.2, delay: 4.6 },
  { freq: 392, dur: 0.3, delay: 4.85 }, { freq: 440, dur: 0.2, delay: 5.25 },
  { freq: 523, dur: 0.3, delay: 5.5 }, { freq: 659, dur: 0.2, delay: 5.9 },
  { freq: 784, dur: 0.4, delay: 6.15 }, { freq: 659, dur: 0.2, delay: 6.65 },
  { freq: 523, dur: 0.3, delay: 6.9 }, { freq: 440, dur: 0.4, delay: 7.3 },
];

// Groove — deep warm bass with upper harmony, head-nodding feel
const MELODY_GROOVE: MelodyNote[] = [
  { freq: 131, dur: 0.5, delay: 0 }, { freq: 262, dur: 0.3, delay: 0.5 },
  { freq: 165, dur: 0.5, delay: 1.0 }, { freq: 330, dur: 0.3, delay: 1.5 },
  { freq: 147, dur: 0.5, delay: 2.0 }, { freq: 294, dur: 0.3, delay: 2.5 },
  { freq: 131, dur: 0.5, delay: 3.0 }, { freq: 262, dur: 0.4, delay: 3.5 },
  { freq: 175, dur: 0.5, delay: 4.0 }, { freq: 349, dur: 0.3, delay: 4.5 },
  { freq: 165, dur: 0.5, delay: 5.0 }, { freq: 330, dur: 0.3, delay: 5.5 },
  { freq: 147, dur: 0.5, delay: 6.0 }, { freq: 294, dur: 0.3, delay: 6.5 },
  { freq: 131, dur: 0.5, delay: 7.0 }, { freq: 262, dur: 0.3, delay: 7.5 },
  { freq: 165, dur: 0.5, delay: 8.0 }, { freq: 392, dur: 0.4, delay: 8.5 },
  { freq: 147, dur: 0.5, delay: 9.0 }, { freq: 349, dur: 0.3, delay: 9.5 },
  { freq: 131, dur: 0.5, delay: 10.0 }, { freq: 330, dur: 0.3, delay: 10.5 },
  { freq: 147, dur: 0.5, delay: 11.0 }, { freq: 262, dur: 0.6, delay: 11.5 },
];

export const SONGS: SongDef[] = [
  { id: "retro", name: "Retro", notes: MELODY_RETRO, duration: 12, oscillator: "triangle", volume: 0.08, style: "single" },
  { id: "ambient", name: "Ambient", notes: MELODY_AMBIENT, duration: 18, oscillator: "sine", volume: 0.05, style: "pad" },
  { id: "bossa", name: "Bossa", notes: MELODY_BOSSA, duration: 13, oscillator: "sine", volume: 0.06, style: "warm" },
  { id: "tropical", name: "Tropical", notes: MELODY_TROPICAL, duration: 8, oscillator: "sine", volume: 0.06, style: "warm" },
  { id: "groove", name: "Groove", notes: MELODY_GROOVE, duration: 12, oscillator: "sine", volume: 0.06, style: "warm" },
];

export type SongId = string;

let _currentSong: SongId = "bossa";

// Plays a note using layered detuned oscillators for richer sound
function playMusicNote(freq: number, dur: number, type: OscillatorType, vol: number, style: SongStyle) {
  const effectiveVol = getEffectiveVolume(vol);
  if (effectiveVol <= 0) return;

  const ctx = getContext();
  const now = ctx.currentTime;

  if (style === "single") {
    // Classic single oscillator (8-bit feel)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(effectiveVol, now);
    gain.gain.setValueAtTime(effectiveVol, now + dur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + dur);
  } else if (style === "warm") {
    // Two slightly detuned oscillators — warmer, less digital
    const detune = 4;
    for (let d = -1; d <= 1; d += 2) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(d * detune, now);
      gain.gain.setValueAtTime(effectiveVol * 0.6, now);
      gain.gain.setValueAtTime(effectiveVol * 0.6, now + dur * 0.65);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + dur);
    }
  } else if (style === "pad") {
    // Soft attack pad — fades in, long sustain
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(effectiveVol, now + dur * 0.3);
    gain.gain.setValueAtTime(effectiveVol, now + dur * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(now + dur);
  }
}

function getCurrentSongData(): SongDef {
  return SONGS.find((s) => s.id === _currentSong) || SONGS[0];
}

function startMusicLoop() {
  if (musicState.stopped) return;

  const song = getCurrentSongData();
  song.notes.forEach(({ freq, dur, delay }) => {
    const t = setTimeout(() => {
      if (!musicState.stopped) {
        playMusicNote(freq, dur, song.oscillator, song.volume, song.style);
      }
    }, delay * 1000);
    musicState.timeouts.push(t);
  });

  const loopT = setTimeout(() => {
    if (!musicState.stopped) {
      startMusicLoop();
    }
  }, song.duration * 1000);
  musicState.timeouts.push(loopT);
}

export function setCurrentSong(songId: SongId) {
  _currentSong = songId;
  if (musicState.playing) {
    stopBackgroundMusic();
    startBackgroundMusic();
  }
}

export function getCurrentSong(): SongId {
  return _currentSong;
}

export function startBackgroundMusic() {
  if (musicState.playing) return;
  musicState.playing = true;
  musicState.stopped = false;
  startMusicLoop();
}

export function stopBackgroundMusic() {
  musicState.stopped = true;
  musicState.playing = false;
  musicState.timeouts.forEach(clearTimeout);
  musicState.timeouts = [];
}
