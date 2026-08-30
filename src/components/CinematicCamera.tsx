import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { damp, experienceState, smoothstep } from "../state/experienceState";

type Key = { t: number; pos: [number, number, number]; look: [number, number, number]; fov: number };

/** Cinematic camera states, blended smoothly by scroll progress. */
const KEYS: Key[] = [
  // CAMERA 1 — reveal (far, three-quarter, low)
  { t: 0.0, pos: [4.4, 1.1, 6.4], look: [0, 0.3429, 0], fov: 34 },
  { t: 0.1, pos: [3.1, 0.95, 4.3], look: [0, 0.4191, 0], fov: 32 },
  // CAMERA 2 — 360 orbit
  { t: 0.17, pos: [4.0, 1.0, 1.4], look: [0, 0.4572, 0], fov: 30 },
  { t: 0.24, pos: [1.2, 1.2, -3.7], look: [0, 0.4572, 0], fov: 30 },
  { t: 0.31, pos: [-3.6, 1.0, -1.6], look: [0, 0.4572, 0], fov: 30 },
  { t: 0.38, pos: [-1.6, 1.6, 3.6], look: [0, 0.4572, 0], fov: 30 },
  // CAMERA 3 — technology inspection (close)
  { t: 0.44, pos: [1.9, 1.5, 2.6], look: [0.0762, 0.5715, 0], fov: 28 },
  { t: 0.5, pos: [1.3, 0.7, 2.6], look: [0.0762, 0.3048, 0], fov: 26 },
  { t: 0.55, pos: [-1.9, 1.0, 2.6], look: [-0.381, 0.4572, 0], fov: 28 },
  // CAMERA 4 — exploded inspection
  { t: 0.63, pos: [0.6, 1.0, 6.2], look: [0, 0.5334, 0], fov: 33 },
  { t: 0.69, pos: [3.4, 2.2, 4.6], look: [0, 0.4572, 0], fov: 32 },
  // CAMERA 5 — material macro
  { t: 0.75, pos: [1.5, 2.0, 2.1], look: [0.0762, 1.143, 0], fov: 26 },
  { t: 0.79, pos: [1.4, 0.2, 2.0], look: [0.1524, 0.0762, 0], fov: 26 },
  { t: 0.82, pos: [-1.8, -0.6, 2.2], look: [-0.2286, -0.5334, 0], fov: 28 },
  // CAMERA 6 — energy + rebuild
  { t: 0.87, pos: [0.2, 0.4, 4.6], look: [0, 0.2286, 0], fov: 32 },
  { t: 0.93, pos: [3.0, 1.4, 3.6], look: [0, 0.381, 0], fov: 32 },
  // FINAL hero — slightly below product level
  { t: 0.975, pos: [1.4, 0.32, 4.6], look: [0, 0.4191, 0], fov: 30 },
  { t: 1.0, pos: [0.15, 0.28, 5.4], look: [0, 0.4572, 0], fov: 30 },
];

export function CinematicCamera() {
  const { camera } = useThree();
  const pos = useRef(new THREE.Vector3(...KEYS[0].pos));
  const look = useRef(new THREE.Vector3(...KEYS[0].look));
  const tmpPos = useMemo(() => new THREE.Vector3(), []);
  const tmpLook = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const p = experienceState.progress;

    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].t) i++;
    const a = KEYS[i];
    const b = KEYS[i + 1];
    const k = smoothstep(a.t, b.t, p);

    tmpPos.set(...a.pos).lerp(tmpLook.set(...b.pos), k);
    // subtle drift so the shot is never perfectly static
    const t = performance.now() / 1000;
    tmpPos.x += Math.sin(t * 0.18) * 0.08;
    tmpPos.y += Math.cos(t * 0.15) * 0.05;
    // optional pointer parallax
    tmpPos.x += experienceState.mouseX * 0.35;
    tmpPos.y += -experienceState.mouseY * 0.22;

    pos.current.x = damp(pos.current.x, tmpPos.x, 3.2, dt);
    pos.current.y = damp(pos.current.y, tmpPos.y, 3.2, dt);
    pos.current.z = damp(pos.current.z, tmpPos.z, 3.2, dt);

    tmpLook.set(...a.look).lerp(tmpPos.set(...b.look), k);
    look.current.x = damp(look.current.x, tmpLook.x, 3.6, dt);
    look.current.y = damp(look.current.y, tmpLook.y, 3.6, dt);
    look.current.z = damp(look.current.z, tmpLook.z, 3.6, dt);

    camera.position.copy(pos.current);
    camera.lookAt(look.current);

    const cam = camera as THREE.PerspectiveCamera;
    const fov = a.fov + (b.fov - a.fov) * k;
    cam.fov = damp(cam.fov, fov, 3, dt);
    cam.updateProjectionMatrix();
  });

  return null;
}
