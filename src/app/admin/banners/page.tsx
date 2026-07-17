import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
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
          <h1 className="text-2xl font-bold mb-6">Promotional Banners</h1>
          <AdminBannerManager banners={banners} />
        </div>
      </div>
    </div>
  );
}
