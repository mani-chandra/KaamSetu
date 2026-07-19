/** Shared scroll state readable from journey overlays without React context. */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Time constant (seconds) — lower = snappier, higher = more cinematic lag. */
const SMOOTH_TAU = 1.15;

/** Max visual progress change per second when the user flicks through the journey. */
const MAX_PROGRESS_PER_SECOND = 0.2;

/** Snap when smoothed is within this distance of target and scroll is idle. */
const IDLE_SNAP_EPSILON = 0.012;

/** Treat scroll velocity below this (progress/sec) as idle. */
const IDLE_VELOCITY = 0.04;

export const cityScrollStore = {
  /** Smoothed progress — drives journey visuals. */
  global: 0,
  /** Raw progress from scroll position. */
  target: 0,
  hero: 0,
};

let lastRawProgress = 0;
let lastRawTime = 0;
let scrollVelocity = 0;

export function setCityScrollTarget(global: number) {
  cityScrollStore.target = clamp01(global);
}

/** Immediately align smoothed + target (skip intro, leave section, etc.). */
export function snapCityScrollProgress(global: number) {
  const v = clamp01(global);
  cityScrollStore.target = v;
  cityScrollStore.global = v;
  cityScrollStore.hero = Math.min(1, v / 0.26);
  lastRawProgress = v;
}

/** @deprecated Prefer setCityScrollTarget + tickCityScrollSmoothing or snapCityScrollProgress */
export function setCityScrollProgress(global: number) {
  snapCityScrollProgress(global);
}

export function resetCityScrollSmoothing() {
  cityScrollStore.global = 0;
  cityScrollStore.target = 0;
  cityScrollStore.hero = 0;
  lastRawProgress = 0;
  lastRawTime = 0;
  scrollVelocity = 0;
}

function isPastCinematicSection() {
  const el = document.getElementById("cinematic-scroll");
  if (!el) return false;
  return el.getBoundingClientRect().bottom <= window.innerHeight * 0.35;
}

/**
 * Advance smoothed progress toward scroll target.
 * Call once per frame from the home scroll loop.
 */
export function tickCityScrollSmoothing(rawProgress: number, dtSeconds: number) {
  const dt = Math.max(0.001, Math.min(0.05, dtSeconds));
  const target = clamp01(rawProgress);
  cityScrollStore.target = target;

  const now = performance.now();
  if (lastRawTime > 0) {
    scrollVelocity = (target - lastRawProgress) / dt;
  }
  lastRawProgress = target;
  lastRawTime = now;

  const delta = target - cityScrollStore.global;

  if (isPastCinematicSection()) {
    snapCityScrollProgress(target);
    return cityScrollStore.global;
  }

  if (Math.abs(scrollVelocity) < IDLE_VELOCITY && Math.abs(delta) < IDLE_SNAP_EPSILON) {
    snapCityScrollProgress(target);
    return cityScrollStore.global;
  }

  const alpha = 1 - Math.exp(-dt / SMOOTH_TAU);
  let next = cityScrollStore.global + delta * alpha;

  const maxStep = MAX_PROGRESS_PER_SECOND * dt;
  const step = next - cityScrollStore.global;
  if (Math.abs(step) > maxStep) {
    next = cityScrollStore.global + Math.sign(step) * maxStep;
  }

  cityScrollStore.global = clamp01(next);
  cityScrollStore.hero = Math.min(1, cityScrollStore.global / 0.26);
  return cityScrollStore.global;
}
