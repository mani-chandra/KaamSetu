"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { cityScrollStore } from "@/lib/scroll/city-scroll-store";
import { JourneySoundEngine } from "@/lib/audio/journey-sound-engine";

export function CinematicSound() {
  const engine = useRef<JourneySoundEngine | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const lastTime = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sound = new JourneySoundEngine();
    engine.current = sound;
    setEnabled(JourneySoundEngine.readPreference());
    setReady(true);

    let frame = 0;
    const tick = (time: number) => {
      const dt = lastTime.current ? (time - lastTime.current) / 1000 : 0;
      lastTime.current = time;
      const p = cityScrollStore.global;
      setProgress(p);
      sound.update(p, dt);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      sound.dispose();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    if (!ready || !engine.current) return;
    void engine.current.setEnabled(enabled);
  }, [enabled, ready]);

  const toggle = useCallback(async () => {
    if (!engine.current) return;
    const next = !enabled;
    if (next) await engine.current.init();
    setEnabled(next);
  }, [enabled]);

  if (!ready || progress > 0.92) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={enabled ? "Mute cinematic sound" : "Enable cinematic sound"}
      aria-pressed={enabled}
      className="pointer-events-auto absolute right-5 top-[11vh] z-50 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/70 backdrop-blur-md transition-all hover:border-brand/50 hover:bg-black/60 hover:text-white md:right-10"
    >
      {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
    </button>
  );
}
