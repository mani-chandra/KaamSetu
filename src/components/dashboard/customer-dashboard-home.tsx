"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import { CustomerBookingStatusHint } from "@/components/booking/customer-booking-journey";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import type { BookingStatus } from "@prisma/client";

type BookingItem = {
  id: string;
  title: string;
  status: BookingStatus;
  statusLabel?: string;
  serviceStartOtp?: string | null;
  professional: { user: { name: string | null; image?: string | null } } | null;
  category: { name: string };
};

export function CustomerDashboardHome({
  userName,
  activeCount,
  totalCount,
  savedCount,
  bookings,
}: {
  userName: string | null | undefined;
  activeCount: number;
  totalCount: number;
  savedCount: number;
  bookings: BookingItem[];
}) {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {t.dashboard.welcome}, {userName}
      </h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.activeBookings}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.totalBookings}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t.dashboard.savedProfessionals}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardNav />
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t.dashboard.recentBookings}</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/bookings">{t.common.viewAll}</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  {t.dashboard.noBookingsYet}{" "}
                  <Link href="/search" className="text-brand">
                    {t.dashboard.findProfessional}
                  </Link>
                </p>
              ) : (
                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <Link
                      key={booking.id}
                      href={`/dashboard/bookings/${booking.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 dark:hover:bg-white/5"
                    >
                      <div>
                        <div className="font-medium">{booking.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {booking.professional?.user.name ?? "Open request"} · {booking.category.name}
                        </div>
                        <CustomerBookingStatusHint
                          status={booking.status}
                          serviceStartOtp={booking.serviceStartOtp}
                        />
                      </div>
                      <BookingStatusBadge
                        status={booking.status}
                        label={booking.statusLabel}
                      />
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
