"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import { ShopCategoryPicker } from "@/components/shop/shop-category-picker";
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

const STEP_LABELS = ["category", "owner", "store", "docs"] as const;

export default function ShopRegisterPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [documentUrls, setDocumentUrls] = useState<string[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    categoryGroupId: "",
    categoryIds: [] as string[],
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    shopName: "",
    description: "",
    address: "",
    pincode: "",
    shopPhone: "",
    gstNumber: "",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setGroups(data.groups || []));
    fetch("/api/cities")
      .then((r) => r.json())
      .then((data) => setCities(data.cities || []));
  }, []);

  function update(field: string, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function uploadDocument(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/shop/register/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploadingDoc(false);

    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }

    setDocumentUrls((prev) => [...prev, data.url]);
    e.target.value = "";
  }

  async function uploadLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError("");
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/shop/register/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploadingLogo(false);

    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }

    setLogoUrl(data.url);
    e.target.value = "";
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/shop/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        logoUrl,
        documentUrls,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/auth/login?shopRegistered=true");
  }

  const stepDescKey = STEP_LABELS[step - 1] as keyof typeof t.shopRegister.stepDescriptions;

  return (
    <div className="page-immersive relative min-h-[calc(100vh-4rem)]">
      <ImmersiveBackground className="opacity-70" />
      <div className="container mx-auto px-4 py-12 max-w-2xl relative z-10">
        <Card className="glass-panel border-white/10">
          <CardHeader>
            <CardTitle>{t.shopRegister.title}</CardTitle>
            <CardDescription>
              {t.shopRegister.stepOf} {step} {t.shopRegister.of} 4 — {t.shopRegister.stepDescriptions[stepDescKey]}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <ShopCategoryPicker
                  groups={groups}
                  selectedGroupId={form.categoryGroupId}
                  selectedCategoryIds={form.categoryIds}
                  onGroupChange={(groupId) => update("categoryGroupId", groupId)}
                  onCategoriesChange={(ids) => update("categoryIds", ids)}
                />
                <Button
                  onClick={() => setStep(2)}
                  className="w-full"
                  disabled={!form.categoryGroupId || form.categoryIds.length === 0}
                >
                  {t.common.continue}
                </Button>
              </div>
            )}

            {step === 2 && (
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
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(1)}>{t.common.back}</Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1"
                    disabled={!form.name || !form.email || !form.password || !form.city}
                  >
                    {t.common.continue}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.shopRegister.shopName}</Label>
                  <Input value={form.shopName} onChange={(e) => update("shopName", e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>{t.shopRegister.aboutShop}</Label>
                  <Textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label>{t.shopRegister.address}</Label>
                  <Textarea value={form.address} onChange={(e) => update("address", e.target.value)} rows={2} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t.shopRegister.pincode}</Label>
                    <Input value={form.pincode} onChange={(e) => update("pincode", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t.shopRegister.shopPhone}</Label>
                    <Input value={form.shopPhone} onChange={(e) => update("shopPhone", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t.shopRegister.gstNumber}</Label>
                  <Input value={form.gstNumber} onChange={(e) => update("gstNumber", e.target.value)} placeholder={t.shopRegister.gstOptional} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(2)}>{t.common.back}</Button>
                  <Button
                    onClick={() => setStep(4)}
                    className="flex-1"
                    disabled={!form.shopName || !form.address}
                  >
                    {t.common.continue}
                  </Button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{t.shopRegister.shopLogo}</Label>
                  <p className="text-xs text-muted-foreground">{t.shopRegister.shopLogoHint}</p>
                  <div className="flex items-center gap-4">
                    {logoUrl && (
                      <div className="relative h-20 w-20 rounded-lg overflow-hidden border-2 border-brand/30">
                        <Image src={logoUrl} alt="Shop logo" fill className="object-cover" unoptimized />
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={uploadLogo}
                      disabled={uploadingLogo}
                    />
                  </div>
                  {uploadingLogo && <p className="text-xs text-muted-foreground">{t.shopRegister.uploading}</p>}
                </div>

                <div className="space-y-2">
                  <Label>{t.shopRegister.verificationDocs}</Label>
                  <p className="text-xs text-muted-foreground">{t.shopRegister.docsHint}</p>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={uploadDocument}
                    disabled={uploadingDoc}
                  />
                  {uploadingDoc && <p className="text-xs text-muted-foreground">{t.shopRegister.uploading}</p>}
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
                    {t.shopRegister.termsAgree}{" "}
                    <Link href="/terms" className="text-brand hover:underline" target="_blank">{t.footer.terms}</Link>
                    {" "}{t.shopRegister.and}{" "}
                    <Link href="/privacy" className="text-brand hover:underline" target="_blank">{t.footer.privacy}</Link>.
                  </span>
                </label>

                <p className="text-sm text-muted-foreground">{t.shopRegister.reviewNote}</p>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStep(3)}>{t.common.back}</Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !acceptedTerms || documentUrls.length === 0 || !logoUrl}
                    className="flex-1"
                  >
                    {loading ? t.shopRegister.submitting : t.shopRegister.submitReview}
                  </Button>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground text-center">
              {t.shopRegister.alreadyRegistered}{" "}
              <Link href="/auth/login" className="text-brand hover:underline">{t.shopRegister.signIn}</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
