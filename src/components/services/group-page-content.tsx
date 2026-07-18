"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Card3D } from "@/components/3d/card-3d";
import { CategoryGrid } from "@/components/home/category-grid";
import { useI18n } from "@/lib/i18n/context";
import { getServiceIcon } from "@/lib/service-icons";

type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
};

export function GroupPageContent({
  group,
  categories,
}: {
  group: {
    name: string;
    slug: string;
    icon: string | null;
    description: string | null;
  };
  categories: Category[];
}) {
  const { t } = useI18n();

  return (
    <>
      <Link
        href="/services"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-brand mb-8"
      >
        <ChevronLeft className="h-4 w-4" /> {t.services.pageTitle}
      </Link>

      <Card3D className="p-8 mb-10 text-center max-w-3xl mx-auto">
        <div className="text-5xl mb-4 float-3d inline-block">{group.icon || "🔧"}</div>
        <h1 className="text-3xl md:text-4xl font-bold shimmer-text mb-3">{group.name}</h1>
        {group.description && <p className="text-muted-foreground">{group.description}</p>}
        <p className="text-sm text-brand mt-4 font-medium">
          {categories.length} {t.services.servicesAvailable}
        </p>
      </Card3D>

      <CategoryGrid
        categories={categories.map((c) => ({
          ...c,
          icon: getServiceIcon(c.slug, c.icon),
        }))}
      />
    </>
  );
}
