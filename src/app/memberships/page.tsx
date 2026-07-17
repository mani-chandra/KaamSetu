import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { formatCurrency, asStringArray } from "@/lib/utils";
import { MembershipSubscribeButton } from "@/components/memberships/subscribe-button";

export default async function MembershipsPage() {
  const plans = await prisma.membershipPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const customerPlans = plans.filter((p) => p.target === "CUSTOMER");
  const proPlans = plans.filter((p) => p.target === "PROFESSIONAL");

  const cities = await prisma.city.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Membership Plans</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Unlock premium benefits for customers and professionals
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
        {customerPlans.map((plan) => {
          const features = asStringArray(plan.features);
          return (
          <Card key={plan.id} className="relative">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="text-3xl font-bold text-brand mt-2">
                {formatCurrency(plan.price)}<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-brand" /> {f}
                  </li>
                ))}
              </ul>
              <MembershipSubscribeButton planId={plan.id} />
            </CardContent>
          </Card>
        );})}
        {proPlans.map((plan) => {
          const features = asStringArray(plan.features);
          return (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="text-3xl font-bold text-brand mt-2">
                {formatCurrency(plan.price)}<span className="text-sm font-normal text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-brand" /> {f}
                  </li>
                ))}
              </ul>
              <MembershipSubscribeButton planId={plan.id} />
            </CardContent>
          </Card>
        );})}
      </div>

      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Available Cities</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {cities.map((city) => (
            <Button key={city.id} variant="outline" size="sm" asChild>
              <Link href={`/search?city=${city.name}`}>{city.name}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
