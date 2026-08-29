import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { CinematicText } from "./CinematicText";
import { LoadingScreen } from "./LoadingScreen";
import { ProductStudio } from "../scenes/ProductStudio";
import { useScrollProgress } from "../hooks/useScrollProgress";
import { damp, experienceState } from "../state/experienceState";

/** Damps raw scroll into the smoothed progress every frame. */
function ScrollController() {
  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    experienceState.progress = damp(experienceState.progress, experienceState.target, 4.2, dt);
  });
  return null;
}

export function Experience() {
  const [loaded, setLoaded] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useScrollProgress();

  const lowPower = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 900 || window.matchMedia("(pointer: coarse)").matches;
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("drop-root");
    return () => document.documentElement.classList.remove("drop-root");
  }, []);

  return (
    <div ref={wrap} className="drop">
      {/* scroll driver — the whole cinematic runs off this one tall column */}
      <div className="drop__scroll" aria-hidden />

      <div className="drop__stage">
        <Canvas
          shadows
          dpr={lowPower ? [1, 1.5] : [1, 2]}
          gl={{ antialias: true, powerPreference: "high-performance" }}
          camera={{ position: [4.4, 1.1, 6.4], fov: 34, near: 0.1, far: 120 }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.18;
          }}
        >
          <ScrollController />
          <Suspense fallback={null}>
            <ProductStudio lowPower={lowPower} />
          </Suspense>
        </Canvas>
      </div>

      <CinematicText />
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
    </div>
  );
}
