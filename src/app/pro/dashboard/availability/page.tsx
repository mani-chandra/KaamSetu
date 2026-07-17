import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProDashboardNav } from "@/components/layout/dashboard-nav";
import { Button } from "@/components/ui/button";
import { asStringArray } from "@/lib/utils";
import { AVAILABILITY_DAYS } from "@/components/pro/availability-editor";

export default async function ProAvailabilityPage() {
  const session = await requireAuth(["PROFESSIONAL"]);
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } },
  });
  if (!pro) return null;

  const serviceAreas = asStringArray(pro.serviceAreas);

  const byDay = AVAILABILITY_DAYS.map((_, dayOfWeek) => ({
    day: AVAILABILITY_DAYS[dayOfWeek],
    slots: pro.availability.filter((a) => a.dayOfWeek === dayOfWeek && a.isAvailable),
  })).filter((d) => d.slots.length > 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <ProDashboardNav />
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Availability</h1>
            <Button asChild>
              <Link href="/pro/dashboard/profile">Edit schedule</Link>
            </Button>
          </div>
          <Card>
            <CardHeader><CardTitle>Working Hours</CardTitle></CardHeader>
            <CardContent>
              {byDay.length === 0 ? (
                <p className="text-muted-foreground">No availability set. Add time blocks in your profile.</p>
              ) : (
                <div className="space-y-4">
                  {byDay.map(({ day, slots }) => (
                    <div key={day}>
                      <div className="font-medium text-sm mb-1">{day}</div>
                      <div className="space-y-1 pl-3 border-l-2 border-brand/30">
                        {slots.map((slot) => (
                          <div key={slot.id} className="text-sm text-muted-foreground">
                            {slot.startTime} – {slot.endTime}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-4">
                Multiple blocks per day let you schedule breaks (e.g. 9–12 and 2–6 with lunch off).
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Service Areas</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <span key={area} className="text-sm bg-slate-100 px-2 py-1 rounded">{area}</span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
