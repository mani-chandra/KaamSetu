import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminNav } from "@/components/layout/dashboard-nav";
import { AdminCategoryManager } from "@/components/admin/category-manager";

export default async function AdminCategoriesPage() {
  await requireAuth(["ADMIN"]);

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <AdminNav />
        <div className="lg:col-span-3">
          <h1 className="text-2xl font-bold mb-6">Manage Categories</h1>
          <AdminCategoryManager categories={categories} />
        </div>
      </div>
    </div>
  );
}
