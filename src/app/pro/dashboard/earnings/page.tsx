import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProDashboardNav } from "@/components/layout/dashboard-nav";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProEarningsPage() {
  const session = await requireAuth(["PROFESSIONAL"]);
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!pro) return null;

  const payments = await prisma.payment.findMany({
    where: { booking: { professionalId: pro.id }, status: "PAID" },
    include: { booking: true },
    orderBy: { paidAt: "desc" },
  });

  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <ProDashboardNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Earnings</h1>
          <Card className="mb-6">
            <CardHeader><CardTitle>Total Earnings</CardTitle></CardHeader>
            <CardContent><div className="text-3xl font-bold text-brand">{formatCurrency(total)}</div></CardContent>
          </Card>
          <div className="space-y-3">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4 flex justify-between">
                  <div>
                    <div className="font-medium">{payment.booking.title}</div>
                    <div className="text-sm text-muted-foreground">{payment.paidAt && formatDate(payment.paidAt)}</div>
                  </div>
                  <div className="font-semibold text-brand">{formatCurrency(payment.amount)}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
