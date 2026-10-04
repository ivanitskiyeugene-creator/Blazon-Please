// Фоновая атмосфера будки. Файл зациклен и управляется отдельным каналом музыки.
let playing = false;
let ambient: HTMLAudioElement | null = null;
let musicVolume = Number(localStorage.getItem("blazon.musicVolume") ?? 0.6);

function getAmbient() {
  if (!ambient) {
    ambient = new Audio("/audio/booth-ambient.wav");
    ambient.loop = true;
    ambient.preload = "auto";
  }
  ambient.volume = musicVolume;
  return ambient;
}

export function startMusic() {
  if (playing) return;
  const audio = getAmbient();
  playing = true;
  void audio.play().catch(() => { playing = false; });
}

export function stopMusic() {
  playing = false;
  if (!ambient) return;
  ambient.pause();
  ambient.currentTime = 0;
}

export function setMusicVolume(v: number) {
  musicVolume = Math.max(0, Math.min(1, v));
  localStorage.setItem("blazon.musicVolume", String(musicVolume));
  if (ambient) ambient.volume = musicVolume;
}
export function getMusicVolume() { return musicVolume; }
export function isMusicPlaying() { return playing; }
