// Процедурный фоновый трек — минималистичный восточноевропейский амбиент
// Генерируется программно через WebAudio, никаких внешних файлов

let ctx: AudioContext | null = null;
let playing = false;
let nodes: { stop: () => void }[] = [];
let masterGain: GainNode | null = null;

// Минорная пентатоника в D (ноты в Hz)
const SCALE = [146.83, 164.81, 174.61, 220.0, 246.94, 293.66, 329.63, 349.23];
const BASS = [73.42, 82.41, 87.31, 110.0];

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch { return null; }
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function createPad(c: AudioContext, freq: number, gain: number, dest: AudioNode) {
  const osc = c.createOscillator();
  osc.type = "sine";
  osc.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = gain;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 800;
  filter.Q.value = 1;
  osc.connect(filter).connect(g).connect(dest);
  osc.start();
  return { stop: () => { try { osc.stop(); } catch {} } };
}

function scheduleLoop(c: AudioContext, dest: AudioNode) {
  const tempo = 1.8; // секунд на ноту
  let step = 0;

  // Дрон-бас
  const drone = c.createOscillator();
  drone.type = "sawtooth";
  drone.frequency.value = BASS[0];
  const droneFilter = c.createBiquadFilter();
  droneFilter.type = "lowpass";
  droneFilter.frequency.value = 200;
  droneFilter.Q.value = 2;
  const droneGain = c.createGain();
  droneGain.gain.value = 0.06;
  drone.connect(droneFilter).connect(droneGain).connect(dest);
  drone.start();
  nodes.push({ stop: () => { try { drone.stop(); } catch {} } });

  // Тихий пэд (аккорд)
  nodes.push(createPad(c, SCALE[0], 0.025, dest));
  nodes.push(createPad(c, SCALE[2], 0.018, dest));
  nodes.push(createPad(c, SCALE[4], 0.015, dest));

  // Мелодическая линия — простая последовательность
  const melody = [0, 2, 4, 3, 2, 0, 1, 3, 5, 4, 2, 0, 4, 6, 5, 3];

  function tick() {
    if (!playing || !ctx) return;
    const t = ctx.currentTime;
    const noteIdx = melody[step % melody.length];
    const freq = SCALE[noteIdx];

    // Мелодия — тихий квадрат с фильтром
    const osc = ctx.createOscillator();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, t);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.linearRampToValueAtTime(0.035, t + 0.08);
    env.gain.exponentialRampToValueAtTime(0.008, t + tempo * 0.7);
    env.gain.linearRampToValueAtTime(0.0001, t + tempo * 0.95);
    const flt = ctx.createBiquadFilter();
    flt.type = "lowpass";
    flt.frequency.setValueAtTime(1200, t);
    flt.frequency.exponentialRampToValueAtTime(400, t + tempo * 0.8);
    osc.connect(flt).connect(env).connect(dest);
    osc.start(t);
    osc.stop(t + tempo);

    // Бас меняется каждые 4 ноты
    if (step % 4 === 0) {
      const bassFreq = BASS[Math.floor(step / 4) % BASS.length];
      drone.frequency.setValueAtTime(bassFreq, t);
      drone.frequency.linearRampToValueAtTime(bassFreq, t + 0.1);
    }

    step++;
    setTimeout(tick, tempo * 1000);
  }

  tick();
}

export function startMusic() {
  if (playing) return;
  const c = getCtx();
  if (!c) return;
  playing = true;

  masterGain = c.createGain();
  masterGain.gain.value = 0.6;
  masterGain.connect(c.destination);

  scheduleLoop(c, masterGain);
}

export function stopMusic() {
  playing = false;
  nodes.forEach((n) => n.stop());
  nodes = [];
  if (masterGain) {
    try { masterGain.disconnect(); } catch {}
    masterGain = null;
  }
}

export function setMusicVolume(v: number) {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
}

export function isMusicPlaying() {
  return playing;
}
