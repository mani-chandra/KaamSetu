import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SearchForm } from "@/components/search/search-form";
import { CategoryGrid } from "@/components/home/category-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Star, Users, Clock } from "lucide-react";

export default async function HomePage() {
  const [categories, stats, banners] = await Promise.all([
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 12,
    }),
    Promise.all([
      prisma.professionalProfile.count({ where: { status: "APPROVED" } }),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.serviceCategory.count({ where: { isActive: true } }),
    ]),
    prisma.promotionalBanner.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      take: 3,
    }),
  ]);

  const [proCount, completedJobs, categoryCount] = stats;

  return (
    <div>
      <section className="bg-gradient-to-br from-teal-50 via-white to-emerald-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 text-sm font-medium text-brand mb-6">
            <ShieldCheck className="h-4 w-4" />
            India&apos;s Trusted Local Services Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto">
            Find trusted professionals for{" "}
            <span className="text-brand">every service</span> you need
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            From plumbers and electricians to tutors and chefs — discover verified
            professionals, compare profiles, and book with confidence.
          </p>
          <div className="max-w-2xl mx-auto">
            <SearchForm />
          </div>
        </div>
      </section>

      {banners.length > 0 && (
        <section className="py-8 border-b bg-white">
          <div className="container mx-auto px-4 flex flex-wrap gap-4 justify-center">
            {banners.map((banner) => (
              <Link
                key={banner.id}
                href={banner.linkUrl || "/search"}
                className="px-6 py-3 rounded-lg bg-brand/5 border border-brand/20 hover:bg-brand/10 transition-colors"
              >
                <div className="font-medium text-brand">{banner.title}</div>
                {banner.subtitle && <div className="text-sm text-muted-foreground">{banner.subtitle}</div>}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="py-12 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users, label: "Verified Professionals", value: `${proCount}+` },
              { icon: Star, label: "Services Completed", value: `${completedJobs}+` },
              { icon: ShieldCheck, label: "Service Categories", value: `${categoryCount}+` },
              { icon: Clock, label: "Avg Response Time", value: "< 1 hr" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="h-8 w-8 text-brand mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Browse Services</h2>
              <p className="text-muted-foreground mt-1">
                Explore categories and find the right professional
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/services">View all</Link>
            </Button>
          </div>
          <CategoryGrid categories={categories} />
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why choose KaamSetu?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Verified Professionals",
                description: "Every professional is verified by our team before they appear on the platform.",
              },
              {
                title: "Transparent Reviews",
                description: "Real ratings and reviews from customers who completed bookings.",
              },
              {
                title: "Easy Booking",
                description: "Book instantly with fixed pricing or request quotes for custom work.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Are you a skilled professional?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Build your digital business card, reach more customers, and grow your income with KaamSetu.
          </p>
          <Button size="lg" asChild>
            <Link href="/pro/register">Join as a Professional</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
