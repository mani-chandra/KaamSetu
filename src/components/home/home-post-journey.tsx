"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, ShieldCheck, MapPin, ArrowRight, Clock, Search, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

type HomePro = {
  id: string;
  avgRating: number;
  reviewCount: number;
  isVerified: boolean;
  user: { name: string | null; image: string | null; city: string | null };
  badges: { label: string }[];
  services: {
    price: number | null;
    minPrice: number | null;
    category: { name: string; slug: string };
  }[];
};

function AnimatedStat({ target, active }: { target: number; active: boolean }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!active) return;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 1200);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active]);

  return <>{display}+</>;
}

export function HomeTrustSidebar({
  proCount,
  completedJobs,
  categoryCount,
}: {
  proCount: number;
  completedJobs: number;
  categoryCount: number;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [countActive, setCountActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const steps = [
    { icon: Search, title: t.home.stepSearch, desc: t.home.stepSearchDesc },
    { icon: Users, title: t.home.stepCompare, desc: t.home.stepCompareDesc },
    { icon: Clock, title: t.home.stepBook, desc: t.home.stepBookDesc },
  ];

  const stats = [
    { target: proCount, label: t.home.verifiedProfessionals },
    { target: completedJobs, label: t.home.servicesCompleted },
    { target: categoryCount, label: t.home.serviceCategories },
  ];

  return (
    <div ref={ref} id="home-trust" className="space-y-5 home-trust-sidebar" data-scroll-reveal>
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-brand/10 to-transparent p-6">
        <h2 className="text-2xl font-bold mb-2">{t.home.trustBandTitle}</h2>
        <p className="text-sm text-muted-foreground">{t.home.howItWorks}</p>
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => (
          <div
            key={step.title}
            data-scroll-card
            className={cn(
              "rounded-xl border border-white/10 bg-white/[0.03] p-4 flex gap-3",
              i === 1 && "md:translate-x-4",
              i === 2 && "md:translate-x-2"
            )}
          >
            <div className="h-9 w-9 shrink-0 rounded-lg bg-brand/15 flex items-center justify-center">
              <step.icon className="h-4 w-4 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <div
            key={stat.label}
            data-scroll-card
            className="rounded-xl border border-white/10 bg-card/50 p-3 text-center col-span-1"
          >
            <div className="text-xl font-bold text-glow tabular-nums">
              <AnimatedStat target={stat.target} active={countActive} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 leading-tight">{stat.label}</div>
          </div>
        ))}
        <div data-scroll-card className="rounded-xl border border-white/10 bg-card/50 p-3 text-center col-span-2">
          <div className="text-xl font-bold text-glow">&lt; 1 hr</div>
          <div className="text-[10px] text-muted-foreground mt-1">{t.home.avgResponse}</div>
        </div>
      </div>

      <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-muted-foreground leading-relaxed">
        {t.home.verifiedDesc}
      </div>
    </div>
  );
}

function ProCard({ pro, className }: { pro: HomePro; className?: string }) {
  const { t } = useI18n();
  const service = pro.services[0];
  const priceLabel = service?.price
    ? formatCurrency(service.price)
    : service?.minPrice
      ? `From ${formatCurrency(service.minPrice)}`
      : null;

  return (
    <article
      data-scroll-card
      className={cn(
        "home-pro-card rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent overflow-hidden group max-w-lg",
        className
      )}
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative h-14 w-14 shrink-0 rounded-full overflow-hidden ring-2 ring-brand/30 bg-muted">
            {pro.user.image ? (
              <Image src={pro.user.image} alt={pro.user.name || ""} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-brand">
                {pro.user.name?.[0] || "P"}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold truncate">{pro.user.name}</h3>
              {pro.isVerified && <ShieldCheck className="h-4 w-4 text-brand shrink-0" />}
            </div>
            {service?.category && (
              <p className="text-xs text-brand mt-0.5 truncate">{service.category.name}</p>
            )}
            <div className="flex items-center gap-1 text-sm mt-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{pro.avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                · {pro.reviewCount} {t.common.reviews}
              </span>
            </div>
          </div>
        </div>

        {pro.user.city && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
            <MapPin className="h-3 w-3 shrink-0" />
            {pro.user.city}
          </p>
        )}

        {pro.badges[0] && (
          <Badge className="mt-3 bg-brand/10 text-brand border-brand/20 text-[10px]">{pro.badges[0].label}</Badge>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 pt-4 border-t border-white/10">
          {priceLabel ? (
            <span className="text-sm font-semibold text-brand">{priceLabel}</span>
          ) : (
            <span className="text-xs text-muted-foreground">{t.book.getQuote}</span>
          )}
          <div className="flex flex-col min-[400px]:flex-row gap-2 w-full sm:w-auto">
            <Button variant="ghost" size="sm" className="h-9 px-3 text-xs w-full min-[400px]:w-auto" asChild>
              <Link href={`/professionals/${pro.id}`}>{t.home.viewProfile}</Link>
            </Button>
            <Button size="sm" className="h-9 text-xs w-full min-[400px]:w-auto" asChild>
              <Link
                href={`/book?pro=${pro.id}${service?.category ? `&category=${service.category.slug}` : ""}`}
              >
                {t.home.bookNow}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function HomeProZigzag({ professionals }: { professionals: HomePro[] }) {
  const { t } = useI18n();

  if (professionals.length === 0) return null;

  return (
    <div id="home-recommendations" className="min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 pr-0 md:pr-8" data-scroll-reveal>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold">{t.home.topRated}</h2>
          <p className="text-muted-foreground mt-2 text-sm max-w-md">{t.home.topRatedDesc}</p>
        </div>
        <Button variant="outline" size="sm" className="glass-panel border-white/10 shrink-0" asChild>
          <Link href="/search">
            {t.common.viewAll}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="space-y-6 md:space-y-8">
        {professionals.slice(0, 6).map((pro, i) => (
          <ProCard
            key={pro.id}
            pro={pro}
            className={cn(
              "w-full md:w-[88%]",
              i % 2 === 0 ? "md:ml-auto md:mr-0" : "md:ml-0 md:mr-auto",
              i % 3 === 1 && "md:translate-x-6",
              i % 3 === 2 && "md:-translate-x-2"
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function HomeInlineCta() {
  const { t } = useI18n();

  return (
    <section id="home-cta" className="rounded-2xl border border-white/10 bg-gradient-to-r from-brand/10 via-transparent to-brand/5 p-5 sm:p-8 md:p-10" data-scroll-reveal>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 md:gap-6">
        <div className="max-w-lg">
          <h2 className="text-xl sm:text-2xl font-bold">{t.home.findAPro}</h2>
          <p className="text-sm text-muted-foreground mt-2">{t.home.findAProDesc}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/search">{t.home.exploreServices}</Link>
          </Button>
          <Button size="lg" variant="outline" className="border-white/15 w-full sm:w-auto" asChild>
            <Link href="/pro/register">{t.home.joinProfessional}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function HomeTrustRail({
  proCount,
  completedJobs,
  categoryCount,
  compact = false,
}: {
  proCount: number;
  completedJobs: number;
  categoryCount: number;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const [countActive, setCountActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const steps = [
    { n: "1", title: t.home.stepSearch, desc: t.home.stepSearchDesc },
    { n: "2", title: t.home.stepCompare, desc: t.home.stepCompareDesc },
    { n: "3", title: t.home.stepBook, desc: t.home.stepBookDesc },
  ];

  const stats = [
    { target: proCount, label: t.home.verifiedProfessionals },
    { target: completedJobs, label: t.home.servicesCompleted },
    { target: categoryCount, label: t.home.serviceCategories },
    { static: "< 1 hr", label: t.home.avgResponse },
  ];

  if (compact) {
    return (
      <div
        ref={ref}
        id="home-trust-compact"
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 space-y-4"
        data-scroll-reveal
      >
        <div>
          <h2 className="text-lg sm:text-xl font-bold">{t.home.trustBandTitle}</h2>
          <p className="text-xs text-muted-foreground mt-1">{t.home.howItWorks}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-2.5 sm:p-3 text-center"
              data-scroll-card
            >
              <div className="mx-auto mb-1.5 h-7 w-7 rounded-full border border-brand/40 bg-brand/10 flex items-center justify-center text-[10px] font-bold text-brand">
                {step.n}
              </div>
              <h3 className="font-semibold text-[11px] sm:text-xs leading-tight">{step.title}</h3>
              <p className="hidden sm:block text-[10px] text-muted-foreground mt-1 line-clamp-2">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              data-scroll-card
              className="rounded-lg border border-white/10 bg-card/40 px-2 py-2.5 text-center"
            >
              <div className="text-base sm:text-lg font-bold text-glow tabular-nums leading-none">
                {"static" in stat ? stat.static : <AnimatedStat target={stat.target} active={countActive} />}
              </div>
              <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-1 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} id="home-trust" className="space-y-6 xl:space-y-8" data-scroll-reveal>
      <div>
        <h2 className="text-xl font-bold leading-tight">{t.home.trustBandTitle}</h2>
        <p className="text-xs text-muted-foreground mt-2">{t.home.howItWorks}</p>
      </div>

      <div className="home-rail-timeline space-y-0">
        {steps.map((step, i) => (
          <div key={step.n} className="home-rail-step relative flex gap-4 pb-8 last:pb-0" data-scroll-card>
            {i < steps.length - 1 && (
              <span className="absolute left-[15px] top-8 bottom-0 w-px bg-gradient-to-b from-brand/40 to-transparent" />
            )}
            <div className="h-8 w-8 shrink-0 rounded-full border border-brand/40 bg-brand/10 flex items-center justify-center text-xs font-bold text-brand">
              {step.n}
            </div>
            <div className="pt-0.5">
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-2 border-t border-white/10">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.home.verifiedProfessionals}</span>
          <span className="font-bold tabular-nums text-glow">
            <AnimatedStat target={proCount} active={countActive} />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.home.servicesCompleted}</span>
          <span className="font-bold tabular-nums text-glow">
            <AnimatedStat target={completedJobs} active={countActive} />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.home.serviceCategories}</span>
          <span className="font-bold tabular-nums text-glow">
            <AnimatedStat target={categoryCount} active={countActive} />
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t.home.avgResponse}</span>
          <span className="font-bold text-glow">&lt; 1 hr</span>
        </div>
      </div>
    </div>
  );
}

export function HomeProSpotlight({ professionals }: { professionals: HomePro[] }) {
  const { t } = useI18n();

  if (professionals.length === 0) return null;

  const [featured, ...rest] = professionals;
  const service = featured.services[0];
  const priceLabel = service?.price
    ? formatCurrency(service.price)
    : service?.minPrice
      ? `From ${formatCurrency(service.minPrice)}`
      : null;

  return (
    <section id="home-recommendations">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-6" data-scroll-reveal>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold">{t.home.topRated}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">{t.home.topRatedDesc}</p>
        </div>
        <Button variant="ghost" size="sm" className="text-brand shrink-0 self-start sm:self-auto" asChild>
          <Link href="/search">
            {t.common.viewAll}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <article
        data-scroll-card
        className="home-pro-spotlight relative rounded-2xl border border-brand/25 overflow-hidden mb-5 sm:mb-6 group"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-brand/5 to-transparent" />
        <div className="relative flex flex-col sm:grid sm:grid-cols-[112px_1fr] lg:grid-cols-[140px_1fr_auto] gap-4 sm:gap-5 lg:gap-6 p-4 sm:p-6 lg:p-8 sm:items-center">
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 lg:h-32 lg:w-32 mx-auto sm:mx-0 rounded-2xl overflow-hidden ring-2 ring-brand/40 bg-muted shrink-0">
            {featured.user.image ? (
              <Image src={featured.user.image} alt={featured.user.name || ""} fill className="object-cover" unoptimized />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-brand">
                {featured.user.name?.[0] || "P"}
              </div>
            )}
          </div>
          <div className="text-center sm:text-left min-w-0 flex-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg sm:text-xl font-bold truncate">{featured.user.name}</h3>
              {featured.isVerified && <ShieldCheck className="h-5 w-5 text-brand shrink-0" />}
            </div>
            {service?.category && <p className="text-sm text-brand mt-1">{service.category.name}</p>}
            <div className="flex items-center justify-center sm:justify-start gap-1 text-sm mt-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{featured.avgRating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                · {featured.reviewCount} {t.common.reviews}
              </span>
            </div>
            {featured.user.city && (
              <p className="flex items-center justify-center sm:justify-start gap-1 text-xs text-muted-foreground mt-2">
                <MapPin className="h-3 w-3" />
                {featured.user.city}
              </p>
            )}
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-3 shrink-0 sm:col-span-2 lg:col-span-1 border-t sm:border-t-0 border-white/10 pt-4 sm:pt-0">
            {priceLabel && (
              <span className="text-base sm:text-lg font-bold text-brand text-center sm:text-right">{priceLabel}</span>
            )}
            <div className="flex flex-col min-[400px]:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full min-[400px]:flex-1 sm:flex-none sm:w-auto" asChild>
                <Link href={`/professionals/${featured.id}`}>{t.home.viewProfile}</Link>
              </Button>
              <Button size="sm" className="w-full min-[400px]:flex-1 sm:flex-none sm:w-auto" asChild>
                <Link
                  href={`/book?pro=${featured.id}${service?.category ? `&category=${service.category.slug}` : ""}`}
                >
                  {t.home.bookNow}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </article>

      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {rest.slice(0, 4).map((pro) => (
            <ProCard key={pro.id} pro={pro} className="max-w-none w-full" />
          ))}
        </div>
      )}
    </section>
  );
}

type HomeBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  linkUrl: string | null;
  imageUrl: string | null;
};

export function HomeAlternatingBanners({ banners }: { banners: HomeBanner[] }) {
  return (
    <section id="home-banners" className="space-y-3 sm:space-y-4">
      {banners.slice(0, 3).map((banner, i) => (
        <Link
          key={banner.id}
          href={banner.linkUrl || "/search"}
          data-scroll-card
          className={cn(
            "group grid grid-cols-1 sm:grid-cols-2 rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:border-brand/30 transition-colors",
            i % 2 === 1 && "sm:[&>*:first-child]:order-2"
          )}
        >
          <div className="relative min-h-[140px] sm:min-h-[180px] md:min-h-[220px] bg-muted">
            {banner.imageUrl ? (
              <Image
                src={banner.imageUrl}
                alt=""
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 480px"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/5" />
            )}
          </div>
          <div className="p-4 sm:p-6 md:p-8 flex flex-col justify-center bg-white/[0.02] min-h-[120px]">
            {i === 0 && (
              <span className="text-[10px] font-medium uppercase tracking-widest text-brand mb-2">Featured</span>
            )}
            <h3 className="text-lg font-semibold group-hover:text-brand transition-colors">{banner.title}</h3>
            {banner.subtitle && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{banner.subtitle}</p>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-brand mt-4 font-medium">
              Learn more
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      ))}
    </section>
  );
}

export function HomeDualCta() {
  const { t } = useI18n();

  return (
    <section id="home-cta" className="relative py-20 md:py-28 overflow-hidden">
      <div className="home-cta-diagonal absolute inset-0 bg-gradient-to-br from-brand/8 via-transparent to-brand/5 pointer-events-none" />
      <div className="container mx-auto px-4 relative">
        <div className="grid md:grid-cols-2 gap-0 max-w-4xl mx-auto home-cta-split" data-scroll-reveal>
          <div className="rounded-2xl md:rounded-r-none border border-brand/25 bg-gradient-to-br from-brand/15 to-brand/5 p-8 md:p-10">
            <h2 className="text-2xl font-bold mb-3">{t.home.findAPro}</h2>
            <p className="text-muted-foreground text-sm mb-6">{t.home.findAProDesc}</p>
            <Button size="lg" asChild>
              <Link href="/search">{t.home.exploreServices}</Link>
            </Button>
          </div>
          <div className="rounded-2xl md:rounded-l-none border border-t md:border-t-white/10 md:border-l-0 border-white/10 bg-gradient-to-bl from-white/[0.06] to-transparent p-8 md:p-10 md:-translate-y-4">
            <h2 className="text-2xl font-bold mb-3">{t.home.ctaTitle}</h2>
            <p className="text-muted-foreground text-sm mb-6">{t.home.ctaDesc}</p>
            <Button size="lg" variant="outline" className="border-white/15" asChild>
              <Link href="/pro/register">{t.home.joinProfessional}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* Legacy exports kept for compatibility */
export function HomeTrustBand(props: Parameters<typeof HomeTrustSidebar>[0]) {
  return (
    <section className="py-20 border-t border-white/5">
      <div className="container mx-auto px-4 max-w-md">
        <HomeTrustSidebar {...props} />
      </div>
    </section>
  );
}

export function HomeProShowcase({ professionals }: { professionals: HomePro[] }) {
  return (
    <section className="py-16 border-t border-white/5">
      <div className="container mx-auto px-4">
        <HomeProZigzag professionals={professionals} />
      </div>
    </section>
  );
}
