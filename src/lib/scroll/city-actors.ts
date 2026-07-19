export type TrafficSpec = {
  id: string;
  kind: "car" | "auto" | "bike" | "bus" | "scooter";
  laneX: number;
  speed: number;
  startZ: number;
  color: string;
  accent?: string;
  direction: 1 | -1;
};

export type PedestrianSpec = {
  id: string;
  side: -1 | 1;
  speed: number;
  startZ: number;
  shirt: string;
  pants: string;
  direction: 1 | -1;
};

export const ROAD_Z_MIN = -52;
export const ROAD_Z_MAX = 14;

export function wrapRoadZ(z: number) {
  const span = ROAD_Z_MAX - ROAD_Z_MIN;
  let value = z;
  while (value < ROAD_Z_MIN) value += span;
  while (value > ROAD_Z_MAX) value -= span;
  return value;
}

export function generateTraffic(): TrafficSpec[] {
  return [
    { id: "auto-1", kind: "auto", laneX: -0.7, speed: 5.2, startZ: 8, color: "#14b8a6", accent: "#fbbf24", direction: -1 },
    { id: "auto-2", kind: "auto", laneX: -0.5, speed: 4.6, startZ: -12, color: "#059669", accent: "#fde047", direction: -1 },
    { id: "car-1", kind: "car", laneX: 0.85, speed: 7.5, startZ: 2, color: "#dc2626", direction: -1 },
    { id: "car-2", kind: "car", laneX: 0.65, speed: 6.8, startZ: -18, color: "#2563eb", direction: -1 },
    { id: "car-3", kind: "car", laneX: 0.95, speed: 8.2, startZ: -32, color: "#fafafa", direction: -1 },
    { id: "bus-1", kind: "bus", laneX: -0.35, speed: 3.8, startZ: -6, color: "#7c2d12", accent: "#f97316", direction: -1 },
    { id: "bike-1", kind: "bike", laneX: 0.35, speed: 5.5, startZ: -24, color: "#a855f7", direction: -1 },
    { id: "scooter-1", kind: "scooter", laneX: -0.15, speed: 6.2, startZ: -28, color: "#0891b2", direction: -1 },
    { id: "car-4", kind: "car", laneX: -0.95, speed: 5.8, startZ: -8, color: "#eab308", direction: 1 },
    { id: "auto-3", kind: "auto", laneX: 0.15, speed: 4.2, startZ: -38, color: "#10b981", accent: "#facc15", direction: 1 },
    { id: "bike-2", kind: "bike", laneX: -0.55, speed: 5.1, startZ: -42, color: "#f43f5e", direction: -1 },
    { id: "scooter-2", kind: "scooter", laneX: 0.55, speed: 6.8, startZ: -14, color: "#6366f1", direction: -1 },
  ];
}

export function generatePedestrians(): PedestrianSpec[] {
  const shirts = ["#ef4444", "#3b82f6", "#8b5cf6", "#14b8a6", "#f97316", "#ec4899", "#22c55e"];
  const pants = ["#1e293b", "#334155", "#0f172a", "#374151"];

  return Array.from({ length: 22 }, (_, i) => ({
    id: `ped-${i}`,
    side: (i % 2 === 0 ? -1 : 1) as -1 | 1,
    speed: 1.1 + (i % 5) * 0.25,
    startZ: 10 - i * 3.2,
    shirt: shirts[i % shirts.length],
    pants: pants[i % pants.length],
    direction: i % 3 === 0 ? 1 : -1,
  }));
}

export type ShopSpec = {
  x: number;
  z: number;
  color: string;
  sign: string;
  awning: string;
};

export function generateStreetShops(): ShopSpec[] {
  return [
    { x: 3.4, z: -36, color: "#134e4a", sign: "#5eead4", awning: "#14b8a6" },
    { x: -3.5, z: -34, color: "#7c2d12", sign: "#fbbf24", awning: "#ea580c" },
    { x: 3.3, z: -44, color: "#312e81", sign: "#c084fc", awning: "#7c3aed" },
    { x: -3.4, z: -42, color: "#1e3a5f", sign: "#38bdf8", awning: "#0284c7" },
  ];
}
