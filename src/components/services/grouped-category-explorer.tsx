"use client";

import Link from "next/link";
import { useState } from "react";
import { Card3D } from "@/components/3d/card-3d";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { getServiceIcon } from "@/lib/service-icons";
import { useI18n } from "@/lib/i18n/context";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
};

type Group = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  categories: Category[];
};

export function GroupedCategoryExplorer({ groups }: { groups: Group[] }) {
  const { t } = useI18n();
  const [openSlug, setOpenSlug] = useState<string | null>(groups[0]?.slug ?? null);

  return (
    <div className="space-y-4 perspective-scene">
      {groups.map((group) => {
        const isOpen = openSlug === group.slug;
        return (
          <div key={group.id} className="glass-panel rounded-2xl border border-white/10 overflow-hidden depth-layer">
            <button
              type="button"
              onClick={() => setOpenSlug(isOpen ? null : group.slug)}
              className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl float-3d">{group.icon || "🔧"}</span>
                <div>
                  <h2 className="font-semibold text-lg">{group.name}</h2>
                  <p className="text-sm text-muted-foreground">{group.categories.length} {t.services.groupServices}</p>
                </div>
              </div>
              <ChevronDown
                className={cn("h-5 w-5 text-muted-foreground transition-transform", isOpen && "rotate-180")}
              />
            </button>

            <div
              className={cn(
                "grid transition-all duration-500 ease-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5 pt-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {group.categories.map((category, i) => (
                    <Link key={category.id} href={`/services/${category.slug}`}>
                      <Card3D
                        className="p-3 h-full text-center hover:border-brand/30"
                        intensity={6 + (i % 3) * 2}
                      >
                        <div className="text-2xl mb-1">{getServiceIcon(category.slug, category.icon)}</div>
                        <div className="font-medium text-xs sm:text-sm leading-tight">{category.name}</div>
                      </Card3D>
                    </Link>
                  ))}
                </div>
                <div className="px-5 pb-4">
                  <Link
                    href={`/services/group/${group.slug}`}
                    className="text-sm text-brand hover:underline"
                  >
                    {t.services.viewAllInGroup} {group.name} →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
