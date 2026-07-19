"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cityScrollStore } from "@/lib/scroll/city-scroll-store";
import type { BuildingSpec } from "@/lib/scroll/camera-path";

function aerialStrength() {
  return 1 - Math.min(1, cityScrollStore.global / 0.32);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function AerialSky() {
  const sun = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const aerial = aerialStrength();
    if (sun.current) {
      sun.current.visible = aerial > 0.08;
      sun.current.position.set(
        14 + Math.sin(state.clock.elapsedTime * 0.08) * 1.5,
        26,
        -18
      );
    }
    if (glow.current) {
      glow.current.visible = aerial > 0.08;
      glow.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.06);
    }
  });

  return (
    <group>
      <mesh ref={glow} position={[14, 26, -18]}>
        <sphereGeometry args={[2.8, 24, 24]} />
        <meshBasicMaterial color="#fdba74" transparent opacity={0.12} depthWrite={false} />
      </mesh>
      <mesh ref={sun} position={[14, 26, -18]}>
        <sphereGeometry args={[1.2, 24, 24]} />
        <meshBasicMaterial color="#fde68a" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -24]}>
        <ringGeometry args={[18, 28, 64]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.06} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function CentralLandmark() {
  const group = useRef<THREE.Group>(null);
  const beacon = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const aerial = aerialStrength();
    if (group.current) {
      group.current.visible = aerial > 0.05;
      group.current.scale.setScalar(0.85 + aerial * 0.15);
    }
    if (beacon.current) {
      const mat = beacon.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.45 + Math.sin(state.clock.elapsedTime * 2.2) * 0.25;
    }
  });

  return (
    <group ref={group} position={[0, 0, -10]}>
      <mesh position={[0, 7, 0]}>
        <boxGeometry args={[2.2, 14, 2.2]} />
        <meshStandardMaterial color="#0f172a" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0, 13.8, 0]}>
        <boxGeometry args={[1.6, 1.2, 1.6]} />
        <meshStandardMaterial color="#134e4a" emissive="#0f766e" emissiveIntensity={0.35} />
      </mesh>
      {[-3.5, -1.2, 1.2, 3.5].map((y) => (
        <mesh key={y} position={[1.12, y, 0]}>
          <boxGeometry args={[0.08, 0.7, 1.8]} />
          <meshStandardMaterial color="#5eead4" emissive="#14b8a6" emissiveIntensity={0.55} transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh ref={beacon} position={[0, 15.2, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#99f6e4" emissive="#5eead4" emissiveIntensity={0.6} />
      </mesh>
      <pointLight position={[0, 14, 0]} intensity={1.4} color="#5eead4" distance={22} />
    </group>
  );
}

export function AerialRoadNetwork() {
  const roundabout = useRef<THREE.Mesh>(null);
  const crossRefs = useRef<THREE.MeshStandardMaterial[]>([]);

  useFrame((state) => {
    const aerial = aerialStrength();
    if (roundabout.current) {
      roundabout.current.visible = aerial > 0.05;
      const mat = roundabout.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.08 + aerial * 0.2;
    }
    crossRefs.current.forEach((mat, i) => {
      mat.emissiveIntensity = 0.06 + aerial * 0.15 + Math.sin(state.clock.elapsedTime * 1.5 + i) * 0.04 * aerial;
    });
  });

  const crossStreets = [-2, -18, -34];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, -24]}>
        <planeGeometry args={[34, 58]} />
        <meshStandardMaterial color="#0b1220" roughness={0.95} />
      </mesh>

      {crossStreets.map((z, i) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, z]}>
          <planeGeometry args={[34, 1.4]} />
          <meshStandardMaterial
            ref={(mat) => {
              if (mat) crossRefs.current[i] = mat;
            }}
            color="#1e293b"
            emissive="#334155"
            emissiveIntensity={0.08}
          />
        </mesh>
      ))}

      <mesh ref={roundabout} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, -2]}>
        <ringGeometry args={[2.2, 3.4, 48]} />
        <meshStandardMaterial color="#1f2937" emissive="#475569" emissiveIntensity={0.1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, -2]}>
        <circleGeometry args={[1.8, 48]} />
        <meshStandardMaterial color="#14532d" emissive="#166534" emissiveIntensity={0.12} roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10, 0.011, -8]}>
        <planeGeometry args={[8, 10]} />
        <meshStandardMaterial color="#166534" emissive="#15803d" emissiveIntensity={0.08} roughness={1} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10, 0.011, -14]}>
        <planeGeometry args={[7, 9]} />
        <meshStandardMaterial color="#166534" emissive="#15803d" emissiveIntensity={0.08} roughness={1} />
      </mesh>
    </group>
  );
}

export function BuildingRooftop({ spec }: { spec: BuildingSpec }) {
  const group = useRef<THREE.Group>(null);
  const hasTank = useMemo(() => Math.abs(spec.x) + Math.abs(spec.z * 0.2) > 3, [spec.x, spec.z]);

  useFrame((state) => {
    if (!group.current) return;
    const aerial = aerialStrength();
    group.current.visible = aerial > 0.06;
    group.current.position.y = spec.height + 0.02;
  });

  return (
    <group ref={group} position={[spec.x, 0, spec.z]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[spec.width * 0.92, spec.depth * 0.92]} />
        <meshStandardMaterial
          color="#334155"
          emissive={spec.emissive}
          emissiveIntensity={0.06}
          roughness={0.85}
        />
      </mesh>
      {hasTank && (
        <mesh position={[spec.width * 0.25, 0.25, 0]}>
          <cylinderGeometry args={[0.22, 0.24, 0.5, 10]} />
          <meshStandardMaterial color="#64748b" metalness={0.5} roughness={0.45} />
        </mesh>
      )}
      {hasTank && (
        <mesh position={[-spec.width * 0.2, 0.12, spec.depth * 0.15]}>
          <boxGeometry args={[0.35, 0.24, 0.35]} />
          <meshStandardMaterial color="#475569" roughness={0.7} />
        </mesh>
      )}
    </group>
  );
}

export function AerialTrafficGlow() {
  const dots = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: (i % 2 === 0 ? -0.6 : 0.7) + (i % 3) * 0.08,
        z: 8 - i * 3.5,
        speed: 4 + (i % 4),
        phase: i * 0.7,
      })),
    []
  );

  return (
    <group>
      {dots.map((dot, i) => (
        <AerialTrafficDot key={i} {...dot} index={i} />
      ))}
    </group>
  );
}

function AerialTrafficDot({
  x,
  z,
  speed,
  phase,
  index,
}: {
  x: number;
  z: number;
  speed: number;
  phase: number;
  index: number;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const zRef = useRef(z);

  useFrame((state, delta) => {
    if (!mesh.current) return;
    const aerial = aerialStrength();
    mesh.current.visible = aerial > 0.1;
    zRef.current -= speed * delta * (0.6 + aerial * 0.5);
    if (zRef.current < -50) zRef.current = 12;

    mesh.current.position.set(x, 0.08, zRef.current);
    const mat = mesh.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.7 + Math.sin(state.clock.elapsedTime * 8 + phase) * 0.3;
    mat.opacity = 0.55 + aerial * 0.35;
  });

  const color = index % 3 === 0 ? "#fbbf24" : index % 3 === 1 ? "#ef4444" : "#5eead4";

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.09, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.7} transparent opacity={0.7} />
    </mesh>
  );
}

export function AerialBirdFlocks() {
  const flockA = useRef<THREE.Group>(null);
  const flockB = useRef<THREE.Group>(null);

  useFrame((state) => {
    const aerial = aerialStrength();
    const t = state.clock.elapsedTime;

    if (flockA.current) {
      flockA.current.visible = aerial > 0.1;
      flockA.current.position.set(Math.sin(t * 0.35) * 10, 20 + Math.sin(t * 0.5) * 1.5, -4 + Math.cos(t * 0.25) * 6);
      flockA.current.rotation.y = t * 0.15;
    }
    if (flockB.current) {
      flockB.current.visible = aerial > 0.1;
      flockB.current.position.set(-8 + Math.cos(t * 0.28) * 8, 24, -16 + Math.sin(t * 0.22) * 5);
      flockB.current.rotation.y = -t * 0.12;
    }
  });

  const birdShape = (i: number) => (
    <mesh key={i} position={[i * 0.7 - 1.4, Math.sin(i * 1.2) * 0.2, i * 0.25]} rotation={[0, 0, Math.sin(i) * 0.2]}>
      <boxGeometry args={[0.45, 0.035, 0.14]} />
      <meshStandardMaterial color="#e2e8f0" emissive="#94a3b8" emissiveIntensity={0.15} />
    </mesh>
  );

  return (
    <>
      <group ref={flockA}>{Array.from({ length: 6 }).map((_, i) => birdShape(i))}</group>
      <group ref={flockB}>{Array.from({ length: 4 }).map((_, i) => birdShape(i))}</group>
    </>
  );
}

export function getAerialSkyColors(progress: number) {
  const aerial = 1 - Math.min(1, progress / 0.32);
  return {
    aerial,
    sky: new THREE.Color().lerpColors(new THREE.Color("#1d4ed8"), new THREE.Color("#0c4a6e"), 1 - aerial * 0.5),
    fog: new THREE.Color().lerpColors(new THREE.Color("#3b82f6"), new THREE.Color("#1e3a5f"), 1 - aerial * 0.4),
    sunIntensity: lerp(0.95, 0.55, 1 - aerial),
    ambientIntensity: lerp(0.62, 0.45, 1 - aerial),
  };
}
