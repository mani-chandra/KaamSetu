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
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 p-2 bg-white rounded-xl shadow-lg border">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.dashboard.servicePlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 border-0 shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="relative sm:w-48">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t.dashboard.cityPlaceholder}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="pl-10 border-0 shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" className="sm:px-8">{t.common.search}</Button>
    </form>
  );
}
