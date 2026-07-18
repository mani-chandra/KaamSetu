"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OptionPicker } from "@/components/pro/option-picker";
import { GroupedCategoryPicker } from "@/components/pro/grouped-category-picker";
import { useI18n } from "@/lib/i18n/context";
import { ImmersiveBackground } from "@/components/3d/immersive-background";

type Category = { id: string; name: string; slug: string; icon?: string | null };
type CategoryGroup = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  categories: Category[];
};
type CityOption = { id: string; name: string };

export default function ProRegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [skillOptions, setSkillOptions] = useState<string[]>([]);
  const [areaOptions, setAreaOptions] = useState<string[]>([]);
  const [languageOptions, setLanguageOptions] = useState<string[]>([]);
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    bio: "",
    experienceYears: 0,
    skills: [] as string[],
    languages: [] as string[],
    certifications: "",
    serviceAreas: [] as string[],
    categoryIds: [] as string[],
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setGroups(data.groups || []));
    fetch("/api/cities")
      .then((r) => r.json())
      .then((data) => setCities(data.cities || []));
  }, []);

  useEffect(() => {
    if (!form.city && step < 2) return;
    const allCategories = groups.flatMap((g) => g.categories);
    const slugs = allCategories
      .filter((c) => form.categoryIds.includes(c.id))
      .map((c) => c.slug)
      .join(",");
    const params = new URLSearchParams({ city: form.city, categories: slugs });
    fetch(`/api/pro/options?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setSkillOptions(data.skills || []);
        setAreaOptions(data.serviceAreas || []);
        setLanguageOptions(data.languages || []);
      });
  }, [form.city, form.categoryIds, groups, step]);

  function update(field: string, value: string | number | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadDocument(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/pro/register/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploadingDoc(false);

    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }

    setDocumentUrls((prev) => [...prev, data.url]);
    e.target.value = "";
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/pro/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        documentUrls,
        certifications: form.certifications.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/auth/login?proRegistered=true");
  }

  return (
    <div className="page-immersive relative min-h-[calc(100vh-4rem)]">
      <ImmersiveBackground className="opacity-70" />
      <div className="container mx-auto px-4 py-12 max-w-2xl relative z-10">
      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle>{t.proRegister.title}</CardTitle>
          <CardDescription>
            {t.proRegister.stepOf} {step} {t.proRegister.of} 4 — {t.proRegister.stepDesc}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.auth.fullName}</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>{t.auth.email}</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>{t.auth.password}</Label>
                <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.auth.phone}</Label>
                  <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>{t.auth.city}</Label>
                  <Select value={form.city} onValueChange={(v) => update("city", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.auth.city} />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="w-full" disabled={!form.city}>
                {t.common.continue}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.proRegister.servicesOffer}</Label>
                <GroupedCategoryPicker
                  groups={groups}
                  selectedIds={form.categoryIds}
                  onChange={(ids) => update("categoryIds", ids)}
                  hint={t.proRegister.servicesHint}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>{t.common.back}</Button>
                <Button onClick={() => setStep(3)} className="flex-1" disabled={form.categoryIds.length === 0}>
                  {t.common.continue}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.proRegister.aboutYou}</Label>
                <Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>{t.proRegister.experienceYears}</Label>
                <Input type="number" min={0} value={form.experienceYears} onChange={(e) => update("experienceYears", Number(e.target.value))} />
              </div>

              <OptionPicker
                label={t.proRegister.skills}
                options={skillOptions}
                selected={form.skills}
                onChange={(skills) => update("skills", skills)}
              />

              <OptionPicker
                label={t.proRegister.serviceAreas}
                options={areaOptions}
                selected={form.serviceAreas}
                onChange={(serviceAreas) => update("serviceAreas", serviceAreas)}
                emptyMessage={`${t.proRegister.serviceAreasEmpty} ${form.city}.`}
              />

              <OptionPicker
                label={t.proRegister.languages}
                options={languageOptions}
                selected={form.languages}
                onChange={(languages) => update("languages", languages)}
              />

              <div className="space-y-2">
                <Label>{t.proRegister.certifications}</Label>
                <Input value={form.certifications} onChange={(e) => update("certifications", e.target.value)} />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>{t.common.back}</Button>
                <Button
                  onClick={() => setStep(4)}
                  className="flex-1"
                  disabled={form.skills.length === 0 || form.serviceAreas.length === 0}
                >
                  {t.common.continue}
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{t.proRegister.verificationDocs}</Label>
                <p className="text-xs text-muted-foreground">{t.proRegister.docsHint}</p>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={uploadDocument}
                  disabled={uploadingDoc}
                />
                {uploadingDoc && <p className="text-xs text-muted-foreground">{t.proRegister.uploading}</p>}
                {documentUrls.length > 0 && (
                  <ul className="text-sm space-y-1">
                    {documentUrls.map((url) => (
                      <li key={url} className="text-brand truncate">{url}</li>
                    ))}
                  </ul>
                )}
              </div>

              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  {t.proRegister.termsAgree}{" "}
                  <Link href="/terms" className="text-brand hover:underline" target="_blank">{t.footer.terms}</Link>
                  {" "}{t.proRegister.and}{" "}
                  <Link href="/privacy" className="text-brand hover:underline" target="_blank">{t.footer.privacy}</Link>.
                </span>
              </label>

              <p className="text-sm text-muted-foreground">{t.proRegister.reviewNote}</p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>{t.common.back}</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !acceptedTerms || documentUrls.length === 0}
                  className="flex-1"
                >
                  {loading ? t.proRegister.submitting : t.proRegister.submitReview}
                </Button>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            {t.proRegister.alreadyRegistered}{" "}
            <Link href="/auth/login" className="text-brand hover:underline">{t.proRegister.signIn}</Link>
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
