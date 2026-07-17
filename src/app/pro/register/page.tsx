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

type Category = { id: string; name: string; slug: string };
type CityOption = { id: string; name: string };

export default function ProRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
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
      .then((data) => setCategories(data.categories || []));
    fetch("/api/cities")
      .then((r) => r.json())
      .then((data) => setCities(data.cities || []));
  }, []);

  useEffect(() => {
    if (!form.city && step < 2) return;
    const slugs = categories
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
  }, [form.city, form.categoryIds, categories, step]);

  function update(field: string, value: string | number | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleCategory(id: string) {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
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
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Join KaamSetu as a Professional</CardTitle>
          <CardDescription>
            Step {step} of 4 — Build your digital business card and reach more customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input value={form.name} onChange={(e) => update("name", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Select value={form.city} onValueChange={(v) => update("city", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
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
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Services you offer</Label>
                <p className="text-xs text-muted-foreground">Select categories first — skills will update based on your selection.</p>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-sm ${
                        form.categoryIds.includes(cat.id) ? "border-brand bg-brand/5" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.categoryIds.includes(cat.id)}
                        onChange={() => toggleCategory(cat.id)}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1" disabled={form.categoryIds.length === 0}>
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>About you</Label>
                <Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Years of experience</Label>
                <Input type="number" min={0} value={form.experienceYears} onChange={(e) => update("experienceYears", Number(e.target.value))} />
              </div>

              <OptionPicker
                label="Skills"
                options={skillOptions}
                selected={form.skills}
                onChange={(skills) => update("skills", skills)}
              />

              <OptionPicker
                label="Service areas you cover"
                options={areaOptions}
                selected={form.serviceAreas}
                onChange={(serviceAreas) => update("serviceAreas", serviceAreas)}
                emptyMessage={`Select areas in ${form.city}.`}
              />

              <OptionPicker
                label="Languages"
                options={languageOptions}
                selected={form.languages}
                onChange={(languages) => update("languages", languages)}
              />

              <div className="space-y-2">
                <Label>Certifications (comma separated)</Label>
                <Input value={form.certifications} onChange={(e) => update("certifications", e.target.value)} />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button
                  onClick={() => setStep(4)}
                  className="flex-1"
                  disabled={form.skills.length === 0 || form.serviceAreas.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Verification documents</Label>
                <p className="text-xs text-muted-foreground">
                  Upload ID proof, trade license, or certification (JPG, PNG, or PDF, max 5MB each). At least one document is required.
                </p>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={uploadDocument}
                  disabled={uploadingDoc}
                />
                {uploadingDoc && <p className="text-xs text-muted-foreground">Uploading...</p>}
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
                  I agree to the{" "}
                  <Link href="/terms" className="text-brand hover:underline" target="_blank">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-brand hover:underline" target="_blank">Privacy Policy</Link>.
                </span>
              </label>

              <p className="text-sm text-muted-foreground">
                Your profile will be reviewed by our admin team before going live.
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !acceptedTerms || documentUrls.length === 0}
                  className="flex-1"
                >
                  {loading ? "Submitting..." : "Submit for Review"}
                </Button>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground text-center">
            Already registered? <Link href="/auth/login" className="text-brand hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
