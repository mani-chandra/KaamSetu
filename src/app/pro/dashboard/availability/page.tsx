import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProDashboardNav } from "@/components/layout/dashboard-nav";
import { asStringArray } from "@/lib/utils";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default async function ProAvailabilityPage() {
  const session = await requireAuth(["PROFESSIONAL"]);
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { availability: { orderBy: { dayOfWeek: "asc" } } },
  });
  if (!pro) return null;

  const serviceAreas = asStringArray(pro.serviceAreas);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <ProDashboardNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Availability</h1>
          <Card>
            <CardHeader><CardTitle>Working Hours</CardTitle></CardHeader>
            <CardContent>
              {pro.availability.length === 0 ? (
                <p className="text-muted-foreground">No availability set.</p>
              ) : (
                <div className="space-y-2">
                  {pro.availability.map((a) => (
                    <div key={a.id} className="flex justify-between text-sm">
                      <span>{days[a.dayOfWeek]}</span>
                      <span>{a.startTime} - {a.endTime}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6">
                <h4 className="font-medium mb-2">Service Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {serviceAreas.map((area) => (
                    <span key={area} className="text-sm bg-slate-100 px-2 py-1 rounded">{area}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
