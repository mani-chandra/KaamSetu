import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/layout/dashboard-nav";

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
        <div className="lg:col-span-3 space-y-6">
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>

          <Card>
            <CardHeader><CardTitle>New Signups (30 days)</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold">{recentSignups}</div></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Bookings by Category</CardTitle></CardHeader>
            <CardContent>
              {byCategory.map((item) => (
                <div key={item.categoryId} className="flex justify-between py-2 border-b last:border-0 text-sm">
                  <span>{categoryMap[item.categoryId] || item.categoryId}</span>
                  <span className="font-medium">{item._count.id}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Bookings by City</CardTitle></CardHeader>
            <CardContent>
              {byCity.map((item) => (
                <div key={item.city} className="flex justify-between py-2 border-b last:border-0 text-sm">
                  <span>{item.city}</span>
                  <span className="font-medium">{item._count.id}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
