import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfessionalCard } from "@/components/professionals/professional-card";
import { asStringArray } from "@/lib/utils";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const category = await prisma.serviceCategory.findUnique({
    where: { slug },
    include: {
      servicePage: true,
      professionalServices: {
        where: { isActive: true, professional: { status: "APPROVED" } },
        include: {
          professional: {
            include: {
              user: true,
              badges: true,
              services: { include: { category: true } },
            },
          },
        },
      },
    },
  });

  if (!category) notFound();

  const professionals = category.professionalServices.map((ps) => ps.professional);
  const included = asStringArray(category.servicePage?.whatsIncluded);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="text-4xl mb-2">{category.icon}</div>
        <h1 className="text-3xl font-bold">{category.name}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          {category.servicePage?.content || category.description}
        </p>
      </div>

      {included.length > 0 && (
        <div className="mb-8 p-6 bg-slate-50 rounded-lg">
          <h2 className="font-semibold mb-3">What&apos;s included</h2>
          <ul className="grid sm:grid-cols-2 gap-2">
            {included.map((item) => (
              <li key={item} className="text-sm flex items-center gap-2">
                <span className="text-brand">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          Available Professionals ({professionals.length})
        </h2>
        <Button variant="outline" asChild>
          <Link href={`/search?category=${category.slug}`}>Search & Filter</Link>
        </Button>
      </div>

      {professionals.length === 0 ? (
        <p className="text-muted-foreground">No professionals available yet in this category.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((pro) => (
            <ProfessionalCard key={pro.id} professional={pro} categorySlug={category.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
