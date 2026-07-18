import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCategoryGroups } from "@/lib/categories";
import { SearchForm } from "@/components/search/search-form";
import { HeroScene } from "@/components/3d/hero-scene";
import { WorkerCharacters } from "@/components/3d/worker-characters";
import { CategoryGroupGrid } from "@/components/services/category-group-grid";
import { Card3D } from "@/components/3d/card-3d";
import {
  HomeHero,
  HomeStats,
  HomeSections,
  HomeBrowseHeader,
  HomeViewAllButton,
  HomeWorkersSection,
} from "@/components/home/home-sections";
import Image from "next/image";

export default async function HomePage() {
  const [groups, stats, banners, recommendations] = await Promise.all([
    getCategoryGroups(),
    Promise.all([
      prisma.professionalProfile.count({ where: { status: "APPROVED" } }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.serviceCategory.count({ where: { isActive: true } }),
    ]),
    prisma.promotionalBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
    prisma.professionalProfile.findMany({
      where: { status: "APPROVED", avgRating: { gte: 4.5 } },
      include: { user: true, badges: true },
      orderBy: { avgRating: "desc" },
      take: 4,
    }),
  ]);

  const [proCount, completedJobs, categoryCount] = stats;

  return (
    <div className="relative">
      <section className="relative min-h-[85vh] flex items-center py-20 overflow-hidden">
        <HeroScene />
        <div className="container mx-auto px-4 text-center relative z-10">
          <HomeHero />
          <div className="max-w-2xl mx-auto perspective-scene">
            <Card3D className="p-2">
              <SearchForm />
            </Card3D>
          </div>
        </div>
      </section>

      <HomeStats
        proCount={proCount}
        completedJobs={completedJobs}
        categoryCount={categoryCount}
      />

      {banners.length > 0 && (
        <section className="py-10 border-y border-white/5">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-4">
            {banners.map((banner) => (
              <Link key={banner.id} href={banner.linkUrl || "/search"}>
                <Card3D className="p-6 h-full overflow-hidden relative">
                  {banner.imageUrl && (
                    <div className="absolute inset-0 opacity-20">
                      <Image src={banner.imageUrl} alt="" fill className="object-cover" />
                    </div>
                  )}
                  <div className="relative">
                    <div className="font-semibold text-brand">{banner.title}</div>
                    {banner.subtitle && (
                      <div className="text-sm text-muted-foreground mt-1">{banner.subtitle}</div>
                    )}
                  </div>
                </Card3D>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="py-16 border-t border-white/5">
        <div className="container mx-auto px-4">
          <HomeWorkersSection />
          <WorkerCharacters />
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <HomeBrowseHeader />
            <HomeViewAllButton />
          </div>
          <CategoryGroupGrid groups={groups} compact />
        </div>
      </section>

      <HomeSections recommendations={recommendations} />
    </div>
  );
}
