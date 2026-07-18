import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/layout/dashboard-nav";

export default async function AdminDashboardPage() {
  await requireAuth(["ADMIN"]);

  const [users, professionals, bookings, payments, pendingPros] = await Promise.all([
    prisma.user.count(),
    prisma.professionalProfile.count({ where: { status: "APPROVED" } }),
    prisma.booking.count(),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.professionalProfile.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Users</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{users}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Approved Professionals</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{professionals}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Total Bookings</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">{bookings}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold">₹{payments._sum.amount?.toFixed(0) ?? 0}</div></CardContent>
            </Card>
          </div>
          {pendingPros > 0 && (
            <Card>
              <CardHeader><CardTitle>Pending Approvals</CardTitle></CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{pendingPros} professional(s) awaiting review.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
