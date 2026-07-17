"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

export function SaveProfessionalButton({
  professionalId,
  initialSaved,
}: {
  professionalId: string;
  initialSaved: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggleSave() {
    setLoading(true);
    const res = await fetch("/api/favorites/professionals", {
      method: saved ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ professionalId }),
    });
    if (res.ok) setSaved(!saved);
    setLoading(false);
  }

  return (
    <Button variant="outline" className="w-full" onClick={toggleSave} disabled={loading}>
      <Heart className={`h-4 w-4 mr-2 ${saved ? "fill-red-500 text-red-500" : ""}`} />
      {saved ? "Saved" : "Save Professional"}
    </Button>
  );
}
