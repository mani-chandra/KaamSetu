import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AdminProfessionalsList } from "@/components/admin/admin-professionals-list";

export default async function AdminProfessionalsPage() {
  await requireAuth(["ADMIN"]);

  const professionals = await prisma.professionalProfile.findMany({
    include: {
      user: true,
      services: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <AdminPageTitle titleKey="professionalManagement" />
          <AdminProfessionalsList professionals={professionals} />
        </div>
      </div>
    </div>
  );
}
