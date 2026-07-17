import { prisma } from "@/lib/prisma";
import { CategoryGrid } from "@/components/home/category-grid";

export default async function ServicesPage() {
  const categories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">All Service Categories</h1>
      <p className="text-muted-foreground mb-8">
        Browse every service category on KaamSetu
      </p>
      <CategoryGrid categories={categories} />
    </div>
  );
}
