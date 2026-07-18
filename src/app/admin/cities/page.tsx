import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminCityManager } from "@/components/admin/city-manager";

export default async function AdminCitiesPage() {
  await requireAuth(["ADMIN"]);
  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { serviceAreas: true } } },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Manage Cities</h1>
          <AdminCityManager cities={cities} />
        </div>
      </div>
    </div>
  );
}
