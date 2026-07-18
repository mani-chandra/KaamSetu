"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";

function AuthOrbs() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[8, 8, 8]} intensity={1} color="#5EEAD4" />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[1.2, 48, 48]} position={[-1, 0.5, 0]}>
          <MeshDistortMaterial color="#14B8A6" distort={0.4} speed={2} metalness={0.7} roughness={0.2} />
        </Sphere>
      </Float>
      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <Sphere args={[0.7, 32, 32]} position={[1.5, -0.8, -1]}>
          <MeshDistortMaterial color="#0F766E" distort={0.3} speed={1.5} metalness={0.6} />
        </Sphere>
      </Float>
      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.2}>
        <Sphere args={[0.4, 24, 24]} position={[0.5, 1.5, -2]}>
          <MeshDistortMaterial color="#5EEAD4" distort={0.25} speed={3} emissive="#5EEAD4" emissiveIntensity={0.2} />
        </Sphere>
      </Float>
    </>
  );
}

export function AuthScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 opacity-25 grid-3d-bg" />
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }} gl={{ alpha: true }} style={{ background: "transparent" }}>
          <AuthOrbs />
        </Canvas>
      </Suspense>
      <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-brand-dark/20" />
    </div>
  );
}
