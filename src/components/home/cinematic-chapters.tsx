"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cityScrollStore } from "@/lib/scroll/city-scroll-store";
import { isPrologue, journeyPhase, phaseProgress } from "@/lib/scroll/journey-camera";

const CHAPTERS = [
  {
    act: "Act I",
    title: "Spot the problem",
    subtitle: "Inside your home — a tap that will not stop dripping.",
    accent: "#fb923c",
    glow: "rgba(251,146,60,0.35)",
    leak: "rgba(56,189,248,0.2)",
    callout: "Leaking tap",
  },
  {
    act: "Act II",
    title: "Find the right professional",
    subtitle: "Plumbers, electricians, cleaners — verified and ready on KaamSetu.",
    accent: "#5eead4",
    glow: "rgba(20,184,166,0.4)",
    leak: "rgba(94,234,212,0.25)",
    callout: null,
  },
  {
    act: "Act III",
    title: "Pro on the way",
    subtitle: "Track your pro live — right on your phone.",
    accent: "#fde047",
    glow: "rgba(250,204,21,0.35)",
    leak: "rgba(253,224,71,0.2)",
    callout: "Live tracking",
  },
  {
    act: "Act IV",
    title: "Fixed at your doorstep",
    subtitle: "Skilled hands seal the leak. Transparent pricing. Real reviews.",
    accent: "#f472b6",
    glow: "rgba(244,114,182,0.3)",
    leak: "rgba(244,114,182,0.18)",
    callout: null,
  },
  {
    act: "Act V",
    title: "KaamSetu — your local services bridge",
    subtitle: "India's trusted platform for every service you need.",
    accent: "#2dd4bf",
    glow: "rgba(45,212,191,0.45)",
    leak: "rgba(45,212,191,0.28)",
    callout: null,
  },
];

export function CinematicChapters() {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const [titleKey, setTitleKey] = useState(0);
  const [prologue, setPrologue] = useState(true);

  useEffect(() => {
    let frame = 0;
    let lastPhase = 0;

    const tick = () => {
      const p = cityScrollStore.global;
      const ph = journeyPhase(p);
      setProgress(p);
      setPhase(ph);
      setPrologue(isPrologue(p));

      if (ph !== lastPhase) {
        setTitleKey((k) => k + 1);
        lastPhase = ph;
      }

      const local = phaseProgress(p, ph);
      const edge = Math.min(local / 0.06, (1 - local) / 0.06, 1);
      const exit = p > 0.92 ? Math.max(0, 1 - (p - 0.92) / 0.08) : 1;
      setOpacity(Math.max(0.4, edge) * exit);

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const chapter = CHAPTERS[phase];
  const local = phaseProgress(progress, phase);
  const phoneAct = phase === 2;
  const parallax = useMemo(() => (phoneAct ? 0 : (0.5 - local) * 28), [local, phoneAct]);
  const titleBlur = useMemo(() => Math.max(0, (1 - local) * 4 - 2), [local]);
  const titleLift = useMemo(() => (1 - Math.min(local * 1.2, 1)) * 8, [local]);
  const prologueOpacity = useMemo(() => Math.max(0, 1 - progress / 0.07), [progress]);

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 z-20 transition-[background] duration-500"
        style={{
          background: phoneAct
            ? `radial-gradient(ellipse 70% 55% at 18% 42%, ${chapter.leak} 0%, transparent 52%), radial-gradient(ellipse at 72% 50%, transparent 42%, rgba(0,0,0,0.35) 100%)`
            : `radial-gradient(ellipse 80% 60% at 20% 50%, ${chapter.leak} 0%, transparent 55%), radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.62) 100%)`,
        }}
      />

      <div
        className="pointer-events-none absolute -left-24 top-1/4 z-20 h-64 w-64 rounded-full blur-[100px] transition-[background,opacity] duration-700"
        style={{ background: chapter.glow, opacity: 0.55 + local * 0.25 }}
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-1/3 z-20 h-48 w-48 rounded-full blur-[80px] transition-[background,opacity] duration-700"
        style={{ background: chapter.leak, opacity: 0.35 + local * 0.2 }}
      />

      {/* Prologue — wide shot before Act I zoom */}
      <div
        className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center transition-opacity duration-500"
        style={{ opacity: prologueOpacity }}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.45em] text-white/50 mb-3">KaamSetu</p>
        <h2 className="text-2xl md:text-4xl font-bold text-white/90 tracking-tight">Your neighborhood at dusk</h2>
        <p className="mt-3 text-sm md:text-base text-white/55 max-w-md">Scroll closer — something needs fixing tonight.</p>
        <div className="mt-8 flex flex-col items-center gap-2 text-white/40">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll to begin</span>
          <ChevronDown className="h-5 w-5 animate-bounce" />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.04] mix-blend-overlay animate-[grain_8s_steps(10)_infinite]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div
        className={`pointer-events-none absolute inset-0 z-20 flex flex-col justify-center px-6 transition-opacity duration-500 ${phoneAct ? "md:px-10 md:max-w-[46%]" : "md:px-14"}`}
        style={{ opacity: prologue ? 0 : opacity, transform: `translateY(${parallax}px)` }}
      >
        <div className="max-w-2xl" key={titleKey}>
          <p
            className="font-mono text-[10px] md:text-xs uppercase tracking-[0.4em] mb-4 flex items-center gap-3 transition-colors duration-500"
            style={{ color: chapter.accent }}
          >
            <span className="inline-block h-px w-8 transition-all duration-500" style={{ background: `${chapter.accent}99` }} />
            {chapter.act}
          </p>
          <h2
            className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08] transition-[filter,transform,opacity] duration-700 ease-out"
            style={{
              filter: `blur(${titleBlur}px)`,
              transform: `translateY(${titleLift}px)`,
              opacity: Math.min(1, 0.35 + local * 0.85),
            }}
          >
            <span
              className="bg-clip-text text-transparent drop-shadow-[0_4px_32px_rgba(0,0,0,0.55)]"
              style={{
                backgroundImage: `linear-gradient(135deg, #ffffff 0%, ${chapter.accent} 120%, rgba(255,255,255,0.75) 200%)`,
              }}
            >
              {chapter.title}
            </span>
          </h2>
          <p
            className="mt-5 text-base md:text-lg text-white/70 max-w-lg leading-relaxed pl-4 transition-[border-color,opacity,transform] duration-700 ease-out"
            style={{
              borderLeft: `2px solid ${chapter.accent}66`,
              opacity: Math.min(1, 0.25 + local * 0.85),
              transform: `translateX(${Math.max(0, (1 - local) * -8)}px)`,
            }}
          >
            {chapter.subtitle}
          </p>
          {chapter.callout && local > 0.15 && (
            <div
              className="mt-4 ml-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] backdrop-blur-sm"
              style={{
                borderColor: `${chapter.accent}55`,
                color: chapter.accent,
                background: `${chapter.accent}18`,
                opacity: Math.min(1, (local - 0.15) * 3),
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              {phase === 2 && local > 0.2 ? "OTP verified · En route" : chapter.callout}
            </div>
          )}
        </div>
      </div>

      <div
        className="pointer-events-none absolute bottom-[11vh] left-6 md:left-14 z-20 flex items-center gap-2 transition-opacity duration-500"
        style={{ opacity: prologue ? prologueOpacity * 0.6 : 1 }}
      >
        {CHAPTERS.map((ch, i) => {
          const active = i === phase && !prologue;
          const done = i < phase || (i === 0 && progress > 0.08 && !prologue);
          const dotLocal = i === phase ? phaseProgress(progress, i) : done ? 1 : 0;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`h-1 rounded-full transition-all duration-700 ease-out ${
                  active ? "w-10 shadow-[0_0_14px_rgba(20,184,166,0.9)]" : done ? "w-5 opacity-70" : "w-2 bg-white/15"
                }`}
                style={
                  active || done
                    ? {
                        background: ch.accent,
                        transform: active ? `scaleX(${0.35 + dotLocal * 0.65})` : undefined,
                        transformOrigin: "left",
                      }
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-[11vh] right-6 md:right-14 z-20 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40 tabular-nums">
        Scroll · {Math.round(progress * 100)}%
      </div>
    </>
  );
}

export function CinematicLetterbox() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-[4.5vh] bg-gradient-to-b from-black via-black to-black/80 shadow-[0_8px_40px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 gap-1 opacity-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} className="h-1 w-1 rounded-full bg-white/40" />
          ))}
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-[4.5vh] bg-gradient-to-t from-black via-black to-black/80 shadow-[0_-8px_40px_rgba(0,0,0,0.9)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
      </div>
    </>
  );
}
