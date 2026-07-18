"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { asStringArray } from "@/lib/utils";
import { splitSkillsFromServices } from "@/lib/pro-options";
import { useI18n } from "@/lib/i18n/context";
import { OptionPicker } from "@/components/pro/option-picker";
import { GroupedCategoryPicker } from "@/components/pro/grouped-category-picker";
import {
  AvailabilityEditor,
  buildDaySchedules,
  schedulesToApiSlots,
  type DaySchedule,
} from "@/components/pro/availability-editor";

type Category = { id: string; name: string; slug: string; icon?: string | null };
type CategoryGroup = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  categories: Category[];
};

type Service = {
  id: string;
  categoryId: string;
  category: { id: string; name: string; slug: string };
  price: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  priceType: string;
  description: string | null;
};

type PortfolioItem = { id: string; title: string | null; imageUrl: string };

type ProfileData = {
  bio: string | null;
  experienceYears: number;
  skills: unknown;
  languages: unknown;
  certifications: unknown;
  serviceAreas: unknown;
  responseTime: number | null;
  services: Service[];
  portfolio: PortfolioItem[];
  availability?: { dayOfWeek: number; startTime: string; endTime: string; isAvailable: boolean }[];
  user: { name: string | null; image: string | null; city: string | null };
};

export function ProProfileEditor({ profile }: { profile: ProfileData }) {
  const router = useRouter();
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    profile.services.map((s) => s.categoryId)
  );
  const [specializationOptions, setSpecializationOptions] = useState<string[]>([]);
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [languageOptions, setLanguageOptions] = useState<string[]>([]);
  const categoryNames = profile.services.map((s) => s.category.name);
  const [selectedSpecializations, setSelectedSpecializations] = useState(
    splitSkillsFromServices(categoryNames, asStringArray(profile.skills))
  );
  const [selectedAreas, setSelectedAreas] = useState(asStringArray(profile.serviceAreas));
  const [selectedLanguages, setSelectedLanguages] = useState(asStringArray(profile.languages));
  const [form, setForm] = useState({
    bio: profile.bio || "",
    experienceYears: profile.experienceYears,
    certifications: asStringArray(profile.certifications).join(", "),
    responseTime: profile.responseTime?.toString() || "",
    image: profile.user.image || "",
  });
  const [services, setServices] = useState(profile.services);
  const [portfolio, setPortfolio] = useState(profile.portfolio);
  const [schedules, setSchedules] = useState<DaySchedule[]>(buildDaySchedules(profile.availability));

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setGroups(data.groups || []));
  }, []);

  const categorySlugs = services.map((s) => s.category.slug).join(",");

  useEffect(() => {
    const params = new URLSearchParams({
      city: profile.user.city || "",
      categories: categorySlugs,
    });
    fetch(`/api/pro/options?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const specializations = data.specializations || [];
        const areas = data.serviceAreas || [];
        const languages = data.languages || [];
        setSpecializationOptions(specializations);
        setAreaOptions(areas);
        setLanguageOptions(languages);
        setSelectedSpecializations((prev) => prev.filter((s) => specializations.includes(s)));
        setSelectedAreas((prev) => prev.filter((a) => areas.includes(a)));
        setSelectedLanguages((prev) => prev.filter((l) => languages.includes(l)));
      });
  }, [profile.user.city, categorySlugs]);

  useEffect(() => {
    const allCategories = groups.flatMap((g) => g.categories);
    setServices((prev) => {
      const byCategoryId = new Map(prev.map((s) => [s.categoryId, s]));
      return selectedCategoryIds.map((categoryId) => {
        const existing = byCategoryId.get(categoryId);
        if (existing) return existing;
        const cat = allCategories.find((c) => c.id === categoryId);
        return {
          id: `pending-${categoryId}`,
          categoryId,
          category: {
            id: categoryId,
            name: cat?.name || "",
            slug: cat?.slug || "",
          },
          price: null,
          minPrice: null,
          maxPrice: null,
          priceType: "quote",
          description: null,
        };
      });
    });
  }, [selectedCategoryIds, groups]);

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/pro/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: form.bio,
        experienceYears: form.experienceYears,
        skills: selectedSpecializations,
        languages: selectedLanguages,
        certifications: form.certifications.split(",").map((s) => s.trim()).filter(Boolean),
        serviceAreas: selectedAreas,
        responseTime: form.responseTime ? parseInt(form.responseTime) : null,
        image: form.image || undefined,
      }),
    });
    const payload = await res.json().catch(() => ({}));
    setSaving(false);
    if (res.ok) {
      setMessage(t.proProfile.profileSaved);
      router.refresh();
    } else {
      setMessage(payload.error || t.proProfile.saveFailed);
    }
  }

  async function saveCategories() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/pro/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "categories", categoryIds: selectedCategoryIds }),
    });
    setSaving(false);
    if (res.ok) {
      setMessage(t.proProfile.categoriesUpdated);
      router.refresh();
    } else {
      const payload = await res.json().catch(() => ({}));
      setMessage(payload.error || t.proProfile.saveFailed);
    }
  }

  async function saveServices() {
    setSaving(true);
    for (const svc of services) {
      if (svc.id.startsWith("pending-")) continue;
      await fetch("/api/pro/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "service",
          serviceId: svc.id,
          price: svc.price,
          minPrice: svc.minPrice,
          maxPrice: svc.maxPrice,
          priceType: svc.priceType,
          description: svc.description,
        }),
      });
    }
    setSaving(false);
    setMessage(t.proProfile.servicesUpdated);
  }

  async function saveAvailability() {
    setSaving(true);
    await fetch("/api/pro/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "availability",
        slots: schedulesToApiSlots(schedules),
      }),
    });
    setSaving(false);
    setMessage(t.proProfile.availabilitySaved);
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (res.ok) setForm((f) => ({ ...f, image: data.url }));
  }

  async function addPortfolio(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) return;

    const res = await fetch("/api/pro/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "portfolio",
        imageUrl: uploadData.url,
        title: t.proProfile.workSample,
      }),
    });
    const data = await res.json();
    if (res.ok) setPortfolio((p) => [...p, data.item]);
  }

  const isError =
    message.includes("Failed") ||
    message.includes("Invalid") ||
    message === t.proProfile.saveFailed;

  return (
    <div className="space-y-4">
      {message && (
        <p className={`text-sm font-medium ${isError ? "text-destructive" : "text-brand"}`}>
          {message}
        </p>
      )}

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">{t.proProfile.tabAbout}</TabsTrigger>
          <TabsTrigger value="services">{t.proProfile.tabServices}</TabsTrigger>
          <TabsTrigger value="availability">{t.proProfile.tabAvailability}</TabsTrigger>
          <TabsTrigger value="portfolio">{t.proProfile.tabPortfolio}</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.proProfile.profilePhoto}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              {form.image && (
                <div className="relative h-20 w-20 rounded-full overflow-hidden">
                  <Image src={form.image} alt="Profile" fill className="object-cover" />
                </div>
              )}
              <Input type="file" accept="image/*" onChange={uploadPhoto} />
            </CardContent>
          </Card>
          <div className="space-y-2">
            <Label>{t.proProfile.bio}</Label>
            <Textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={4}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.proProfile.experienceYears}</Label>
              <Input
                type="number"
                value={form.experienceYears}
                onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t.proProfile.responseTime}</Label>
              <Input
                value={form.responseTime}
                onChange={(e) => setForm({ ...form, responseTime: e.target.value })}
              />
            </div>
          </div>

          {services.length > 0 && (
            <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 space-y-2">
              <p className="text-xs text-muted-foreground">{t.proProfile.servicesAutoAdded}</p>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <span key={s.categoryId} className="text-xs px-2 py-1 rounded-full bg-brand/10 text-brand border border-brand/20">
                    {s.category.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <OptionPicker
            label={t.proProfile.specializations}
            options={specializationOptions}
            selected={selectedSpecializations}
            onChange={setSelectedSpecializations}
            emptyMessage={t.proProfile.specializationsEmpty}
          />
          <p className="text-xs text-muted-foreground">{t.proProfile.specializationsHint}</p>

          <OptionPicker
            label={t.proProfile.serviceAreas}
            options={areaOptions}
            selected={selectedAreas}
            onChange={setSelectedAreas}
            emptyMessage={t.proProfile.areasEmpty}
          />

          <OptionPicker
            label={t.proProfile.languages}
            options={languageOptions}
            selected={selectedLanguages}
            onChange={setSelectedLanguages}
          />

          <div className="space-y-2">
            <Label>{t.proProfile.certifications}</Label>
            <Input
              value={form.certifications}
              onChange={(e) => setForm({ ...form, certifications: e.target.value })}
            />
          </div>
          <Button onClick={saveProfile} disabled={saving}>
            {t.proProfile.saveProfile}
          </Button>
        </TabsContent>

        <TabsContent value="services" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.proProfile.servicesOffer}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <GroupedCategoryPicker
                groups={groups}
                selectedIds={selectedCategoryIds}
                onChange={setSelectedCategoryIds}
                hint={t.proProfile.servicesHint}
              />
              <Button onClick={saveCategories} disabled={saving || selectedCategoryIds.length === 0}>
                {t.proProfile.saveCategories}
              </Button>
            </CardContent>
          </Card>

          {services.map((svc, i) => (
            <Card key={svc.categoryId}>
              <CardContent className="pt-6 space-y-3">
                <p className="font-medium">{svc.category.name}</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>{t.proProfile.fixedPrice}</Label>
                    <Input
                      type="number"
                      value={svc.price ?? ""}
                      onChange={(e) => {
                        const next = [...services];
                        next[i] = { ...svc, price: e.target.value ? Number(e.target.value) : null };
                        setServices(next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t.proProfile.minQuote}</Label>
                    <Input
                      type="number"
                      value={svc.minPrice ?? ""}
                      onChange={(e) => {
                        const next = [...services];
                        next[i] = { ...svc, minPrice: e.target.value ? Number(e.target.value) : null };
                        setServices(next);
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>{t.proProfile.maxQuote}</Label>
                    <Input
                      type="number"
                      value={svc.maxPrice ?? ""}
                      onChange={(e) => {
                        const next = [...services];
                        next[i] = { ...svc, maxPrice: e.target.value ? Number(e.target.value) : null };
                        setServices(next);
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {services.length > 0 && (
            <Button onClick={saveServices} disabled={saving}>
              {t.proProfile.savePricing}
            </Button>
          )}
        </TabsContent>

        <TabsContent value="availability" className="space-y-4 mt-4">
          <AvailabilityEditor schedules={schedules} onChange={setSchedules} />
          <Button onClick={saveAvailability} disabled={saving}>
            {t.proProfile.saveAvailability}
          </Button>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4 mt-4">
          <Input type="file" accept="image/*" onChange={addPortfolio} />
          <div className="grid grid-cols-3 gap-3">
            {portfolio.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={item.imageUrl}
                  alt={item.title || t.proProfile.workSample}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
