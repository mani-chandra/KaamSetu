"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card3D } from "@/components/3d/card-3d";

export function CustomerBookingActions({
  bookingId,
  status,
  hasDispute,
}: {
  bookingId: string;
  status: string;
  hasDispute: boolean;
}) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const canCancel = ["REQUESTED", "QUOTED", "CONFIRMED"].includes(status);
  const canDispute = ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(status) && !hasDispute;

  async function cancelBooking() {
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
      setMessage("Booking cancelled.");
    } else {
      const data = await res.json();
      setMessage(data.error || "Cancel failed");
    }
  }

  async function raiseDispute() {
    setLoading(true);
    const res = await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, reason: disputeReason }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
      setMessage("Dispute submitted. Our team will review it.");
    } else {
      const data = await res.json();
      setMessage(data.error || "Dispute failed");
    }
  }

  if (!canCancel && !canDispute) return null;

  return (
    <Card3D className="p-6 space-y-4">
      <h3 className="font-semibold">Booking Actions</h3>
      {message && <p className="text-sm text-brand">{message}</p>}
      {canCancel && (
        <div className="space-y-2">
          <Label>Cancel booking</Label>
          <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (optional)" rows={2} />
          <Button variant="outline" onClick={cancelBooking} disabled={loading}>
            Cancel Booking
          </Button>
        </div>
      )}
      {canDispute && (
        <div className="space-y-2 border-t border-white/10 pt-4">
          <Label>Raise a dispute</Label>
          <Textarea value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)} placeholder="Describe the issue (min 10 characters)" rows={3} />
          <Button variant="destructive" onClick={raiseDispute} disabled={loading || disputeReason.length < 10}>
            Submit Dispute
          </Button>
        </div>
      )}
    </Card3D>
  );
}
