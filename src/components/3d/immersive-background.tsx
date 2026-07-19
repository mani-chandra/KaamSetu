"use client";

import { Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial } from "@react-three/drei";
import { useRef, useMemo } from "react";
import type { Mesh } from "three";

function ParticleField() {
  const particles = useRef<Mesh[]>([]);

  const positions = useMemo<[number, number, number][]>(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 4 + (i % 5) * 1.2;
      return [
        Math.cos(angle) * radius,
        Math.sin(angle * 0.7) * 3,
        -4 - (i % 4) * 1.5,
      ];
    });
  }, []);

  useFrame((state) => {
    particles.current.forEach((p, i) => {
      if (p) {
        p.position.y = Math.sin(state.clock.elapsedTime * 0.3 + i) * 0.5;
        p.rotation.z = state.clock.elapsedTime * 0.1 + i;
      }
    });
  });

  return (
    <>
      {positions.map((pos, i) => (
        <Float key={i} speed={1 + (i % 5) * 0.2} floatIntensity={0.5}>
          <Sphere
            ref={(el) => {
              if (el) particles.current[i] = el;
            }}
            args={[0.04 + (i % 3) * 0.02, 8, 8]}
            position={pos}
          >
            <meshStandardMaterial
              color={i % 2 === 0 ? "#5EEAD4" : "#14B8A6"}
              emissive={i % 2 === 0 ? "#5EEAD4" : "#14B8A6"}
              emissiveIntensity={0.4}
              transparent
              opacity={0.6}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
}

function BackgroundOrbs() {
  return (
    <>
      <Float speed={1.2} rotationIntensity={0.3} floatIntensity={0.6}>
        <Sphere args={[2.5, 32, 32]} position={[-6, 2, -8]}>
          <MeshDistortMaterial color="#0F766E" distort={0.2} speed={1} transparent opacity={0.15} />
        </Sphere>
      </Float>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Sphere args={[2, 32, 32]} position={[7, -1, -6]}>
          <MeshDistortMaterial color="#14B8A6" distort={0.25} speed={1.5} transparent opacity={0.12} />
        </Sphere>
      </Float>
    </>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#5EEAD4" />
      <BackgroundOrbs />
      <ParticleField />
    </>
  );
}

export function ImmersiveBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${className}`}>
      <div className="absolute inset-0 opacity-20 grid-3d-bg animate-grid-drift" />
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 10], fov: 50 }}
          dpr={[1, 1.25]}
          gl={{ alpha: true, antialias: true }}
          style={{ background: "transparent" }}
        >
          <Scene />
        </Canvas>
      </Suspense>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
    </div>
  );
}
