"use client";

import Image from "next/image";
import { journeyEase, journeyLerp, useJourneyScroll } from "@/components/home/cinematic-journey/use-journey-scroll";

import { HOME_STORY_IMAGES } from "@/lib/home/category-group-images";

/** Home scroll journey backgrounds — `/` cinematic hero in `HybridJourneyScene`. */
const PHOTOS = HOME_STORY_IMAGES;

function PhotoLayer({
  src,
  alt,
  opacity,
  scale,
  y,
  x = 0,
  priority,
}: {
  src: string;
  alt: string;
  opacity: number;
  scale: number;
  y: number;
  x?: number;
  priority?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 will-change-[opacity,transform]"
      style={{
        opacity,
        visibility: opacity > 0.015 ? "visible" : "hidden",
      }}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `scale(${scale}) translate(${x}%, ${y}%)` }}
      >
        <Image src={src} alt={alt} fill priority={priority} sizes="100vw" className="object-cover" />
      </div>
    </div>
  );
}

export function JourneyPhotoLayers() {
  const { progress, phase } = useJourneyScroll();

  const wideOpacity = Math.max(
    journeyEase(journeyLerp(progress, 0.84, 0.96)) * 0.9,
    1 - journeyEase(journeyLerp(progress, 0.05, 0.14))
  );

  const interiorIn = journeyEase(journeyLerp(progress, 0.07, 0.13));
  const interiorOut = journeyEase(journeyLerp(progress, 0.24, 0.3));
  const interiorOpacity = interiorIn * (1 - interiorOut);

  const tapIn = journeyEase(journeyLerp(progress, 0.09, 0.15));
  const tapOut = journeyEase(journeyLerp(progress, 0.24, 0.32));
  const tapOpacity = tapIn * (1 - tapOut);

  const actIIBackdrop = journeyEase(journeyLerp(progress, 0.26, 0.34)) * (1 - journeyEase(journeyLerp(progress, 0.42, 0.48)));
  const actIIIBackdrop = journeyEase(journeyLerp(progress, 0.44, 0.5)) * (1 - journeyEase(journeyLerp(progress, 0.62, 0.68)));

  const serviceIn = journeyEase(journeyLerp(progress, 0.6, 0.7));
  const serviceOut = journeyEase(journeyLerp(progress, 0.82, 0.9));
  const serviceOpacity = serviceIn * (1 - serviceOut);

  const tapZoom = 1.05 + journeyEase(journeyLerp(progress, 0.1, 0.24)) * 0.22;
  const tapPanY = -journeyEase(journeyLerp(progress, 0.1, 0.24)) * 5;
  const actIIIDim = phase === 2 ? 0.55 + journeyEase(journeyLerp(progress, 0.44, 0.52)) * 0.2 : 0;

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#070b10]">
      <PhotoLayer
        src={PHOTOS.wide}
        alt="Neighborhood at dusk"
        opacity={wideOpacity}
        scale={1 + journeyEase(Math.min(1, progress / 0.2)) * 0.08}
        y={0}
        priority
      />
      <PhotoLayer
        src={PHOTOS.interior}
        alt="Home interior"
        opacity={Math.max(interiorOpacity, actIIBackdrop * 0.65, actIIIBackdrop * 0.45)}
        scale={1.06}
        y={-2}
      />
      <PhotoLayer
        src={PHOTOS.tap}
        alt="Leaking kitchen tap"
        opacity={Math.max(tapOpacity, actIIIBackdrop * 0.35)}
        scale={tapZoom}
        y={tapPanY}
      />
      <PhotoLayer
        src={PHOTOS.service}
        alt="Professional fixing a leak"
        opacity={serviceOpacity}
        scale={1.04 + journeyEase(journeyLerp(progress, 0.64, 0.78)) * 0.06}
        y={-3}
      />

      <div className="absolute inset-0 bg-black transition-opacity duration-300" style={{ opacity: actIIIDim }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/15 to-black/65" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-black/30" />
    </div>
  );
}
