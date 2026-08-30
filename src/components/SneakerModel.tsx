import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import {
  CUSHION_PODS,
  LACE_ROWS,
  laceHalfWidth,
  makeCollar,
  makeHeel,
  makeInsole,
  makeMidsole,
  makeOutsole,
  makeToeCap,
  makeTongue,
  makeTread,
  makeUpper,
} from "../lib/sneaker-geometry";
import { band, damp, experienceState, smoothstep } from "../state/experienceState";

const ACCENT = "#4d8cff";

function useMaterials() {
  return useMemo(() => {
    const mk = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
    return {
      upper: mk({ color: "#14161c", roughness: 0.82, metalness: 0.08, emissive: ACCENT, emissiveIntensity: 0 }),
      toe: mk({ color: "#f2f3f5", roughness: 0.55, metalness: 0.05, emissive: ACCENT, emissiveIntensity: 0 }),
      heel: mk({ color: "#20242e", roughness: 0.42, metalness: 0.45, emissive: ACCENT, emissiveIntensity: 0 }),
      collar: mk({ color: "#2a2f3a", roughness: 0.9, metalness: 0.02 }),
      tongue: mk({ color: "#1b1f27", roughness: 0.95, metalness: 0.02, emissive: ACCENT, emissiveIntensity: 0 }),
      midsole: mk({ color: "#eceef1", roughness: 0.62, metalness: 0.02, emissive: ACCENT, emissiveIntensity: 0 }),
      insole: mk({ color: "#c9ced8", roughness: 0.75, metalness: 0.04, emissive: ACCENT, emissiveIntensity: 0 }),
      outsole: mk({ color: "#0d0f14", roughness: 0.68, metalness: 0.1, emissive: ACCENT, emissiveIntensity: 0 }),
      tread: mk({ color: "#161a21", roughness: 0.72, metalness: 0.08 }),
      cushion: mk({
        color: "#8fbaff",
        roughness: 0.18,
        metalness: 0.0,
        transparent: true,
        opacity: 0.72,
        emissive: ACCENT,
        emissiveIntensity: 0.8,
      }),
      accent: mk({ color: "#dfe6f2", roughness: 0.3, metalness: 0.7, emissive: ACCENT, emissiveIntensity: 0.5 }),
      lace: mk({ color: "#e8eaee", roughness: 0.95, metalness: 0.0 }),
      eyelet: mk({ color: "#aeb6c4", roughness: 0.25, metalness: 0.9 }),
    };
  }, []);
}

export function SneakerModel() {
  const group = useRef<THREE.Group>(null!);
  const upper = useRef<THREE.Group>(null!);
  const tongue = useRef<THREE.Group>(null!);
  const laces = useRef<THREE.Group>(null!);
  const insole = useRef<THREE.Group>(null!);
  const cushion = useRef<THREE.Group>(null!);
  const midsole = useRef<THREE.Group>(null!);
  const outsole = useRef<THREE.Group>(null!);
  const heel = useRef<THREE.Group>(null!);
  const accents = useRef<THREE.Group>(null!);
  const energyLight = useRef<THREE.PointLight>(null!);

  const m = useMaterials();
  const geo = useMemo(
    () => ({
      outsole: makeOutsole(),
      midsole: makeMidsole(),
      insole: makeInsole(),
      upper: makeUpper(),
      collar: makeCollar(),
      heel: makeHeel(),
      tongue: makeTongue(),
      toe: makeToeCap(),
      tread: makeTread(),
      pod: new THREE.SphereGeometry(0.13, 20, 14),
      eyelet: new THREE.TorusGeometry(0.032, 0.012, 8, 16),
      lace: new THREE.CylinderGeometry(0.019, 0.019, 1, 8),
      strip: new THREE.BoxGeometry(2.5, 0.022, 0.02),
    }),
    [],
  );

  const state = useRef({ yaw: -0.55, lift: 0 });

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const p = experienceState.progress;
    const t = performance.now() / 1000;

    // ---- explode factor (out during 04-06, back in during 07) ----
    const e = smoothstep(0.55, 0.685, p) * (1 - smoothstep(0.902, 0.962, p));
    const ee = e * e * (3 - 2 * e);

    // ---- orientation ----
    const spin = smoothstep(0.13, 0.4, p);
    const finalSpin = smoothstep(0.962, 1, p);
    const targetYaw = -0.55 - Math.PI * 2 * spin - 0.9 * finalSpin;
    state.current.yaw = damp(state.current.yaw, targetYaw, 6, dt);

    const lift = 0.3 * smoothstep(0.12, 0.26, p) + 0.12 * ee;
    state.current.lift = damp(state.current.lift, lift, 5, dt);

    group.current.rotation.y = state.current.yaw;
    group.current.rotation.z = 0.03 * Math.sin(t * 0.5) * (1 - ee);
    group.current.position.y =
      state.current.lift + Math.sin(t * 0.7) * 0.02 * (1 - ee) - 0.35 * ee;

    // ---- exploded offsets ----
    outsole.current.position.y = -0.95 * ee;
    midsole.current.position.y = -0.4 * ee;
    cushion.current.position.y = -0.05 * ee;
    insole.current.position.y = 0.5 * ee;
    upper.current.position.y = 1.1 * ee;
    heel.current.position.y = 1.1 * ee;
    heel.current.position.x = -0.45 * ee;
    tongue.current.position.y = 1.75 * ee;
    laces.current.position.y = 2.3 * ee;
    accents.current.position.y = -0.4 * ee;

    // ---- technology highlights (stage 03) ----
    const hUpper = band(p, 0.4, 0.442, 0.016) + band(p, 0.705, 0.745, 0.014);
    const hMid = band(p, 0.442, 0.482, 0.016) + band(p, 0.745, 0.785, 0.014);
    const hOut = band(p, 0.482, 0.52, 0.016) + band(p, 0.785, 0.82, 0.014);
    const hHeel = band(p, 0.52, 0.556, 0.016);

    // ---- energy sequence (stage 06) ----
    const en = band(p, 0.818, 0.902, 0.02);
    const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
    const sweep = (t * 0.55) % 1;

    m.upper.emissiveIntensity = hUpper * 0.5;
    m.toe.emissiveIntensity = hUpper * 0.35;
    m.tongue.emissiveIntensity = hUpper * 0.4;
    m.midsole.emissiveIntensity = hMid * 0.35 + en * 0.25 * pulse;
    m.insole.emissiveIntensity = hMid * 0.3;
    m.outsole.emissiveIntensity = hOut * 0.6;
    m.heel.emissiveIntensity = hHeel * 0.8;
    m.cushion.emissiveIntensity = 0.7 + hMid * 1.4 + en * 2.2 * pulse;
    m.accent.emissiveIntensity = 0.45 + en * 2.4 * pulse + ee * 0.4;

    // cushioning compression + sole flex during energy
    const squash = 1 - 0.06 * en * pulse;
    midsole.current.scale.y = damp(midsole.current.scale.y, squash, 8, dt);
    cushion.current.scale.setScalar(1 + 0.12 * en * pulse);

    // light travelling heel -> toe
    energyLight.current.intensity = en * 9;
    energyLight.current.position.set(-1.5 + sweep * 3.1, 0.28, 0);

    // subtle idle breathing on laces during energy
    laces.current.rotation.z = 0.03 * en * Math.sin(t * 2.4);
  });

  const tread = geo.tread;

  return (
    <group ref={group} position={[0, 0, 0]} scale={1}>
      {/* ---------- OUTSOLE ---------- */}
      <group ref={outsole}>
        <mesh geometry={geo.outsole} material={m.outsole} castShadow receiveShadow />
        {tread.map((g, i) => (
          <mesh key={i} geometry={g} material={m.tread} castShadow />
        ))}
      </group>

      {/* ---------- MIDSOLE ---------- */}
      <group ref={midsole}>
        <mesh geometry={geo.midsole} material={m.midsole} castShadow receiveShadow />
      </group>

      {/* ---------- CUSHIONING PODS ---------- */}
      <group ref={cushion}>
        {CUSHION_PODS.map((pos, i) => (
          <mesh
            key={i}
            geometry={geo.pod}
            material={m.cushion}
            position={pos}
            scale={[1.5, 0.72, 1.9]}
          />
        ))}
      </group>

      {/* ---------- ACCENT STRIP ---------- */}
      <group ref={accents}>
        <mesh geometry={geo.strip} material={m.accent} position={[-0.1, 0.245, 0.375]} rotation={[0, 0, 0.012]} />
        <mesh geometry={geo.strip} material={m.accent} position={[-0.1, 0.245, -0.375]} rotation={[0, 0, 0.012]} />
      </group>

      {/* ---------- INSOLE ---------- */}
      <group ref={insole}>
        <mesh geometry={geo.insole} material={m.insole} castShadow />
      </group>

      {/* ---------- UPPER ---------- */}
      <group ref={upper}>
        <mesh geometry={geo.upper} material={m.upper} castShadow receiveShadow />
        <mesh geometry={geo.toe} material={m.toe} castShadow />
        <mesh geometry={geo.collar} material={m.collar} castShadow />
        {LACE_ROWS.map(([x, y], i) => {
          const w = laceHalfWidth(x) + 0.055;
          return (
            <group key={i}>
              <mesh geometry={geo.eyelet} material={m.eyelet} position={[x, y, w]} rotation={[0, 0, 0]} />
              <mesh geometry={geo.eyelet} material={m.eyelet} position={[x, y, -w]} rotation={[0, 0, 0]} />
            </group>
          );
        })}
      </group>

      {/* ---------- HEEL COUNTER ---------- */}
      <group ref={heel}>
        <mesh geometry={geo.heel} material={m.heel} castShadow />
      </group>

      {/* ---------- TONGUE ---------- */}
      <group ref={tongue}>
        <mesh geometry={geo.tongue} material={m.tongue} castShadow />
      </group>

      {/* ---------- LACES ---------- */}
      <group ref={laces}>
        {LACE_ROWS.map(([x, y], i) => {
          const w = laceHalfWidth(x) + 0.05;
          const next = LACE_ROWS[Math.min(i + 1, LACE_ROWS.length - 1)];
          const dx = next[0] - x;
          const dy = next[1] - y;
          const len = Math.hypot(dx, dy, w * 2) || 0.001;
          const cross = (sign: number) => (
            <mesh
              key={`${i}-${sign}`}
              geometry={geo.lace}
              material={m.lace}
              position={[x + dx / 2, y + dy / 2 + 0.03, 0]}
              scale={[1, len, 1]}
              rotation={new THREE.Euler().setFromQuaternion(
                new THREE.Quaternion().setFromUnitVectors(
                  new THREE.Vector3(0, 1, 0),
                  new THREE.Vector3(dx, dy, sign * w * 2).normalize(),
                ),
              )}
            />
          );
          return i === LACE_ROWS.length - 1 ? null : (
            <group key={i}>
              {cross(1)}
              {cross(-1)}
            </group>
          );
        })}
        {/* lace ends */}
        <mesh
          geometry={geo.lace}
          material={m.lace}
          position={[-0.26, 0.98, 0.08]}
          scale={[1, 0.26, 1]}
          rotation={[0.5, 0, 1.35]}
        />
        <mesh
          geometry={geo.lace}
          material={m.lace}
          position={[-0.22, 0.96, -0.1]}
          scale={[1, 0.24, 1]}
          rotation={[-0.5, 0, 1.5]}
        />
      </group>

      <pointLight ref={energyLight} color={ACCENT} distance={2.4} intensity={0} />
    </group>
  );
}
