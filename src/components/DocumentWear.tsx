function hash(seed: string) { let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }

/** Детерминированные бытовые следы: один документ сохраняет свои пятна при каждом рендере. */
export function DocumentWear({ seed }: { seed: string }) {
  const h = hash(seed);
  const marks = [
    h % 3 === 0 && <i key="coffee" className="wear-coffee" style={{ left: `${8 + h % 68}%`, top: `${10 + (h >>> 4) % 55}%` }} />,
    h % 4 !== 1 && <i key="fold" className="wear-fold" style={{ left: `${15 + (h >>> 7) % 65}%` }} />,
    h % 5 === 0 && <i key="ink" className="wear-ink" style={{ left: `${5 + (h >>> 9) % 75}%`, top: `${15 + (h >>> 13) % 60}%` }} />,
    h % 7 < 3 && <i key="finger" className="wear-fingerprint" style={{ right: `${4 + (h >>> 11) % 28}%`, bottom: `${5 + (h >>> 16) % 35}%` }}>◎</i>,
    h % 6 === 2 && <i key="grease" className="wear-grease" style={{ left: `${10 + (h >>> 3) % 65}%`, bottom: `${4 + (h >>> 18) % 25}%` }} />,
  ];
  return <span className="document-wear" aria-hidden="true">{marks}</span>;
}
