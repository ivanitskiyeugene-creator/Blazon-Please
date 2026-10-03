import { motion, useMotionValue } from "framer-motion";
import { useRef, useState } from "react";
import type { EntrantSpec } from "../game/types";
import { useI18n } from "../i18n";
import { sfx } from "../audio";

export function InspectionDevices({ entrant, wanted, onWanted, onScan, onFingerprints, onMeasure }: {
  entrant: EntrantSpec;
  wanted?: EntrantSpec;
  onWanted: () => void;
  onScan: () => void;
  onFingerprints: () => void;
  onMeasure: () => void;
}) {
  const { t } = useI18n();
  const scanX = useMotionValue(0);
  const rulerY = useMotionValue(0);
  const [scanned, setScanned] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [measured, setMeasured] = useState(false);
  const [fingerDown, setFingerDown] = useState(false);
  const fingerTimer = useRef<number | null>(null);

  const pressFinger = () => {
    if (printed) return;
    setFingerDown(true); sfx.paperDragStart();
    fingerTimer.current = window.setTimeout(() => { setPrinted(true); setFingerDown(false); sfx.stamp(); onFingerprints(); }, 850);
  };
  const releaseFinger = () => {
    if (fingerTimer.current) window.clearTimeout(fingerTimer.current);
    fingerTimer.current = null;
    if (!printed) setFingerDown(false);
  };

  return <div className="physical-inspection">
    <div className="database-terminal">
      <div className="device-label">{t.ui.game.wantedBoard}</div>
      <div className="database-screen" onClick={onWanted} role="switch" tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") onWanted(); }}>
        <span className="scanlines" />
        <b>{wanted?.passport.name ?? t.ui.game.wantedEmpty}</b>
        <small>{wanted ? wanted.passport.id : "— — —"}</small>
      </div>
      <i className="terminal-light" data-on={!!wanted} /><span className="terminal-key">{t.ui.game.databaseKey}</span>
    </div>

    <div className="search-apparatus">
      <div className="device-label">{t.ui.game.scan}</div>
      <div className="search-rail"><motion.div className="search-carriage" drag="x" dragConstraints={{ left: 0, right: 88 }} dragElastic={0} dragMomentum={false} style={{ x: scanX }} onDragStart={() => sfx.metalDragStart()} onDragEnd={() => { scanX.set(0); setScanned(true); sfx.metalDragStop(); onScan(); }}><i /></motion.div></div>
      <div className="search-result" data-bad={!!entrant.contraband}>{scanned ? entrant.contraband ?? t.ui.game.scanClear : "████████"}</div>
    </div>

    <div className="fingerprint-rig">
      <div className="device-label">{t.ui.game.fingerprintCard}</div>
      <div className={`finger-pad ${fingerDown ? "is-down" : ""} ${printed ? "has-print" : ""}`} onPointerDown={pressFinger} onPointerUp={releaseFinger} onPointerLeave={releaseFinger}><span className="finger-whorl">◎</span></div>
      <div className="print-card" data-out={printed}>{printed ? (entrant.fingerprintMismatch ? t.ui.game.fingerprintBad : t.ui.game.fingerprintMatch) : t.ui.game.fingerprints}</div>
    </div>

    <div className="measure-rig">
      <div className="device-label">{t.ui.game.measurements}</div>
      <div className="height-column"><motion.div className="height-stop" drag="y" dragConstraints={{ top: 0, bottom: 42 }} dragElastic={0} dragMomentum={false} style={{ y: rulerY }} onDragStart={() => sfx.metalDragStart()} onDragEnd={() => { rulerY.set(0); setMeasured(true); sfx.metalDragStop(); onMeasure(); }} /></div>
      <div className="measure-readout">{measured ? `${entrant.measuredHeight}cm · ${entrant.measuredWeight}kg` : `${entrant.declaredHeight ?? "—"}cm · ${entrant.declaredWeight ?? "—"}kg`}</div>
    </div>
  </div>;
}
