import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PaymentsPage() {
  const session = await requireAuth(["CUSTOMER", "ADMIN"]);
  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
  });

  const payments = customer
    ? await prisma.payment.findMany({
        where: { booking: { customerId: customer.id } },
        include: {
          booking: {
            include: {
              category: true,
              professional: { include: { user: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Payments & Invoices</h1>
          {payments.length === 0 ? (
            <p className="text-muted-foreground">No payments yet.</p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <Card key={payment.id}>
                  <CardHeader className="flex flex-row justify-between pb-2">
                    <CardTitle className="text-base">{payment.booking.title}</CardTitle>
                    <span className="font-semibold text-brand">{formatCurrency(payment.amount)}</span>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">
                    <p>{payment.booking.professional.user.name} · {payment.booking.category.name}</p>
                    <p>Invoice: {payment.invoiceNumber}</p>
                    <p>Status: {payment.status}</p>
                    {payment.paidAt && <p>Paid: {formatDate(payment.paidAt)}</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
