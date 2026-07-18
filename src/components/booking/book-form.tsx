"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatAvailabilitySummary, isBookingWithinAvailability } from "@/lib/availability";
import { useI18n } from "@/lib/i18n/context";
import { getCategoryMetadata } from "@/lib/category-catalog";
import { Camera, X } from "lucide-react";

type BookingField = {
  name: string;
  label: string;
  type: "select" | "text";
  required?: boolean;
  options?: string[];
};

type AvailabilitySlot = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

type ProData = {
  id: string;
  user: { name: string | null };
  availability?: AvailabilitySlot[];
  services: {
    id: string;
    categoryId: string;
    category: { name: string; slug: string };
    price: number | null;
    priceType: string;
    minPrice: number | null;
  }[];
};

export function BookForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { t } = useI18n();
  const proId = params.proId as string;
  const preselectedCategorySlug = searchParams.get("category");
  const [pro, setPro] = useState<ProData | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [bookingMeta, setBookingMeta] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    categoryId: "",
    type: "INSTANT" as "INSTANT" | "QUOTE",
    title: "",
    description: "",
    scheduledDate: "",
    scheduledTime: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    if (!proId) return;
    fetch(`/api/professionals/${proId}`)
      .then((r) => r.json())
      .then((data) => {
        setPro(data.professional);
        if (data.professional?.services?.length) {
          const match = preselectedCategorySlug
            ? data.professional.services.find(
                (s: { category: { slug: string } }) => s.category.slug === preselectedCategorySlug
              )
            : data.professional.services[0];
          if (match) {
            setForm((f) => ({
              ...f,
              categoryId: match.categoryId,
              type: match.price ? "INSTANT" : "QUOTE",
            }));
          }
        }
      });
  }, [proId, preselectedCategorySlug]);

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || photoUrls.length >= 3) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setPhotoUrls((prev) => [...prev, data.url]);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (pro?.availability?.length) {
      const slotCheck = isBookingWithinAvailability(
        form.scheduledDate,
        form.scheduledTime,
        pro.availability
      );
      if (!slotCheck.valid) {
        setError(slotCheck.message || "Selected time is not available");
        return;
      }
    }

    const selectedService = pro?.services.find((s) => s.categoryId === form.categoryId);
    const categoryMeta = selectedService
      ? getCategoryMetadata(selectedService.category.slug)
      : undefined;
    const bookingFields = (categoryMeta?.bookingFields as BookingField[] | undefined) ?? [];
    for (const field of bookingFields) {
      if (field.required && !bookingMeta[field.name]) {
        setError(`${field.label} is required`);
        return;
      }
    }

    setLoading(true);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        professionalId: proId,
        ...form,
        photoUrls: form.type === "QUOTE" ? photoUrls : [],
        metadata: bookingMeta,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Booking failed");
      return;
    }

    router.push(`/dashboard/bookings/${data.booking.id}`);
  }

  if (!pro) {
    return <div className="container mx-auto px-4 py-12 text-center">{t.book.loading}</div>;
  }

  const selectedService = pro.services.find((s) => s.categoryId === form.categoryId);
  const showServiceDropdown =
    !preselectedCategorySlug && pro.services.length > 1;
  const categoryMeta = selectedService
    ? getCategoryMetadata(selectedService.category.slug)
    : undefined;
  const bookingFields = (categoryMeta?.bookingFields as BookingField[] | undefined) ?? [];

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle>{t.book.title} {pro.user.name}</CardTitle>
          <CardDescription>{t.book.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {showServiceDropdown ? (
              <div className="space-y-2">
                <Label>{t.book.service}</Label>
                <Select
                  value={form.categoryId}
                  onValueChange={(v) => {
                    const svc = pro.services.find((s) => s.categoryId === v);
                    setForm((f) => ({
                      ...f,
                      categoryId: v,
                      type: svc?.price ? "INSTANT" : "QUOTE",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service" />
                  </SelectTrigger>
                  <SelectContent>
                    {pro.services.map((s) => (
                      <SelectItem key={s.id} value={s.categoryId}>
                        {s.category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : selectedService ? (
              <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">{t.book.selectedService}</p>
                <p className="font-medium text-brand">{selectedService.category.name}</p>
              </div>
            ) : null}

            {bookingFields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label>{field.label}</Label>
                {field.type === "select" && field.options ? (
                  <Select
                    value={bookingMeta[field.name] ?? ""}
                    onValueChange={(v) =>
                      setBookingMeta((m) => ({ ...m, [field.name]: v }))
                    }
                    required={field.required}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={bookingMeta[field.name] ?? ""}
                    onChange={(e) =>
                      setBookingMeta((m) => ({ ...m, [field.name]: e.target.value }))
                    }
                    required={field.required}
                  />
                )}
              </div>
            ))}

            <Tabs
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as "INSTANT" | "QUOTE" }))}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="INSTANT" disabled={!selectedService?.price}>
                  {t.book.instantBook}
                </TabsTrigger>
                <TabsTrigger value="QUOTE">{t.book.requestQuote}</TabsTrigger>
              </TabsList>
              <TabsContent value="INSTANT" className="text-sm text-muted-foreground mt-2">
                {selectedService?.price
                  ? `${t.book.fixedPrice}: ₹${selectedService.price}`
                  : t.book.fixedNotAvailable}
              </TabsContent>
              <TabsContent value="QUOTE" className="text-sm text-muted-foreground mt-2">
                {t.book.quoteDesc}
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>{t.book.jobTitle}</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder={t.book.jobTitlePlaceholder}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>{t.book.description}</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                required={form.type === "QUOTE"}
              />
            </div>

            {form.type === "QUOTE" && (
              <div className="space-y-2">
                <Label>{t.book.issuePhoto}</Label>
                <p className="text-xs text-muted-foreground">{t.book.issuePhotoOptional}</p>
                <div className="flex flex-wrap gap-3 items-center">
                  {photoUrls.map((url, i) => (
                    <div key={url} className="relative h-20 w-20 rounded-lg overflow-hidden border border-white/10">
                      <Image src={url} alt="" fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => setPhotoUrls((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1 right-1 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {photoUrls.length < 3 && (
                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-brand/30 bg-brand/5 hover:bg-brand/10 transition-colors">
                      <Camera className="h-5 w-5 text-brand mb-1" />
                      <span className="text-[10px] text-muted-foreground text-center px-1">
                        {uploading ? t.book.uploading : t.book.addPhoto}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={uploadPhoto}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t.book.date}</Label>
                <Input
                  type="date"
                  value={form.scheduledDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t.book.time}</Label>
                <Input
                  type="time"
                  value={form.scheduledTime}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            {pro.availability && pro.availability.length > 0 && (
              <p className="text-xs text-muted-foreground rounded-md bg-muted/50 p-3">
                <span className="font-medium">{t.book.availability}: </span>
                {formatAvailabilitySummary(pro.availability)}
              </p>
            )}

            <div className="space-y-2">
              <Label>{t.book.address}</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>City</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                required
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/professionals/${proId}`}>{t.book.cancel}</Link>
              </Button>
              <Button type="submit" disabled={loading || uploading} className="flex-1">
                {loading
                  ? t.book.booking
                  : form.type === "INSTANT"
                    ? t.book.confirmBooking
                    : t.book.requestQuoteBtn}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
