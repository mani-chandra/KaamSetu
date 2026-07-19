"use client";

import { CheckCircle2, Droplets, MapPin, ShieldCheck, Star, Wrench } from "lucide-react";
import { bikeRideProgress } from "@/lib/scroll/journey-camera";
import {
  journeyEase,
  journeyLerp,
  overlayStyle,
  useActOpacity,
  useJourneyScroll,
} from "@/components/home/cinematic-journey/use-journey-scroll";

const PROS = [
  { name: "Rajesh K.", role: "Plumber", rating: 4.9, jobs: 312, verified: true },
  { name: "Priya M.", role: "Electrician", rating: 4.8, jobs: 189, verified: true },
  { name: "Amit S.", role: "Cleaner", rating: 4.9, jobs: 445, verified: true },
];

const ROUTE_POINTS = "20,78 35,62 52,48 68,34 82,22";

function TapDrops({ active }: { active: number }) {
  if (active < 0.05) return null;

  return (
    <div className="pointer-events-none absolute inset-0" style={{ opacity: active }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="absolute left-[47%] h-3 w-[2px] rounded-full bg-sky-300/80 shadow-[0_0_8px_rgba(125,211,252,0.6)] animate-journey-drop"
          style={{
            top: `${38 + i * 2}%`,
            animationDelay: `${i * 0.35}s`,
            animationDuration: `${1.1 + i * 0.15}s`,
          }}
        />
      ))}
      <div className="absolute left-[44%] top-[52%] h-10 w-16 rounded-full bg-sky-500/10 blur-xl" />
    </div>
  );
}

export function JourneyTapScene() {
  const { progress } = useJourneyScroll();
  const show = journeyEase(journeyLerp(progress, 0.1, 0.18)) * (1 - journeyEase(journeyLerp(progress, 0.24, 0.3)));
  const drip = journeyEase(journeyLerp(progress, 0.12, 0.22));

  return (
    <div className="pointer-events-none absolute inset-0 z-10" style={overlayStyle(show)}>
      <TapDrops active={drip} />

      <div
        className="absolute left-[42%] top-[34%] md:left-[40%] md:top-[36%]"
        style={{ opacity: show }}
      >
        <div className="relative">
          <span className="absolute -inset-8 rounded-full border border-sky-400/25" />
          <span className="absolute -inset-4 rounded-full border border-sky-300/40" />
          <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 backdrop-blur-md">
            <Droplets className="h-3.5 w-3.5 text-sky-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/90">Leaking tap</span>
          </div>
        </div>
        <p className="mt-4 max-w-[180px] text-xs leading-relaxed text-white/50">
          Water pooling on the floor — needs attention tonight.
        </p>
      </div>
    </div>
  );
}

export function JourneyProCards() {
  const { progress } = useJourneyScroll();
  const opacity = useActOpacity(0.28, 0.38, 0.42, 0.48);
  const show = journeyEase(journeyLerp(progress, 0.28, 0.38));

  return (
    <div
      className="pointer-events-none absolute inset-y-0 right-0 z-20 flex w-full items-center justify-end px-4 md:w-[48%] md:px-10"
      style={overlayStyle(opacity)}
    >
      <div className="w-full max-w-md space-y-3">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">Verified nearby</p>
        {PROS.map((pro, i) => (
          <div
            key={pro.name}
            className="flex items-center gap-4 rounded-xl border border-white/10 bg-black/45 p-4 backdrop-blur-xl"
            style={{
              transform: `translateX(${(1 - show) * (20 + i * 6)}px)`,
              opacity: journeyEase(journeyLerp(progress, 0.28 + i * 0.03, 0.38 + i * 0.03)),
            }}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-teal-900/80 text-sm font-semibold text-teal-100">
              {pro.name.slice(0, 1)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{pro.name}</span>
                {pro.verified && <ShieldCheck className="h-3.5 w-3.5 text-teal-400" aria-hidden />}
              </div>
              <p className="text-sm text-white/55">{pro.role}</p>
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center gap-1 text-amber-300">
                <Star className="h-3.5 w-3.5 fill-current" />
                {pro.rating}
              </div>
              <p className="text-white/40">{pro.jobs} jobs</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function JourneyPhoneTracker() {
  const { progress } = useJourneyScroll();
  const opacity = useActOpacity(0.45, 0.52, 0.62, 0.67);
  const show = journeyEase(journeyLerp(progress, 0.45, 0.52));
  const ride = bikeRideProgress(progress);
  const routeLength = 100;
  const dashOffset = routeLength * (1 - ride);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[32] flex items-center justify-center px-4 md:justify-end md:pr-[8%]"
      style={overlayStyle(opacity)}
    >
      <div
        className="relative w-full max-w-[280px] rounded-[2rem] border border-white/15 bg-zinc-950/95 p-2 shadow-[0_32px_64px_rgba(0,0,0,0.5)] md:max-w-[290px]"
        style={{
          transform: `scale(${0.94 + show * 0.06}) translateY(${(1 - show) * 16}px)`,
          willChange: "transform",
        }}
      >
        <div className="overflow-hidden rounded-[1.5rem] bg-zinc-900">
          <div className="flex items-center justify-between px-4 py-2 text-[10px] text-white/50">
            <span>9:41</span>
            <span className="font-medium text-teal-400">KaamSetu</span>
            <span>LTE</span>
          </div>

          <div className="border-b border-white/5 px-4 pb-3">
            <p className="text-xs text-white/45">Booking #KS-4821</p>
            <p className="text-base font-semibold text-white">Rajesh is on the way</p>
            <p className="text-sm text-teal-300/90">{Math.max(3, Math.round(18 - ride * 15))} min away</p>
          </div>

          <div className="relative aspect-[4/5] bg-[#0f1a18]">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <linearGradient id="journeyRouteGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#facc15" stopOpacity="0.95" />
                </linearGradient>
              </defs>
              <path d={`M ${ROUTE_POINTS}`} fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" strokeLinecap="round" />
              <path
                d={`M ${ROUTE_POINTS}`}
                fill="none"
                stroke="url(#journeyRouteGrad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={routeLength}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div
              className="absolute h-3 w-3 rounded-full border-2 border-white bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.75)]"
              style={{
                left: `${20 + ride * 62}%`,
                top: `${78 - ride * 56}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
            <div className="absolute right-[18%] top-[22%] text-teal-400/90" style={{ transform: "translate(50%, -50%)" }}>
              <MapPin className="h-4 w-4" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-2 px-4 py-3">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-amber-400" style={{ width: `${ride * 100}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Wrench className="h-3.5 w-3.5 text-teal-400" />
                Plumber · OTP verified
              </div>
              <span className="rounded-md bg-emerald-900/60 px-2 py-0.5 font-mono text-[10px] text-emerald-300">4829</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function JourneyFixOverlay() {
  const opacity = useActOpacity(0.66, 0.76, 0.8, 0.86);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 flex items-end justify-start p-8 md:p-14"
      style={overlayStyle(opacity)}
    >
      <div className="max-w-sm rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-xl">
        <div className="mb-3 flex items-center gap-2 text-teal-300">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-mono text-[10px] uppercase tracking-[0.25em]">Job complete</span>
        </div>
        <p className="text-xl font-semibold text-white">Leak sealed. Tap running clean.</p>
        <p className="mt-2 text-sm text-white/55">₹499 · Paid via UPI · Rate your experience</p>
      </div>
    </div>
  );
}
