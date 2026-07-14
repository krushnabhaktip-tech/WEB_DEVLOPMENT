// Procedural sound engine using the Web Audio API — no audio files needed.
// Generates background music (looping chord progression) and SFX for game events.

type SfxName =
  | 'click'
  | 'win'
  | 'lose'
  | 'draw'
  | 'flip'
  | 'match'
  | 'nomatch'
  | 'coin'
  | 'achievement'
  | 'hover'
  | 'error'
  | 'tick'
  | 'select'
  | 'shuffle';

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicTimer: number | null = null;
let musicPlaying = false;

function ensureCtx(): AudioContext {
  if (!ctx) {
    ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.connect(masterGain);
    sfxGain = ctx.createGain();
    sfxGain.connect(masterGain);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function initAudio() {
  ensureCtx();
}

export function setMasterVolumes(musicVol: number, sfxVol: number, musicOn: boolean, sfxOn: boolean) {
  const c = ensureCtx();
  if (musicGain) musicGain.gain.setTargetAtTime(musicOn ? musicVol : 0, c.currentTime, 0.05);
  if (sfxGain) sfxGain.gain.setTargetAtTime(sfxOn ? sfxVol : 0, c.currentTime, 0.05);
}

// --- SFX ---
const sfxConfig: Record<SfxName, { freq: number; dur: number; type: OscillatorType; sweep?: number; chord?: number[] }> = {
  click:      { freq: 600, dur: 0.06, type: 'sine' },
  hover:      { freq: 800, dur: 0.03, type: 'sine' },
  select:     { freq: 500, dur: 0.08, type: 'triangle' },
  flip:       { freq: 400, dur: 0.1, type: 'triangle', sweep: 700 },
  match:      { freq: 660, dur: 0.2, type: 'sine', chord: [660, 880, 1320] },
  nomatch:    { freq: 200, dur: 0.15, type: 'sawtooth', sweep: 120 },
  win:        { freq: 523, dur: 0.5, type: 'triangle', chord: [523, 659, 784, 1047] },
  lose:       { freq: 300, dur: 0.4, type: 'sawtooth', sweep: 100 },
  draw:       { freq: 400, dur: 0.3, type: 'square', sweep: 350 },
  coin:       { freq: 988, dur: 0.15, type: 'square', chord: [988, 1319] },
  achievement:{ freq: 784, dur: 0.6, type: 'triangle', chord: [784, 988, 1175, 1568] },
  error:      { freq: 150, dur: 0.2, type: 'sawtooth' },
  tick:       { freq: 1000, dur: 0.03, type: 'sine' },
  shuffle:    { freq: 300, dur: 0.3, type: 'triangle', sweep: 600 },
};

export function playSfx(name: SfxName) {
  const c = ensureCtx();
  if (!sfxGain) return;
  const cfg = sfxConfig[name];
  const now = c.currentTime;

  if (cfg.chord) {
    cfg.chord.forEach((f, i) => {
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = cfg.type;
      osc.frequency.setValueAtTime(f, now + i * 0.06);
      g.gain.setValueAtTime(0, now + i * 0.06);
      g.gain.linearRampToValueAtTime(0.3, now + i * 0.06 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + cfg.dur);
      osc.connect(g);
      g.connect(sfxGain!);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + cfg.dur);
    });
  } else {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = cfg.type;
    osc.frequency.setValueAtTime(cfg.freq, now);
    if (cfg.sweep) osc.frequency.linearRampToValueAtTime(cfg.sweep, now + cfg.dur);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.3, now + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, now + cfg.dur);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(now);
    osc.stop(now + cfg.dur);
  }
}

// --- Background music: gentle looping chord progression ---
const chordProgression: number[][] = [
  [261.63, 329.63, 392.0],   // C major
  [220.0, 277.18, 329.63],   // A minor
  [196.0, 246.94, 293.66],   // G major
  [174.61, 220.0, 261.63],   // F major
];

function playChord(chord: number[], duration: number) {
  const c = ensureCtx();
  if (!musicGain) return;
  const now = c.currentTime;
  chord.forEach((freq) => {
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 0.1);
    g.gain.linearRampToValueAtTime(0.08, now + duration - 0.1);
    g.gain.linearRampToValueAtTime(0, now + duration);
    osc.connect(g);
    g.connect(musicGain!);
    osc.start(now);
    osc.stop(now + duration);
  });
  // Add a soft melody note on top
  const melodyFreq = chord[2] * 2;
  const mOsc = c.createOscillator();
  const mGain = c.createGain();
  mOsc.type = 'triangle';
  mOsc.frequency.value = melodyFreq;
  mGain.gain.setValueAtTime(0, now + duration * 0.3);
  mGain.gain.linearRampToValueAtTime(0.05, now + duration * 0.35);
  mGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.8);
  mOsc.connect(mGain);
  mGain.connect(musicGain);
  mOsc.start(now + duration * 0.3);
  mOsc.stop(now + duration);
}

export function startMusic() {
  if (musicPlaying) return;
  musicPlaying = true;
  ensureCtx();
  let chordIndex = 0;
  const chordDuration = 2.5;
  const tick = () => {
    if (!musicPlaying) return;
    playChord(chordProgression[chordIndex], chordDuration);
    chordIndex = (chordIndex + 1) % chordProgression.length;
    musicTimer = window.setTimeout(tick, chordDuration * 1000);
  };
  tick();
}

export function stopMusic() {
  musicPlaying = false;
  if (musicTimer !== null) {
    clearTimeout(musicTimer);
    musicTimer = null;
  }
}
