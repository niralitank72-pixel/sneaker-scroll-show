import * as THREE from "three";

/**
 * Procedural sneaker geometry.
 *
 * Each part is an extruded 2D side-profile, then laterally tapered so the
 * volume reads as a real shoe (narrow at toe + heel, full at the waist)
 * instead of a flat extrusion.
 */

type TaperOpts = {
  /** max half width at the widest point */
  width: number;
  /** length normalization (|x| / len) */
  len?: number;
  /** extra narrowing towards the toe (+x) */
  toe?: number;
  /** extra narrowing towards the top (+y) */
  crown?: number;
  crownFrom?: number;
};

function taper(geo: THREE.BufferGeometry, o: TaperOpts) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const len = o.len ?? 1.6;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const u = Math.min(1, Math.abs(x) / len);
    let f = Math.pow(Math.max(0.0001, 1 - Math.pow(u, 3.2)), 0.42);
    if (x > 0) f *= 1 - (o.toe ?? 0.22) * u * u;
    if (o.crown) {
      const c = Math.max(0, (y - (o.crownFrom ?? 0.3)) / 0.9);
      f *= 1 - Math.min(0.92, o.crown * c);
    }
    pos.setZ(i, z * f * o.width);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

function extrude(shape: THREE.Shape, depth: number, bevel = 0.045, steps = 2) {
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 22,
    steps,
  });
  geo.translate(0, 0, -depth / 2);
  // normalize extrusion to unit half-depth so taper() controls the real width
  geo.scale(1, 1, 1 / (depth / 2 + bevel));
  return geo;
}

/** Outsole: thin ground-contact layer with toe spring. */
export function makeOutsole() {
  const s = new THREE.Shape();
  s.moveTo(-1.42, 0.03);
  s.quadraticCurveTo(-1.6, 0.06, -1.55, 0.16);
  s.lineTo(-1.5, 0.17);
  s.lineTo(1.28, 0.1);
  s.quadraticCurveTo(1.55, 0.11, 1.58, 0.2);
  s.quadraticCurveTo(1.62, 0.06, 1.3, 0.005);
  s.lineTo(-1.1, 0.0);
  s.quadraticCurveTo(-1.36, 0.0, -1.42, 0.03);
  return taper(extrude(s, 0.9), { width: 0.44, toe: 0.3 });
}

/** Midsole: chunky foam wedge, thicker at the heel. */
export function makeMidsole() {
  const s = new THREE.Shape();
  s.moveTo(-1.55, 0.16);
  s.lineTo(1.58, 0.2);
  s.quadraticCurveTo(1.6, 0.3, 1.44, 0.33);
  s.lineTo(0.2, 0.31);
  s.quadraticCurveTo(-0.9, 0.33, -1.24, 0.46);
  s.quadraticCurveTo(-1.56, 0.56, -1.58, 0.36);
  s.quadraticCurveTo(-1.6, 0.24, -1.55, 0.16);
  return taper(extrude(s, 0.88), { width: 0.435, toe: 0.3 });
}

/** Insole: thin footbed plate. */
export function makeInsole() {
  const s = new THREE.Shape();
  s.moveTo(-1.36, 0.36);
  s.lineTo(1.34, 0.33);
  s.quadraticCurveTo(1.42, 0.37, 1.3, 0.4);
  s.lineTo(-1.2, 0.45);
  s.quadraticCurveTo(-1.4, 0.45, -1.36, 0.36);
  return taper(extrude(s, 0.78), { width: 0.385, toe: 0.34 });
}

/** Upper: mid-top shell with a rounded, dipped collar. */
export function makeUpper() {
  const s = new THREE.Shape();
  s.moveTo(-1.48, 0.28);
  s.lineTo(1.44, 0.24);
  s.quadraticCurveTo(1.52, 0.4, 1.22, 0.5);
  s.quadraticCurveTo(0.74, 0.6, 0.42, 0.74);
  s.quadraticCurveTo(0.06, 0.9, -0.2, 1.02);
  s.quadraticCurveTo(-0.42, 1.12, -0.66, 1.0);
  s.quadraticCurveTo(-0.9, 0.9, -1.06, 1.06);
  s.quadraticCurveTo(-1.3, 1.28, -1.42, 1.0);
  s.lineTo(-1.52, 0.52);
  s.quadraticCurveTo(-1.56, 0.3, -1.48, 0.28);
  return taper(extrude(s, 0.84), {
    width: 0.415,
    toe: 0.34,
    crown: 0.42,
    crownFrom: 0.42,
  });
}

/** Collar ring at the ankle opening. */
export function makeCollar() {
  const geo = new THREE.TorusGeometry(0.3, 0.05, 12, 40);
  geo.rotateX(Math.PI / 2);
  geo.rotateZ(-0.38);
  geo.scale(1.5, 1, 0.62);
  geo.translate(-0.62, 1.02, 0);
  return geo;
}

/** Heel counter panel, hugging the back of the upper. */
export function makeHeel() {
  const s = new THREE.Shape();
  s.moveTo(-1.48, 0.32);
  s.quadraticCurveTo(-0.92, 0.34, -0.8, 0.62);
  s.quadraticCurveTo(-0.9, 0.84, -1.02, 0.98);
  s.quadraticCurveTo(-1.24, 1.18, -1.38, 0.96);
  s.lineTo(-1.5, 0.5);
  s.quadraticCurveTo(-1.54, 0.34, -1.48, 0.32);
  return taper(extrude(s, 0.86, 0.028), {
    width: 0.434,
    toe: 0,
    crown: 0.3,
    crownFrom: 0.5,
  });
}

/** Tongue: padded slab lying on the instep. */
export function makeTongue() {
  const s = new THREE.Shape();
  s.moveTo(0.62, 0.6);
  s.lineTo(-0.12, 1.12);
  s.quadraticCurveTo(-0.24, 1.24, -0.34, 1.16);
  s.lineTo(0.5, 0.5);
  s.quadraticCurveTo(0.64, 0.48, 0.62, 0.6);
  return taper(extrude(s, 0.5, 0.035), { width: 0.27, toe: 0.1 });
}

/** Toe cap overlay. */
export function makeToeCap() {
  const s = new THREE.Shape();
  s.moveTo(1.46, 0.27);
  s.quadraticCurveTo(1.53, 0.44, 1.22, 0.54);
  s.lineTo(0.82, 0.63);
  s.lineTo(0.78, 0.3);
  s.quadraticCurveTo(1.1, 0.26, 1.46, 0.27);
  return taper(extrude(s, 0.85, 0.02), { width: 0.421, toe: 0.34, crown: 0.3, crownFrom: 0.4 });
}

/** Tread blocks for the outsole. */
export function makeTread() {
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 13; i++) {
    const x = -1.28 + i * 0.215;
    const u = Math.min(1, Math.abs(x) / 1.6);
    const w = Math.pow(Math.max(0.0001, 1 - Math.pow(u, 3.2)), 0.42) * 0.4 * (x > 0 ? 1 - 0.3 * u * u : 1);
    const g = new THREE.BoxGeometry(0.12, 0.05, w * 2 * 0.92);
    g.translate(x, -0.01, 0);
    parts.push(g);
  }
  return parts;
}

/** Air / cushioning pods living between mid- and outsole. */
export const CUSHION_PODS: Array<[number, number, number]> = [
  [-1.16, 0.19, 0],
  [-0.78, 0.18, 0],
  [0.62, 0.16, 0],
  [1.0, 0.15, 0],
];

/** Eyelet + lace anchor points along the instep line. */
export const LACE_ROWS: Array<[number, number]> = [
  [0.66, 0.62],
  [0.42, 0.79],
  [0.18, 0.95],
  [-0.06, 1.1],
];

export function laceHalfWidth(x: number) {
  const u = Math.min(1, Math.abs(x) / 1.6);
  return Math.pow(Math.max(0.0001, 1 - Math.pow(u, 3.2)), 0.42) * 0.32;
}
