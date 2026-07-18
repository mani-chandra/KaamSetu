import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminPageTitle } from "@/components/admin/admin-page-title";
import { AdminBookingsList } from "@/components/admin/admin-bookings-list";

export default async function AdminBookingsPage() {
  await requireAuth(["ADMIN"]);

  const bookings = await prisma.booking.findMany({
    include: {
      customer: { include: { user: true } },
      professional: { include: { user: true } },
      category: true,
      dispute: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <AdminPageTitle titleKey="allBookings" />
          <AdminBookingsList bookings={bookings} />
        </div>
      </div>
    </div>
  );
}
