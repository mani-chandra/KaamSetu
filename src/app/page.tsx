import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/dashboard-path";
import { prisma } from "@/lib/prisma";
import { getCategoryGroups } from "@/lib/categories";
import { HomePageClient } from "@/components/home/home-page-client";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.role === "ADMIN" || session?.user?.role === "PROFESSIONAL") {
    redirect(getDashboardPath(session.user.role));
  }

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
      include: {
        user: { select: { name: true, image: true, city: true } },
        badges: { take: 1 },
        services: {
          take: 1,
          orderBy: { price: "asc" },
          include: { category: { select: { name: true, slug: true } } },
        },
      },
      orderBy: { avgRating: "desc" },
      take: 8,
    }),
  ]);

  const [proCount, completedJobs, categoryCount] = stats;

  return (
    <HomePageClient
      groups={groups}
      proCount={proCount}
      completedJobs={completedJobs}
      categoryCount={categoryCount}
      banners={banners}
      recommendations={recommendations}
    />
  );
}
