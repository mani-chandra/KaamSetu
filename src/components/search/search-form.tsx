"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";

export function SearchForm({ defaultQuery = "", defaultCity = "" }: { defaultQuery?: string; defaultCity?: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [query, setQuery] = useState(defaultQuery);
  const [city, setCity] = useState(defaultCity);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (city) params.set("city", city);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2 p-2 sm:p-2.5 bg-card/80 rounded-xl shadow-lg border border-white/10 backdrop-blur-sm w-full min-w-0"
    >
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t.dashboard.servicePlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-11 sm:h-10 border-0 shadow-none focus-visible:ring-0 bg-transparent w-full min-w-0"
        />
      </div>
      <div className="relative w-full sm:w-44 md:w-48 shrink-0">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder={t.dashboard.cityPlaceholder}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="pl-10 h-11 sm:h-10 border-0 shadow-none focus-visible:ring-0 bg-transparent w-full min-w-0"
        />
      </div>
      <Button type="submit" className="w-full sm:w-auto sm:px-6 md:px-8 h-11 sm:h-10 shrink-0">
        {t.common.search}
      </Button>
    </form>
  );
}
