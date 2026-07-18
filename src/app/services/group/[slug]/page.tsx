import { notFound } from "next/navigation";
import { getCategoryGroupBySlug } from "@/lib/categories";
import { ImmersiveBackground } from "@/components/3d/immersive-background";
import { GroupPageContent } from "@/components/services/group-page-content";

export default async function CategoryGroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = await getCategoryGroupBySlug(slug);

  if (!group || !group.isActive) notFound();

  return (
    <div className="page-immersive relative min-h-screen">
      <ImmersiveBackground />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <GroupPageContent
          group={{
            name: group.name,
            slug: group.slug,
            icon: group.icon,
            description: group.description,
          }}
          categories={group.categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            icon: c.icon,
            description: c.description,
          }))}
        />
      </div>
    </div>
  );
}
