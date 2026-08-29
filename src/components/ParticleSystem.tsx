import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { band, experienceState, smoothstep } from "../state/experienceState";

type Props = { count?: number };

/** Ambient dust + energy particles. One instanced Points cloud for the whole scene. */
export function ParticleSystem({ count = 500 }: Props) {
  const points = useRef<THREE.Points>(null!);
  const mat = useRef<THREE.PointsMaterial>(null!);

  const { geometry, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const s = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 6;
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = Math.random() * 5 - 0.6;
      positions[i * 3 + 2] = Math.sin(a) * r;
      s[i * 3] = Math.random();
      s[i * 3 + 1] = 0.2 + Math.random() * 0.8;
      s[i * 3 + 2] = Math.random() * Math.PI * 2;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { geometry: g, seeds: s };
  }, [count]);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const t = performance.now() / 1000;
    const p = experienceState.progress;

    const pos = geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i) + dt * seeds[i * 3 + 1] * 0.12;
      pos.setY(i, y > 4.6 ? -0.8 : y);
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.25 + seeds[i * 3 + 2]) * dt * 0.05);
    }
    pos.needsUpdate = true;

    const reveal = smoothstep(0.0, 0.12, p);
    const energy = band(p, 0.818, 0.902, 0.02);
    const exploded = band(p, 0.55, 0.82, 0.05);
    mat.current.opacity = 0.12 + reveal * 0.18 + exploded * 0.22 + energy * 0.5;
    mat.current.size = 0.016 + energy * 0.02;
    (mat.current.color as THREE.Color).setStyle(energy > 0.35 ? "#77a6ff" : "#c9d8f5");
    points.current.rotation.y = t * 0.012;
  });

  return (
    <points ref={points} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={mat}
        transparent
        depthWrite={false}
        sizeAttenuation
        size={0.02}
        opacity={0.2}
        color="#c9d8f5"
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
