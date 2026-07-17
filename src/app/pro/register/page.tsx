"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Category = { id: string; name: string; slug: string };

export default function ProRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
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
    skills: "",
    languages: "",
    certifications: "",
    serviceAreas: "",
    categoryIds: [] as string[],
  });

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

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

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/pro/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
        certifications: form.certifications.split(",").map((s) => s.trim()).filter(Boolean),
        serviceAreas: form.serviceAreas.split(",").map((s) => s.trim()).filter(Boolean),
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
            Step {step} of 3 — Build your digital business card and reach more customers
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
                  <Input value={form.city} onChange={(e) => update("city", e.target.value)} />
                </div>
              </div>
              <Button onClick={() => setStep(2)} className="w-full">Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>About you</Label>
                <Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} rows={4} />
              </div>
              <div className="space-y-2">
                <Label>Years of experience</Label>
                <Input type="number" min={0} value={form.experienceYears} onChange={(e) => update("experienceYears", Number(e.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Skills (comma separated)</Label>
                <Input value={form.skills} onChange={(e) => update("skills", e.target.value)} placeholder="Pipe repair, Installation" />
              </div>
              <div className="space-y-2">
                <Label>Languages (comma separated)</Label>
                <Input value={form.languages} onChange={(e) => update("languages", e.target.value)} placeholder="Hindi, English" />
              </div>
              <div className="space-y-2">
                <Label>Certifications (comma separated)</Label>
                <Input value={form.certifications} onChange={(e) => update("certifications", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Service areas (comma separated)</Label>
                <Input value={form.serviceAreas} onChange={(e) => update("serviceAreas", e.target.value)} placeholder="Andheri, Bandra" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Services you offer</Label>
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
              <p className="text-sm text-muted-foreground">
                Your profile will be reviewed by our admin team before going live. You&apos;ll receive a notification once approved.
              </p>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
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
