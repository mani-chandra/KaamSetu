import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { ProApprovalActions } from "@/components/admin/pro-approval-actions";
import { Badge } from "@/components/ui/badge";

export default async function AdminProfessionalsPage() {
  await requireAuth(["ADMIN"]);

  const professionals = await prisma.professionalProfile.findMany({
    include: {
      user: true,
      services: { include: { category: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Professional Management</h1>
          <div className="space-y-4">
            {professionals.map((pro) => (
              <Card key={pro.id}>
                <CardHeader className="flex flex-row justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">{pro.user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{pro.user.email} · {pro.user.city}</p>
                  </div>
                  <Badge className={
                    pro.status === "APPROVED" ? "bg-green-100 text-green-800" :
                    pro.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }>{pro.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{pro.bio}</p>
                  <p className="text-sm">Services: {pro.services.map((s) => s.category.name).join(", ")}</p>
                  {pro.status === "PENDING" && (
                    <div className="mt-4">
                      <ProApprovalActions professionalId={pro.id} />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
