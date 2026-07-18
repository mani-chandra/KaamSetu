"use client";

import { useI18n } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/translations";

export function AdminPageTitle({
  titleKey,
  descriptionKey,
}: {
  titleKey: keyof TranslationKey["admin"];
  descriptionKey?: keyof TranslationKey["admin"];
}) {
  const { t } = useI18n();
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold">{t.admin[titleKey]}</h1>
      {descriptionKey && (
        <p className="text-muted-foreground mt-1 text-sm">{t.admin[descriptionKey]}</p>
      )}
    </div>
  );
}
