"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShopDashboardNav } from "@/components/layout/dashboard-nav";

type ShopDashboardHomeProps = {
  userName: string | null | undefined;
  shop: {
    shopName: string;
    slug: string;
    status: string;
    city: string | null;
    address: string | null;
    isVerified: boolean;
    categories: { name: string }[];
    categoryGroup: { name: string };
  };
};

export function ShopDashboardHome({ userName, shop }: ShopDashboardHomeProps) {
  const { t } = useI18n();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {t.dashboard.shopDashboard} — {userName}
      </h1>

      <div className="grid lg:grid-cols-4 gap-8">
        <ShopDashboardNav />
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle>{shop.shopName}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">/{shop.slug}</p>
              </div>
              <Badge
                className={
                  shop.status === "APPROVED"
                    ? "bg-green-100 text-green-800"
                    : shop.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                }
              >
                {shop.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm">
                <span className="text-muted-foreground">{t.shopRegister.categoryGroup}:</span>{" "}
                {shop.categoryGroup.name}
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">{t.admin.servicesLabel}</span>{" "}
                {shop.categories.map((c) => c.name).join(", ")}
              </p>
              {shop.address && (
                <p className="text-sm text-muted-foreground">
                  {shop.address}{shop.city ? `, ${shop.city}` : ""}
                </p>
              )}
              {shop.isVerified && (
                <p className="text-sm text-brand font-medium">{t.dashboard.shopVerified}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.shopGettingStarted}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{t.dashboard.shopGettingStartedDesc}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function ShopDashboardPendingReview() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">{t.dashboard.applicationUnderReview}</h1>
      <p className="text-muted-foreground">{t.dashboard.shopApplicationUnderReviewDesc}</p>
    </div>
  );
}

export function ShopDashboardNotFound() {
  const { t } = useI18n();
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <p>
        {t.dashboard.shopProfileNotFound}{" "}
        <Link href="/shop/register" className="text-brand">
          {t.dashboard.completeRegistration}
        </Link>
      </p>
    </div>
  );
}
