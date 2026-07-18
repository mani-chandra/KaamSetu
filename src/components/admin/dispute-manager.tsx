"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card3D } from "@/components/3d/card-3d";

type Dispute = {
  id: string;
  reason: string;
  status: string;
  booking: {
    title: string;
    customer: { user: { name: string | null } };
    professional: { user: { name: string | null } } | null;
    category: { name: string };
  };
};

export function AdminDisputeManager({ disputes: initial }: { disputes: Dispute[] }) {
  const [resolution, setResolution] = useState<Record<string, string>>({});

  async function resolve(id: string, status: "RESOLVED" | "CLOSED") {
    await fetch("/api/admin/disputes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, resolution: resolution[id] || "Resolved by admin" }),
    });
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      {initial.length === 0 ? <p className="text-muted-foreground">No disputes.</p> : null}
      {initial.map((d) => (
        <Card3D key={d.id} className="p-4 text-sm space-y-2">
          <div className="font-medium">{d.booking.title} · {d.booking.category.name}</div>
          <p>{d.reason}</p>
          <p className="text-xs text-muted-foreground">
            {d.booking.customer.user.name} vs {d.booking.professional?.user.name ?? "Unassigned"} · {d.status}
          </p>
          {d.status === "OPEN" && (
            <>
              <Textarea placeholder="Resolution note" value={resolution[d.id] || ""} onChange={(e) => setResolution({ ...resolution, [d.id]: e.target.value })} rows={2} />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => resolve(d.id, "RESOLVED")}>Resolve</Button>
                <Button size="sm" variant="outline" onClick={() => resolve(d.id, "CLOSED")}>Close</Button>
              </div>
            </>
          )}
        </Card3D>
      ))}
    </div>
  );
}
