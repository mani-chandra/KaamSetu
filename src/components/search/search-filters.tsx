"use client";

import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Category = { slug: string; name: string };
type City = { slug: string; name: string };

export function SearchFilters({
  categories,
  cities,
  currentParams,
}: {
  categories: Category[];
  cities: City[];
  currentParams: Record<string, string | undefined>;
}) {
  const router = useRouter();

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
    if (minRating) params.set("minRating", minRating);
    if (minExperience) params.set("minExperience", minExperience);
    if (language) params.set("language", language);
    if (sort) params.set("sort", sort);

    router.push(`/search?${params.toString()}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={applyFilters} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select name="category" defaultValue={currentParams.category || "all"}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>City</Label>
            <Select name="city" defaultValue={currentParams.city || "all"}>
              <SelectTrigger>
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c.slug} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Min rating</Label>
            <Select name="minRating" defaultValue={currentParams.minRating || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="4">4+ stars</SelectItem>
                <SelectItem value="4.5">4.5+ stars</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Min experience (years)</Label>
            <Input name="minExperience" type="number" min={0} defaultValue={currentParams.minExperience} />
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Input name="language" placeholder="Hindi, English..." defaultValue={currentParams.language} />
          </div>

          <div className="space-y-2">
            <Label>Sort by</Label>
            <Select name="sort" defaultValue={currentParams.sort || "rating"}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest rated</SelectItem>
                <SelectItem value="experience">Most experienced</SelectItem>
                <SelectItem value="jobs">Most jobs completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full">Apply filters</Button>
        </form>
      </CardContent>
    </Card>
  );
}
