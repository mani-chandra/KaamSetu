import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminMembershipsContent } from "@/components/admin/admin-memberships-content";

export default async function AdminMembershipsPage() {
  await requireAuth(["ADMIN"]);
  const plans = await prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <AdminMembershipsContent plans={plans} />
        </div>
      </div>
    </div>
  );
}
