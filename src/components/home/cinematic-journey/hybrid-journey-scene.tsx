"use client";

import { CinematicChapters, CinematicLetterbox } from "@/components/home/cinematic-chapters";
import { CinematicSkipIntro } from "@/components/home/cinematic-skip-intro";
import { CinematicSound } from "@/components/home/cinematic-sound";
import {
  JourneyFixOverlay,
  JourneyPhoneTracker,
  JourneyProCards,
  JourneyTapScene,
} from "@/components/home/cinematic-journey/journey-act-overlays";
import { JourneyPhotoLayers } from "@/components/home/cinematic-journey/journey-photo-layers";
import { JourneyScrollProvider } from "@/components/home/cinematic-journey/use-journey-scroll";

export function HybridJourneyScene() {
  return (
    <JourneyScrollProvider>
      <div className="absolute inset-0 isolate h-full w-full z-0">
        <JourneyPhotoLayers />
        <JourneyTapScene />
        <JourneyProCards />
        <JourneyFixOverlay />
        <CinematicLetterbox />
        <CinematicChapters />
        <JourneyPhoneTracker />
        <CinematicSkipIntro />
        <CinematicSound />
      </div>
    </JourneyScrollProvider>
  );
}
