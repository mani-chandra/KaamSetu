import Link from "next/link";
import { Card3D } from "@/components/3d/card-3d";
import { getServiceIcon } from "@/lib/service-icons";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 perspective-scene">
      {categories.map((category, i) => (
        <Link key={category.id} href={`/services/${category.slug}`}>
          <Card3D
            className="p-4 text-center h-full"
            intensity={8 + (i % 3) * 2}
          >
            <div className="text-3xl mb-2 float-3d">{getServiceIcon(category.slug, category.icon)}</div>
            <div className="font-medium text-sm">{category.name}</div>
          </Card3D>
        </Link>
      ))}
    </div>
  );
}
