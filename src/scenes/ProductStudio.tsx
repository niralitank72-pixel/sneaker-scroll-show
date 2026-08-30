import { ContactShadows, MeshReflectorMaterial } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { CinematicCamera } from "../components/CinematicCamera";
import { LightingSystem } from "../components/LightingSystem";
import { ParticleSystem } from "../components/ParticleSystem";
import { SneakerModel } from "../components/SneakerModel";
import { TechLabels } from "../components/TechLabels";
import { band, experienceState, smoothstep } from "../state/experienceState";

const FLOOR_Y = -0.02;

function LightStrips() {
  const group = useRef<THREE.Group>(null!);
  const mats = useRef<THREE.MeshBasicMaterial[]>([]);

  useFrame(() => {
    const p = experienceState.progress;
    const showroom = smoothstep(0.9, 0.99, p);
    const base = 0.1 + smoothstep(0.02, 0.14, p) * 0.35 + showroom * 0.55;
    const energy = band(p, 0.818, 0.902, 0.02);
    const t = performance.now() / 1000;
    mats.current.forEach((m, i) => {
      if (!m) return;
      m.opacity = base * (0.55 + 0.45 * Math.sin(t * 0.6 + i)) + energy * 0.35;
    });
    group.current.rotation.y = Math.sin(t * 0.03) * 0.05;
  });

  const strips = [
    { p: [-9, 2.6, -7], r: 0, s: [0.06, 6, 0.06] },
    { p: [9, 2.6, -7], r: 0, s: [0.06, 6, 0.06] },
    { p: [-5.5, 2.2, -9], r: 0, s: [0.05, 5, 0.05] },
    { p: [5.5, 2.2, -9], r: 0, s: [0.05, 5, 0.05] },
    { p: [0, 5.4, -9], r: 0, s: [16, 0.05, 0.05] },
    { p: [-11, 0.06, 0], r: 0, s: [0.06, 0.04, 22] },
    { p: [11, 0.06, 0], r: 0, s: [0.06, 0.04, 22] },
  ];

  return (
    <group ref={group}>
      {strips.map((s, i) => (
        <mesh key={i} position={s.p as [number, number, number]} scale={s.s as [number, number, number]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial
            ref={(m: THREE.MeshBasicMaterial) => {
              if (m) mats.current[i] = m;
            }}
            color={i % 2 === 0 ? "#6e9dff" : "#b6a6ff"}
            transparent
            opacity={0.3}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function Atmosphere() {
  const fog = useRef<THREE.FogExp2>(null!);
  useFrame(() => {
    const p = experienceState.progress;
    // heavy fog at the start, clears as the product is revealed
    fog.current.density = 0.11 - smoothstep(0.0, 0.18, p) * 0.075 + smoothstep(0.95, 1, p) * 0.012;
  });
  return <fogExp2 ref={fog} attach="fog" args={["#0c1119", 0.1]} />;
}

export function ProductStudio({ lowPower }: { lowPower: boolean }) {
  return (
    <>
      <color attach="background" args={["#0c1119"]} />
      <Atmosphere />

      <CinematicCamera />
      <LightingSystem />

      <group position={[0, 0.04, 0]} scale={0.7}>
        <SneakerModel />
        <TechLabels />
      </group>

      {/* reflective studio floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <planeGeometry args={[70, 70]} />
        {lowPower ? (
          <meshStandardMaterial color="#12161f" roughness={0.35} metalness={0.6} />
        ) : (
          <MeshReflectorMaterial
            resolution={512}
            mixBlur={1.1}
            mixStrength={22}
            blur={[320, 90]}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.3}
            mirror={0.55}
            color="#141924"
            metalness={0.65}
            roughness={0.72}
          />
        )}
      </mesh>

      <ContactShadows
        position={[0, FLOOR_Y + 0.005, 0]}
        opacity={0.7}
        scale={11}
        blur={2.4}
        far={5}
        resolution={lowPower ? 256 : 512}
        color="#000000"
      />

      <LightStrips />
      <ParticleSystem count={lowPower ? 180 : 520} />
    </>
  );
}
