import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, ShieldCheck, MapPin, Clock, Briefcase } from "lucide-react";
import { formatCurrency, asStringArray } from "@/lib/utils";
import { SaveProfessionalButton } from "@/components/professionals/save-button";
import { auth } from "@/lib/auth";

export default async function ProfessionalProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const professional = await prisma.professionalProfile.findUnique({
    where: { id, status: "APPROVED" },
    include: {
      user: true,
      badges: true,
      services: { include: { category: true } },
      portfolio: true,
      availability: true,
      reviews: {
        include: {
          customer: { include: { user: true } },
          photos: true,
          reply: true,
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!professional) notFound();

  const skills = asStringArray(professional.skills);
  const languages = asStringArray(professional.languages);
  const certifications = asStringArray(professional.certifications);
  const serviceAreas = asStringArray(professional.serviceAreas);

  let isSaved = false;
  if (session?.user?.role === "CUSTOMER") {
    const customer = await prisma.customerProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (customer) {
      const saved = await prisma.savedProfessional.findUnique({
        where: {
          customerId_professionalId: {
            customerId: customer.id,
            professionalId: professional.id,
          },
        },
      });
      isSaved = !!saved;
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex gap-6">
            <div className="relative h-24 w-24 rounded-full overflow-hidden bg-muted shrink-0">
              {professional.user.image ? (
                <Image src={professional.user.image} alt={professional.user.name || ""} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-brand">
                  {professional.user.name?.[0]}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{professional.user.name}</h1>
                {professional.isVerified && (
                  <Badge className="bg-brand/10 text-brand border-brand/20">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{professional.avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({professional.reviewCount} reviews)</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {professional.badges.map((b) => (
                  <Badge key={b.id} variant="outline">{b.label}</Badge>
                ))}
              </div>
            </div>
          </div>

          <Card>
            <CardHeader><CardTitle>About</CardTitle></CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{professional.bio}</p>
              <div className="grid sm:grid-cols-2 gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-brand" />
                  {professional.experienceYears} years experience
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-brand" />
                  {professional.completedJobs} jobs completed
                </div>
                {professional.user.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand" />
                    {professional.user.city}
                  </div>
                )}
                {professional.responseTime && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-brand" />
                    Responds in ~{professional.responseTime} min
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Skills & Languages</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <Badge key={s} variant="secondary">{s}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {languages.map((l) => (
                    <Badge key={l} variant="outline">{l}</Badge>
                  ))}
                </div>
              </div>
              {certifications.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Certifications</h4>
                  <ul className="text-sm text-muted-foreground list-disc pl-4">
                    {certifications.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {professional.reviews.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Customer Reviews</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {professional.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3.5 w-3.5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.customer.user.name}</span>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                    {review.reply && (
                      <p className="text-sm mt-2 pl-4 border-l-2 text-muted-foreground">
                        <span className="font-medium">Response:</span> {review.reply.comment}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Services & Pricing</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {professional.services.map((service) => (
                <div key={service.id} className="flex justify-between items-center text-sm">
                  <span>{service.category.name}</span>
                  <span className="font-medium text-brand">
                    {service.price
                      ? formatCurrency(service.price)
                      : service.minPrice
                      ? `From ${formatCurrency(service.minPrice)}`
                      : "Quote"}
                  </span>
                </div>
              ))}
              <Button className="w-full mt-4" asChild>
                <Link href={`/book/${professional.id}`}>Book Now</Link>
              </Button>
              {session?.user?.role === "CUSTOMER" && (
                <SaveProfessionalButton professionalId={professional.id} initialSaved={isSaved} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Service Areas</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {serviceAreas.map((area) => (
                  <Badge key={area} variant="outline">{area}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
