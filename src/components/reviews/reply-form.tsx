"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ReviewReplyForm({ reviewId }: { reviewId: string }) {
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reviewId, comment }),
    });
    setLoading(false);
    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a reply..." rows={2} required />
      <Button type="submit" size="sm" disabled={loading}>
        {loading ? "Posting..." : "Reply"}
      </Button>
    </form>
  );
}
