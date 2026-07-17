"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
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

type ProData = {
  id: string;
  user: { name: string | null };
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
  const proId = params.proId as string;
  const [pro, setPro] = useState<ProData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
        const categorySlug = searchParams.get("category");
        if (data.professional?.services?.length) {
          const match = categorySlug
            ? data.professional.services.find((s: { category: { slug: string } }) => s.category.slug === categorySlug)
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
  }, [proId, searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professionalId: proId, ...form }),
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
    return <div className="container mx-auto px-4 py-12 text-center">Loading...</div>;
  }

  const selectedService = pro.services.find((s) => s.categoryId === form.categoryId);

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Book {pro.user.name}</CardTitle>
          <CardDescription>Choose booking type and schedule your service</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Service</Label>
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

            <Tabs
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v as "INSTANT" | "QUOTE" }))}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="INSTANT" disabled={!selectedService?.price}>
                  Instant Book
                </TabsTrigger>
                <TabsTrigger value="QUOTE">Request Quote</TabsTrigger>
              </TabsList>
              <TabsContent value="INSTANT" className="text-sm text-muted-foreground mt-2">
                {selectedService?.price
                  ? `Fixed price: ₹${selectedService.price}`
                  : "Fixed pricing not available for this service"}
              </TabsContent>
              <TabsContent value="QUOTE" className="text-sm text-muted-foreground mt-2">
                Describe your requirements and receive a quote from the professional.
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Kitchen tap repair"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                required={form.type === "QUOTE"}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={form.scheduledTime}
                  onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
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
                <Link href={`/professionals/${proId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Booking..." : form.type === "INSTANT" ? "Confirm Booking" : "Request Quote"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
