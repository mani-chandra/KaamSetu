"use client";

import { useI18n } from "@/lib/i18n/context";

export function ProProfilePageHeader() {
  const { t } = useI18n();
  return <h1 className="text-2xl font-bold">{t.dashboard.editProfile}</h1>;
}
