"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Circle, MapPin, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";
import { getBookingJourneySteps, getCustomerStatusHint } from "@/lib/booking-service";
import type { BookingStatus } from "@prisma/client";

type ProfessionalInfo = {
  id: string;
  user: {
    name: string | null;
    image: string | null;
  };
} | null;

export function CustomerBookingJourney({
  status,
  professional,
  serviceStartOtp,
  compact = false,
}: {
  status: BookingStatus;
  professional: ProfessionalInfo;
  serviceStartOtp?: string | null;
  compact?: boolean;
}) {
  const { t } = useI18n();
  const steps = getBookingJourneySteps(status);
  const hintKey = getCustomerStatusHint(status);
  const showOtp = status === "EN_ROUTE" && serviceStartOtp;

  if (status === "CANCELLED" || status === "DISPUTED") {
    return null;
  }

  const journeyLabels: Record<(typeof steps)[number]["labelKey"], string> = {
    requested: t.bookingJourney.requestSent,
    approved: t.bookingJourney.proApprovedStep,
    enRoute: t.bookingJourney.proOnTheWayStep,
    inProgress: t.bookingJourney.serviceStarted,
    completed: t.bookingJourney.completed,
  };

  return (
    <Card className={compact ? "border-brand/20" : undefined}>
      <CardHeader className={compact ? "pb-3" : undefined}>
        <CardTitle className={compact ? "text-base" : undefined}>
          {t.bookingJourney.title}
        </CardTitle>
        {hintKey && (
          <p className="text-sm text-muted-foreground">{t.bookingJourney[hintKey]}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {professional && (
          <div className="flex items-center gap-3 rounded-lg border border-brand/20 bg-brand/5 p-3">
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-brand/30 bg-muted">
              {professional.user.image ? (
                <Image
                  src={professional.user.image}
                  alt={professional.user.name ?? "Professional"}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-brand">
                  {(professional.user.name ?? "P").charAt(0)}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <ShieldCheck className="h-4 w-4 text-brand shrink-0" />
                {professional.user.name ?? t.bookingJourney.assignedProfessional}
              </div>
              <Link
                href={`/professionals/${professional.id}`}
                className="text-xs text-brand hover:underline"
              >
                {t.bookingJourney.viewProfile}
              </Link>
            </div>
          </div>
        )}

        {showOtp && (
          <div className="rounded-lg border-2 border-dashed border-brand/40 bg-brand/10 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.bookingJourney.otpTitle}
            </p>
            <p className="mt-2 text-3xl font-bold tracking-[0.3em] text-brand">
              {serviceStartOtp}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">{t.bookingJourney.otpHint}</p>
          </div>
        )}

        <div className={compact ? "space-y-2" : "space-y-3"}>
          {steps.map((step) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {step.done ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                ) : step.active ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-brand bg-brand/10">
                    {step.id === "enRoute" ? (
                      <MapPin className="h-3.5 w-3.5 text-brand" />
                    ) : (
                      <Circle className="h-2.5 w-2.5 fill-brand text-brand" />
                    )}
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-muted-foreground/30">
                    <Circle className="h-2.5 w-2.5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="min-w-0 pt-0.5">
                <p
                  className={`text-sm ${
                    step.active
                      ? "font-semibold text-foreground"
                      : step.done
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                  }`}
                >
                  {journeyLabels[step.labelKey]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomerBookingStatusHint({
  status,
  serviceStartOtp,
}: {
  status: BookingStatus;
  serviceStartOtp?: string | null;
}) {
  const { t } = useI18n();
  const hintKey = getCustomerStatusHint(status);

  if (!hintKey) return null;

  return (
    <p className="text-xs text-muted-foreground mt-1">
      {t.bookingJourney[hintKey]}
      {status === "EN_ROUTE" && serviceStartOtp && (
        <span className="ml-1 font-semibold text-brand">
          · {t.bookingJourney.otpShort}: {serviceStartOtp}
        </span>
      )}
    </p>
  );
}
