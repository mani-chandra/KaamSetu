"use client";

import { Button } from "@/components/ui/button";
import { Card3D } from "@/components/3d/card-3d";

type Ticket = {
  id: string;
  subject: string;
  message: string;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string; role: string };
};

export function AdminSupportManager({ tickets: initial }: { tickets: Ticket[] }) {
  async function updateStatus(id: string, status: string) {
    await fetch("/api/admin/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    window.location.reload();
  }

  return (
    <div className="space-y-3">
      {initial.length === 0 ? <p className="text-muted-foreground">No tickets.</p> : null}
      {initial.map((t) => (
        <Card3D key={t.id} className="p-4 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">{t.subject}</span>
            <span className="text-muted-foreground">{t.status}</span>
          </div>
          <p className="text-muted-foreground">{t.message}</p>
          <p className="text-xs">{t.user.name} · {t.user.email} · {t.user.role}</p>
          {t.status === "OPEN" && (
            <Button size="sm" onClick={() => updateStatus(t.id, "RESOLVED")}>Mark resolved</Button>
          )}
        </Card3D>
      ))}
    </div>
  );
}
