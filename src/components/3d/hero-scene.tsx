"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Torus } from "@react-three/drei";
import type { Mesh } from "three";

function FloatingOrb({
  position,
  color,
  scale = 1,
  speed = 2,
}: {
  position: [number, number, number];
  color: string;
  scale?: number;
  speed?: number;
}) {
  const ref = useRef<Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.15;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1.4}>
      <Sphere ref={ref} args={[1, 48, 48]} position={position} scale={scale}>
        <MeshDistortMaterial
          color={color}
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.9}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </Sphere>
    </Float>
  );
}

function OrbitRing() {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.z = state.clock.elapsedTime * 0.08;
  });
  return (
    <Torus ref={ref} args={[4, 0.02, 8, 64]} rotation={[Math.PI / 2.5, 0, 0]}>
      <meshStandardMaterial color="#5EEAD4" emissive="#5EEAD4" emissiveIntensity={0.3} transparent opacity={0.4} />
    </Torus>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[10, 10, 10]} intensity={1.4} color="#5EEAD4" />
      <pointLight position={[-10, -5, 5]} intensity={0.7} color="#0F766E" />
      <pointLight position={[0, -8, 2]} intensity={0.4} color="#2DD4BF" />
      <OrbitRing />
      <FloatingOrb position={[-3.5, 0.5, -1]} color="#14B8A6" scale={1.4} />
      <FloatingOrb position={[3.8, -0.6, -2]} color="#0F766E" scale={1.1} speed={1.5} />
      <FloatingOrb position={[0, 2.2, -3]} color="#5EEAD4" scale={0.6} speed={2.5} />
      <FloatingOrb position={[-1.8, -2, 0.5]} color="#2DD4BF" scale={0.45} speed={3} />
      <FloatingOrb position={[2, 1.5, -1]} color="#99F6E4" scale={0.35} speed={2.8} />
    </>
  );
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-35 grid-3d-bg animate-grid-drift pointer-events-none" />
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 9], fov: 45 }}
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <Scene />
        </Canvas>
      </Suspense>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/15 to-background pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(173_80%_40%/0.08),transparent_70%)] pointer-events-none" />
    </div>
  );
}
