"use client";

import Link from "next/link";
import Image from "next/image";
import { Card3D } from "@/components/3d/card-3d";
import { useI18n } from "@/lib/i18n/context";
import { getCategoryGroupImage } from "@/lib/home/category-group-images";
import { ArrowUpRight } from "lucide-react";

type CategoryGroup = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  categories: { id: string; name?: string; imageUrl?: string | null }[];
};

export function CategoryGroupGrid({
  groups,
  compact = false,
  scrollReveal = false,
  variant = "default",
}: {
  groups: CategoryGroup[];
  compact?: boolean;
  scrollReveal?: boolean;
  variant?: "default" | "photo";
}) {
  const { t } = useI18n();

  if (variant === "photo") {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {groups.map((group) => {
          const cover = getCategoryGroupImage(
            group.slug,
            group.categories.find((c) => c.imageUrl)?.imageUrl
          );
          const topCategories = group.categories.slice(0, 2).map((c) => c.name).filter(Boolean);

          return (
            <Link
              key={group.id}
              href={`/services/group/${group.slug}`}
              {...(scrollReveal ? { "data-scroll-card": true } : {})}
              className="group"
            >
              <div className="relative h-[200px] md:h-[240px] rounded-2xl overflow-hidden border border-white/10 transition-transform duration-300 hover:scale-[1.02] hover:border-brand/30">
                <Image
                  src={cover}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                  <h3 className="font-semibold text-sm md:text-base text-white leading-snug group-hover:text-brand transition-colors">
                    {group.name}
                  </h3>
                  {topCategories.length > 0 && (
                    <p className="text-[10px] md:text-xs text-white/60 mt-1 truncate">
                      {topCategories.join(" · ")}
                    </p>
                  )}
                  <p className="text-[10px] text-brand/90 mt-2 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {group.categories.length} {t.services.groupServices}
                    <ArrowUpRight className="h-3 w-3" />
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 md:grid-cols-4 gap-4 perspective-scene"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 perspective-scene"
      }
    >
      {groups.map((group, i) => (
        <Link
          key={group.id}
          href={`/services/group/${group.slug}`}
          {...(scrollReveal ? { "data-scroll-card": true } : {})}
        >
          <Card3D
            className={
              compact
                ? "p-5 h-full group"
                : "p-6 h-full min-h-[160px] flex flex-col justify-between group"
            }
            intensity={10 + (i % 4) * 2}
          >
            <div>
              <div
                className={`${compact ? "text-3xl" : "text-4xl"} mb-3 float-3d inline-block`}
                style={{ animationDelay: `${i * 0.3}s` }}
              >
                {group.icon || "🔧"}
              </div>
              <h3 className={`font-semibold ${compact ? "text-sm" : "text-base"} group-hover:text-brand transition-colors`}>
                {group.name}
              </h3>
              {!compact && group.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{group.description}</p>
              )}
            </div>
            <p className="text-xs text-brand mt-3 font-medium">
              {group.categories.length} {t.services.groupServices} →
            </p>
          </Card3D>
        </Link>
      ))}
    </div>
  );
}
