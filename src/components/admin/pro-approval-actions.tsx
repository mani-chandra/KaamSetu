"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ProApprovalActions({ professionalId }: { professionalId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "approve" | "reject") {
    setLoading(true);
    await fetch(`/api/admin/professionals/${professionalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    window.location.reload();
  }

  return (
    <div className="flex gap-2">
      <Button size="sm" disabled={loading} onClick={() => handleAction("approve")}>
        Approve
      </Button>
      <Button size="sm" variant="destructive" disabled={loading} onClick={() => handleAction("reject")}>
        Reject
      </Button>
    </div>
  );
}
