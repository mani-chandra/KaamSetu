"use client";

import { useI18n } from "@/lib/i18n/context";

export function SearchResultsHeader({ count }: { count: number }) {
  const { t } = useI18n();
  return (
    <h1 className="text-xl font-semibold">
      {count} {t.search.professionalsFound}
    </h1>
  );
}

export function SearchEmptyState() {
  const { t } = useI18n();
  return <p className="text-muted-foreground">{t.search.noResults}</p>;
}
