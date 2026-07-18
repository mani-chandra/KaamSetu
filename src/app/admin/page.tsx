import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminDashboardHome } from "@/components/admin/admin-dashboard-home";

export default async function AdminDashboardPage() {
  await requireAuth(["ADMIN"]);

  const [users, professionals, bookings, payments, pendingPros] = await Promise.all([
    prisma.user.count(),
    prisma.professionalProfile.count({ where: { status: "APPROVED" } }),
    prisma.booking.count(),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.professionalProfile.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <AdminDashboardHome
      users={users}
      professionals={professionals}
      bookings={bookings}
      revenue={payments._sum.amount ?? 0}
      pendingPros={pendingPros}
    />
  );
}
