"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";
import { Card3D } from "@/components/3d/card-3d";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Star, Users, Clock, Sparkles } from "lucide-react";

type Recommendation = {
  id: string;
  avgRating: number;
  reviewCount: number;
  user: { name: string | null };
  badges: { label: string }[];
};

export function HomeHero() {
  const { t } = useI18n();

  return (
    <>
      <div className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-sm font-medium text-brand mb-6 float-3d">
        <Sparkles className="h-4 w-4" />
        {t.home.badge}
      </div>
      <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
        <span className="shimmer-text">{t.home.headline1}</span>
        <br />
        <span className="text-foreground/90">{t.home.headline2}</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">{t.home.subheadline}</p>
    </>
  );
}

export function HomeStats({
  proCount,
  completedJobs,
  categoryCount,
}: {
  proCount: number;
  completedJobs: number;
  categoryCount: number;
}) {
  const { t } = useI18n();

  const stats = [
    { icon: Users, label: t.home.verifiedProfessionals, value: `${proCount}+` },
    { icon: Star, label: t.home.servicesCompleted, value: `${completedJobs}+` },
    { icon: ShieldCheck, label: t.home.serviceCategories, value: `${categoryCount}+` },
    { icon: Clock, label: t.home.avgResponse, value: "< 1 hr" },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <Card3D key={stat.label} className="p-6 text-center">
              <stat.icon className="h-8 w-8 text-brand mx-auto mb-2" />
              <div className="text-2xl font-bold text-glow">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card3D>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeSections({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const { t } = useI18n();

  const features = [
    { title: t.home.verifiedProfessionals, description: t.home.verifiedDesc },
    { title: "Transparent Reviews", description: t.home.reviewsDesc },
    { title: "Easy Booking", description: t.home.bookingDesc },
  ];

  return (
    <>
      {recommendations.length > 0 && (
        <section className="py-16 border-t border-white/5">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">{t.home.topRated}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((pro) => (
                <Link key={pro.id} href={`/professionals/${pro.id}`}>
                  <Card3D className="p-5 h-full">
                    <div className="font-semibold">{pro.user.name}</div>
                    <div className="flex items-center gap-1 text-sm mt-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {pro.avgRating.toFixed(1)} · {pro.reviewCount} reviews
                    </div>
                    {pro.badges[0] && (
                      <span className="text-xs text-brand mt-2 inline-block">{pro.badges[0].label}</span>
                    )}
                  </Card3D>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">{t.home.whyChoose}</h2>
          <div className="grid md:grid-cols-3 gap-8 perspective-scene">
            {features.map((item) => (
              <Card3D key={item.title} className="p-6">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </Card3D>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <Card3D className="p-12 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">{t.home.ctaTitle}</h2>
            <p className="text-muted-foreground mb-8">{t.home.ctaDesc}</p>
            <Button size="lg" className="animate-pulse-glow" asChild>
              <Link href="/pro/register">{t.home.joinProfessional}</Link>
            </Button>
          </Card3D>
        </div>
      </section>
    </>
  );
}

export function HomeBrowseHeader() {
  const { t } = useI18n();
  return (
    <div>
      <h2 className="text-3xl font-bold">{t.home.browseServices}</h2>
      <p className="text-muted-foreground mt-1">{t.home.browseDesc}</p>
    </div>
  );
}

export function HomeViewAllButton() {
  const { t } = useI18n();
  return (
    <Button variant="outline" className="glass-panel border-white/10" asChild>
      <Link href="/services">{t.home.viewAll}</Link>
    </Button>
  );
}

export function HomeWorkersSection() {
  const { t } = useI18n();
  return (
    <div className="text-center mb-8">
      <h2 className="text-3xl font-bold mb-2">{t.home.meetWorkers}</h2>
      <p className="text-muted-foreground">{t.home.meetWorkersDesc}</p>
    </div>
  );
}
