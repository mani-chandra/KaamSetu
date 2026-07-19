"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useI18n } from "@/lib/i18n/context";
import {
  getBookingFlow,
  getBookingFlowConfig,
  getRecurringFrequencies,
  type BookingFlow,
  type ServicePackageDef,
} from "@/lib/booking-flows";
import { MediaUpload } from "@/components/booking/media-upload";
import { ProPicker } from "@/components/booking/pro-picker";
import { formatCurrency } from "@/lib/utils";

type StepId = "service" | "issue" | "describe" | "recurring" | "schedule" | "address" | "pro" | "confirm";

type BookWizardProps = {
  mode?: "standard" | "marketplace" | "emergency";
};

export type { BookWizardProps };

function repairNeedsDescribeStep(
  issueKnown: "" | "yes" | "no",
  commonIssue: string
): boolean {
  if (issueKnown === "no") return true;
  if (issueKnown === "yes" && (!commonIssue || commonIssue === "Other")) return true;
  return false;
}

function getStepIds(
  flow: BookingFlow,
  mode: BookWizardProps["mode"],
  consultationMode: string,
  issueKnown: "" | "yes" | "no",
  commonIssue: string
): StepId[] {
  if (mode === "emergency") return ["service", "schedule"];
  if (mode === "marketplace") return ["service", "describe", "address", "pro"];

  const needsAddress =
    flow !== "consultation" ||
    ["Home Visit", "In-Person"].includes(consultationMode);

  switch (flow) {
    case "instant":
      return ["service", "schedule", "address", "pro", "confirm"];
    case "repair": {
      const steps: StepId[] = ["service", "issue"];
      if (repairNeedsDescribeStep(issueKnown, commonIssue)) steps.push("describe");
      steps.push("schedule", "address", "pro");
      return steps;
    }
    case "inspection":
      return ["service", "describe", "address", "schedule", "pro"];
    case "recurring":
      return ["service", "recurring", "schedule", "address", "pro"];
    case "consultation":
      return needsAddress
        ? ["service", "schedule", "address", "pro"]
        : ["service", "schedule", "pro"];
    case "marketplace":
      return ["service", "describe", "address", "pro"];
    default:
      return ["service", "schedule", "address", "pro"];
  }
}

export function BookWizard({ mode = "standard" }: BookWizardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();

  const preselectedCategorySlug = searchParams.get("category") || "";
  const preselectedCategoryId = searchParams.get("categoryId") || "";
  const preferredProId = searchParams.get("pro") || "";
  const isServiceLocked = Boolean(preselectedCategorySlug || preselectedCategoryId);

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [videoUrls, setVideoUrls] = useState<string[]>([]);
  const [selectedProId, setSelectedProId] = useState("");
  const [openRequest, setOpenRequest] = useState(false);
  const [minBookingDate, setMinBookingDate] = useState("");
  const [matchedPros, setMatchedPros] = useState<{ id: string; user: { name: string | null }; service: { price: number | null } | null }[]>([]);

  const [form, setForm] = useState({
    categoryId: preselectedCategoryId,
    categorySlug: preselectedCategorySlug,
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    address: "",
    city: "",
    specialInstructions: "",
    packageId: "",
    consultationMode: "",
    budget: "",
    eventDate: "",
    issueKnown: "" as "" | "yes" | "no",
    commonIssue: "",
    frequency: "",
    preferredTime: "",
    durationWeeks: "",
  });

  useEffect(() => {
    setMinBookingDate(new Date().toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        const all = (data.groups || []).flatMap(
          (g: { categories: { id: string; name: string; slug: string }[] }) => g.categories
        );
        setCategories(all);
        if (preselectedCategoryId) {
          const cat = all.find((c: { id: string }) => c.id === preselectedCategoryId);
          if (cat) setForm((f) => ({ ...f, categoryId: cat.id, categorySlug: cat.slug }));
        } else if (preselectedCategorySlug) {
          const cat = all.find((c: { slug: string }) => c.slug === preselectedCategorySlug);
          if (cat) setForm((f) => ({ ...f, categoryId: cat.id, categorySlug: cat.slug }));
        }
      });
    fetch("/api/cities")
      .then((r) => r.json())
      .then((data) => setCities(data.cities || []));
  }, [preselectedCategorySlug, preselectedCategoryId]);

  const selectedCategoryName =
    categories.find((c) => c.id === form.categoryId)?.name ||
    (form.categorySlug ? form.categorySlug.replace(/-/g, " ") : "");

  const flow: BookingFlow = useMemo(() => {
    if (mode === "emergency") return "emergency";
    if (mode === "marketplace") return "marketplace";
    return form.categorySlug ? getBookingFlow(form.categorySlug) : "repair";
  }, [mode, form.categorySlug]);

  const flowConfig = form.categorySlug ? getBookingFlowConfig(form.categorySlug) : null;
  const packages = (flowConfig?.packages ?? []) as ServicePackageDef[];
  const commonIssues = flowConfig?.commonIssues ?? [];
  const consultationModes = flowConfig?.consultationModes ?? [];

  const steps = useMemo(
    () => getStepIds(flow, mode, form.consultationMode, form.issueKnown, form.commonIssue),
    [flow, mode, form.consultationMode, form.issueKnown, form.commonIssue]
  );
  const currentStep = steps[stepIndex] ?? "service";
  const totalSteps = steps.length;
  const isLastStep = stepIndex === totalSteps - 1;

  useEffect(() => {
    setStepIndex((i) => Math.min(i, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  const slotTime = flow === "recurring" ? form.preferredTime : form.scheduledTime;
  const slotDate = form.scheduledDate;

  const handleSelectPro = useCallback((id: string) => {
    setSelectedProId(id);
    setOpenRequest(false);
  }, []);

  const handleAlternateSlot = useCallback((date: string, time: string) => {
    setForm((f) => ({
      ...f,
      scheduledDate: date,
      scheduledTime: flow === "recurring" ? f.scheduledTime : time,
      preferredTime: flow === "recurring" ? time : f.preferredTime,
    }));
    setSelectedProId("");
  }, [flow]);

  const selectedPro = matchedPros.find((p) => p.id === selectedProId);

  const fetchMatchedPros = useCallback(async () => {
    if (!form.categoryId || !slotDate || !slotTime) return;
    const params = new URLSearchParams({
      categoryId: form.categoryId,
      date: slotDate,
      time: slotTime,
    });
    if (form.city) params.set("city", form.city);
    if (preferredProId) params.set("pro", preferredProId);
    const res = await fetch(`/api/professionals/available?${params}`);
    const data = await res.json();
    setMatchedPros(data.professionals ?? []);
  }, [form.categoryId, form.city, slotDate, slotTime, preferredProId]);

  useEffect(() => {
    if (currentStep === "pro" || currentStep === "confirm") {
      fetchMatchedPros();
    }
  }, [currentStep, fetchMatchedPros]);

  function nextStep() {
    setError("");
    if (currentStep === "service" && !form.categoryId) {
      if (isServiceLocked && form.categorySlug) {
        setError(t.book.loading);
        return;
      }
      setError("Please select a service");
      return;
    }
    if (currentStep === "issue") {
      if (!form.issueKnown) {
        setError("Please indicate if you know the issue");
        return;
      }
      if (form.issueKnown === "yes" && commonIssues.length > 0 && !form.commonIssue) {
        setError("Please select the issue");
        return;
      }
    }
    if (currentStep === "describe" && flow === "repair" && !form.description.trim()) {
      setError("Please describe the issue");
      return;
    }
    if (currentStep === "recurring" && !form.frequency) {
      setError("Please select a frequency");
      return;
    }
    if (currentStep === "schedule" && mode !== "emergency") {
      if (!form.scheduledDate) {
        setError("Please select a date");
        return;
      }
      if (flow === "recurring" && !form.preferredTime) {
        setError("Please set a preferred time");
        return;
      }
      if (flow !== "recurring" && !form.scheduledTime) {
        setError("Please select a time");
        return;
      }
    }
    if (currentStep === "address" && (!form.address || !form.city)) {
      setError("Please enter address and city");
      return;
    }
    if (currentStep === "pro" && !selectedProId && !openRequest) {
      setError(t.book.selectProRequired);
      return;
    }
    setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLastStep) {
      nextStep();
      return;
    }

    setError("");
    setLoading(true);

    const useOpenRequest = openRequest || (flow === "marketplace" && !selectedProId);
    const categoryName =
      categories.find((c) => c.id === form.categoryId)?.name ||
      selectedCategoryName ||
      "Service booking";
    const resolvedDescription =
      form.description.trim() ||
      (form.commonIssue && form.commonIssue !== "Other" ? form.commonIssue : "") ||
      undefined;
    const resolvedTitle =
      form.title.trim() ||
      (flow === "repair"
        ? form.commonIssue && form.commonIssue !== "Other" && form.commonIssue !== "Unknown issue"
          ? `${categoryName} — ${form.commonIssue}`
          : resolvedDescription
            ? `${categoryName} — ${resolvedDescription.slice(0, 60)}`
            : categoryName
        : categoryName);

    const payload: Record<string, unknown> = {
      professionalId: useOpenRequest ? undefined : selectedProId || undefined,
      categoryId: form.categoryId,
      categorySlug: form.categorySlug,
      title: resolvedTitle,
      description: resolvedDescription,
      scheduledDate: form.scheduledDate || undefined,
      scheduledTime: flow === "recurring" ? form.preferredTime : form.scheduledTime || undefined,
      address: form.address || undefined,
      city: form.city || undefined,
      photoUrls,
      videoUrls,
      specialInstructions: form.specialInstructions || undefined,
      packageId: form.packageId || undefined,
      consultationMode: form.consultationMode || undefined,
      budget: form.budget ? Number(form.budget) : undefined,
      eventDate: form.eventDate || undefined,
      isEmergency: mode === "emergency",
      metadata: {
        issueKnown: form.issueKnown,
        commonIssue: form.commonIssue,
      },
    };

    if (flow === "recurring") {
      payload.recurring = {
        frequency: form.frequency,
        preferredTime: form.preferredTime,
        durationWeeks: form.durationWeeks ? Number(form.durationWeeks) : undefined,
      };
    }

    if (mode === "emergency" && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
        );
        payload.latitude = pos.coords.latitude;
        payload.longitude = pos.coords.longitude;
      } catch {
        /* optional */
      }
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Booking failed");
      return;
    }

    router.push(`/dashboard/bookings/${data.booking.id}`);
  }

  const flowLabel: Record<BookingFlow, string> = {
    instant: "Instant Fixed Booking",
    repair: "Issue-Based Repair",
    inspection: "Inspection & Quotation",
    recurring: "Recurring Service",
    marketplace: "Quote Marketplace",
    consultation: "Consultation",
    emergency: "Emergency Booking",
  };

  const submitLabel = loading
    ? t.book.booking
    : isLastStep
    ? mode === "emergency"
      ? "Send Emergency Alert"
      : flow === "instant"
      ? t.book.confirmBooking
      : openRequest || (flow === "marketplace" && !selectedProId)
      ? "Post Request"
      : flow === "repair" || flow === "inspection"
      ? "Book Technician"
      : t.book.requestQuoteBtn
    : currentStep === "pro"
    ? t.common.continue
    : t.common.continue;

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle>{flowLabel[flow]}</CardTitle>
          <CardDescription>
            {flowLabel[flow]} · Step {stepIndex + 1} of {totalSteps}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentStep === "service" && (
              <>
                {isServiceLocked && (form.categoryId || form.categorySlug) ? (
                  <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3">
                    <p className="text-xs text-muted-foreground mb-1">{t.book.selectedService}</p>
                    <p className="font-medium text-brand">
                      {selectedCategoryName || t.book.loading}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>{t.book.service}</Label>
                    <Select
                      value={form.categoryId}
                      onValueChange={(v) => {
                        const cat = categories.find((c) => c.id === v);
                        setForm((f) => ({ ...f, categoryId: v, categorySlug: cat?.slug || "" }));
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {flow === "instant" && packages.length > 0 && (
                  <div className="space-y-2">
                    <Label>Choose package</Label>
                    <div className="grid gap-2">
                      {packages.map((pkg) => (
                        <label
                          key={pkg.id}
                          className={`flex justify-between p-3 rounded-lg border cursor-pointer ${form.packageId === pkg.id ? "border-brand bg-brand/10" : "border-white/10"}`}
                        >
                          <div className="flex items-center gap-2">
                            <input type="radio" name="pkg" checked={form.packageId === pkg.id} onChange={() => setForm((f) => ({ ...f, packageId: pkg.id }))} />
                            <div>
                              <p className="font-medium text-sm">{pkg.name}</p>
                              {pkg.description && <p className="text-xs text-muted-foreground">{pkg.description}</p>}
                            </div>
                          </div>
                          <span className="font-bold text-brand">₹{pkg.price}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {flow === "consultation" && (
                  <div className="space-y-2">
                    <Label>Consultation mode</Label>
                    <Select value={form.consultationMode} onValueChange={(v) => setForm((f) => ({ ...f, consultationMode: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger>
                      <SelectContent>
                        {consultationModes.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(flow === "marketplace" || mode === "emergency") && (
                  <>
                    <div className="space-y-2">
                      <Label>{t.book.jobTitle}</Label>
                      <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t.book.jobTitlePlaceholder} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.book.description}</Label>
                      <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} required />
                    </div>
                  </>
                )}

                {mode === "emergency" && (
                  <p className="text-sm text-red-500 font-medium">Share your location on the next step. Nearest available professionals will be alerted.</p>
                )}
              </>
            )}

            {currentStep === "issue" && (
              <>
                <div className="space-y-2">
                  <Label>Do you know the issue?</Label>
                  <div className="flex gap-2">
                    <Button type="button" variant={form.issueKnown === "yes" ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, issueKnown: "yes" }))}>Yes</Button>
                    <Button type="button" variant={form.issueKnown === "no" ? "default" : "outline"} onClick={() => setForm((f) => ({ ...f, issueKnown: "no", commonIssue: "Unknown issue" }))}>No</Button>
                  </div>
                </div>
                {form.issueKnown === "yes" && commonIssues.length > 0 && (
                  <div className="space-y-2">
                    <Label>What is the issue?</Label>
                    <Select
                      value={form.commonIssue}
                      onValueChange={(v) =>
                        setForm((f) => ({
                          ...f,
                          commonIssue: v,
                          description: v !== "Other" ? "" : f.description,
                        }))
                      }
                    >
                      <SelectTrigger><SelectValue placeholder="Select issue" /></SelectTrigger>
                      <SelectContent>
                        {commonIssues.map((issue) => (
                          <SelectItem key={issue} value={issue}>{issue}</SelectItem>
                        ))}
                        <SelectItem value="Other">Other — I&apos;ll describe it</SelectItem>
                      </SelectContent>
                    </Select>
                    {form.commonIssue && form.commonIssue !== "Other" && (
                      <p className="text-xs text-muted-foreground">
                        We&apos;ll share this with your professional — no extra description needed.
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {currentStep === "describe" && (
              <>
                <div className="space-y-2">
                  <Label>
                    {flow === "repair" && form.issueKnown === "no"
                      ? "Describe what you're experiencing"
                      : t.book.description}
                  </Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    required={flow === "repair"}
                  />
                </div>
                {(flow !== "repair" || form.issueKnown === "no" || form.commonIssue === "Other") && (
                  <div className="space-y-2">
                    <Label>{t.book.issuePhoto}</Label>
                    <p className="text-xs text-muted-foreground">{t.book.issuePhotoOptional}</p>
                    <MediaUpload photoUrls={photoUrls} videoUrls={videoUrls} onPhotosChange={setPhotoUrls} onVideosChange={setVideoUrls} />
                  </div>
                )}
                {flow === "marketplace" && (
                  <>
                    <div className="space-y-2">
                      <Label>Budget (optional)</Label>
                      <Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} placeholder="₹" />
                    </div>
                    <div className="space-y-2">
                      <Label>Event date</Label>
                      <Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
                    </div>
                  </>
                )}
              </>
            )}

            {currentStep === "recurring" && (
              <>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={form.frequency} onValueChange={(v) => setForm((f) => ({ ...f, frequency: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger>
                    <SelectContent>
                      {getRecurringFrequencies().map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Preferred time</Label>
                    <Input type="time" value={form.preferredTime} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (weeks)</Label>
                    <Input type="number" value={form.durationWeeks} onChange={(e) => setForm({ ...form, durationWeeks: e.target.value })} placeholder="Optional" />
                  </div>
                </div>
              </>
            )}

            {currentStep === "schedule" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{flow === "recurring" ? "First session date" : t.book.date}</Label>
                    <Input type="date" value={form.scheduledDate} min={minBookingDate || undefined} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })} required={mode !== "emergency"} />
                  </div>
                  {flow !== "recurring" && (
                    <div className="space-y-2">
                      <Label>{t.book.time}</Label>
                      <Input type="time" value={form.scheduledTime} onChange={(e) => setForm({ ...form, scheduledTime: e.target.value })} required={mode !== "emergency"} />
                    </div>
                  )}
                </div>
                {mode === "emergency" && (
                  <>
                    <div className="space-y-2">
                      <Label>{t.book.address}</Label>
                      <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                    </div>
                    <div className="space-y-2">
                      <Label>{t.auth.city}</Label>
                      <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
                        <SelectTrigger><SelectValue placeholder={t.auth.city} /></SelectTrigger>
                        <SelectContent>
                          {cities.map((city) => (
                            <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </>
            )}

            {currentStep === "address" && (
              <>
                <div className="space-y-2">
                  <Label>{t.book.address}</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>{t.auth.city}</Label>
                  <Select value={form.city} onValueChange={(v) => setForm({ ...form, city: v })}>
                    <SelectTrigger><SelectValue placeholder={t.auth.city} /></SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city.id} value={city.name}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {flow === "instant" && (
                  <div className="space-y-2">
                    <Label>Special instructions (optional)</Label>
                    <Textarea value={form.specialInstructions} onChange={(e) => setForm({ ...form, specialInstructions: e.target.value })} rows={2} />
                  </div>
                )}
              </>
            )}

            {currentStep === "pro" && slotDate && slotTime && (
              <>
                <p className="text-sm font-medium">{t.book.chooseProfessional}</p>
                <p className="text-xs text-muted-foreground">{slotDate} · {slotTime}{form.city ? ` · ${form.city}` : ""}</p>
                <ProPicker
                  categoryId={form.categoryId}
                  scheduledDate={slotDate}
                  scheduledTime={slotTime}
                  city={form.city}
                  preferredProId={preferredProId}
                  selectedProId={selectedProId}
                  onSelect={handleSelectPro}
                  onAlternateSlot={handleAlternateSlot}
                  allowOpenRequest={flow === "marketplace" || mode === "marketplace"}
                  onOpenRequest={() => {
                    setOpenRequest(true);
                    setSelectedProId("");
                  }}
                />
              </>
            )}

            {currentStep === "confirm" && (
              <div className="rounded-lg bg-brand/5 border border-brand/20 p-4 text-sm space-y-1">
                <p><strong>Service:</strong> {categories.find((c) => c.id === form.categoryId)?.name}</p>
                {form.packageId && packages.find((p) => p.id === form.packageId) && (
                  <p><strong>Package:</strong> {packages.find((p) => p.id === form.packageId)?.name} — ₹{packages.find((p) => p.id === form.packageId)?.price}</p>
                )}
                {selectedPro && (
                  <p><strong>Professional:</strong> {selectedPro.user.name}</p>
                )}
                {selectedPro?.service?.price && (
                  <p><strong>{t.book.fixedPrice}:</strong> {formatCurrency(selectedPro.service.price)}</p>
                )}
                <p><strong>{t.book.date}:</strong> {slotDate} {slotTime}</p>
                <p><strong>{t.book.address}:</strong> {form.address}, {form.city}</p>
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              {stepIndex > 0 && (
                <Button type="button" variant="outline" onClick={() => setStepIndex((i) => i - 1)}>{t.common.back}</Button>
              )}
              <Button type="submit" disabled={loading} className="flex-1">
                {submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
