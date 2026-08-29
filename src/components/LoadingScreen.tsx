import { useEffect, useState } from "react";

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [phase, setPhase] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(100, v + 2 + Math.random() * 6);
      setPct(Math.floor(v));
      if (v > 52) setPhase(1);
      if (v >= 100) {
        clearInterval(id);
        setTimeout(() => setGone(true), 420);
        setTimeout(onDone, 1100);
      }
    }, 55);
    return () => clearInterval(id);
  }, [onDone]);

  return (
    <div className={`loader${gone ? " loader--gone" : ""}`}>
      <div className="loader__inner">
        <span className="loader__brand">AERON</span>
        <span className="loader__text">
          {phase === 0 ? "PREPARING THE DROP..." : "INITIALIZING EXPERIENCE..."}
        </span>
        <span className="loader__bar">
          <span className="loader__bar-fill" style={{ transform: `scaleX(${pct / 100})` }} />
        </span>
        <span className="loader__pct">{String(pct).padStart(3, "0")}</span>
      </div>
    </div>
  );
}
