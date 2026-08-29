import { Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { band, experienceState, smoothstep } from "../state/experienceState";

export function LightingSystem() {
  const key = useRef<THREE.DirectionalLight>(null!);
  const rim = useRef<THREE.SpotLight>(null!);
  const fill = useRef<THREE.PointLight>(null!);
  const amb = useRef<THREE.AmbientLight>(null!);
  const inspect = useRef<THREE.SpotLight>(null!);

  useFrame((_, delta) => {
    const p = experienceState.progress;
    const t = performance.now() / 1000;
    // reveal ramp: dark -> fully lit product
    const reveal = smoothstep(0.005, 0.11, p);
    const base = 0.12 + reveal * 0.88;

    amb.current.intensity = 0.18 + base * 0.42;
    key.current.intensity = 0.5 + base * 3.0;
    rim.current.intensity = 2 + base * 22;
    fill.current.intensity = 0.4 + base * 5;

    // key light orbits slightly so different facets catch light while rotating
    const orbit = smoothstep(0.12, 0.4, p) * Math.PI * 2;
    key.current.position.set(Math.sin(orbit + 0.9) * 5, 6.5, Math.cos(orbit + 0.9) * 5);

    // focused inspection light during technology + materials stages
    const focus = band(p, 0.4, 0.56, 0.03) + band(p, 0.7, 0.82, 0.03);
    inspect.current.intensity = focus * 30;
    inspect.current.position.set(1.6 + Math.sin(t * 0.4) * 0.6, 3.2, 2.4);

    void delta;
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.3} color="#9fb4d8" />
      <hemisphereLight args={["#8fa8d8", "#0c1018", 0.55]} />

      <directionalLight
        ref={key}
        position={[5, 6.5, 5]}
        intensity={3}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0006}
      />

      {/* rim / edge light */}
      <spotLight
        ref={rim}
        position={[-4.5, 3.2, -4.5]}
        angle={0.8}
        penumbra={1}
        color="#7aa2ff"
        intensity={18}
      />

      {/* cool violet fill */}
      <pointLight ref={fill} position={[3.2, 0.8, -3]} color="#a48cff" intensity={4} distance={16} />

      {/* soft frontal fill so the product is never hard to read */}
      <pointLight position={[0.5, 2.2, 4.5]} color="#dce7ff" intensity={6} distance={18} />

      <spotLight ref={inspect} angle={0.5} penumbra={0.9} color="#ffffff" intensity={0} distance={14} />

      <Environment resolution={128}>
        <Lightformer intensity={2.2} color="#ffffff" position={[0, 5, 1]} scale={[9, 5, 1]} />
        <Lightformer
          intensity={1.4}
          color="#6f9cff"
          position={[-5, 1.5, -1]}
          rotation-y={Math.PI / 2}
          scale={[16, 2, 1]}
        />
        <Lightformer
          intensity={1.1}
          color="#b9a4ff"
          position={[5, 1.5, -1]}
          rotation-y={-Math.PI / 2}
          scale={[16, 2, 1]}
        />
        <Lightformer intensity={0.8} color="#ffffff" position={[0, 1, 6]} scale={[10, 4, 1]} />
      </Environment>
    </>
  );
}
