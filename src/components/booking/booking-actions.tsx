"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { BookingStatus } from "@prisma/client";

export function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: BookingStatus;
}) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(newStatus: BookingStatus, note?: string) {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, note }),
    });
    setLoading(false);
    window.location.reload();
  }

  return (
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
        <Button size="sm" disabled={loading} onClick={() => updateStatus("IN_PROGRESS", "Work started")}>
          Start Work
        </Button>
      )}
      {status === "IN_PROGRESS" && (
        <Button size="sm" disabled={loading} onClick={() => updateStatus("COMPLETED", "Work completed")}>
          Mark Complete
        </Button>
      )}
    </div>
  );
}
