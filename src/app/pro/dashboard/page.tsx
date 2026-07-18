import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  ProDashboardHome,
  ProDashboardNotFound,
  ProDashboardPendingReview,
} from "@/components/dashboard/pro-dashboard-home";

export default async function ProDashboardPage() {
  const session = await requireAuth(["PROFESSIONAL"]);
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      bookings: {
        include: { customer: { include: { user: true } }, category: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      badges: true,
    },
  });

  if (!pro) {
    return <ProDashboardNotFound />;
  }

  if (pro.status === "PENDING") {
    return <ProDashboardPendingReview />;
  }

  const pendingBookings = pro.bookings.filter((b) => ["REQUESTED", "QUOTED"].includes(b.status));

  const earnings = await prisma.payment.aggregate({
    where: { booking: { professionalId: pro.id }, status: "PAID" },
    _sum: { amount: true },
  });

  return (
    <ProDashboardHome
      userName={session.user.name}
      pendingCount={pendingBookings.length}
      completedJobs={pro.completedJobs}
      avgRating={pro.avgRating}
      totalEarnings={earnings._sum.amount ?? 0}
      bookings={pro.bookings}
    />
  );
}
