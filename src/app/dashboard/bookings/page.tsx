import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { CustomerBookingStatusHint } from "@/components/booking/customer-booking-journey";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function CustomerBookingsPage() {
  const session = await requireAuth(["CUSTOMER", "ADMIN"]);
  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });

  const bookings = customer
    ? await prisma.booking.findMany({
        where: { customerId: customer.id },
        include: {
          professional: { include: { user: true } },
          category: true,
          payment: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">
                      <Link href={`/dashboard/bookings/${booking.id}`} className="hover:text-brand">
                        {booking.title}
                      </Link>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {booking.professional?.user.name ?? "Open request"} · {booking.category.name}
                    </p>
                    <CustomerBookingStatusHint
                      status={booking.status}
                      serviceStartOtp={booking.serviceStartOtp}
                    />
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {booking.scheduledDate && (
                    <p>Scheduled: {formatDate(booking.scheduledDate)} at {booking.scheduledTime}</p>
                  )}
                  {booking.amount && <p>Amount: {formatCurrency(booking.amount)}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
