import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProDashboardNav } from "@/components/layout/dashboard-nav";
import { BookingStatusBadge } from "@/components/booking/status-badge";

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
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p>Professional profile not found. <Link href="/pro/register" className="text-brand">Complete registration</Link></p>
      </div>
    );
  }

  if (pro.status === "PENDING") {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Application Under Review</h1>
        <p className="text-muted-foreground">Your professional profile is being reviewed by our admin team. You&apos;ll receive a notification once approved.</p>
      </div>
    );
  }

  const pendingBookings = pro.bookings.filter((b) =>
    ["REQUESTED", "QUOTED"].includes(b.status)
  );

  const earnings = await prisma.payment.aggregate({
    where: { booking: { professionalId: pro.id }, status: "PAID" },
    _sum: { amount: true },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pro Dashboard — {session.user.name}</h1>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Pending Requests</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingBookings.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Completed Jobs</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{pro.completedJobs}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Rating</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{pro.avgRating.toFixed(1)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Total Earnings</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{earnings._sum.amount?.toFixed(0) ?? 0}</div></CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <ProDashboardNav />
        <div className="lg:col-span-3">
          <Card>
            <CardHeader><CardTitle>Recent Booking Requests</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {pro.bookings.length === 0 ? (
                <p className="text-muted-foreground text-sm">No bookings yet.</p>
              ) : (
                pro.bookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href="/pro/dashboard/bookings"
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <div className="font-medium">{booking.title}</div>
                      <div className="text-sm text-muted-foreground">{booking.customer.user.name}</div>
                    </div>
                    <BookingStatusBadge status={booking.status} />
                  </Link>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
