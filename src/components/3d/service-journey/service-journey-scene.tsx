"use client";

import dynamic from "next/dynamic";
import { CinematicChapters, CinematicLetterbox } from "@/components/home/cinematic-chapters";
import { CinematicSkipIntro } from "@/components/home/cinematic-skip-intro";
import { CinematicSound } from "@/components/home/cinematic-sound";

const ServiceJourneyCanvas = dynamic(
  () =>
    import("@/components/3d/service-journey/service-journey-canvas").then((m) => m.ServiceJourneyCanvas),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-[#1a1208]" aria-hidden /> }
);

export function ServiceJourneyScene() {
  return (
    <div className="absolute inset-0 h-full w-full z-0">
      <ServiceJourneyCanvas />
      <CinematicLetterbox />
      <CinematicChapters />
      <CinematicSkipIntro />
      <CinematicSound />
    </div>
  );
}
