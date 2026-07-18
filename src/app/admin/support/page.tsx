import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AdminSupportManager } from "@/components/admin/support-manager";

export default async function AdminSupportPage() {
  await requireAuth(["ADMIN"]);
  const tickets = await prisma.supportTicket.findMany({
    include: { user: { select: { name: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <AdminPageTitle titleKey="supportTickets" />
          <AdminSupportManager tickets={tickets.map((t) => ({ ...t, createdAt: t.createdAt.toISOString() }))} />
        </div>
      </div>
    </div>
  );
}
