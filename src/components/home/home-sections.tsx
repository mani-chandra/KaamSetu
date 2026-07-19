"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

export function HomeBrowseHeader() {
  const { t } = useI18n();
  return (
    <div>
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight">{t.home.browseServices}</h2>
      <p className="text-muted-foreground mt-2 max-w-lg">{t.home.browseDesc}</p>
    </div>
  );
}

export function HomeViewAllButton() {
  const { t } = useI18n();
  return (
    <Button variant="outline" className="glass-panel border-white/10 shrink-0" asChild>
      <Link href="/services">{t.home.viewAll}</Link>
    </Button>
  );
}
