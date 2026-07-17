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
import { OptionPicker } from "@/components/pro/option-picker";
import {
  AvailabilityEditor,
  buildDaySchedules,
  schedulesToApiSlots,
  type DaySchedule,
} from "@/components/pro/availability-editor";

type Service = {
  id: string;
  category: { name: string; slug: string };
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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [skillOptions, setSkillOptions] = useState<string[]>([]);
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [languageOptions, setLanguageOptions] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState(asStringArray(profile.skills));
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

  const categorySlugs = profile.services.map((s) => s.category.slug).join(",");

  useEffect(() => {
    const params = new URLSearchParams({
      city: profile.user.city || "",
      categories: categorySlugs,
    });
    fetch(`/api/pro/options?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const skills = data.skills || [];
        const areas = data.serviceAreas || [];
        const languages = data.languages || [];
        setSkillOptions(skills);
        setAreaOptions(areas);
        setLanguageOptions(languages);
        setSelectedSkills((prev) => prev.filter((s) => skills.includes(s)));
        setSelectedAreas((prev) => prev.filter((a) => areas.includes(a)));
        setSelectedLanguages((prev) => prev.filter((l) => languages.includes(l)));
      });
  }, [profile.user.city, categorySlugs]);

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/pro/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bio: form.bio,
        experienceYears: form.experienceYears,
        skills: selectedSkills,
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
      setMessage("Profile saved!");
      router.refresh();
    } else {
      setMessage(payload.error || "Failed to save profile");
    }
  }

  async function saveServices() {
    setSaving(true);
    for (const svc of services) {
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
    setMessage("Services updated!");
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
    setMessage("Availability saved!");
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
      body: JSON.stringify({ type: "portfolio", imageUrl: uploadData.url, title: "Work sample" }),
    });
    const data = await res.json();
    if (res.ok) setPortfolio((p) => [...p, data.item]);
  }

  return (
    <div className="space-y-4">
      {message && (
        <p className={`text-sm font-medium ${message.includes("Failed") || message.includes("Invalid") ? "text-destructive" : "text-brand"}`}>
          {message}
        </p>
      )}

      <Tabs defaultValue="about">
        <TabsList>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4 mt-4">
          <Card>
            <CardHeader><CardTitle>Profile photo</CardTitle></CardHeader>
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
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Experience (years)</Label>
              <Input type="number" value={form.experienceYears} onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>Response time (minutes)</Label>
              <Input value={form.responseTime} onChange={(e) => setForm({ ...form, responseTime: e.target.value })} />
            </div>
          </div>

          <OptionPicker
            label="Skills"
            options={skillOptions}
            selected={selectedSkills}
            onChange={setSelectedSkills}
            emptyMessage="Skills load based on your service categories."
          />

          <OptionPicker
            label="Service areas"
            options={areaOptions}
            selected={selectedAreas}
            onChange={setSelectedAreas}
            emptyMessage={`No areas found for ${profile.user.city || "your city"}. Update your city in account settings.`}
          />

          <OptionPicker
            label="Languages"
            options={languageOptions}
            selected={selectedLanguages}
            onChange={setSelectedLanguages}
          />

          <div className="space-y-2">
            <Label>Certifications (comma separated)</Label>
            <Input value={form.certifications} onChange={(e) => setForm({ ...form, certifications: e.target.value })} />
          </div>
          <Button onClick={saveProfile} disabled={saving}>Save profile</Button>
        </TabsContent>

        <TabsContent value="services" className="space-y-4 mt-4">
          {services.map((svc, i) => (
            <Card key={svc.id}>
              <CardContent className="pt-6 space-y-3">
                <p className="font-medium">{svc.category.name}</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label>Fixed price (₹)</Label>
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
                    <Label>Min quote (₹)</Label>
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
                    <Label>Max quote (₹)</Label>
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
          <Button onClick={saveServices} disabled={saving}>Save pricing</Button>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4 mt-4">
          <AvailabilityEditor schedules={schedules} onChange={setSchedules} />
          <Button onClick={saveAvailability} disabled={saving}>Save availability</Button>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4 mt-4">
          <Input type="file" accept="image/*" onChange={addPortfolio} />
          <div className="grid grid-cols-3 gap-3">
            {portfolio.map((item) => (
              <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden">
                <Image src={item.imageUrl} alt={item.title || "Portfolio"} fill className="object-cover" />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
