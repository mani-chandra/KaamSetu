export type Vec3 = [number, number, number];

export type CameraKeyframe = {
  t: number;
  position: Vec3;
  lookAt: Vec3;
  fov: number;
};

export const CITY_CAMERA_PATH: CameraKeyframe[] = [
  { t: 0, position: [5, 50, 44], lookAt: [0, 2, -10], fov: 52 },
  { t: 0.12, position: [2, 38, 32], lookAt: [0, 1, -12], fov: 50 },
  { t: 0.15, position: [3, 30, 24], lookAt: [0, 0, -16], fov: 47 },
  { t: 0.32, position: [1, 20, 10], lookAt: [0, 0.5, -22], fov: 44 },
  { t: 0.52, position: [0.2, 10, -4], lookAt: [0, 1.2, -30], fov: 42 },
  { t: 0.72, position: [0, 3.8, -20], lookAt: [0, 1.5, -38], fov: 39 },
  { t: 0.88, position: [0, 1.85, -30], lookAt: [0, 1.45, -46], fov: 37 },
  { t: 1, position: [0, 1.55, -36], lookAt: [0, 1.4, -58], fov: 36 },
];

export function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

export function sampleCameraPath(progress: number) {
  const t = easeInOutCubic(Math.max(0, Math.min(1, progress)));
  const frames = CITY_CAMERA_PATH;

  for (let i = 0; i < frames.length - 1; i++) {
    const current = frames[i];
    const next = frames[i + 1];
    if (t >= current.t && t <= next.t) {
      const local = (t - current.t) / (next.t - current.t);
      const smooth = easeInOutCubic(local);
      return {
        position: lerpVec3(current.position, next.position, smooth),
        lookAt: lerpVec3(current.lookAt, next.lookAt, smooth),
        fov: lerp(current.fov, next.fov, smooth),
      };
    }
  }

  const last = frames[frames.length - 1];
  return { position: last.position, lookAt: last.lookAt, fov: last.fov };
}

export type BuildingSpec = {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
  emissive: string;
  windows: number;
};

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export function generateCityBlocks(): BuildingSpec[] {
  const blocks: BuildingSpec[] = [];
  const palette = ["#1e293b", "#0f172a", "#134e4a", "#164e63", "#1e3a5f", "#312e81", "#1e40af", "#4338ca"];

  for (let row = 0; row < 14; row++) {
    const z = -4 - row * 3.6;
    for (const side of [-1, 1] as const) {
      for (let col = 0; col < 3; col++) {
        const seed = row * 10 + col * 3 + (side === -1 ? 0 : 100);
        const laneOffset = side * (5.8 + col * 3.2 + hash(seed) * 1.2);
        const nearCenter = row < 5 ? 1 + hash(seed + 2) * 6 : 0;
        const height = 2.4 + hash(seed + 1) * 7 + nearCenter;
        const width = 2.2 + hash(seed + 3) * 1.8;
        const depth = 2.4 + hash(seed + 4) * 1.4;
        const color = palette[Math.floor(hash(seed + 5) * palette.length)];

        blocks.push({
          x: laneOffset,
          z,
          width,
          depth,
          height,
          color,
          emissive: hash(seed + 6) > 0.5 ? "#5eead4" : "#fbbf24",
          windows: Math.floor(height * 1.5),
        });
      }
    }
  }

  return blocks;
}
