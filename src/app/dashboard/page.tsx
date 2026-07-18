import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CustomerDashboardHome } from "@/components/dashboard/customer-dashboard-home";

export default async function CustomerDashboardPage() {
  const session = await requireAuth(["CUSTOMER", "ADMIN"]);
  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      bookings: {
        include: {
          professional: { include: { user: true } },
          category: true,
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      savedProfessionals: { include: { professional: { include: { user: true } } }, take: 3 },
    },
  });

  const activeBookings =
    customer?.bookings.filter((b) =>
      ["REQUESTED", "QUOTED", "CONFIRMED", "EN_ROUTE", "IN_PROGRESS"].includes(b.status)
    ) ?? [];

  return (
    <CustomerDashboardHome
      userName={session.user.name}
      activeCount={activeBookings.length}
      totalCount={customer?.bookings.length ?? 0}
      savedCount={customer?.savedProfessionals.length ?? 0}
      bookings={customer?.bookings ?? []}
    />
  );
}
