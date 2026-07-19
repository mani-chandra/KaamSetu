"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { cityScrollStore } from "@/lib/scroll/city-scroll-store";
import { generateCityBlocks, sampleCameraPath, type BuildingSpec } from "@/lib/scroll/camera-path";
import { generatePedestrians, generateStreetShops, generateTraffic, type ShopSpec } from "@/lib/scroll/city-actors";
import { CityTraffic } from "@/components/3d/city-traffic";
import { CityPedestrians } from "@/components/3d/city-pedestrians";
import {
  AerialBirdFlocks,
  AerialRoadNetwork,
  AerialSky,
  AerialTrafficGlow,
  BuildingRooftop,
  CentralLandmark,
  getAerialSkyColors,
} from "@/components/3d/city-aerial";
import type { Group, PointLight } from "three";
import * as THREE from "three";

function useScrollProgress() {
  return () => cityScrollStore.global;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function hashWindow(i: number, x: number) {
  return Math.abs(Math.sin(i * 12.9898 + x * 78.233) * 43758.5453) % 1;
}

function Building({ spec }: { spec: BuildingSpec }) {
  const group = useRef<Group>(null);
  const getProgress = useScrollProgress();

  useFrame((state) => {
    if (!group.current) return;
    const scrollProgress = getProgress();
    const streetReveal = Math.max(0, (scrollProgress - 0.45) / 0.55);
    const aerialFade = 1 - Math.min(1, scrollProgress / 0.25);
    const pulse = 0.85 + Math.sin(state.clock.elapsedTime * 2 + spec.x) * 0.15;

    group.current.position.y = spec.height / 2;
    group.current.scale.y = 1 + aerialFade * 0.04 * pulse;

    const body = group.current.children[0] as THREE.Mesh;
    const mat = body.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.08 + streetReveal * 0.22;
  });

  return (
    <group ref={group} position={[spec.x, 0, spec.z]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[spec.width, spec.height, spec.depth]} />
        <meshStandardMaterial
          color={spec.color}
          roughness={0.85}
          metalness={0.15}
          emissive={spec.emissive}
          emissiveIntensity={0.08}
        />
      </mesh>
      {Array.from({ length: Math.min(spec.windows, 12) }).map((_, i) => {
        const floor = Math.floor(i / 3);
        const col = i % 3;
        const lit = hashWindow(i, spec.x) > 0.35;
        return (
          <mesh
            key={i}
            position={[
              (col - 1) * (spec.width * 0.22),
              -spec.height / 2 + 1 + floor * 1.4,
              spec.depth / 2 + 0.02,
            ]}
          >
            <planeGeometry args={[0.35, 0.45]} />
            <meshStandardMaterial
              color={lit ? "#fef08a" : "#334155"}
              emissive={lit ? "#fbbf24" : "#000000"}
              emissiveIntensity={lit ? 0.55 : 0}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function Street() {
  const centerLineMat = useRef<THREE.MeshStandardMaterial>(null);
  const getProgress = useScrollProgress();

  useFrame((state) => {
    if (!centerLineMat.current) return;
    const scrollProgress = getProgress();
    const streetGlow = Math.max(0, (scrollProgress - 0.4) / 0.6);
    centerLineMat.current.emissiveIntensity = 0.15 + streetGlow * 0.55;
    centerLineMat.current.opacity = 0.55 + Math.sin(state.clock.elapsedTime * 3) * 0.08 * streetGlow;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, -24]}>
        <planeGeometry args={[0.12, 56]} />
        <meshStandardMaterial
          ref={centerLineMat}
          color="#5eead4"
          emissive="#14b8a6"
          emissiveIntensity={0.15}
          transparent
          opacity={0.7}
        />
      </mesh>
      {[-3.8, 3.8].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.02, -24]}>
          <planeGeometry args={[1.2, 56]} />
          <meshStandardMaterial color="#1f2937" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function StreetShop({ shop, index }: { shop: ShopSpec; index: number }) {
  const group = useRef<Group>(null);
  const signMat = useRef<THREE.MeshStandardMaterial>(null);
  const getProgress = useScrollProgress();

  useFrame((state) => {
    if (!group.current) return;
    const reveal = Math.max(0, (getProgress() - 0.55) / 0.45);
    group.current.visible = reveal > 0.08;
    if (signMat.current) {
      signMat.current.emissiveIntensity = (0.55 + Math.sin(state.clock.elapsedTime * 4 + index) * 0.35) * reveal;
    }
  });

  return (
    <group ref={group} position={[shop.x, 0, shop.z]} visible={false}>
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[2.6, 2.2, 2]} />
        <meshStandardMaterial color={shop.color} emissive={shop.color} emissiveIntensity={0.12} />
      </mesh>
      <mesh position={[0, 2.45, 0.35]}>
        <boxGeometry args={[2.9, 0.14, 1.3]} />
        <meshStandardMaterial color={shop.awning} emissive={shop.awning} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 1.85, 1.05]}>
        <boxGeometry args={[2.2, 0.55, 0.08]} />
        <meshStandardMaterial ref={signMat} color={shop.sign} emissive={shop.sign} emissiveIntensity={0.55} />
      </mesh>
    </group>
  );
}

function StreetLamps() {
  const lampZ = [-14, -22, -30, -38, -46];
  const lightRefs = useRef<(PointLight | null)[]>([]);
  const getProgress = useScrollProgress();

  useFrame((state) => {
    const scrollProgress = getProgress();
    const intensity = Math.max(0, (scrollProgress - 0.35) / 0.65) * 2.4;
    lightRefs.current.forEach((light, i) => {
      if (light) light.intensity = intensity * (0.85 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.15);
    });
  });

  return (
    <>
      {lampZ.map((z, i) => (
        <group key={z} position={[i % 2 === 0 ? -4.2 : 4.2, 0, z]}>
          <mesh position={[0, 3.4, 0]}>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial color="#fef9c3" emissive="#fbbf24" emissiveIntensity={0.9} />
          </mesh>
          <pointLight
            ref={(el) => {
              lightRefs.current[i] = el;
            }}
            position={[0, 3.4, 0]}
            intensity={0}
            color="#fde68a"
            distance={9}
          />
        </group>
      ))}
    </>
  );
}

function CinematicLighting() {
  const ambient = useRef<THREE.AmbientLight>(null);
  const sun = useRef<THREE.DirectionalLight>(null);
  const cityGlow = useRef<THREE.PointLight>(null);
  const { scene } = useThree();
  const getProgress = useScrollProgress();
  const skyDusk = useMemo(() => new THREE.Color("#0f172a"), []);
  const fogDusk = useMemo(() => new THREE.Color("#1c1018"), []);
  const skyTarget = useMemo(() => new THREE.Color(), []);
  const fogTarget = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const p = getProgress();
    const dusk = Math.max(0, (p - 0.2) / 0.8);
    const aerial = getAerialSkyColors(p);

    if (ambient.current) ambient.current.intensity = lerp(aerial.ambientIntensity, 0.18, dusk);
    if (sun.current) {
      sun.current.intensity = lerp(aerial.sunIntensity, 0.25, dusk);
      sun.current.color.setHSL(lerp(0.12, 0.08, dusk), 0.85, lerp(0.72, 0.55, dusk));
    }
    if (cityGlow.current) cityGlow.current.intensity = lerp(0.15 + aerial.aerial * 0.25, 1.1, dusk);

    skyTarget.copy(aerial.sky).lerp(skyDusk, dusk);
    fogTarget.copy(aerial.fog).lerp(fogDusk, dusk);
    if (scene.background instanceof THREE.Color) scene.background.copy(skyTarget);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(fogTarget);
      scene.fog.far = lerp(72, 42, p) - p * 6;
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={0.62} />
      <directionalLight ref={sun} position={[18, 32, -8]} intensity={0.95} color="#fde68a" castShadow />
      <pointLight ref={cityGlow} position={[0, 8, -12]} intensity={0.4} color="#5eead4" distance={50} />
      <hemisphereLight args={["#fdba74", "#0f172a", 0.45]} />
    </>
  );
}

function CityCameraRig() {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3());

  useFrame((state) => {
    const progress = cityScrollStore.global;
    const { position, lookAt, fov } = sampleCameraPath(progress);
    const time = state.clock.elapsedTime;
    const idle = (1 - Math.min(progress * 2.2, 1)) * Math.sin(time * 0.15) * 2;

    camera.position.set(position[0] + idle, position[1], position[2]);
    lookTarget.current.set(lookAt[0], lookAt[1], lookAt[2]);
    camera.lookAt(lookTarget.current);

    if ("fov" in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.fov = fov;
      persp.updateProjectionMatrix();
    }
  });

  return null;
}

function CityScene() {
  const buildings = useMemo(() => generateCityBlocks(), []);
  const traffic = useMemo(() => generateTraffic(), []);
  const pedestrians = useMemo(() => generatePedestrians(), []);
  const shops = useMemo(() => generateStreetShops(), []);

  return (
    <>
      <CityCameraRig />
      <CinematicLighting />
      <color attach="background" args={["#1d4ed8"]} />
      <fog attach="fog" args={["#3b82f6", 22, 72]} />
      <AerialSky />
      <Sparkles count={100} scale={[28, 12, 36]} size={2} speed={0.3} opacity={0.4} color="#fde68a" position={[0, 16, -8]} />
      <AerialRoadNetwork />
      <CentralLandmark />
      <AerialTrafficGlow />
      <AerialBirdFlocks />
      <Street />
      <StreetLamps />
      {shops.map((shop, i) => (
        <StreetShop key={`${shop.x}-${shop.z}`} shop={shop} index={i} />
      ))}
      <CityTraffic specs={traffic} />
      <CityPedestrians specs={pedestrians} />
      {buildings.map((spec, i) => (
        <group key={i}>
          <Building spec={spec} />
          <BuildingRooftop spec={spec} />
        </group>
      ))}
    </>
  );
}

export function CityScrollCanvas() {
  return (
    <div className="absolute inset-0 h-full w-full">
      <Canvas
        frameloop="always"
        shadows
        camera={{ position: [5, 50, 44], fov: 52, near: 0.1, far: 120 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <Suspense fallback={null}>
          <CityScene />
        </Suspense>
      </Canvas>
      {/* Light vignette only — do not cover the whole canvas */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/50 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/20 to-transparent" />
    </div>
  );
}
