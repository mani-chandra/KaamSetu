"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function QuoteForm({ bookingId }: { bookingId: string }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: parseFloat(amount), message }),
    });
    setLoading(false);
    window.location.reload();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-lg border border-border bg-muted/50 space-y-3 text-foreground"
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Quote Amount (₹)</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Message</Label>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={2} />
      </div>
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Sending..." : "Send Quote"}
      </Button>
    </form>
  );
}
