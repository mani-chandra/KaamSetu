/** Compute 0–1 scroll progress through the cinematic intro section. */
export function computeCinematicProgress(): number {
  const el = document.getElementById("cinematic-scroll");
  if (!el) return 0;

  const scrollRange = el.offsetHeight - window.innerHeight;
  if (scrollRange <= 0) return 0;

  const rect = el.getBoundingClientRect();
  return Math.max(0, Math.min(1, -rect.top / scrollRange));
}

/** Scroll the page to a point within the cinematic intro (0 = start, 1 = end). */
export function scrollToCinematicProgress(target: number, behavior: ScrollBehavior = "smooth") {
  const el = document.getElementById("cinematic-scroll");
  if (!el) return;

  const clamped = Math.max(0, Math.min(1, target));
  const scrollRange = el.offsetHeight - window.innerHeight;
  if (scrollRange <= 0) return;

  const current = computeCinematicProgress();
  window.scrollTo({ top: window.scrollY + (clamped - current) * scrollRange, behavior });
}
