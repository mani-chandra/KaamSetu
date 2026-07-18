import { getCategoryGroups } from "@/lib/categories";
import { ImmersiveBackground } from "@/components/3d/immersive-background";
import { ServicesPageContent } from "@/components/services/services-page-content";

export default async function ServicesPage() {
  const groups = await getCategoryGroups();
  const totalCategories = groups.reduce((n, g) => n + g.categories.length, 0);

  return (
    <div className="page-immersive relative min-h-screen">
      <ImmersiveBackground />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <ServicesPageContent groups={groups} totalCategories={totalCategories} />
      </div>
    </div>
  );
}
