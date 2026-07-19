"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import {
  DEFAULT_CATEGORY_GROUP_IMAGE,
  getCategoryGroupImage,
} from "@/lib/home/category-group-images";
import { ArrowUpRight } from "lucide-react";

type CategoryGroup = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  categories: { id: string; name?: string; imageUrl?: string | null }[];
};

function CoverImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  const [current, setCurrent] = useState(src);
  return (
    <Image
      src={current}
      alt={alt}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-105"
      sizes={sizes}
      onError={() => {
        if (current !== DEFAULT_CATEGORY_GROUP_IMAGE) setCurrent(DEFAULT_CATEGORY_GROUP_IMAGE);
      }}
    />
  );
}

export function CategoryGroupRibbon({
  groups,
  scrollReveal = false,
}: {
  groups: CategoryGroup[];
  scrollReveal?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div className="home-ribbon-wrap relative -mx-4 sm:-mx-6 lg:mx-0">
      <div className="home-ribbon-fade-left pointer-events-none absolute left-0 top-0 bottom-0 w-6 sm:w-10 lg:w-14 z-10" />
      <div className="home-ribbon-fade-right pointer-events-none absolute right-0 top-0 bottom-0 w-6 sm:w-10 lg:w-14 z-10" />
      <div
        className="home-ribbon-scroll flex gap-3 sm:gap-4 overflow-x-auto overscroll-x-contain pb-3 px-4 sm:px-6 lg:px-1 snap-x snap-mandatory touch-pan-x"
        role="list"
        aria-label={t.home.browseServices}
      >
        {groups.map((group, i) => {
          const cover = getCategoryGroupImage(
            group.slug,
            group.categories.find((c) => c.imageUrl)?.imageUrl
          );

          return (
            <Link
              key={group.id}
              href={`/services/group/${group.slug}`}
              role="listitem"
              {...(scrollReveal ? { "data-scroll-card": true } : {})}
              className="group snap-start shrink-0 w-[min(78vw,220px)] sm:w-[240px] md:w-[260px] lg:w-[280px]"
            >
              <div className="relative h-[260px] sm:h-[300px] md:h-[320px] lg:h-[360px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 hover:border-brand/40 active:scale-[0.98] transition-all">
                <CoverImage
                  src={cover}
                  alt={group.name}
                  sizes="(max-width:640px) 78vw, (max-width:768px) 240px, (max-width:1024px) 260px, 280px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 rounded-full bg-black/40 backdrop-blur-sm px-2 sm:px-2.5 py-0.5 text-[10px] font-medium text-white/80 tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <h3 className="font-semibold text-white text-base sm:text-lg leading-snug group-hover:text-brand transition-colors line-clamp-2">
                    {group.name}
                  </h3>
                  {group.description && (
                    <p className="hidden sm:block text-xs text-white/55 mt-1.5 line-clamp-2">{group.description}</p>
                  )}
                  <p className="text-[10px] sm:text-xs text-brand mt-2 sm:mt-3 flex items-center gap-1 font-medium">
                    {group.categories.length} {t.services.groupServices}
                    <ArrowUpRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
