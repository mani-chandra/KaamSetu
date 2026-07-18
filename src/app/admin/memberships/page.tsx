import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { formatCurrency, asStringArray } from "@/lib/utils";
import { Card3D } from "@/components/3d/card-3d";

export default async function AdminMembershipsPage() {
  await requireAuth(["ADMIN"]);
  const plans = await prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3 space-y-4">
          <h1 className="text-2xl font-bold mb-6">Membership Plans</h1>
          {plans.map((plan) => (
            <Card3D key={plan.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-medium">{plan.name}</div>
                <div className="text-sm text-muted-foreground">{plan.target} · {formatCurrency(plan.price)}/mo</div>
                <div className="text-xs text-muted-foreground mt-1">{asStringArray(plan.features).join(" · ")}</div>
              </div>
              <span className="text-sm">{plan.isActive ? "Active" : "Inactive"}</span>
            </Card3D>
          ))}
          <p className="text-sm text-muted-foreground">Use seed or API to add plans. Customer checkout uses Razorpay.</p>
        </div>
      </div>
    </div>
  );
}
