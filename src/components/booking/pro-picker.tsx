"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star, ShieldCheck, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";

type AvailablePro = {
  id: string;
  bio: string | null;
  experienceYears: number;
  avgRating: number;
  reviewCount: number;
  completedJobs: number;
  isVerified: boolean;
  user: { name: string | null; image: string | null; city: string | null };
  badges: { label: string }[];
  service: {
    price: number | null;
    priceType: string;
    minPrice: number | null;
    maxPrice: number | null;
  } | null;
  availabilitySummary: string;
};

type AlternateSlot = {
  date: string;
  time: string;
  professionalCount: number;
};

export function ProPicker({
  categoryId,
  scheduledDate,
  scheduledTime,
  city,
  preferredProId,
  selectedProId,
  onSelect,
  onAlternateSlot,
  allowOpenRequest,
  onOpenRequest,
}: {
  categoryId: string;
  scheduledDate: string;
  scheduledTime: string;
  city?: string;
  preferredProId?: string;
  selectedProId: string;
  onSelect: (proId: string) => void;
  onAlternateSlot?: (date: string, time: string) => void;
  allowOpenRequest?: boolean;
  onOpenRequest?: () => void;
}) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [pros, setPros] = useState<AvailablePro[]>([]);
  const [alternates, setAlternates] = useState<AlternateSlot[]>([]);
  const autoSelected = useRef(false);

  useEffect(() => {
    autoSelected.current = false;
    setLoading(true);
    const params = new URLSearchParams({
      categoryId,
      date: scheduledDate,
      time: scheduledTime,
      alternates: "1",
    });
    if (city) params.set("city", city);
    if (preferredProId) params.set("pro", preferredProId);

    fetch(`/api/professionals/available?${params}`)
      .then((r) => r.json())
      .then((data) => {
        const list: AvailablePro[] = data.professionals ?? [];
        setPros(list);
        setAlternates(data.alternates ?? []);
        if (!autoSelected.current && !selectedProId) {
          if (list.length === 1) {
            onSelect(list[0].id);
            autoSelected.current = true;
          } else if (preferredProId && list.some((p) => p.id === preferredProId)) {
            onSelect(preferredProId);
            autoSelected.current = true;
          }
        }
      })
      .finally(() => setLoading(false));
  }, [categoryId, scheduledDate, scheduledTime, city, preferredProId, selectedProId, onSelect]);

  if (loading) {
    return <p className="text-sm text-muted-foreground text-center py-6">{t.book.loadingPros}</p>;
  }

  if (pros.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t.book.noProsAtTime}</p>
        {alternates.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">{t.book.suggestedTimes}</p>
            <div className="flex flex-wrap gap-2">
              {alternates.map((slot) => (
                <Button
                  key={`${slot.date}-${slot.time}`}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAlternateSlot?.(slot.date, slot.time)}
                >
                  {slot.date} · {slot.time} ({slot.professionalCount})
                </Button>
              ))}
            </div>
          </div>
        )}
        {allowOpenRequest && onOpenRequest && (
          <Button type="button" variant="secondary" className="w-full" onClick={onOpenRequest}>
            {t.book.postOpenRequest}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {pros.length} {t.book.prosAvailable}
      </p>
      {pros.map((pro) => {
        const priceLabel = pro.service?.price
          ? formatCurrency(pro.service.price)
          : pro.service?.minPrice
          ? `From ${formatCurrency(pro.service.minPrice)}`
          : t.book.getQuote;

        return (
          <label
            key={pro.id}
            className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedProId === pro.id ? "border-brand bg-brand/10" : "border-white/10 hover:bg-white/5"
            }`}
          >
            <input
              type="radio"
              name="pro"
              className="mt-1"
              checked={selectedProId === pro.id}
              onChange={() => onSelect(pro.id)}
            />
            <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted shrink-0">
              {pro.user.image ? (
                <Image src={pro.user.image} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold text-brand">
                  {pro.user.name?.[0] || "P"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium truncate">{pro.user.name}</span>
                {pro.isVerified && <ShieldCheck className="h-3.5 w-3.5 text-brand shrink-0" />}
                {pro.id === preferredProId && (
                  <span className="text-[10px] bg-brand/20 text-brand px-1.5 py-0.5 rounded">{t.book.yourPick}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {pro.avgRating.toFixed(1)} ({pro.reviewCount})
                <span>·</span>
                <Clock className="h-3 w-3" />
                {pro.experienceYears}y
              </div>
              {pro.user.city && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  {pro.user.city}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-brand text-sm">{priceLabel}</p>
              <p className="text-[10px] text-muted-foreground">{pro.availabilitySummary}</p>
            </div>
          </label>
        );
      })}
    </div>
  );
}
