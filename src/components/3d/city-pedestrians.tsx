"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { wrapRoadZ, type PedestrianSpec } from "@/lib/scroll/city-actors";
import { cityScrollStore } from "@/lib/scroll/city-scroll-store";

function PedestrianActor({ spec }: { spec: PedestrianSpec }) {
  const group = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);
  const zRef = useRef(spec.startZ);

  useFrame((state, delta) => {
    if (!group.current) return;
    const scroll = cityScrollStore.global;
    const activity = 0.55 + scroll * 0.75;
    zRef.current += spec.direction * spec.speed * delta * activity;
    zRef.current = wrapRoadZ(zRef.current);

    const x = spec.side * 4.15 + Math.sin(state.clock.elapsedTime * 0.8 + spec.startZ) * 0.08;
    const bob = Math.abs(Math.sin(state.clock.elapsedTime * 6 + spec.startZ)) * 0.06;
    group.current.position.set(x, bob, zRef.current);
    group.current.rotation.y = spec.direction === -1 ? Math.PI : 0;
    group.current.scale.setScalar(1.35);

    const stride = Math.sin(state.clock.elapsedTime * 8 + spec.startZ) * 0.45;
    if (leftLeg.current) leftLeg.current.rotation.x = stride;
    if (rightLeg.current) rightLeg.current.rotation.x = -stride;
  });

  return (
    <group ref={group}>
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#f5d0a9" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <boxGeometry args={[0.22, 0.35, 0.14]} />
        <meshStandardMaterial color={spec.shirt} roughness={0.8} />
      </mesh>
      <group ref={leftLeg} position={[-0.07, 0.35, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.1, 0.38, 0.12]} />
          <meshStandardMaterial color={spec.pants} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.07, 0.35, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.1, 0.38, 0.12]} />
          <meshStandardMaterial color={spec.pants} />
        </mesh>
      </group>
    </group>
  );
}

export function CityPedestrians({ specs }: { specs: PedestrianSpec[] }) {
  return (
    <group>
      {specs.map((spec) => (
        <PedestrianActor key={spec.id} spec={spec} />
      ))}
    </group>
  );
}
