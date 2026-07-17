"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PaymentButton({
  bookingId,
  amount,
}: {
  bookingId: string;
  amount: number;
}) {
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);

  async function handlePay() {
    setLoading(true);

    const orderRes = await fetch("/api/payments/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });
    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      setLoading(false);
      return;
    }

    if (orderData.demo) {
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          razorpayOrderId: orderData.order.id,
          razorpayPaymentId: `pay_demo_${Date.now()}`,
        }),
      });
      const verifyData = await verifyRes.json();
      setLoading(false);
      if (verifyRes.ok) {
        setPaid(true);
        setInvoiceNumber(verifyData.payment?.invoiceNumber);
      }
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setLoading(false);
      return;
    }

    const options = {
      key: orderData.keyId,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: "KaamSetu",
      description: "Service payment",
      order_id: orderData.order.id,
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        });
        const verifyData = await verifyRes.json();
        setLoading(false);
        if (verifyRes.ok) {
          setPaid(true);
          setInvoiceNumber(verifyData.payment?.invoiceNumber);
        }
      },
      theme: { color: "#0F766E" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
    setLoading(false);
  }

  if (paid) {
    return (
      <Card>
        <CardContent className="pt-6 space-y-2">
          <p className="text-brand font-medium">Payment successful!</p>
          {invoiceNumber && (
            <p className="text-sm text-muted-foreground">
              Invoice: <span className="font-mono">{invoiceNumber}</span>
            </p>
          )}
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
