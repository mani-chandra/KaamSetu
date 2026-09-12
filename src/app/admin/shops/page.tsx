import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AdminShopsList } from "@/components/admin/admin-shops-list";

export default async function AdminShopsPage() {
  await requireAuth(["ADMIN"]);

  const shops = await prisma.shopProfile.findMany({
    include: {
      user: true,
      categoryGroup: true,
      categories: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <AdminPageTitle titleKey="shopManagement" />
          <AdminShopsList shops={shops} />
        </div>
      </div>
    </div>
  );
}
