"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { wrapRoadZ, type TrafficSpec } from "@/lib/scroll/city-actors";
import { cityScrollStore } from "@/lib/scroll/city-scroll-store";

function Wheel({ x, z, r = 0.18 }: { x: number; z: number; r?: number }) {
  return (
    <mesh position={[x, r, z]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[r, r, 0.12, 12]} />
      <meshStandardMaterial color="#0f172a" roughness={0.8} />
    </mesh>
  );
}

function CarBody({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.95, 0.35, 1.8]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.62, -0.05]}>
        <boxGeometry args={[0.82, 0.28, 1]} />
        <meshStandardMaterial color="#1e293b" metalness={0.2} roughness={0.2} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.28, 0.92]}>
        <boxGeometry args={[0.7, 0.12, 0.08]} />
        <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 0.28, -0.92]}>
        <boxGeometry args={[0.55, 0.1, 0.08]} />
        <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.9} />
      </mesh>
      <Wheel x={-0.38} z={0.55} />
      <Wheel x={0.38} z={0.55} />
      <Wheel x={-0.38} z={-0.55} />
      <Wheel x={0.38} z={-0.55} />
    </group>
  );
}

function AutoBody({ color, accent = "#fbbf24" }: { color: string; accent?: string }) {
  return (
    <group>
      <mesh position={[0, 0.32, 0.15]}>
        <boxGeometry args={[0.85, 0.3, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.72, -0.05]}>
        <boxGeometry args={[0.95, 0.55, 1.05]} />
        <meshStandardMaterial color={accent} metalness={0.2} roughness={0.5} emissive={accent} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0.28, 0.75]}>
        <boxGeometry args={[0.5, 0.1, 0.08]} />
        <meshStandardMaterial color="#fef08a" emissive="#fbbf24" emissiveIntensity={1.1} />
      </mesh>
      <Wheel x={-0.42} z={0.45} r={0.16} />
      <Wheel x={0.42} z={0.45} r={0.16} />
      <Wheel x={0} z={-0.55} r={0.16} />
    </group>
  );
}

function BusBody({ color, accent = "#f97316" }: { color: string; accent?: string }) {
  return (
    <group>
      <mesh position={[0, 0.75, 0]}>
        <boxGeometry args={[1.05, 1.1, 2.8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 0]}>
        <boxGeometry args={[1.08, 0.12, 2.85]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.35} />
      </mesh>
      {[-0.9, -0.3, 0.3, 0.9].map((z) => (
        <mesh key={z} position={[0.52, 0.85, z]}>
          <planeGeometry args={[0.02, 0.5]} />
          <meshStandardMaterial color="#bae6fd" emissive="#7dd3fc" emissiveIntensity={0.25} transparent opacity={0.7} />
        </mesh>
      ))}
      <Wheel x={-0.45} z={0.95} r={0.22} />
      <Wheel x={0.45} z={0.95} r={0.22} />
      <Wheel x={-0.45} z={-0.95} r={0.22} />
      <Wheel x={0.45} z={-0.95} r={0.22} />
    </group>
  );
}

function BikeBody({ color }: { color: string }) {
  return (
    <group>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[0.15, 0.35, 0.8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.15} />
      </mesh>
      <Wheel x={0} z={0.45} r={0.22} />
      <Wheel x={0} z={-0.45} r={0.22} />
    </group>
  );
}

function TrafficActor({ spec }: { spec: TrafficSpec }) {
  const group = useRef<Group>(null);
  const zRef = useRef(spec.startZ);

  useFrame((state, delta) => {
    if (!group.current) return;
    const scroll = cityScrollStore.global;
    const activity = 0.55 + scroll * 0.9;
    zRef.current += spec.direction * spec.speed * delta * activity;
    zRef.current = wrapRoadZ(zRef.current);

    group.current.position.set(spec.laneX, 0, zRef.current);
    group.current.rotation.y = spec.direction === -1 ? Math.PI : 0;
    group.current.scale.setScalar(1.65);

    const bounce = Math.sin(state.clock.elapsedTime * 12 + spec.startZ) * 0.015;
    group.current.position.y = bounce;
  });

  const body =
    spec.kind === "car" ? (
      <CarBody color={spec.color} />
    ) : spec.kind === "auto" ? (
      <AutoBody color={spec.color} accent={spec.accent} />
    ) : spec.kind === "bus" ? (
      <BusBody color={spec.color} accent={spec.accent} />
    ) : (
      <BikeBody color={spec.color} />
    );

  return <group ref={group}>{body}</group>;
}

export function CityTraffic({ specs }: { specs: TrafficSpec[] }) {
  return (
    <group>
      {specs.map((spec) => (
        <TrafficActor key={spec.id} spec={spec} />
      ))}
    </group>
  );
}
