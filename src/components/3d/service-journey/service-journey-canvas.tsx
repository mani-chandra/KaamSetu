"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Sparkles, Stars } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { cityScrollStore } from "@/lib/scroll/city-scroll-store";
import {
  actEnvelope,
  bikeRideProgress,
  journeyPhase,
  leakFixProgress,
  phaseProgress,
  sampleJourneyCamera,
  TAP_WORLD,
} from "@/lib/scroll/journey-camera";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function damp(current: number, target: number, lambda: number, dt: number) {
  return lerp(current, target, 1 - Math.exp(-lambda * dt));
}

function JourneyCamera() {
  const { camera } = useThree();
  const lookAt = useRef(new THREE.Vector3(0, 3.5, 0));
  const pos = useRef(new THREE.Vector3(0, 12, 18));
  const roll = useRef(0);

  useFrame((state, delta) => {
    const p = cityScrollStore.global;
    const sample = sampleJourneyCamera(p);
    const breathe = Math.sin(state.clock.elapsedTime * 0.35) * 0.05 * (1 - Math.min(p * 1.1, 1));
    const sway = Math.sin(state.clock.elapsedTime * 0.55 + p * 3) * 0.03 * (1 - Math.min(p * 0.8, 1));

    pos.current.x = damp(pos.current.x, sample.position[0] + breathe + sway, 4, delta);
    pos.current.y = damp(pos.current.y, sample.position[1], 4, delta);
    pos.current.z = damp(pos.current.z, sample.position[2], 4, delta);

    lookAt.current.x = damp(lookAt.current.x, sample.lookAt[0], 5, delta);
    lookAt.current.y = damp(lookAt.current.y, sample.lookAt[1], 5, delta);
    lookAt.current.z = damp(lookAt.current.z, sample.lookAt[2], 5, delta);

    roll.current = damp(roll.current, sample.roll ?? 0, 3, delta);

    camera.position.copy(pos.current);
    camera.lookAt(lookAt.current);

    if ("fov" in camera) {
      const persp = camera as THREE.PerspectiveCamera;
      persp.fov = damp(persp.fov, sample.fov, 3, delta);
      persp.rotation.z = roll.current;
      persp.updateProjectionMatrix();
    }
  });

  return null;
}

function JourneyLighting() {
  const key = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const { scene } = useThree();
  const dusk = useMemo(() => new THREE.Color("#2a1810"), []);
  const night = useMemo(() => new THREE.Color("#061018"), []);
  const teal = useMemo(() => new THREE.Color("#0a2e2a"), []);
  const sky = useMemo(() => new THREE.Color(), []);

  useFrame(() => {
    const p = cityScrollStore.global;
    const warmPhase = 1 - Math.min(1, p / 0.55);
    const tealPhase = Math.max(0, (p - 0.45) / 0.55);

    if (key.current) {
      key.current.intensity = lerp(1.25, 0.45, p) + tealPhase * 0.2;
      key.current.color.setHSL(lerp(0.09, 0.5, p), 0.8, lerp(0.68, 0.5, p));
    }
    if (fill.current) fill.current.intensity = lerp(0.25, 1.1, tealPhase);
    if (rim.current) rim.current.intensity = lerp(0.15, 0.55, p) * warmPhase;

    if (p < 0.5) sky.lerpColors(dusk, night, p * 2);
    else sky.lerpColors(night, teal, (p - 0.5) * 2);

    if (scene.background instanceof THREE.Color) scene.background.copy(sky);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.copy(sky);
      scene.fog.near = lerp(10, 6, p);
      scene.fog.far = lerp(42, 30, p);
    }
  });

  return (
    <>
      <ambientLight intensity={0.28} />
      <directionalLight ref={key} position={[10, 16, 8]} intensity={1.25} color="#ffd59a" castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight ref={fill} position={[0, 2.5, 1.5]} intensity={0.3} color="#5eead4" distance={16} />
      <pointLight ref={rim} position={[-6, 4, -4]} intensity={0.2} color="#fb923c" distance={20} />
      <hemisphereLight args={["#fdba74", "#0c0a09", 0.5]} />
    </>
  );
}

function PostFX() {
  const bloomRef = useRef<{ intensity: number } | null>(null);

  useFrame(() => {
    const p = cityScrollStore.global;
    const ph = journeyPhase(p);
    const local = phaseProgress(p, ph);
    const edge = 1 - Math.min(local / 0.08, (1 - local) / 0.08, 1);
    const completion = actEnvelope(p, 4, 0.2);
    const discovery = actEnvelope(p, 1, 0.12);

    if (bloomRef.current) {
      bloomRef.current.intensity = 0.72 + discovery * 0.55 + completion * 0.95 + edge * 0.12;
    }
  });

  return (
    <EffectComposer multisampling={0}>
      <Bloom ref={bloomRef} intensity={0.72} luminanceThreshold={0.22} luminanceSmoothing={0.92} mipmapBlur />
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0008, 0.0008]} radialModulation modulateOffset />
      <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.028} />
      <Vignette eskil offset={0.16} darkness={0.72} />
    </EffectComposer>
  );
}

function HomeBuilding() {
  const windows = useRef<THREE.Group>(null);
  const doorGlow = useRef<THREE.MeshStandardMaterial>(null);
  const problemLight = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const p = cityScrollStore.global;
    const act1 = actEnvelope(p, 0, 0.2);
    const fixed = leakFixProgress(p);
    const flicker = (0.55 + Math.sin(state.clock.elapsedTime * 9) * 0.35 * act1) * (1 - fixed);

    windows.current?.children.forEach((child, i) => {
      const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
      if (i === 2) {
        mat.emissive.setHex(fixed > 0.5 ? 0xfef9c3 : 0xf97316);
        mat.emissiveIntensity = lerp(flicker * 0.65, 0.42, fixed);
      } else {
        mat.emissiveIntensity = (0.5 + Math.sin(state.clock.elapsedTime + i) * 0.08) * 0.65;
      }
    });

    if (doorGlow.current) doorGlow.current.emissiveIntensity = lerp(0.25 + act1 * 0.35, 0.2, fixed);
    if (problemLight.current) problemLight.current.intensity = act1 * 1.8 * (1 - fixed);
  });

  return (
    <group>
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5.5, 5, 4]} />
        <meshStandardMaterial color="#3d2f2a" roughness={0.78} metalness={0.08} />
      </mesh>
      <mesh position={[0, 5.2, 0]}>
        <boxGeometry args={[5.9, 0.3, 4.35]} />
        <meshStandardMaterial color="#57534e" roughness={0.75} />
      </mesh>
      {[-1.6, 0, 1.6].map((x) => (
        <group key={x} position={[x, 3.25, 2.08]}>
          <mesh>
            <boxGeometry args={[1.45, 0.1, 0.85]} />
            <meshStandardMaterial color="#78716c" />
          </mesh>
          <mesh position={[0, -0.58, 0]}>
            <boxGeometry args={[1.38, 1.05, 0.07]} />
            <meshStandardMaterial color="#1e293b" emissive="#fbbf24" emissiveIntensity={0.4} transparent opacity={0.92} />
          </mesh>
        </group>
      ))}
      <group ref={windows}>
        {[
          [-1.5, 3.5], [0, 3.5], [1.5, 3.5],
          [-1.5, 1.5], [0, 1.5], [1.5, 1.5],
        ].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 2.03]}>
            <planeGeometry args={[0.88, 1.05]} />
            <meshStandardMaterial color="#fef9c3" emissive={i === 2 ? "#f97316" : "#fbbf24"} emissiveIntensity={0.55} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 1.05, 2.06]}>
        <boxGeometry args={[1.25, 2.15, 0.12]} />
        <meshStandardMaterial ref={doorGlow} color="#92400e" emissive="#ea580c" emissiveIntensity={0.25} roughness={0.65} />
      </mesh>
      <pointLight ref={problemLight} position={[0, 3.5, 2.5]} intensity={0} color="#f97316" distance={5} />
      {/* Festive string lights */}
      {Array.from({ length: 8 }).map((_, i) => (
        <TwinkleLight key={i} index={i} position={[-2.4 + i * 0.7, 5.05, 2.1]} colorA={i % 2 === 0 ? "#5eead4" : "#fbbf24"} colorB={i % 2 === 0 ? "#14b8a6" : "#f59e0b"} />
      ))}
    </group>
  );
}

function TwinkleLight({
  index,
  position,
  colorA,
  colorB,
}: {
  index: number;
  position: [number, number, number];
  colorA: string;
  colorB: string;
}) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!mat.current) return;
    const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 2.8 + index * 0.9) * 0.45;
    mat.current.emissiveIntensity = pulse;
  });

  return (
    <mesh position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshStandardMaterial ref={mat} color={colorA} emissive={colorB} emissiveIntensity={0.9} />
    </mesh>
  );
}

function LeakDrops() {
  const drops = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      y: 2.4 - i * 0.35,
      speed: 0.9 + i * 0.15,
      phase: i * 0.4,
    }))
  );
  const dropMeshes = useRef<THREE.Mesh[]>([]);

  useFrame((state, delta) => {
    const p = cityScrollStore.global;
    const leakActive = p > 0.08;
    const fixed = leakFixProgress(p);
    const strength = leakActive ? 1 - fixed : 0;
    const visible = strength > 0.05;

    drops.current.forEach((drop, i) => {
      const mesh = dropMeshes.current[i];
      if (!mesh) return;

      mesh.visible = visible;
      if (!visible) return;

      drop.y -= drop.speed * delta;
      if (drop.y < 0.15) drop.y = 2.35 + Math.sin(state.clock.elapsedTime + drop.phase) * 0.05;
      mesh.position.y = drop.y;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = strength * 0.75;
    });
  });

  return (
    <group position={[1.5, 0, 2.12]}>
      {drops.current.map((drop, i) => (
        <mesh
          key={i}
          ref={(node) => {
            if (node) dropMeshes.current[i] = node;
          }}
          position={[0, drop.y, 0]}
          visible={false}
        >
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.6} transparent opacity={0.6} />
        </mesh>
      ))}
      <mesh position={[0, 2.55, 0]}>
        <boxGeometry args={[0.12, 0.04, 0.06]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function ProblemCallout() {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const arrow = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!group.current) return;
    const p = cityScrollStore.global;
    const focus = actEnvelope(p, 0, 0.22) * Math.min(1, (p - 0.05) / 0.08);
    const fixed = leakFixProgress(p);
    const strength = focus * (1 - fixed);
    group.current.visible = strength > 0.04;

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.12;
    if (ring.current) {
      ring.current.scale.setScalar((0.9 + strength * 0.35) * pulse);
      const mat = ring.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + strength * 0.8;
      mat.opacity = strength * 0.7;
    }
    if (arrow.current) {
      arrow.current.position.y = 0.35 + Math.sin(state.clock.elapsedTime * 3) * 0.06;
      const mat = arrow.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + strength * 0.5;
      mat.opacity = strength * 0.85;
    }
    if (glow.current) glow.current.intensity = strength * 2.2;
  });

  return (
    <group ref={group} position={TAP_WORLD} visible={false}>
      <pointLight ref={glow} position={[0, 0.2, 0.3]} color="#38bdf8" intensity={0} distance={4} />
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.22, 0.32, 32]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
      <mesh ref={arrow} position={[0, 0.35, 0.15]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.08, 0.22, 8]} />
        <meshStandardMaterial color="#fb923c" emissive="#f97316" emissiveIntensity={0.6} transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, -0.05, 0.1]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

function NeighborBlock({ x, z, h, windows = 2 }: { x: number; z: number; h: number; windows?: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow>
        <boxGeometry args={[3.5, h, 3]} />
        <meshStandardMaterial color="#1c1917" roughness={0.88} />
      </mesh>
      {Array.from({ length: windows }).map((_, i) => (
        <mesh key={i} position={[(i - 0.5) * 0.9, h * 0.55, 1.52]}>
          <planeGeometry args={[0.5, 0.65]} />
          <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function easeLocal(p: number, start: number, end: number) {
  return Math.max(0, Math.min(1, (p - start) / (end - start)));
}

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

const PRO_ARRIVAL = { x: 1.35, z: 1.15 };

/** Mini map route drawn on the booking phone screen (Act III). */
const PHONE_ROUTE: [number, number][] = [
  [-0.16, -0.18],
  [-0.09, -0.08],
  [-0.02, 0.02],
  [0.06, 0.1],
  [0.13, 0.2],
];

function samplePhoneRoute(t: number): [number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  const segments = PHONE_ROUTE.length - 1;
  const f = clamped * segments;
  const i = Math.min(segments - 1, Math.floor(f));
  const local = f - i;
  const a = PHONE_ROUTE[i];
  const b = PHONE_ROUTE[i + 1];
  return [lerp(a[0], b[0], local), lerp(a[1], b[1], local)];
}

function BookingBeacon() {
  const group = useRef<THREE.Group>(null);
  const screen = useRef<THREE.MeshStandardMaterial>(null);
  const otpBadge = useRef<THREE.Group>(null);
  const otpMat = useRef<THREE.MeshStandardMaterial>(null);
  const otpRing = useRef<THREE.MeshStandardMaterial>(null);
  const proDot = useRef<THREE.Mesh>(null);
  const etaBar = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!group.current) return;
    const p = cityScrollStore.global;
    const env = actEnvelope(p, 2, 0.14);
    const otp = actEnvelope(p, 2, 0.16);
    const ride = bikeRideProgress(p);
    const local = phaseProgress(p, 2);
    group.current.visible = env > 0.04;

    const focus = easeOut(local);
    const bob = Math.sin(state.clock.elapsedTime * 2.2) * 0.06;
    group.current.position.set(
      lerp(2.4, 0.6, focus),
      lerp(4.1, 3.6, focus) + bob,
      lerp(1.0, 2.4, focus)
    );
    group.current.rotation.set(
      lerp(-0.08, -0.28, focus),
      lerp(0.35, 0.05, focus) + Math.sin(state.clock.elapsedTime * 0.8) * 0.04,
      lerp(0.05, 0, focus)
    );
    const scale = env * lerp(1.05, 1.45, focus);
    group.current.scale.setScalar(scale);

    if (screen.current) {
      screen.current.emissiveIntensity = 0.35 + ride * 0.35 + Math.sin(state.clock.elapsedTime * 3) * 0.08;
    }

    const [dx, dy] = samplePhoneRoute(ride);
    if (proDot.current) {
      proDot.current.position.set(dx, dy, 0.07);
      proDot.current.visible = ride > 0.04;
      const mat = proDot.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.7 + Math.sin(state.clock.elapsedTime * 6) * 0.25;
    }
    if (etaBar.current) {
      etaBar.current.scale.x = 0.15 + ride * 0.7;
      const mat = etaBar.current.material as THREE.MeshStandardMaterial;
      mat.opacity = env * 0.85;
    }

    if (otpBadge.current) {
      otpBadge.current.visible = otp > 0.12;
      otpBadge.current.scale.setScalar(otp * (1 + Math.sin(state.clock.elapsedTime * 6) * 0.12));
    }
    if (otpMat.current) {
      otpMat.current.emissiveIntensity = 0.55 + Math.sin(state.clock.elapsedTime * 7) * 0.35;
      otpMat.current.opacity = otp;
    }
    if (otpRing.current) {
      otpRing.current.emissiveIntensity = 0.35 + Math.sin(state.clock.elapsedTime * 5) * 0.25;
      otpRing.current.opacity = otp * 0.5;
    }
  });

  return (
    <group ref={group} visible={false}>
      <mesh>
        <boxGeometry args={[0.58, 1.02, 0.09]} />
        <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.55} />
      </mesh>
      <mesh position={[0, 0.38, 0.05]}>
        <boxGeometry args={[0.5, 0.07, 0.01]} />
        <meshStandardMaterial color="#065f46" emissive="#10b981" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0, 0.04, 0.05]}>
        <planeGeometry args={[0.46, 0.72]} />
        <meshStandardMaterial ref={screen} color="#0c2a28" emissive="#134e4a" emissiveIntensity={0.35} />
      </mesh>
      {PHONE_ROUTE.slice(0, -1).map((a, i) => {
        const b = PHONE_ROUTE[i + 1];
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const angle = Math.atan2(b[1] - a[1], b[0] - a[0]);
        return (
          <mesh key={i} position={[mx, my, 0.055]} rotation={[0, 0, angle]}>
            <boxGeometry args={[len, 0.014, 0.01]} />
            <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.45} transparent opacity={0.75} />
          </mesh>
        );
      })}
      <mesh position={[PHONE_ROUTE[PHONE_ROUTE.length - 1][0], PHONE_ROUTE[PHONE_ROUTE.length - 1][1], 0.06]}>
        <coneGeometry args={[0.025, 0.05, 8]} />
        <meshStandardMaterial color="#5eead4" emissive="#14b8a6" emissiveIntensity={0.65} />
      </mesh>
      <mesh ref={proDot} position={[PHONE_ROUTE[0][0], PHONE_ROUTE[0][1], 0.07]} visible={false}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.7} />
      </mesh>
      <mesh ref={etaBar} position={[-0.22, -0.28, 0.06]}>
        <boxGeometry args={[0.85, 0.04, 0.01]} />
        <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, -0.62, 0]}>
        <ringGeometry args={[0.38, 0.58, 32]} />
        <meshStandardMaterial color="#5eead4" emissive="#2dd4bf" emissiveIntensity={0.35} transparent opacity={0.35} />
      </mesh>
      <group ref={otpBadge} position={[0.34, 0.24, 0.07]} visible={false}>
        <mesh>
          <boxGeometry args={[0.4, 0.13, 0.02]} />
          <meshStandardMaterial ref={otpMat} color="#065f46" emissive="#10b981" emissiveIntensity={0.55} transparent opacity={0} />
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[0.32, 0.07]} />
          <meshBasicMaterial color="#ecfdf5" transparent opacity={0.95} />
        </mesh>
        <mesh position={[0, 0, -0.02]}>
          <ringGeometry args={[0.25, 0.31, 24]} />
          <meshStandardMaterial ref={otpRing} color="#34d399" emissive="#10b981" emissiveIntensity={0.35} transparent opacity={0} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function ConnectionBeam() {
  const beam = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!beam.current) return;
    const p = cityScrollStore.global;
    const strength = actEnvelope(p, 1, 0.18) * (1 - actEnvelope(p, 2, 0.1));
    beam.current.visible = strength > 0.05;
    beam.current.scale.y = strength * 1.2;
    const mat = beam.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
    mat.opacity = strength * 0.45;
  });

  return (
    <mesh ref={beam} position={[0, 6, 0]} visible={false}>
      <cylinderGeometry args={[0.03, 0.12, 8, 12, 1, true]} />
      <meshStandardMaterial color="#5eead4" emissive="#14b8a6" emissiveIntensity={0.4} transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

const TAP_APPROACH = { x: 1.45, z: 1.75 };

function ServiceWorker() {
  const group = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const p = cityScrollStore.global;
    const fixed = leakFixProgress(p);
    const walk = easeLocal(p, 0.64, 0.72);
    const atTap = easeOut(easeLocal(p, 0.72, 0.82));
    group.current.visible = p >= 0.64 && p < 0.86;

    if (walk < 1) {
      const eased = easeOut(walk);
      group.current.position.set(
        lerp(PRO_ARRIVAL.x, TAP_APPROACH.x, eased),
        0,
        lerp(PRO_ARRIVAL.z, TAP_APPROACH.z, eased)
      );
      group.current.rotation.y = lerp(-0.2, 0.55, eased);
    } else {
      group.current.position.set(TAP_APPROACH.x, lerp(0, 0.08, atTap), TAP_APPROACH.z);
      group.current.rotation.y = lerp(0.55, 0.72, atTap);
    }

    const strideScale = walk < 1 ? 1 : lerp(0.4, 0.05, atTap);
    const stride = Math.sin(state.clock.elapsedTime * 8) * 0.5 * strideScale * (1 - fixed);
    if (leftLeg.current) leftLeg.current.rotation.x = stride;
    if (rightLeg.current) rightLeg.current.rotation.x = -stride;
    group.current.position.y = walk < 1 ? Math.abs(Math.sin(state.clock.elapsedTime * 8)) * 0.04 : lerp(0, 0.06, atTap) * (1 - fixed);
  });

  return (
    <group ref={group} visible={false}>
      <mesh position={[0, 1.08, 0]}>
        <sphereGeometry args={[0.19, 14, 14]} />
        <meshStandardMaterial color="#f5d0a9" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.38, 0.48, 0.22]} />
        <meshStandardMaterial color="#0f766e" emissive="#14b8a6" emissiveIntensity={0.2} roughness={0.55} />
      </mesh>
      <group ref={leftLeg} position={[-0.08, 0.38, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.11, 0.42, 0.13]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.08, 0.38, 0]}>
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.11, 0.42, 0.13]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
      </group>
      <mesh position={[0.3, 0.68, 0]} rotation={[-0.85, 0, 0]}>
        <boxGeometry args={[0.09, 0.5, 0.09]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[-0.24, 0.52, 0.12]}>
        <boxGeometry args={[0.3, 0.24, 0.22]} />
        <meshStandardMaterial color="#c2410c" roughness={0.55} emissive="#ea580c" emissiveIntensity={0.08} />
      </mesh>
    </group>
  );
}

const SERVICE_ICONS = [
  { label: "Plumber", color: "#38bdf8", x: -2.4, y: 4.8, z: 0.8, phase: 1 },
  { label: "Electric", color: "#fbbf24", x: 2.5, y: 4.2, z: 0.4, phase: 1 },
  { label: "Clean", color: "#c084fc", x: -2, y: 5.5, z: -0.4, phase: 1 },
  { label: "Chef", color: "#fb7185", x: 2.2, y: 5.3, z: -0.9, phase: 1 },
];

function ServiceIcons() {
  return (
    <>
      {SERVICE_ICONS.map((icon, i) => (
        <Float key={icon.label} speed={1.8} rotationIntensity={0.15} floatIntensity={0.55}>
          <ServiceIconOrb {...icon} index={i} />
        </Float>
      ))}
    </>
  );
}

function ServiceIconOrb({
  color,
  x,
  y,
  z,
  phase,
  index,
}: {
  label: string;
  color: string;
  x: number;
  y: number;
  z: number;
  phase: number;
  index: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    const p = cityScrollStore.global;
    const env = actEnvelope(p, phase, 0.12);
    group.current.visible = env > 0.03 && p < 0.75;
    const scale = env * (0.9 + Math.sin(state.clock.elapsedTime * 2.5 + index) * 0.06);
    group.current.scale.setScalar(scale);
    group.current.rotation.y = state.clock.elapsedTime * 0.4 + index;
  });

  return (
    <group ref={group} position={[x, y, z]} visible={false}>
      <mesh>
        <icosahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.65} metalness={0.4} roughness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.42, 0.52, 32]} />
        <meshStandardMaterial color="#5eead4" emissive="#14b8a6" emissiveIntensity={0.4} transparent opacity={0.55} />
      </mesh>
    </group>
  );
}

function Ground() {
  const wet = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!wet.current) return;
    const p = cityScrollStore.global;
    wet.current.roughness = lerp(0.15, 0.4, p);
    wet.current.metalness = lerp(0.35, 0.1, p);
    wet.current.emissiveIntensity = 0.02 + Math.sin(state.clock.elapsedTime * 0.5) * 0.01;
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[44, 44]} />
        <meshStandardMaterial ref={wet} color="#1a1512" roughness={0.2} metalness={0.3} emissive="#0f766e" emissiveIntensity={0.02} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 1.5]}>
        <planeGeometry args={[5.5, 16]} />
        <meshStandardMaterial color="#292018" roughness={0.85} />
      </mesh>
    </group>
  );
}

function CompletionBurst() {
  const ring = useRef<THREE.Mesh>(null);
  const burst = useRef<THREE.Group>(null);
  const confetti = useRef<THREE.Group>(null);

  useFrame((state) => {
    const p = cityScrollStore.global;
    const done = phaseProgress(p, 4);
    if (ring.current) {
      ring.current.visible = done > 0.05;
      ring.current.scale.setScalar(1 + done * 0.8 + Math.sin(state.clock.elapsedTime * 2.5) * 0.04);
      const mat = ring.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = done * 1.1;
      mat.opacity = done * 0.55;
    }
    if (burst.current) {
      burst.current.visible = done > 0.1;
      burst.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
    if (confetti.current) {
      confetti.current.visible = done > 0.25;
      confetti.current.rotation.y = state.clock.elapsedTime * 0.15;
      confetti.current.children.forEach((child, i) => {
        child.position.y = Math.sin(state.clock.elapsedTime * 2 + i) * 0.15 + done * 0.5;
      });
    }
  });

  return (
    <group position={[0, 2.8, 0]}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <ringGeometry args={[2.8, 3.6, 64]} />
        <meshStandardMaterial color="#5eead4" emissive="#2dd4bf" emissiveIntensity={0} transparent opacity={0} />
      </mesh>
      <group ref={burst} visible={false}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} rotation={[0, (i / 6) * Math.PI * 2, 0]} position={[0, 0, 1.8]}>
            <boxGeometry args={[0.04, 0.04, 0.8]} />
            <meshStandardMaterial color="#99f6e4" emissive="#5eead4" emissiveIntensity={0.8} transparent opacity={0.6} />
          </mesh>
        ))}
      </group>
      <group ref={confetti} visible={false}>
        {Array.from({ length: 12 }).map((_, i) => (
          <mesh
            key={i}
            position={[Math.cos(i * 0.9) * 1.4, (i % 3) * 0.2, Math.sin(i * 0.9) * 1.4]}
            rotation={[(i * 0.31) % 1, (i * 0.47) % 1, (i * 0.19) % 1]}
          >
            <boxGeometry args={[0.06, 0.06, 0.02]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#5eead4" : i % 3 === 1 ? "#fbbf24" : "#fb7185"}
              emissive={i % 3 === 0 ? "#14b8a6" : i % 3 === 1 ? "#f59e0b" : "#e11d48"}
              emissiveIntensity={0.7}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function FixSplash() {
  const ring = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ring.current) return;
    const fixed = leakFixProgress(cityScrollStore.global);
    ring.current.visible = fixed > 0.2 && fixed < 0.98;
    ring.current.scale.setScalar(0.5 + fixed * 0.8 + Math.sin(state.clock.elapsedTime * 4) * 0.05);
    const mat = ring.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = fixed * 0.9;
    mat.opacity = (1 - fixed) * 0.45;
  });

  return (
    <mesh ref={ring} position={TAP_WORLD} visible={false}>
      <ringGeometry args={[0.15, 0.28, 24]} />
      <meshStandardMaterial color="#5eead4" emissive="#2dd4bf" emissiveIntensity={0} transparent opacity={0} side={THREE.DoubleSide} />
    </mesh>
  );
}

function StreetLamp({ x, z }: { x: number; z: number }) {
  const light = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (!light.current) return;
    const flicker = 0.85 + Math.sin(state.clock.elapsedTime * 1.2 + x) * 0.08;
    light.current.intensity = flicker * 1.4;
  });

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 3.2, 8]} />
        <meshStandardMaterial color="#292524" roughness={0.8} />
      </mesh>
      <mesh position={[0, 3.15, 0.12]}>
        <sphereGeometry args={[0.12, 10, 10]} />
        <meshStandardMaterial color="#fef3c7" emissive="#fbbf24" emissiveIntensity={0.9} />
      </mesh>
      <pointLight ref={light} position={[0, 3.1, 0.2]} color="#fde68a" intensity={1.4} distance={7} />
    </group>
  );
}

function Moon() {
  const moon = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!moon.current) return;
    const p = cityScrollStore.global;
    const night = Math.min(1, p / 0.35);
    moon.current.visible = night > 0.15;
    moon.current.position.y = 14 + Math.sin(state.clock.elapsedTime * 0.2) * 0.15;
  });

  return (
    <group ref={moon} position={[8, 14, -18]} visible={false}>
      <mesh>
        <sphereGeometry args={[1.1, 24, 24]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fde68a" emissiveIntensity={0.35} roughness={0.9} />
      </mesh>
      <mesh scale={1.8}>
        <sphereGeometry args={[1.1, 16, 16]} />
        <meshBasicMaterial color="#fef08a" transparent opacity={0.06} />
      </mesh>
    </group>
  );
}

function AmbientDust() {
  return (
    <>
      <Sparkles count={90} scale={[14, 10, 14]} size={1.5} speed={0.15} opacity={0.45} color="#fde68a" position={[0, 4, 1]} />
      <Sparkles count={40} scale={[8, 6, 8]} size={1} speed={0.25} opacity={0.35} color="#5eead4" position={[0, 1.5, -1]} />
    </>
  );
}

function JourneyScene() {
  const starOpacity = useRef(1);

  useFrame(() => {
    starOpacity.current = lerp(starOpacity.current, cityScrollStore.global > 0.55 ? 0.15 : 0.85, 0.05);
  });

  return (
    <>
      <JourneyCamera />
      <JourneyLighting />
      <color attach="background" args={["#2a1810"]} />
      <fog attach="fog" args={["#2a1810", 10, 42]} />
      <Stars radius={60} depth={30} count={1200} factor={3} saturation={0.15} fade speed={0.4} />
      <Moon />
      <AmbientDust />
      <Ground />
      <StreetLamp x={-4.5} z={2.5} />
      <StreetLamp x={4.8} z={1.8} />
      <NeighborBlock x={-7.5} z={-1.5} h={4.2} windows={3} />
      <NeighborBlock x={7.2} z={-0.5} h={3.4} windows={2} />
      <NeighborBlock x={-6.5} z={-5.5} h={3} windows={2} />
      <NeighborBlock x={6.8} z={-4.8} h={4} windows={3} />
      <HomeBuilding />
      <LeakDrops />
      <ProblemCallout />
      <FixSplash />
      <ConnectionBeam />
      <ServiceIcons />
      <BookingBeacon />
      <ServiceWorker />
      <CompletionBurst />
      <PostFX />
    </>
  );
}

export function ServiceJourneyCanvas() {
  return (
    <div className="absolute inset-0 z-0 h-full w-full bg-[#2a1810]">
      <Canvas
        frameloop="always"
        shadows
        camera={{ position: [0, 12, 18], fov: 44, near: 0.1, far: 90 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", zIndex: 0 }}
      >
        <Suspense fallback={null}>
          <JourneyScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
