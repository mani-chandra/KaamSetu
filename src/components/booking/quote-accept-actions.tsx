"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function QuoteAcceptActions({
  bookingId,
  amount,
}: {
  bookingId: string;
  amount: number;
}) {
  const [loading, setLoading] = useState(false);

  async function respond(action: "accept" | "reject") {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}/quote/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    window.location.reload();
  }

  return (
    <Card>
      <CardHeader><CardTitle>Quote Received</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          The professional sent a quote of {formatCurrency(amount)}. Accept to confirm the booking.
        </p>
        <div className="flex gap-2">
          <Button onClick={() => respond("accept")} disabled={loading}>
            Accept Quote
          </Button>
          <Button variant="outline" onClick={() => respond("reject")} disabled={loading}>
            Decline
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
