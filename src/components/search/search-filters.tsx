"use client";

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = { slug: string; name: string };
type CategoryGroup = {
  name: string;
  categories: Category[];
};
type City = { slug: string; name: string };

export function SearchFilters({
  groups,
  cities,
  currentParams,
}: {
  groups: CategoryGroup[];
  cities: City[];
  currentParams: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const { t } = useI18n();

  function applyFilters(formData: FormData) {
    const params = new URLSearchParams();
    const q = formData.get("q") as string;
    const city = formData.get("city") as string;
    const category = formData.get("category") as string;
    const minRating = formData.get("minRating") as string;
    const minExperience = formData.get("minExperience") as string;
    const language = formData.get("language") as string;
    const sort = formData.get("sort") as string;

    if (q) params.set("q", q);
    if (city && city !== "all") params.set("city", city);
    if (category && category !== "all") params.set("category", category);
    if (minRating && minRating !== "any") params.set("minRating", minRating);
    if (minExperience) params.set("minExperience", minExperience);
    if (language) params.set("language", language);
    if (sort) params.set("sort", sort);

    router.push(`/search?${params.toString()}`);
  }

  return (
    <Card className="glass-panel border-white/10">
      <CardHeader>
        <CardTitle className="text-base">{t.search.filters}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={applyFilters} className="space-y-4">
          <div className="space-y-2">
            <Label>{t.search.category}</Label>
            <Select name="category" defaultValue={currentParams.category || "all"}>
              <SelectTrigger>
                <SelectValue placeholder={t.common.allCategories} />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="all">{t.common.allCategories}</SelectItem>
                {groups.map((group) => (
                  <SelectGroup key={group.name}>
                    <SelectLabel>{group.name}</SelectLabel>
                    {group.categories.map((c) => (
                      <SelectItem key={c.slug} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t.search.city}</Label>
            <Select name="city" defaultValue={currentParams.city || "all"}>
              <SelectTrigger>
                <SelectValue placeholder={t.search.allCities} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.search.allCities}</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c.slug} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t.search.minRating}</Label>
            <Select name="minRating" defaultValue={currentParams.minRating || "any"}>
              <SelectTrigger>
                <SelectValue placeholder={t.common.any} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{t.common.any}</SelectItem>
                <SelectItem value="4">{t.search.stars4}</SelectItem>
                <SelectItem value="4.5">{t.search.stars45}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t.search.minExperience}</Label>
            <Input name="minExperience" type="number" min={0} defaultValue={currentParams.minExperience} />
          </div>

          <div className="space-y-2">
            <Label>{t.search.language}</Label>
            <Input name="language" placeholder={t.search.languagePlaceholder} defaultValue={currentParams.language} />
          </div>

          <div className="space-y-2">
            <Label>{t.search.sortBy}</Label>
            <Select name="sort" defaultValue={currentParams.sort || "rating"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">{t.search.highestRated}</SelectItem>
                <SelectItem value="experience">{t.search.mostExperienced}</SelectItem>
                <SelectItem value="jobs">{t.search.mostJobs}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">{t.common.apply}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
