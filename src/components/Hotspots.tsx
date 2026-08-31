import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { HOTSPOTS, type Hotspot } from "../data/product";
import { experienceState, smoothstep } from "../state/experienceState";
import { readUi, uiActions, useUi } from "../state/uiStore";

/** Visible window for the inspection markers (act 03). */
const visibility = (p: number) => smoothstep(0.29, 0.33, p) * (1 - smoothstep(0.5, 0.545, p));

function Marker({ spot }: { spot: Hotspot }) {
  const group = useRef<THREE.Group>(null!);
  const el = useRef<HTMLButtonElement>(null);
  const active = useUi((s) => s.hotspot === spot.id);

  useFrame(() => {
    const o = visibility(experienceState.progress);
    group.current.visible = o > 0.02;
    if (el.current) {
      el.current.style.opacity = String(o);
      el.current.style.transform = `scale(${0.8 + o * 0.2})`;
    }
    if (o <= 0.02 && readUi().hotspot === spot.id) uiActions.setHotspot(null);
  });

  return (
    <group ref={group} position={spot.position}>
      <Html center distanceFactor={2.4} zIndexRange={[20, 0]}>
        <button
          ref={el}
          type="button"
          className={`hotspot${active ? " hotspot--on" : ""}`}
          aria-label={`${spot.label} details`}
          onPointerDown={(e) => {
            e.stopPropagation();
            uiActions.setHotspot(active ? null : spot.id);
          }}
        >
          <span className="hotspot__dot" />
          <span className="hotspot__label">
            <b>{spot.index}</b> {spot.label}
          </span>
        </button>
      </Html>
    </group>
  );
}

export function Hotspots() {
  return (
    <>
      {HOTSPOTS.map((h) => (
        <Marker key={h.id} spot={h} />
      ))}
    </>
  );
}
