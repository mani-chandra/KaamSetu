"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MembershipSubscribeButton({
  planId,
  price,
}: {
  planId: string;
  price: number;
}) {
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  async function loadRazorpay(): Promise<boolean> {
    if (window.Razorpay) return true;
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function handleSubscribe() {
    setLoading(true);
    setError("");

    const orderRes = await fetch("/api/memberships/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      setLoading(false);
      setError(orderData.error || "Failed to start checkout");
      return;
    }

    if (orderData.demo) {
      const verifyRes = await fetch("/api/memberships/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          razorpayOrderId: orderData.order.id,
          razorpayPaymentId: `pay_demo_${Date.now()}`,
          razorpaySignature: "demo",
        }),
      });
      setLoading(false);
      if (verifyRes.ok) setSubscribed(true);
      else setError("Activation failed");
      return;
    }

    await loadRazorpay();
    const Razorpay = (window as Window & { Razorpay?: new (options: Record<string, unknown>) => { open: () => void } }).Razorpay;
    if (!Razorpay) {
      setLoading(false);
      setError("Payment gateway failed to load");
      return;
    }

    const rzp = new Razorpay({
      key: orderData.keyId,
      amount: orderData.order.amount,
      currency: orderData.order.currency,
      name: "KaamSetu",
      description: orderData.plan.name,
      order_id: orderData.order.id,
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const verifyRes = await fetch("/api/memberships/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
        });
        setLoading(false);
        if (verifyRes.ok) setSubscribed(true);
        else setError("Payment verification failed");
      },
      modal: { ondismiss: () => setLoading(false) },
    });
    rzp.open();
    setLoading(false);
  }

  if (subscribed) {
    return <p className="text-brand font-medium text-sm">Subscribed successfully!</p>;
  }

  return (
    <div>
      {error && <p className="text-sm text-destructive mb-2">{error}</p>}
      <Button className="w-full" onClick={handleSubscribe} disabled={loading}>
        {loading ? "Processing..." : `Subscribe — ₹${price}/mo`}
      </Button>
    </div>
  );
}
