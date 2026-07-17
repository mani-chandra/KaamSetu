import Link from "next/link";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export default async function FavoritesPage() {
  const session = await requireAuth(["CUSTOMER", "ADMIN"]);
  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      savedProfessionals: {
        include: { professional: { include: { user: true, badges: true } } },
      },
      favoriteServices: {
        include: { category: true },
      },
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-4 gap-8">
        <DashboardNav />
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h1 className="text-2xl font-bold mb-4">Saved Professionals</h1>
            {customer?.savedProfessionals.length === 0 ? (
              <p className="text-muted-foreground">No saved professionals yet.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {customer?.savedProfessionals.map(({ professional }) => (
                  <Card key={professional.id}>
                    <CardHeader>
                      <CardTitle className="text-base">{professional.user.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">{professional.bio?.slice(0, 100)}...</p>
                      <Button size="sm" asChild>
                        <Link href={`/professionals/${professional.id}`}>View Profile</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
