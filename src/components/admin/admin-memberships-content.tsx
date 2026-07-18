"use client";

import { useI18n } from "@/lib/i18n/context";
import { formatCurrency, asStringArray } from "@/lib/utils";
import { Card3D } from "@/components/3d/card-3d";
import { AdminPageTitle } from "@/components/admin/admin-page-title";

type Plan = {
  id: string;
  name: string;
  target: string;
  price: number;
  features: unknown;
  isActive: boolean;
};

export function AdminMembershipsContent({ plans }: { plans: Plan[] }) {
  const { t } = useI18n();

  return (
    <div className="space-y-4">
      <AdminPageTitle titleKey="membershipPlans" />
      {plans.map((plan) => (
        <Card3D key={plan.id} className="p-4 flex justify-between items-center">
          <div>
            <div className="font-medium">{plan.name}</div>
            <div className="text-sm text-muted-foreground">
              {plan.target} · {formatCurrency(plan.price)}
              {t.admin.perMonth}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {asStringArray(plan.features).join(" · ")}
            </div>
          </div>
          <span className="text-sm">{plan.isActive ? t.admin.active : t.admin.inactive}</span>
        </Card3D>
      ))}
      <p className="text-sm text-muted-foreground">{t.admin.membershipsSeedHint}</p>
    </div>
  );
}
