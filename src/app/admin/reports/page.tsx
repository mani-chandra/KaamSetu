import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminReportsContent } from "@/components/admin/admin-reports-content";

export default async function AdminReportsPage() {
  await requireAuth(["ADMIN"]);

  const [byCategory, byCity, recentSignups] = await Promise.all([
    prisma.booking.groupBy({
      by: ["categoryId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.booking.groupBy({
      by: ["city"],
      _count: { id: true },
      where: { city: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  const categories = await prisma.serviceCategory.findMany();
  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <AdminReportsContent
            recentSignups={recentSignups}
            byCategory={byCategory}
            byCity={byCity}
            categoryMap={categoryMap}
          />
        </div>
      </div>
    </div>
  );
}
