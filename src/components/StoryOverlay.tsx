import { useEffect, useRef } from "react";
import { COLORWAYS, HOTSPOTS, LAYERS, PRODUCT, SECTIONS, SPECS } from "../data/product";
import { band, clamp, experienceState, smoothstep } from "../state/experienceState";
import { uiActions, useUi } from "../state/uiStore";

/** Scrolls the page to the middle of a section's progress band. */
function goTo(t: number) {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  window.scrollTo({ top: max * t, behavior: "smooth" });
}

function HotspotCard() {
  const id = useUi((s) => s.hotspot);
  const spot = HOTSPOTS.find((h) => h.id === id);
  if (!spot) return null;
  return (
    <div className="hotcard glass" role="dialog" aria-label={spot.label}>
      <button className="hotcard__x" onClick={() => uiActions.setHotspot(null)} aria-label="Close">
        ×
      </button>
      <span className="eyebrow">
        ZONE {spot.index} · {spot.material}
      </span>
      <h3>{spot.label}</h3>
      <p>{spot.detail}</p>
      <span className="hotcard__stat">{spot.stat}</span>
    </div>
  );
}

function SpecsDrawer() {
  const open = useUi((s) => s.specsOpen);
  return (
    <>
      <button className="specs-btn glass" onClick={() => uiActions.toggleSpecs()} aria-expanded={open}>
        {open ? "CLOSE SPECS" : "SPECS"}
      </button>
      <aside className={`drawer glass${open ? " drawer--open" : ""}`} aria-hidden={!open}>
        <span className="eyebrow">TECHNICAL SHEET</span>
        <h3>{PRODUCT.model}</h3>
        <ul className="drawer__specs">
          {SPECS.map((s) => (
            <li key={s.k}>
              <span className="drawer__k">{s.k}</span>
              <span className="drawer__v">{s.v}</span>
              <span className="drawer__s">{s.s}</span>
            </li>
          ))}
        </ul>
        <span className="eyebrow">CONSTRUCTION</span>
        <ul className="drawer__layers">
          {LAYERS.map((l, i) => (
            <li key={l.name}>
              <span className="drawer__n">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <b>{l.name}</b>
                <em>{l.material}</em>
              </span>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}

function ColorwayBar() {
  const active = useUi((s) => s.colorway);
  return (
    <div className="colorbar glass">
      <span className="eyebrow">COLORWAY</span>
      <div className="colorbar__row">
        {COLORWAYS.map((c, i) => (
          <button
            key={c.id}
            className={`swatch${i === active ? " swatch--on" : ""}`}
            style={{ background: c.swatch }}
            onClick={() => uiActions.setColorway(i)}
            aria-label={c.name}
            aria-pressed={i === active}
          />
        ))}
      </div>
      <span className="colorbar__name">
        {COLORWAYS[active]!.name} <b>{COLORWAYS[active]!.code}</b>
      </span>
    </div>
  );
}

function Cta() {
  const reserved = useUi((s) => s.reserved);
  return (
    <button className={`cta${reserved ? " cta--done" : ""}`} onClick={() => uiActions.reserve()}>
      {reserved ? "RESERVED — CHECK YOUR INBOX" : `RESERVE A PAIR · ${PRODUCT.price}`}
    </button>
  );
}

/**
 * The story layer. Copy is static React; only opacity/transform is written
 * per frame, so scrolling never triggers a re-render.
 */
export function StoryOverlay() {
  const panels = useRef<Array<HTMLDivElement | null>>([]);
  const navs = useRef<Array<HTMLButtonElement | null>>([]);
  const hero = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const vignette = useRef<HTMLDivElement>(null);
  const railFill = useRef<HTMLSpanElement>(null);
  const colorbar = useRef<HTMLDivElement>(null);
  const launch = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const p = experienceState.progress;

      if (hero.current) {
        const o = 1 - smoothstep(0.02, 0.1, p);
        hero.current.style.opacity = String(o);
        hero.current.style.transform = `translateY(${(1 - o) * -22}px)`;
      }
      if (hint.current) hint.current.style.opacity = String(1 - smoothstep(0.004, 0.03, p));
      if (vignette.current) vignette.current.style.opacity = String(0.9 - smoothstep(0, 0.16, p) * 0.45);
      if (railFill.current) railFill.current.style.transform = `scaleY(${clamp(p)})`;

      SECTIONS.forEach((s, i) => {
        const el = panels.current[i];
        const nav = navs.current[i];
        const inside = p >= s.start && p < s.end;
        if (el) {
          const o = i === 0 ? 0 : band(p, s.start, s.end, 0.03);
          el.style.opacity = String(o);
          el.style.transform = `translateY(${(1 - o) * 16}px)`;
          el.style.pointerEvents = o > 0.6 ? "auto" : "none";
        }
        if (nav) nav.dataset["on"] = inside ? "1" : "0";
      });

      if (colorbar.current) {
        // colorway control fades in for act 05 and stays for the launch act
        const o = smoothstep(0.72, 0.77, p);
        colorbar.current.style.opacity = String(o);
        colorbar.current.style.pointerEvents = o > 0.6 ? "auto" : "none";
      }
      if (launch.current) {
        const o = smoothstep(0.925, 0.975, p);
        launch.current.style.opacity = String(o);
        launch.current.style.transform = `translateY(${(1 - o) * 18}px)`;
        launch.current.style.pointerEvents = o > 0.6 ? "auto" : "none";
      }

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="overlay">
      <div ref={vignette} className="overlay__vignette" />

      <header className="topbar">
        <div className="brand">
          <span>{PRODUCT.brand}</span>
          <span className="brand__sub">{PRODUCT.model}</span>
        </div>
        <SpecsDrawer />
      </header>

      {/* ACT 01 — hero, readable in the first second */}
      <div ref={hero} className="hero">
        <span className="eyebrow">{PRODUCT.drop}</span>
        <h1>
          GLIDE<span>01</span>
        </h1>
        <p className="hero__tag">{PRODUCT.tagline}</p>
        <p className="hero__sub">
          A futuristic running silhouette built for people who move all day — 218g, 78% energy return,
          one seamless upper.
        </p>
        <div className="hero__stats">
          <span>
            <b>218g</b>WEIGHT
          </span>
          <span>
            <b>78%</b>ENERGY RETURN
          </span>
          <span>
            <b>500</b>PAIRS
          </span>
        </div>
      </div>

      <div ref={hint} className="hint">
        <span className="hint__line" />
        SCROLL TO PLAY THE FILM
      </div>

      {/* ACTS 02-06 — one glass panel per act */}
      {SECTIONS.map((s, i) => (
        <div
          key={s.id}
          className={`panel glass panel--${s.id}`}
          ref={(el) => {
            panels.current[i] = el;
          }}
          style={{ opacity: 0 }}
        >
          <span className="eyebrow">
            {s.index} · {s.kicker}
          </span>
          <h2>{s.title}</h2>
          <p>{s.body}</p>
          {s.points && (
            <ul className="panel__points">
              {s.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          )}
          {s.id === "build" && (
            <ul className="panel__layers">
              {LAYERS.map((l, n) => (
                <li key={l.name}>
                  <span>{String(n + 1).padStart(2, "0")}</span>
                  <b>{l.name}</b>
                  <em>{l.note}</em>
                </li>
              ))}
            </ul>
          )}
          {s.id === "color" && (
            <p className="panel__hint">Use the swatches below — the model re-skins instantly.</p>
          )}
          {s.id === "inspect" && (
            <p className="panel__hint">Markers are live on the shoe while it turns.</p>
          )}
        </div>
      ))}

      <HotspotCard />

      <div ref={colorbar} className="colorbar-wrap" style={{ opacity: 0 }}>
        <ColorwayBar />
      </div>

      {/* ACT 06 — launch */}
      <div ref={launch} className="launch" style={{ opacity: 0 }}>
        <span className="eyebrow">{PRODUCT.drop}</span>
        <h2>{PRODUCT.tagline}</h2>
        <Cta />
        <button className="ghost" onClick={() => uiActions.toggleSpecs(true)}>
          VIEW FULL SPECS
        </button>
      </div>

      {/* chapter rail — always available, judges can jump anywhere */}
      <nav className="rail" aria-label="Chapters">
        <span className="rail__track">
          <span ref={railFill} className="rail__fill" />
        </span>
        <ul>
          {SECTIONS.map((s, i) => (
            <li key={s.id}>
              <button
                ref={(el) => {
                  navs.current[i] = el;
                }}
                onClick={() => goTo((s.start + s.end) / 2)}
                data-on="0"
              >
                <i />
                <span>{s.nav}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
