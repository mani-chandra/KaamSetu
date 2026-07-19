import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CustomerDashboardHome } from "@/components/dashboard/customer-dashboard-home";
import { getServerTranslations } from "@/lib/i18n/server";

export default async function CustomerDashboardPage() {
  const session = await requireAuth(["CUSTOMER", "ADMIN"]);
  const t = await getServerTranslations();
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
      bookings={(customer?.bookings ?? []).map((booking) => ({
        id: booking.id,
        title: booking.title,
        status: booking.status,
        statusLabel: t.bookingStatus[booking.status],
        serviceStartOtp: booking.serviceStartOtp,
        professional: booking.professional
          ? {
              user: {
                name: booking.professional.user.name,
                image: booking.professional.user.image,
              },
            }
          : null,
        category: { name: booking.category.name },
      }))}
    />
  );
}
