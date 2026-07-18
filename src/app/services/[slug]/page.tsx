import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { asStringArray } from "@/lib/utils";
import { getServiceIcon } from "@/lib/service-icons";
import { ImmersiveBackground } from "@/components/3d/immersive-background";
import { ServiceDetailContent } from "@/components/services/service-detail-content";

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
  const faq = (category.servicePage?.faq as { q: string; a: string }[] | null) ?? [];

  return (
    <div className="page-immersive relative min-h-screen">
      <ImmersiveBackground />
      <div className="container mx-auto px-4 py-12 relative z-10">
      <ServiceDetailContent
        category={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          icon: getServiceIcon(category.slug, category.icon),
          description: category.description,
        }}
        servicePage={category.servicePage}
        professionals={professionals}
        included={included}
        faq={faq}
      />
      </div>
    </div>
  );
}
