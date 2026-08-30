import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { band, experienceState } from "../state/experienceState";

type LabelDef = {
  text: string;
  meta: string;
  position: [number, number, number];
  start: number;
  end: number;
};

const LABELS: LabelDef[] = [
  { text: "ADAPTIVE UPPER", meta: "01", position: [-0.1, 1.5, 0.6], start: 0.4, end: 0.444 },
  { text: "ENERGY FOAM", meta: "02", position: [1.5, 0.45, 0.7], start: 0.442, end: 0.484 },
  { text: "AEROFLOW SOLE", meta: "03", position: [-1.5, -0.1, 0.7], start: 0.482, end: 0.522 },
  { text: "FLEX CORE", meta: "04", position: [-2.0, 1.0, 0.5], start: 0.52, end: 0.558 },
  { text: "LIGHTWEIGHT", meta: "—", position: [0.2, 2.4, 0.4], start: 0.705, end: 0.748 },
  { text: "BREATHABLE", meta: "—", position: [1.7, 1.2, 0.4], start: 0.745, end: 0.788 },
  { text: "RESPONSIVE", meta: "—", position: [-1.9, -0.5, 0.4], start: 0.785, end: 0.822 },
];

function Label({ def }: { def: LabelDef }) {
  const el = useRef<HTMLDivElement>(null);
  const group = useRef<THREE.Group>(null!);

  useFrame(() => {
    const o = band(experienceState.progress, def.start, def.end, 0.014);
    if (el.current) {
      el.current.style.opacity = String(o);
      el.current.style.transform = `translateY(${(1 - o) * 10}px)`;
    }
    group.current.visible = o > 0.01;
  });

  return (
    <group ref={group} position={def.position}>
      <Html center distanceFactor={2.6} zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
        <div ref={el} className="tech-label">
          <span className="tech-label__meta">{def.meta}</span>
          <span className="tech-label__line" />
          <span className="tech-label__text">{def.text}</span>
        </div>
      </Html>
    </group>
  );
}

export function TechLabels() {
  return (
    <>
      {LABELS.map((l) => (
        <Label key={l.text} def={l} />
      ))}
    </>
  );
}
