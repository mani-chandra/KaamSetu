"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

type Quote = {
  id: string;
  amount: number;
  message: string | null;
  status: string;
  professional: { user: { name: string | null } };
};

export function MarketplaceQuoteCompare({
  bookingId,
  quotes,
}: {
  bookingId: string;
  quotes: Quote[];
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const sent = quotes.filter((q) => q.status === "SENT");

  async function accept(quoteId: string) {
    setLoading(quoteId);
    await fetch(`/api/bookings/${bookingId}/marketplace-quote/${quoteId}/accept`, { method: "POST" });
    setLoading(null);
    window.location.reload();
  }

  if (sent.length === 0) return null;

  return (
    <Card>
      <CardHeader><CardTitle>Compare Quotes</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {sent.map((q) => (
          <div key={q.id} className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium">{q.professional.user.name}</p>
              <p className="text-lg font-bold text-brand">{formatCurrency(q.amount)}</p>
              {q.message && <p className="text-sm text-muted-foreground">{q.message}</p>}
            </div>
            <Button size="sm" disabled={loading === q.id} onClick={() => accept(q.id)}>
              Book
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function EmergencyAcceptButton({ bookingId }: { bookingId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/bookings/${bookingId}/accept-emergency`, { method: "POST" });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Could not accept");
      return;
    }
    window.location.reload();
  }

  return (
    <Card className="border-red-500/30">
      <CardHeader><CardTitle className="text-red-500">🚨 Emergency Request</CardTitle></CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">First professional to accept gets this job.</p>
        {error && <p className="text-sm text-destructive mb-2">{error}</p>}
        <Button variant="destructive" onClick={accept} disabled={loading}>
          {loading ? "Accepting..." : "Accept Emergency Job"}
        </Button>
      </CardContent>
    </Card>
  );
}

export function MarketplaceQuoteForm({ bookingId }: { bookingId: string }) {
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}/marketplace-quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), message }),
    });
    setLoading(false);
    if (res.ok) setDone(true);
  }

  if (done) return <p className="text-sm text-brand">Quote submitted!</p>;

  return (
    <form onSubmit={submit} className="space-y-3 p-4 border rounded-lg">
      <p className="font-medium text-sm">Submit your quote</p>
      <Input type="number" placeholder="Amount (₹)" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      <Input placeholder="Message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
      <Button type="submit" size="sm" disabled={loading}>Send Quote</Button>
    </form>
  );
}
