import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProDashboardNav } from "@/components/layout/dashboard-nav";
import { Badge } from "@/components/ui/badge";
import { asStringArray } from "@/lib/utils";

export default async function ProProfilePage() {
  const session = await requireAuth(["PROFESSIONAL"]);
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { services: { include: { category: true } }, badges: true, portfolio: true },
  });
  if (!pro) return null;

  const skills = asStringArray(pro.skills);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <ProDashboardNav />
        <div className="lg:col-span-3 space-y-6">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <Card>
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{pro.bio}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {skills.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Services</CardTitle></CardHeader>
            <CardContent>
              {pro.services.map((s) => (
                <div key={s.id} className="flex justify-between py-2 border-b last:border-0">
                  <span>{s.category.name}</span>
                  <span>{s.price ? `₹${s.price}` : "Quote based"}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
