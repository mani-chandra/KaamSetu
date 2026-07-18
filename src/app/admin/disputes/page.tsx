import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AdminDisputeManager } from "@/components/admin/dispute-manager";

export default async function AdminDisputesPage() {
  await requireAuth(["ADMIN"]);
  const disputes = await prisma.dispute.findMany({
    include: {
      booking: {
        include: {
          customer: { include: { user: true } },
          professional: { include: { user: true } },
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <AdminPageTitle titleKey="disputes" />
          <AdminDisputeManager disputes={disputes} />
        </div>
      </div>
    </div>
  );
}
