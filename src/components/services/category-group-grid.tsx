"use client";

import Link from "next/link";
import { Card3D } from "@/components/3d/card-3d";
import { useI18n } from "@/lib/i18n/context";

type CategoryGroup = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  categories: { id: string }[];
};

export function CategoryGroupGrid({
  groups,
  compact = false,
}: {
  groups: CategoryGroup[];
  compact?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 md:grid-cols-4 gap-4 perspective-scene"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 perspective-scene"
      }
    >
      {groups.map((group, i) => (
        <Link key={group.id} href={`/services/group/${group.slug}`}>
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
