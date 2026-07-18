"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card3D } from "@/components/3d/card-3d";
import { Star } from "lucide-react";

export function ReviewForm({
  bookingId,
  professionalId,
}: {
  bookingId: string;
  professionalId: string;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || photoUrls.length >= 5) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setUploading(false);
    if (res.ok) setPhotoUrls((prev) => [...prev, data.url]);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, professionalId, rating, comment, photoUrls }),
    });

    setLoading(false);
    if (res.ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <Card3D className="p-6">
        <p className="text-brand font-medium">Thank you for your review!</p>
      </Card3D>
    );
  }

  return (
    <Card3D className="p-6">
      <h3 className="font-semibold text-lg mb-4">Leave a Review</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Rating</Label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => setRating(star)}>
                <Star
                  className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-500"}`}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Comment</Label>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} className="glass-panel border-white/10 bg-background/50" />
        </div>
        <div className="space-y-2">
          <Label>Photos (optional, max 5)</Label>
          <Input type="file" accept="image/*" onChange={uploadPhoto} disabled={uploading || photoUrls.length >= 5} />
          {photoUrls.length > 0 && (
            <p className="text-xs text-muted-foreground">{photoUrls.length} photo(s) attached</p>
          )}
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </form>
    </Card3D>
  );
}
