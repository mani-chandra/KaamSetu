"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { GroupedCategoryExplorer } from "@/components/services/grouped-category-explorer";
import { CategoryGroupGrid } from "@/components/services/category-group-grid";

type Group = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  categories: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    icon: string | null;
  }[];
};

export function ServicesPageContent({
  groups,
  totalCategories,
}: {
  groups: Group[];
  totalCategories: number;
}) {
  const { t } = useI18n();

  return (
    <>
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-4xl md:text-5xl font-bold shimmer-text mb-4">{t.services.pageTitle}</h1>
        <p className="text-muted-foreground text-lg">
          16 {t.services.pageSubtitlePrefix} · {totalCategories} {t.services.pageSubtitleSuffix}
        </p>
      </div>

      <section className="mb-16">
        <h2 className="text-xl font-semibold mb-6">{t.services.browseByGroup}</h2>
        <CategoryGroupGrid groups={groups} />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-6">{t.services.exploreEvery}</h2>
        <GroupedCategoryExplorer groups={groups} />
      </section>

      <p className="text-center text-sm text-muted-foreground mt-12">
        {t.services.cantFind}{" "}
        <Link href="/search" className="text-brand hover:underline">{t.services.searchAll}</Link>
      </p>
    </>
  );
}
