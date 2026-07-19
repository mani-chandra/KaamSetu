export type Vec3 = [number, number, number];

export type JourneyKeyframe = {
  t: number;
  position: Vec3;
  lookAt: Vec3;
  fov: number;
  roll?: number;
};

/** World-space tap / problem focal point (balcony leak). */
export const TAP_WORLD: Vec3 = [1.5, 2.55, 2.12];
export const DOOR_WORLD: Vec3 = [0.55, 0.1, -0.85];

/** Prologue ends here; Act I begins. */
export const PROLOGUE_END = 0.08;

/** Start scroll position for each act (Act I … Act V), plus finale at 1. */
export const PHASE_BOUNDS = [0.08, 0.26, 0.44, 0.64, 0.82, 1];

export const JOURNEY_CAMERA: JourneyKeyframe[] = [
  // Prologue — wide landing
  { t: 0, position: [0, 15, 24], lookAt: [0, 3.2, 0], fov: 50, roll: 0 },
  { t: 0.04, position: [1, 12, 19], lookAt: [0, 3.5, 0.2], fov: 46, roll: 0 },
  // Push toward the house
  { t: 0.08, position: [3.5, 9, 14], lookAt: [0, 3.8, 0.8], fov: 42, roll: -0.015 },
  // Act I — tight on the leaking tap
  { t: 0.14, position: [2.4, 5.2, 6.5], lookAt: TAP_WORLD, fov: 34, roll: 0.01 },
  { t: 0.22, position: [1.85, 3.8, 4.2], lookAt: TAP_WORLD, fov: 28, roll: 0.02 },
  { t: 0.26, position: [2.8, 6.5, 9], lookAt: [0, 3.5, 0], fov: 38, roll: 0.01 },
  // Act II — discover pros
  { t: 0.36, position: [5.5, 7, 11], lookAt: [0, 4.2, 0], fov: 38, roll: -0.02 },
  { t: 0.44, position: [4, 5.5, 9], lookAt: [0, 2.5, 1], fov: 36, roll: -0.01 },
  // Act III — phone live tracking
  { t: 0.52, position: [2.8, 4.8, 5.5], lookAt: [0.8, 3.5, 2.2], fov: 34, roll: -0.01 },
  { t: 0.58, position: [1.8, 4.2, 4.2], lookAt: [0.5, 3.4, 2.3], fov: 32, roll: 0 },
  { t: 0.64, position: [1.2, 3.8, 3.8], lookAt: [0.4, 3.2, 2.2], fov: 30, roll: 0.01 },
  // Act IV — worker fixes the tap
  { t: 0.72, position: [1.7, 3.2, 3.6], lookAt: TAP_WORLD, fov: 27, roll: 0.015 },
  { t: 0.78, position: [1.55, 3.5, 3.2], lookAt: TAP_WORLD, fov: 25, roll: 0.01 },
  { t: 0.82, position: [0.5, 5.5, 9], lookAt: [0, 3, 0], fov: 36, roll: 0 },
  // Act V — pull back to brand
  { t: 0.92, position: [0, 9, 14], lookAt: [0, 3, 0], fov: 40, roll: 0 },
  { t: 1, position: [0, 13, 20], lookAt: [0, 3.2, 0], fov: 44, roll: 0 },
];

export function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

export function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function sampleJourneyCamera(progress: number) {
  const t = easeInOutQuart(Math.max(0, Math.min(1, progress)));
  const frames = JOURNEY_CAMERA;

  for (let i = 0; i < frames.length - 1; i++) {
    const a = frames[i];
    const b = frames[i + 1];
    if (t >= a.t && t <= b.t) {
      const local = (t - a.t) / (b.t - a.t);
      const smooth = easeInOutQuart(local);
      return {
        position: lerpVec3(a.position, b.position, smooth),
        lookAt: lerpVec3(a.lookAt, b.lookAt, smooth),
        fov: lerp(a.fov, b.fov, smooth),
        roll: lerp(a.roll ?? 0, b.roll ?? 0, smooth),
      };
    }
  }

  const last = frames[frames.length - 1];
  return { position: last.position, lookAt: last.lookAt, fov: last.fov, roll: last.roll ?? 0 };
}

export function isPrologue(progress: number) {
  return progress < PROLOGUE_END;
}

export function journeyPhase(progress: number) {
  if (progress < PHASE_BOUNDS[1]) return 0;
  if (progress < PHASE_BOUNDS[2]) return 1;
  if (progress < PHASE_BOUNDS[3]) return 2;
  if (progress < PHASE_BOUNDS[4]) return 3;
  return 4;
}

export function phaseProgress(progress: number, phase: number) {
  const start = PHASE_BOUNDS[phase] ?? 0;
  const end = PHASE_BOUNDS[phase + 1] ?? 1;
  return Math.max(0, Math.min(1, (progress - start) / (end - start)));
}

export function actEnvelope(progress: number, phase: number, fade = 0.15) {
  const local = phaseProgress(progress, phase);
  const inFade = Math.min(1, local / fade);
  const outFade = Math.min(1, (1 - local) / fade);
  return Math.min(inFade, outFade);
}

/** Live tracking progress within Act III (0 → 1). */
export function bikeRideProgress(progress: number) {
  return Math.max(0, Math.min(1, (progress - 0.44) / 0.2));
}

/** Leak fix progress during Act IV (0 → 1). */
export function leakFixProgress(progress: number) {
  const t = Math.max(0, Math.min(1, (progress - 0.68) / 0.12));
  return 1 - Math.pow(1 - t, 3);
}
