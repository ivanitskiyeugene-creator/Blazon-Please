// Миниатюрный синтезатор звуков КПП — без аудиофайлов
let ctx: AudioContext | null = null;
let muted = false;
let effectsVolume = Number(localStorage.getItem("blazon.effectsVolume") ?? 0.8);

export function initAudio() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === "suspended") ctx.resume();
}

export function setMuted(m: boolean) {
  muted = m;
}
export function setEffectsVolume(v: number) { effectsVolume = Math.max(0, Math.min(1, v)); localStorage.setItem("blazon.effectsVolume", String(effectsVolume)); }
export function getEffectsVolume() { return effectsVolume; }
export function isMuted() {
  return muted;
}

const SAMPLE = {
  announce: "/audio/speech-announce.wav",
  stamp: "/audio/stamp-down.wav",
  barOpen: "/audio/stampbar-open.wav",
  barClose: "/audio/stampbar-close.wav",
  metalStart: "/audio/metal-dragstart0.wav",
  metalStop: "/audio/metal-dragstop0.wav",
  paperStart: "/audio/paper-dragstart0.wav",
  paperStop: "/audio/paper-dragstop0.wav",
} as const;

function playSample(src: string, gain = 1) {
  if (muted || effectsVolume <= 0) return;
  const audio = new Audio(src);
  audio.volume = Math.max(0, Math.min(1, effectsVolume * gain));
  void audio.play().catch(() => {});
}

function noiseBuffer(duration: number) {
  if (!ctx) return null;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function playNoise(duration: number, filterFreq: number, gainPeak: number, type: BiquadFilterType = "lowpass") {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(duration);
  const filter = ctx.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = filterFreq;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(gainPeak * effectsVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(t);
}

function tone(freq: number, duration: number, type: OscillatorType, gainPeak: number, delay = 0, slideTo?: number) {
  if (!ctx || muted) return;
  const t = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(gainPeak * effectsVolume, t + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

export const sfx = {
  announce: () => playSample(SAMPLE.announce),
  stamp: () => playSample(SAMPLE.stamp),
  stampBarOpen: () => playSample(SAMPLE.barOpen, 0.9),
  stampBarClose: () => playSample(SAMPLE.barClose, 0.9),
  metalDragStart: () => playSample(SAMPLE.metalStart, 0.85),
  metalDragStop: () => playSample(SAMPLE.metalStop, 0.85),
  paperDragStart: () => playSample(SAMPLE.paperStart, 0.7),
  paperDragStop: () => playSample(SAMPLE.paperStop, 0.75),
  paper() {
    playSample(SAMPLE.paperStop, 0.65);
  },
  walk() {
    playNoise(0.3, 500, 0.1);
  },
  ok() {
    tone(392, 0.14, "square", 0.08);
    tone(523, 0.2, "square", 0.08, 0.09);
  },
  bad() {
    tone(180, 0.3, "sawtooth", 0.1, 0, 70);
    playNoise(0.25, 400, 0.2);
  },
  ui() {
    tone(660, 0.06, "square", 0.05);
  },
  coin() {
    tone(880, 0.1, "square", 0.07);
    tone(1174, 0.16, "square", 0.07, 0.07);
  },
  alarm() {
    tone(520, 0.35, "sawtooth", 0.09, 0, 340);
    tone(340, 0.35, "sawtooth", 0.09, 0.3, 220);
  },
  typeBlip() {
    tone(1100 + Math.random() * 300, 0.03, "square", 0.03);
  },
};
