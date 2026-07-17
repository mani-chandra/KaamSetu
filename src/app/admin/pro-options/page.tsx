import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminProOptionsManager } from "@/components/admin/pro-options-manager";

export default async function AdminProOptionsPage() {
  await requireAuth(["ADMIN"]);

  const [skills, serviceAreas, languages, categories, cities] = await Promise.all([
    prisma.predefinedSkill.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.predefinedServiceArea.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { city: { select: { id: true, name: true } } },
    }),
    prisma.predefinedLanguage.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-2">Pro Options</h1>
          <p className="text-muted-foreground mb-6">
            Skills, service areas, and languages that professionals can select on their profile.
          </p>
          <AdminProOptionsManager
            skills={skills}
            serviceAreas={serviceAreas}
            languages={languages}
            categories={categories}
            cities={cities}
          />
        </div>
      </div>
    </div>
  );
}
