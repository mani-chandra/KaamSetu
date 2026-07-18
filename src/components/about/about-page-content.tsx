"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card3D } from "@/components/3d/card-3d";
import { useI18n } from "@/lib/i18n/context";
import { ShieldCheck, Users, Zap, Globe } from "lucide-react";

export function AboutPageContent() {
  const { t } = useI18n();

  const items = [
    { icon: ShieldCheck, title: t.about.trustFirst, text: t.about.trustFirstDesc },
    { icon: Users, title: t.about.marketplace, text: t.about.marketplaceDesc },
    { icon: Zap, title: t.about.booking, text: t.about.bookingDesc },
    { icon: Globe, title: t.about.coverage, text: t.about.coverageDesc },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl relative z-10">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold shimmer-text mb-4">{t.about.title}</h1>
        <p className="text-muted-foreground text-lg">{t.about.subtitle}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-12">
        {items.map((item) => (
          <Card3D key={item.title} className="p-6">
            <item.icon className="h-8 w-8 text-brand mb-3" />
            <h2 className="font-semibold text-lg mb-2">{item.title}</h2>
            <p className="text-sm text-muted-foreground">{item.text}</p>
          </Card3D>
        ))}
      </div>

      <Card3D className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">{t.about.readyTitle}</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          <Button asChild><Link href="/search">{t.about.findProfessional}</Link></Button>
          <Button variant="outline" className="glass-panel" asChild>
            <Link href="/pro/register">{t.about.joinProfessional}</Link>
          </Button>
        </div>
      </Card3D>
    </div>
  );
}
