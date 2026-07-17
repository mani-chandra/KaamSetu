import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { DashboardNav } from "@/components/layout/dashboard-nav";

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

  const activeBookings = customer?.bookings.filter((b) =>
    ["REQUESTED", "QUOTED", "CONFIRMED", "IN_PROGRESS"].includes(b.status)
  ) ?? [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Welcome, {session.user.name}</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Bookings</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{activeBookings.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Bookings</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{customer?.bookings.length ?? 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Saved Professionals</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{customer?.savedProfessionals.length ?? 0}</div></CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardNav />
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/bookings">View all</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {customer?.bookings.length === 0 ? (
                <p className="text-muted-foreground text-sm">No bookings yet. <Link href="/search" className="text-brand">Find a professional</Link></p>
              ) : (
                <div className="space-y-3">
                  {customer?.bookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/dashboard/bookings/${booking.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50"
                    >
                      <div>
                        <div className="font-medium">{booking.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.professional.user.name} · {booking.category.name}
                        </div>
                      </div>
                      <BookingStatusBadge status={booking.status} />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
