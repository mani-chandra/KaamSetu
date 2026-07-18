import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminServicePageManager } from "@/components/admin/service-page-manager";

export default async function AdminServicePagesPage() {
  await requireAuth(["ADMIN"]);
  const pages = await prisma.servicePage.findMany({
    include: { category: { select: { name: true, slug: true } } },
    orderBy: { category: { sortOrder: "asc" } },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Service Page CMS</h1>
          <AdminServicePageManager pages={pages} />
        </div>
      </div>
    </div>
  );
}
