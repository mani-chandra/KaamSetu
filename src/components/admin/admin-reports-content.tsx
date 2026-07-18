"use client";

import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminPageTitle } from "@/components/admin/admin-page-title";

export function AdminReportsContent({
  recentSignups,
  byCategory,
  byCity,
  categoryMap,
}: {
  recentSignups: number;
  byCategory: { categoryId: string; _count: { id: number } }[];
  byCity: { city: string | null; _count: { id: number } }[];
  categoryMap: Record<string, string>;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <AdminPageTitle titleKey="reportsAnalytics" />
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.newSignups30Days}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{recentSignups}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.bookingsByCategory}</CardTitle>
        </CardHeader>
        <CardContent>
          {byCategory.map((item) => (
            <div key={item.categoryId} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span>{categoryMap[item.categoryId] || item.categoryId}</span>
              <span className="font-medium">{item._count.id}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t.admin.bookingsByCity}</CardTitle>
        </CardHeader>
        <CardContent>
          {byCity.map((item) => (
            <div key={item.city} className="flex justify-between py-2 border-b last:border-0 text-sm">
              <span>{item.city}</span>
              <span className="font-medium">{item._count.id}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
