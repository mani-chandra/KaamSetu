import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProDashboardNav } from "@/components/layout/dashboard-nav";
import { ProProfileEditor } from "@/components/pro/profile-editor";

export default async function ProProfilePage() {
  const session = await requireAuth(["PROFESSIONAL"]);
  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      services: { include: { category: true } },
      portfolio: true,
      availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
      user: { select: { name: true, image: true, phone: true, city: true } },
    },
  });
  if (!pro) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <ProDashboardNav />
        <div className="lg:col-span-3 space-y-6">
          <h1 className="text-2xl font-bold">Edit Profile</h1>
          <ProProfileEditor profile={pro} />
        </div>
      </div>
    </div>
  );
}
