"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export function PaymentButton({ bookingId, amount }: { bookingId: string; amount: number }) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);

  async function handlePay() {
    setLoading(true);
    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    setLoading(false);
    if (res.ok) setPaid(true);
  }

  if (paid) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-brand font-medium">Payment successful! Invoice generated.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Pay {formatCurrency(amount)} for this completed service.
        </p>
        <Button onClick={handlePay} disabled={loading}>
          {loading ? "Processing..." : `Pay ${formatCurrency(amount)}`}
        </Button>
      </CardContent>
    </Card>
  );
}
