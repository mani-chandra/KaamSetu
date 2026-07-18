import Link from "next/link";
import Image from "next/image";
import { Card3D } from "@/components/3d/card-3d";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShieldCheck, MapPin, Clock } from "lucide-react";
import { formatCurrency, asStringArray } from "@/lib/utils";

type Professional = {
  id: string;
  bio: string | null;
  experienceYears: number;
  avgRating: number;
  reviewCount: number;
  completedJobs: number;
  responseTime: number | null;
  serviceAreas: unknown;
  isVerified: boolean;
  user: { name: string | null; image: string | null; city: string | null };
  badges: { label: string }[];
  services: { price: number | null; priceType: string; minPrice: number | null }[];
};

export function ProfessionalCard({
  professional,
  categorySlug,
}: {
  professional: Professional;
  categorySlug?: string;
}) {
  const service = professional.services[0];
  const areas = asStringArray(professional.serviceAreas);
  const priceLabel = service?.price
    ? formatCurrency(service.price)
    : service?.minPrice
    ? `From ${formatCurrency(service.minPrice)}`
    : "Get quote";

  return (
    <Card3D className="overflow-hidden">
      <div className="p-4">
          <div className="flex gap-4">
            <div className="relative h-16 w-16 rounded-full overflow-hidden bg-muted shrink-0">
              {professional.user.image ? (
                <Image src={professional.user.image} alt={professional.user.name || ""} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-brand">
                  {professional.user.name?.[0] || "P"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{professional.user.name}</h3>
                {professional.isVerified && (
                  <ShieldCheck className="h-4 w-4 text-brand shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{professional.avgRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({professional.reviewCount})</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {professional.bio}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {professional.badges.slice(0, 2).map((badge) => (
              <Badge key={badge.label} className="bg-brand/10 text-brand border-brand/20">
                {badge.label}
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {professional.experienceYears} yrs exp
            </span>
            <span>{professional.completedJobs} jobs done</span>
            {professional.user.city && (
              <span className="flex items-center gap-1 col-span-2">
                <MapPin className="h-3 w-3" />
                {professional.user.city}
                {areas.length > 0 && ` · ${areas.slice(0, 2).join(", ")}`}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="font-semibold text-brand">{priceLabel}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/professionals/${professional.id}`}>View Profile</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href={`/book?pro=${professional.id}${categorySlug ? `&category=${categorySlug}` : ""}`}>
                  Book
                </Link>
              </Button>
            </div>
          </div>
      </div>
    </Card3D>
  );
}
