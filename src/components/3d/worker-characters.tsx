"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, RoundedBox, Sphere, Cylinder } from "@react-three/drei";
import type { Group } from "three";
import { useHomeScrollRef } from "@/lib/scroll/home-scroll-context";

type WorkerConfig = {
  position: [number, number, number];
  bodyColor: string;
  hatColor: string;
  toolColor: string;
  scale?: number;
  variant: "plumber" | "electrician" | "cleaner" | "chef" | "tutor";
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function WorkerCharacter({ config, scrollDriven }: { config: WorkerConfig; scrollDriven?: boolean }) {
  const group = useRef<Group>(null);
  const scrollRef = useHomeScrollRef();
  const { position, bodyColor, hatColor, toolColor, scale = 1, variant } = config;

  useFrame((state) => {
    if (!group.current) return;
    const progress = scrollDriven && scrollRef ? scrollRef.current.workers : 0;
    const scrollProgress = progress * 8 - 4;
    const focus = scrollDriven
      ? Math.max(0, 1 - Math.abs(scrollProgress - (position[0] + 4) / 8) * 1.5)
      : 0;

    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.15 + focus * 0.25;
    group.current.position.y = position[1] + focus * 0.15;
    group.current.scale.setScalar(scale * (1 + focus * 0.12));
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
      <group ref={group} position={position} scale={scale}>
        <Cylinder args={[0.32, 0.36, 0.12, 16]} position={[0, 1.55, 0]}>
          <meshStandardMaterial color={hatColor} metalness={0.3} roughness={0.4} />
        </Cylinder>
        <Sphere args={[0.28, 24, 24]} position={[0, 1.2, 0]}>
          <meshStandardMaterial color="#F5D0A9" roughness={0.6} />
        </Sphere>
        <RoundedBox args={[0.55, 0.75, 0.35]} radius={0.08} position={[0, 0.55, 0]}>
          <meshStandardMaterial color={bodyColor} metalness={0.2} roughness={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.18, 0.5, 0.2]} radius={0.04} position={[-0.14, -0.05, 0]}>
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[0.18, 0.5, 0.2]} radius={0.04} position={[0.14, -0.05, 0]}>
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </RoundedBox>
        {variant === "plumber" && (
          <group position={[0.45, 0.6, 0]} rotation={[0, 0, -0.5]}>
            <Cylinder args={[0.04, 0.04, 0.7, 8]} rotation={[0, 0, Math.PI / 2]}>
              <meshStandardMaterial color={toolColor} metalness={0.8} roughness={0.2} />
            </Cylinder>
          </group>
        )}
        {variant === "electrician" && (
          <RoundedBox args={[0.08, 0.5, 0.08]} radius={0.02} position={[0.42, 0.55, 0]} rotation={[0, 0, -0.3]}>
            <meshStandardMaterial color={toolColor} metalness={0.6} />
          </RoundedBox>
        )}
        {variant === "cleaner" && (
          <Cylinder args={[0.15, 0.2, 0.05, 12]} position={[0.4, 0.2, 0]}>
            <meshStandardMaterial color={toolColor} roughness={0.8} />
          </Cylinder>
        )}
        {variant === "chef" && (
          <group position={[0, 1.72, 0]}>
            <Cylinder args={[0.22, 0.28, 0.25, 16]}>
              <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
            </Cylinder>
          </group>
        )}
        {variant === "tutor" && (
          <RoundedBox args={[0.35, 0.25, 0.05]} radius={0.02} position={[0.38, 0.65, 0]} rotation={[0, -0.3, 0]}>
            <meshStandardMaterial color={toolColor} roughness={0.6} />
          </RoundedBox>
        )}
      </group>
    </Float>
  );
}

const WORKERS: WorkerConfig[] = [
  { position: [-4, -0.5, 0], bodyColor: "#0F766E", hatColor: "#FBBF24", toolColor: "#94A3B8", variant: "plumber" },
  { position: [-2, -0.3, -0.5], bodyColor: "#1D4ED8", hatColor: "#FCD34D", toolColor: "#F59E0B", variant: "electrician", scale: 0.95 },
  { position: [0, -0.4, 0], bodyColor: "#14B8A6", hatColor: "#FFFFFF", toolColor: "#64748B", variant: "cleaner" },
  { position: [2, -0.35, -0.3], bodyColor: "#DC2626", hatColor: "#FFFFFF", toolColor: "#78350F", variant: "chef", scale: 1.05 },
  { position: [4, -0.45, 0], bodyColor: "#7C3AED", hatColor: "#E2E8F0", toolColor: "#F8FAFC", variant: "tutor", scale: 0.9 },
];

function WorkersCamera({ scrollDriven }: { scrollDriven?: boolean }) {
  const scrollRef = useHomeScrollRef();
  const { camera } = useThree();
  const current = useRef({ x: 0, y: 1.2, z: 8 });

  useFrame(() => {
    if (!scrollDriven || !scrollRef) return;
    const progress = scrollRef.current.workers;
    const targetX = lerp(0, 2.5, progress);
    const targetY = lerp(1.2, 1.6, progress);
    const targetZ = lerp(8, 6.5, progress);

    current.current.x = lerp(current.current.x, targetX, 0.08);
    current.current.y = lerp(current.current.y, targetY, 0.08);
    current.current.z = lerp(current.current.z, targetZ, 0.08);

    camera.position.set(current.current.x, current.current.y, current.current.z);
    camera.lookAt(lerp(0, 1.5, progress), 0.5, 0);
  });

  return null;
}

function WorkersScene({ scrollDriven }: { scrollDriven?: boolean }) {
  return (
    <>
      {scrollDriven && <WorkersCamera scrollDriven />}
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 8, 5]} intensity={1.2} color="#5EEAD4" />
      <pointLight position={[-5, 3, 3]} intensity={0.5} color="#0F766E" />
      {WORKERS.map((worker, i) => (
        <WorkerCharacter key={i} config={worker} scrollDriven={scrollDriven} />
      ))}
    </>
  );
}

export function WorkerCharacters({ scrollDriven = false }: { scrollDriven?: boolean }) {
  return (
    <div className="relative h-[320px] md:h-[380px] w-full overflow-hidden rounded-2xl glass-panel preserve-3d">
      <div className="absolute inset-0 opacity-20 grid-3d-bg pointer-events-none" />
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: scrollDriven ? [0, 1.2, 8] : [0, 1.2, 8], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <WorkersScene scrollDriven={scrollDriven} />
        </Canvas>
      </Suspense>
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
