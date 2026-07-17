import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Link key={category.id} href={`/services/${category.slug}`}>
          <Card className="hover:border-brand hover:shadow-md transition-all h-full">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{category.icon || "🔧"}</div>
              <div className="font-medium text-sm">{category.name}</div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
