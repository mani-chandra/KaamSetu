import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AdminBannerManager } from "@/components/admin/banner-manager";

export default async function AdminBannersPage() {
  await requireAuth(["ADMIN"]);

  const banners = await prisma.promotionalBanner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <AdminPageTitle titleKey="promotionalBanners" />
          <AdminBannerManager banners={banners} />
        </div>
      </div>
    </div>
  );
}
