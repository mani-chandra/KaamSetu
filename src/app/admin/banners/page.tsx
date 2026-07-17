import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { Badge } from "@/components/ui/badge";

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
          <div className="space-y-4">
            {banners.map((banner) => (
              <Card key={banner.id}>
                <CardHeader className="flex flex-row justify-between pb-2">
                  <CardTitle className="text-base">{banner.title}</CardTitle>
                  <Badge className={banner.isActive ? "bg-green-100 text-green-800" : "bg-gray-100"}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {banner.subtitle && <p>{banner.subtitle}</p>}
                  {banner.linkUrl && <p>Link: {banner.linkUrl}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
