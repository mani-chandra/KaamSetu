"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BookingStatus } from "@prisma/client";

export function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  async function updateStatus(newStatus: BookingStatus, note?: string) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, note }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Update failed");
      return;
    }
    window.location.reload();
  }

  async function startService() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/bookings/${bookingId}/start-service`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Invalid OTP");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {status === "REQUESTED" && (
          <>
            <Button size="sm" disabled={loading} onClick={() => updateStatus("CONFIRMED", "Booking accepted")}>
              Accept
            </Button>
            <Button size="sm" variant="outline" disabled={loading} onClick={() => updateStatus("CANCELLED", "Declined by professional")}>
              Decline
            </Button>
          </>
        )}
        {status === "CONFIRMED" && (
          <Button size="sm" disabled={loading} onClick={() => updateStatus("EN_ROUTE", "Professional on the way")}>
            On the way
          </Button>
        )}
        {status === "EN_ROUTE" && (
          <div className="flex flex-wrap items-end gap-2 w-full">
            <div className="space-y-1">
              <Label htmlFor={`otp-${bookingId}`} className="text-xs">
                Customer OTP to start service
              </Label>
              <Input
                id={`otp-${bookingId}`}
                inputMode="numeric"
                maxLength={4}
                placeholder="4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                className="w-32"
              />
            </div>
            <Button size="sm" disabled={loading || otp.length !== 4} onClick={startService}>
              Start service
            </Button>
          </div>
        )}
        {status === "IN_PROGRESS" && (
          <Button size="sm" disabled={loading} onClick={() => updateStatus("COMPLETED", "Work completed")}>
            Mark Complete
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
