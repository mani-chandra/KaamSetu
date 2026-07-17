import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProDashboardNav } from "@/components/layout/dashboard-nav";
import { BookingActions } from "@/components/booking/booking-actions";
import { QuoteForm } from "@/components/booking/quote-form";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function ProBookingsPage() {
  const session = await requireAuth(["PROFESSIONAL"]);
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!pro) return null;

  const bookings = await prisma.booking.findMany({
    where: { professionalId: pro.id },
    include: {
      customer: { include: { user: true } },
      category: true,
      quote: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <ProDashboardNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Manage Bookings</h1>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="flex flex-row justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">{booking.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{booking.customer.user.name} · {booking.category.name}</p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </CardHeader>
                <CardContent className="space-y-3">
                  {booking.description && <p className="text-sm">{booking.description}</p>}
                  {booking.scheduledDate && (
                    <p className="text-sm text-muted-foreground">
                      {formatDate(booking.scheduledDate)} at {booking.scheduledTime} · {booking.address}, {booking.city}
                    </p>
                  )}
                  {booking.amount && <p className="text-sm font-medium">{formatCurrency(booking.amount)}</p>}
                  {booking.type === "QUOTE" && booking.status === "REQUESTED" && (
                    <QuoteForm bookingId={booking.id} />
                  )}
                  <BookingActions bookingId={booking.id} status={booking.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
