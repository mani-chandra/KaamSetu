"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProDashboardNav } from "@/components/layout/dashboard-nav";
import { BookingStatusBadge } from "@/components/booking/status-badge";
import type { BookingStatus } from "@prisma/client";

type BookingItem = {
  id: string;
  title: string;
  status: BookingStatus;
  customer: { user: { name: string | null } };
};

export function ProDashboardHome({
  userName,
  pendingCount,
  completedJobs,
  avgRating,
  totalEarnings,
  bookings,
}: {
  userName: string | null | undefined;
  pendingCount: number;
  completedJobs: number;
  avgRating: number;
  totalEarnings: number;
  bookings: BookingItem[];
}) {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {t.dashboard.professionalDashboard} — {userName}
      </h1>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t.dashboard.pendingRequests}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t.dashboard.completedJobs}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedJobs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t.dashboard.rating}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t.dashboard.totalEarnings}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalEarnings.toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <ProDashboardNav />
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.recentBookingRequests}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bookings.length === 0 ? (
                <p className="text-muted-foreground text-sm">{t.dashboard.noBookingsYet}</p>
              ) : (
                bookings.map((booking) => (
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

export function ProDashboardPendingReview() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">{t.dashboard.applicationUnderReview}</h1>
      <p className="text-muted-foreground">{t.dashboard.applicationUnderReviewDesc}</p>
    </div>
  );
}

export function ProDashboardNotFound() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <p>
        {t.dashboard.profileNotFound}{" "}
        <Link href="/pro/register" className="text-brand">
          {t.dashboard.completeRegistration}
        </Link>
      </p>
    </div>
  );
}
