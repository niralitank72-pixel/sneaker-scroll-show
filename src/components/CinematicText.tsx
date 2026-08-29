import { useEffect, useRef } from "react";
import { band, clamp, experienceState, smoothstep, STAGES } from "../state/experienceState";

/**
 * DOM overlay: cinematic titles, stage labels and the progress rail.
 * Everything is driven imperatively from the scroll value — no re-renders.
 */
export function CinematicText() {
  const title = useRef<HTMLDivElement>(null);
  const scrollHint = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const finale = useRef<HTMLDivElement>(null);
  const railFill = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const vignette = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = experienceState.progress;

      // Opening title: visible at the very start, fades on scroll
      if (title.current) {
        const o = 1 - smoothstep(0.005, 0.075, p);
        title.current.style.opacity = String(o);
        title.current.style.transform = `translateY(${(1 - o) * -24}px)`;
        title.current.style.letterSpacing = `${0.34 + (1 - o) * 0.14}em`;
      }
      if (scrollHint.current) {
        scrollHint.current.style.opacity = String(1 - smoothstep(0.004, 0.03, p));
      }

      // Stage labels
      STAGES.forEach((s, i) => {
        const el = stageRefs.current[i];
        if (!el) return;
        const o = band(p, s.start, s.end, 0.022);
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - o) * 12}px)`;
      });

      // Finale block
      if (finale.current) {
        const o = smoothstep(0.972, 0.995, p);
        finale.current.style.opacity = String(o);
        finale.current.style.transform = `translateY(${(1 - o) * 18}px)`;
      }

      if (railFill.current) railFill.current.style.transform = `scaleY(${clamp(p)})`;
      if (counter.current) counter.current.textContent = String(Math.round(p * 100)).padStart(3, "0");
      if (vignette.current) {
        vignette.current.style.opacity = String(0.85 - smoothstep(0.0, 0.16, p) * 0.45);
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="overlay">
      <div ref={vignette} className="overlay__vignette" />

      {/* brand mark */}
      <div className="overlay__brand">
        <span>AERON</span>
        <span className="overlay__brand-sub">AERON // X1</span>
      </div>

      {/* opening title */}
      <div ref={title} className="overlay__title">
        <h1>THE DROP</h1>
        <p>ENGINEERED TO MOVE.</p>
      </div>

      <div ref={scrollHint} className="overlay__scroll">
        <span className="overlay__scroll-line" />
        SCROLL
      </div>

      {/* stage labels */}
      <div className="overlay__stages">
        {STAGES.map((s, i) => (
          <div
            key={s.id}
            className="overlay__stage"
            ref={(el) => {
              stageRefs.current[i] = el;
            }}
          >
            <span className="overlay__stage-id">{s.id}</span>
            <span className="overlay__stage-name">{s.name}</span>
          </div>
        ))}
      </div>

      {/* finale */}
      <div ref={finale} className="overlay__finale">
        <h2>THE DROP</h2>
        <p>ENGINEERED TO MOVE.</p>
        <div className="overlay__finale-meta">
          <span>LIMITED EDITION</span>
          <span>01 / 01</span>
        </div>
      </div>

      {/* progress rail */}
      <div className="overlay__rail">
        <span className="overlay__rail-track">
          <span ref={railFill} className="overlay__rail-fill" />
        </span>
        <span ref={counter} className="overlay__rail-count">
          000
        </span>
      </div>
    </div>
  );
}
