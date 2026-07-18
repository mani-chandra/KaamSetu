"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/layout/dashboard-nav";

export function AdminDashboardHome({
  users,
  professionals,
  bookings,
  revenue,
  pendingPros,
}: {
  users: number;
  professionals: number;
  bookings: number;
  revenue: number;
  pendingPros: number;
}) {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{t.dashboard.adminDashboard}</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t.dashboard.totalUsers}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t.dashboard.approvedProfessionals}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{professionals}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t.dashboard.totalBookings}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t.dashboard.revenue}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{revenue.toFixed(0)}</div>
              </CardContent>
            </Card>
          </div>
          {pendingPros > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t.dashboard.pendingApprovals}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {pendingPros} {t.admin.awaitingReviewCount}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
