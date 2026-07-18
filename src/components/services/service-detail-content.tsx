"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfessionalCard } from "@/components/professionals/professional-card";
import { useI18n } from "@/lib/i18n/context";

type Professional = Parameters<typeof ProfessionalCard>[0]["professional"];

export function ServiceDetailContent({
  category,
  servicePage,
  professionals,
  included,
  faq,
}: {
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    description: string | null;
  };
  servicePage: {
    headline: string | null;
    content: string | null;
    pricingGuidance: string | null;
  } | null;
  professionals: Professional[];
  included: string[];
  faq: { q: string; a: string }[];
}) {
  const { t } = useI18n();

  return (
    <>
      <div className="mb-8">
        <div className="text-4xl mb-2 float-3d">{category.icon}</div>
        <h1 className="text-3xl font-bold">{servicePage?.headline || category.name}</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          {servicePage?.content || category.description}
        </p>
        {servicePage?.pricingGuidance && (
          <p className="text-sm text-brand mt-3 glass-panel inline-block px-4 py-2 rounded-lg">
            {servicePage.pricingGuidance}
          </p>
        )}
      </div>

      {included.length > 0 && (
        <div className="mb-8 p-6 glass-panel rounded-xl">
          <h2 className="font-semibold mb-3">{t.services.whatsIncluded}</h2>
          <ul className="grid sm:grid-cols-2 gap-2">
            {included.map((item) => (
              <li key={item} className="text-sm flex items-center gap-2">
                <span className="text-brand">✓</span> {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {faq.length > 0 && (
        <div className="mb-8 glass-panel rounded-xl p-6">
          <h2 className="font-semibold mb-4">{t.services.faq}</h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <div key={item.q}>
                <p className="font-medium text-sm">{item.q}</p>
                <p className="text-sm text-muted-foreground mt-1">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {t.services.availableProfessionals} ({professionals.length})
        </h2>
        <Button variant="outline" className="glass-panel" asChild>
          <Link href={`/search?category=${category.slug}`}>{t.services.searchFilter}</Link>
        </Button>
      </div>

      {professionals.length === 0 ? (
        <p className="text-muted-foreground">{t.services.noProfessionals}</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professionals.map((pro) => (
            <ProfessionalCard key={pro.id} professional={pro} categorySlug={category.slug} />
          ))}
        </div>
      )}
    </>
  );
}
