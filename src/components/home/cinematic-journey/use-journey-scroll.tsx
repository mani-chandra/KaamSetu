"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { cityScrollStore } from "@/lib/scroll/city-scroll-store";
import { isPrologue, journeyPhase, phaseProgress } from "@/lib/scroll/journey-camera";

type JourneyScrollState = {
  progress: number;
  phase: number;
  local: number;
  prologue: boolean;
};

const JourneyScrollContext = createContext<JourneyScrollState>({
  progress: 0,
  phase: 0,
  local: 0,
  prologue: true,
});

export function JourneyScrollProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<JourneyScrollState>({
    progress: 0,
    phase: 0,
    local: 0,
    prologue: true,
  });

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const progress = cityScrollStore.global;
      const phase = journeyPhase(progress);
      setState({
        progress,
        phase,
        local: phaseProgress(progress, phase),
        prologue: isPrologue(progress),
      });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <JourneyScrollContext.Provider value={state}>{children}</JourneyScrollContext.Provider>;
}

export function useJourneyScroll() {
  return useContext(JourneyScrollContext);
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

export function journeyLerp(progress: number, start: number, end: number) {
  return clamp01((progress - start) / (end - start));
}

export function journeyEase(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Visibility helper — keeps DOM mounted to avoid scroll flicker. */
export function overlayStyle(opacity: number) {
  const visible = opacity > 0.02;
  return {
    opacity,
    visibility: visible ? ("visible" as const) : ("hidden" as const),
    pointerEvents: "none" as const,
  };
}

export function useActOpacity(showStart: number, showEnd: number, hideStart?: number, hideEnd?: number) {
  const { progress } = useJourneyScroll();
  return useMemo(() => {
    const show = journeyEase(journeyLerp(progress, showStart, showEnd));
    if (hideStart === undefined || hideEnd === undefined) return show;
    const hide = journeyEase(journeyLerp(progress, hideStart, hideEnd));
    return show * (1 - hide);
  }, [progress, showStart, showEnd, hideStart, hideEnd]);
}
