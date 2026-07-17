import { prisma } from "@/lib/prisma";
import { SearchForm } from "@/components/search/search-form";
import { SearchFilters } from "@/components/search/search-filters";
import { ProfessionalCard } from "@/components/professionals/professional-card";
import { Prisma } from "@prisma/client";

type SearchParams = {
  q?: string;
  city?: string;
  category?: string;
  minRating?: string;
  minExperience?: string;
  language?: string;
  sort?: string;
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const where: Prisma.ProfessionalProfileWhereInput = {
    status: "APPROVED",
  };

  if (params.city) {
    where.user = { city: { contains: params.city } };
  }
  if (params.minRating) {
    where.avgRating = { gte: parseFloat(params.minRating) };
  }
  if (params.minExperience) {
    where.experienceYears = { gte: parseInt(params.minExperience) };
  }
  if (params.language) {
    where.bio = { contains: params.language };
  }
  if (params.category) {
    where.services = { some: { category: { slug: params.category } } };
  }
  if (params.q) {
    where.OR = [
      { bio: { contains: params.q } },
      { user: { name: { contains: params.q } } },
      { services: { some: { category: { name: { contains: params.q } } } } },
    ];
  }

  const orderBy: Prisma.ProfessionalProfileOrderByWithRelationInput =
    params.sort === "experience"
      ? { experienceYears: "desc" }
      : params.sort === "jobs"
      ? { completedJobs: "desc" }
      : { avgRating: "desc" };

  const [professionals, categories, cities] = await Promise.all([
    prisma.professionalProfile.findMany({
      where,
      orderBy,
      include: {
        user: true,
        badges: true,
        services: { include: { category: true } },
      },
    }),
    prisma.serviceCategory.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchForm defaultQuery={params.q} defaultCity={params.city} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <SearchFilters categories={categories} cities={cities} currentParams={params} />
        </aside>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold">
              {professionals.length} professional{professionals.length !== 1 ? "s" : ""} found
            </h1>
          </div>

          {professionals.length === 0 ? (
            <p className="text-muted-foreground">No professionals match your search. Try adjusting filters.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {professionals.map((pro) => (
                <ProfessionalCard key={pro.id} professional={pro} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
