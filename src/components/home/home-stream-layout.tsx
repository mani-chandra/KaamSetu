"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { SearchForm } from "@/components/search/search-form";
import { CategoryGroupRibbon } from "@/components/home/category-group-ribbon";
import {
  HomeTrustRail,
  HomeProSpotlight,
  HomeAlternatingBanners,
  HomeInlineCta,
} from "@/components/home/home-post-journey";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

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

function WaveDivider() {
  return (
    <div className="home-wave-divider relative h-8 sm:h-12 md:h-16 lg:h-20 -mt-8 sm:-mt-10 text-background" aria-hidden>
      <svg viewBox="0 0 1440 80" fill="currentColor" className="absolute bottom-0 w-full h-full" preserveAspectRatio="none">
        <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,45 L1440,80 L0,80 Z" />
      </svg>
    </div>
  );
}

export function HomeStreamLayout({
  groups,
  proCount,
  completedJobs,
  categoryCount,
  banners,
  recommendations,
}: {
  groups: CategoryGroup[];
  proCount: number;
  completedJobs: number;
  categoryCount: number;
  banners: Banner[];
  recommendations: Recommendation[];
}) {
  const { t } = useI18n();

  return (
    <div className="home-stream relative bg-background pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <WaveDivider />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
        <div className="home-stream-grid lg:grid lg:grid-cols-[minmax(260px,300px)_1fr] xl:grid-cols-[minmax(280px,340px)_1fr] lg:gap-8 xl:gap-16">
          {/* Desktop sidebar — hidden on mobile & tablet */}
          <aside className="hidden lg:block lg:sticky lg:top-[4.5rem] lg:self-start lg:max-h-[calc(100svh-5.5rem)] lg:overflow-y-auto lg:py-8 xl:py-10 lg:pr-3 xl:pr-4 home-stream-rail border-r border-white/10">
            <HomeTrustRail
              proCount={proCount}
              completedJobs={completedJobs}
              categoryCount={categoryCount}
            />
          </aside>

          {/* Main content stream */}
          <div className="py-8 sm:py-10 lg:py-12 space-y-12 sm:space-y-16 md:space-y-20 min-w-0">
            {/* Bridge + search */}
            <section id="home-bridge" data-scroll-reveal>
              <p className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-brand mb-2 sm:mb-3">
                {t.home.exploreServices}
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-balance max-w-xl">
                {t.home.bridgeTitle}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-3 max-w-lg text-balance">
                {t.home.bridgeSubtitle}
              </p>
              <div className="mt-5 sm:mt-6 max-w-lg rounded-xl ring-1 ring-white/10 overflow-hidden">
                <SearchForm />
              </div>
            </section>

            {/* Mobile + tablet trust strip */}
            <div className="lg:hidden">
              <HomeTrustRail
                compact
                proCount={proCount}
                completedJobs={completedJobs}
                categoryCount={categoryCount}
              />
            </div>

            {/* Horizontal category ribbon */}
            <section id="home-browse">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-6" data-scroll-reveal>
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold">{t.home.browseServices}</h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">{t.home.browseDesc}</p>
                </div>
                <Button variant="ghost" size="sm" className="shrink-0 text-brand self-start sm:self-auto" asChild>
                  <Link href="/services">
                    {t.home.viewAll}
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CategoryGroupRibbon groups={groups} scrollReveal />
            </section>

            <HomeProSpotlight professionals={recommendations} />

            {banners.length > 0 && <HomeAlternatingBanners banners={banners} />}

            <HomeInlineCta />
          </div>
        </div>
      </div>
    </div>
  );
}
