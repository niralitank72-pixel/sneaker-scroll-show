// Shared, render-loop friendly experience state (no React re-renders per frame).
export const experienceState = {
  /** Damped normalized scroll progress 0..1 */
  progress: 0,
  /** Raw normalized scroll progress 0..1 */
  target: 0,
  /** Pointer parallax, -1..1 */
  mouseX: 0,
  mouseY: 0,
  ready: false,
};

export const STAGES = [
  { id: "01", name: "REVEAL", start: 0.0, end: 0.12 },
  { id: "02", name: "ROTATION", start: 0.12, end: 0.4 },
  { id: "03", name: "TECHNOLOGY", start: 0.4, end: 0.55 },
  { id: "04", name: "EXPLODED", start: 0.55, end: 0.7 },
  { id: "05", name: "MATERIALS", start: 0.7, end: 0.82 },
  { id: "06", name: "ENERGY", start: 0.82, end: 0.9 },
  { id: "07", name: "REBUILD", start: 0.9, end: 0.965 },
  { id: "08", name: "FINAL DROP", start: 0.965, end: 1.001 },
] as const;

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

/** 0 -> 1 -> 0 window with soft edges */
export const band = (x: number, start: number, end: number, fade = 0.04) =>
  smoothstep(start - fade, start + fade, x) * (1 - smoothstep(end - fade, end + fade, x));

/** Frame-rate independent damping */
export const damp = (current: number, target: number, lambda: number, dt: number) =>
  current + (target - current) * (1 - Math.exp(-lambda * dt));
