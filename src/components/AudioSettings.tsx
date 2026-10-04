import { useState, type CSSProperties } from "react";
import { getEffectsVolume, setEffectsVolume, sfx } from "../audio";
import { getMusicVolume, setMusicVolume } from "../music";

export function AudioSettings() {
  const [effects, setEffects] = useState(getEffectsVolume());
  const [music, setMusic] = useState(getMusicVolume());
  return <div className="audio-console" aria-label="Audio controls">
    <span className="audio-console__bolt" />
    <label className="audio-channel">
      <span>FX</span>
      <input aria-label="Effects volume" type="range" min="0" max="1" step="0.05" value={effects} style={{ "--level": `${effects * 100}%` } as CSSProperties} onChange={(e) => { const v=Number(e.target.value); setEffects(v); setEffectsVolume(v); sfx.ui(); }} />
    </label>
    <span className="audio-console__divider" />
    <label className="audio-channel">
      <span>♪</span>
      <input aria-label="Music volume" type="range" min="0" max="1" step="0.05" value={music} style={{ "--level": `${music * 100}%` } as CSSProperties} onChange={(e) => { const v=Number(e.target.value); setMusic(v); setMusicVolume(v); }} />
    </label>
  </div>;
}
