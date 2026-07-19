"use client";

import { useRef, useEffect } from "react";
import { SearchForm } from "@/components/search/search-form";
import { HybridJourneyScene } from "@/components/home/cinematic-journey/hybrid-journey-scene";
import { HomeStreamLayout } from "@/components/home/home-stream-layout";
import { Card3D } from "@/components/3d/card-3d";
import { HomeScrollProvider } from "@/lib/scroll/home-scroll-context";
import { useHomeScroll } from "@/components/home/use-home-scroll";

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  linkUrl: string | null;
  imageUrl: string | null;
};

type Recommendation = {
  id: string;
  avgRating: number;
  reviewCount: number;
  isVerified: boolean;
  user: { name: string | null; image: string | null; city: string | null };
  badges: { label: string }[];
  services: {
    price: number | null;
    minPrice: number | null;
    category: { name: string; slug: string };
  }[];
};

type CategoryGroup = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  categories: { id: string; name: string; imageUrl?: string | null }[];
};

type HomePageClientProps = {
  groups: CategoryGroup[];
  proCount: number;
  completedJobs: number;
  categoryCount: number;
  banners: Banner[];
  recommendations: Recommendation[];
};

function HomeScrollLayout(props: HomePageClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useHomeScroll(containerRef);

  useEffect(() => {
    document.documentElement.classList.add("home-scroll-active");
    document.body.classList.add("home-city-active");
    document.querySelector("main")?.classList.add("home-transparent-main");
    return () => {
      document.documentElement.classList.remove("home-scroll-active");
      document.body.classList.remove("home-city-active");
      document.querySelector("main")?.classList.remove("home-transparent-main");
    };
  }, []);

  return (
    <div id="home-scroll-track" ref={containerRef} className="relative bg-background">
      <section
        id="cinematic-scroll"
        className="relative h-[380svh] sm:h-[420svh] md:h-[450svh] lg:h-[480svh]"
        aria-label="Cinematic introduction"
      >
        <div className="home-journey-sticky sticky w-full overflow-hidden isolate bg-[#070b10]">
          <HybridJourneyScene />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-40 flex flex-col justify-end pb-[max(10vh,3rem)] sm:pb-[12vh] md:pb-[13vh] px-3 sm:px-4">
            <div
              id="home-hero-search"
              className="pointer-events-auto max-w-xl mx-auto w-full min-w-0 opacity-0 translate-y-8"
            >
              <Card3D className="p-1.5 sm:p-2">
                <SearchForm />
              </Card3D>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 bg-background">
        <HomeStreamLayout {...props} />
      </div>
    </div>
  );
}

export function HomePageClient(props: HomePageClientProps) {
  return (
    <HomeScrollProvider>
      <HomeScrollLayout {...props} />
    </HomeScrollProvider>
  );
}
