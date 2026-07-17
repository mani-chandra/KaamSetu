"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MembershipSubscribeButton({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  async function handleSubscribe() {
    setLoading(true);
    const res = await fetch("/api/memberships/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    setLoading(false);
    if (res.ok) setSubscribed(true);
  }

  if (subscribed) {
    return <p className="text-brand font-medium text-sm">Subscribed successfully!</p>;
  }

  return (
    <Button className="w-full" onClick={handleSubscribe} disabled={loading}>
      {loading ? "Processing..." : "Subscribe"}
    </Button>
  );
}
