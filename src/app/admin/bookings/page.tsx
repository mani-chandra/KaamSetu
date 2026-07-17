import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { formatDate } from "@/lib/utils";

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
          <h1 className="text-2xl font-bold mb-6">All Bookings</h1>
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="flex flex-row justify-between pb-2">
                  <CardTitle className="text-base">{booking.title}</CardTitle>
                  <BookingStatusBadge status={booking.status} />
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>{booking.customer.user.name} → {booking.professional.user.name} · {booking.category.name}</p>
                  <p>{booking.city} · {booking.scheduledDate && formatDate(booking.scheduledDate)}</p>
                  {booking.dispute && <p className="text-red-600 mt-1">Dispute: {booking.dispute.reason}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
