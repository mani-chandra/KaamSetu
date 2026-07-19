"use client";

import { useEffect, useState } from "react";
import { cityScrollStore, snapCityScrollProgress } from "@/lib/scroll/city-scroll-store";
import { scrollToCinematicProgress } from "@/lib/scroll/cinematic-progress";

const SKIP_TARGET = 0.88;
const STORAGE_KEY = "kaamsetu-cinematic-skipped";

export function CinematicSkipIntro() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      setProgress(cityScrollStore.global);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const delay = localStorage.getItem(STORAGE_KEY) ? 400 : 1200;
    const timer = window.setTimeout(() => setVisible(true), delay);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible || progress >= 0.82) return null;

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    scrollToCinematicProgress(SKIP_TARGET);
    snapCityScrollProgress(SKIP_TARGET);
    setVisible(false);
  };

  return (
    <button
      type="button"
      onClick={handleSkip}
      className="pointer-events-auto absolute right-5 top-[6vh] z-50 rounded-full border border-white/20 bg-black/45 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/75 backdrop-blur-md transition-all hover:border-brand/50 hover:bg-black/60 hover:text-white md:right-10"
    >
      Skip intro →
    </button>
  );
}
