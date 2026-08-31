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
import { COLORWAYS } from "../data/product";
import { readUi } from "../state/uiStore";

function useMaterials() {
  return useMemo(() => {
    const c = COLORWAYS[0]!.colors;
    const mk = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o);
    return {
      upper: mk({ color: c.upper, roughness: 0.82, metalness: 0.08, emissive: c.glow, emissiveIntensity: 0 }),
      toe: mk({ color: c.toe, roughness: 0.55, metalness: 0.05, emissive: c.glow, emissiveIntensity: 0 }),
      heel: mk({ color: c.heel, roughness: 0.42, metalness: 0.45, emissive: c.glow, emissiveIntensity: 0 }),
      collar: mk({ color: c.collar, roughness: 0.9, metalness: 0.02 }),
      tongue: mk({ color: c.tongue, roughness: 0.95, metalness: 0.02, emissive: c.glow, emissiveIntensity: 0 }),
      midsole: mk({ color: c.midsole, roughness: 0.62, metalness: 0.02, emissive: c.glow, emissiveIntensity: 0 }),
      insole: mk({ color: c.insole, roughness: 0.75, metalness: 0.04, emissive: c.glow, emissiveIntensity: 0 }),
      outsole: mk({ color: c.outsole, roughness: 0.68, metalness: 0.1, emissive: c.glow, emissiveIntensity: 0 }),
      tread: mk({ color: c.outsole, roughness: 0.72, metalness: 0.08 }),
      cushion: mk({
        color: "#8fbaff",
        roughness: 0.18,
        metalness: 0.0,
        transparent: true,
        opacity: 0.72,
        emissive: c.glow,
        emissiveIntensity: 0.8,
      }),
      accent: mk({ color: c.accent, roughness: 0.3, metalness: 0.7, emissive: c.glow, emissiveIntensity: 0.5 }),
      lace: mk({ color: c.lace, roughness: 0.95, metalness: 0.0 }),
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
  const target = useMemo(() => new THREE.Color(), []);
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
    const ui = readUi();

    // ---- colorway blend (drives every skin in one place) ----
    const cw = COLORWAYS[ui.colorway] ?? COLORWAYS[0]!;
    const k = 1 - Math.exp(-6 * dt);
    const blend = (mat: THREE.MeshStandardMaterial, hex: string) => mat.color.lerp(target.set(hex), k);
    blend(m.upper, cw.colors.upper);
    blend(m.toe, cw.colors.toe);
    blend(m.heel, cw.colors.heel);
    blend(m.collar, cw.colors.collar);
    blend(m.tongue, cw.colors.tongue);
    blend(m.midsole, cw.colors.midsole);
    blend(m.insole, cw.colors.insole);
    blend(m.outsole, cw.colors.outsole);
    blend(m.tread, cw.colors.outsole);
    blend(m.accent, cw.colors.accent);
    blend(m.lace, cw.colors.lace);
    m.cushion.emissive.lerp(target.set(cw.colors.glow), k);
    m.accent.emissive.lerp(target.set(cw.colors.glow), k);
    energyLight.current.color.lerp(target.set(cw.colors.glow), k);

    // ---- ACT 04: deconstruct, then rebuild before the colorway act ----
    const e = smoothstep(0.53, 0.61, p) * (1 - smoothstep(0.72, 0.78, p));
    const ee = e * e * (3 - 2 * e);

    // ---- orientation: one full inspection turn in act 03 ----
    const spin = smoothstep(0.3, 0.5, p);
    const settle = smoothstep(0.12, 0.28, p) * 0.35;
    const finalSpin = smoothstep(0.9, 1, p);
    const targetYaw = -0.55 - settle - Math.PI * 2 * spin - 0.6 * finalSpin;
    state.current.yaw = damp(state.current.yaw, targetYaw, 6, dt);

    const lift = 0.3 * smoothstep(0.1, 0.24, p) + 0.12 * ee;
    state.current.lift = damp(state.current.lift, lift, 5, dt);

    group.current.rotation.y = state.current.yaw;
    group.current.rotation.z = 0.025 * Math.sin(t * 0.5) * (1 - ee);
    group.current.position.y = state.current.lift + Math.sin(t * 0.7) * 0.02 * (1 - ee) - 0.35 * ee;

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

    // ---- zone highlights: scroll bands in act 03, plus the clicked hotspot ----
    const sel = ui.hotspot;
    const hUpper = band(p, 0.3, 0.35, 0.014) + (sel === "upper" ? 1 : 0);
    const hMid = band(p, 0.35, 0.4, 0.014) + band(p, 0.62, 0.68, 0.014) + (sel === "foam" ? 1 : 0);
    const hOut = band(p, 0.4, 0.45, 0.014) + band(p, 0.68, 0.73, 0.014) + (sel === "sole" ? 1 : 0);
    const hHeel = band(p, 0.45, 0.5, 0.014) + (sel === "heel" ? 1 : 0);

    // ---- energy pulse carries the colorway act ----
    const en = band(p, 0.78, 0.9, 0.025);
    const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
    const sweep = (t * 0.55) % 1;

    m.upper.emissiveIntensity = hUpper * 0.45;
    m.toe.emissiveIntensity = hUpper * 0.3;
    m.tongue.emissiveIntensity = hUpper * 0.35;
    m.midsole.emissiveIntensity = hMid * 0.32 + en * 0.22 * pulse;
    m.insole.emissiveIntensity = hMid * 0.28;
    m.outsole.emissiveIntensity = hOut * 0.55;
    m.heel.emissiveIntensity = hHeel * 0.75;
    m.cushion.emissiveIntensity = 0.7 + hMid * 1.4 + en * 2 * pulse;
    m.accent.emissiveIntensity = 0.45 + en * 2.2 * pulse + ee * 0.4;

    const squash = 1 - 0.05 * en * pulse;
    midsole.current.scale.y = damp(midsole.current.scale.y, squash, 8, dt);
    cushion.current.scale.setScalar(1 + 0.1 * en * pulse);

    energyLight.current.intensity = en * 9;
    energyLight.current.position.set(-1.5 + sweep * 3.1, 0.28, 0);
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
          <mesh key={i} geometry={geo.pod} material={m.cushion} position={pos} scale={[1.5, 0.72, 1.9]} />
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
              <mesh geometry={geo.eyelet} material={m.eyelet} position={[x, y, w]} />
              <mesh geometry={geo.eyelet} material={m.eyelet} position={[x, y, -w]} />
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
          const next = LACE_ROWS[Math.min(i + 1, LACE_ROWS.length - 1)]!;
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

      <pointLight ref={energyLight} color={COLORWAYS[0]!.colors.glow} distance={2.4} intensity={0} />
    </group>
  );
}
