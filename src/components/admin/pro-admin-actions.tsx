"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

export function ProAdminActions({
  professionalId,
  status,
}: {
  professionalId: string;
  status: string;
}) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  async function handleAction(action: "approve" | "reject" | "remove" | "reactivate") {
    if (action === "remove" && !window.confirm(t.admin.removeConfirm)) return;

    setLoading(true);
    await fetch(`/api/admin/professionals/${professionalId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setLoading(false);
    window.location.reload();
  }

  if (status === "PENDING") {
    return (
      <div className="flex flex-wrap gap-2">
        <Button size="sm" disabled={loading} onClick={() => handleAction("approve")}>
          {t.admin.approve}
        </Button>
        <Button size="sm" variant="destructive" disabled={loading} onClick={() => handleAction("reject")}>
          {t.admin.reject}
        </Button>
      </div>
    );
  }

  if (status === "APPROVED") {
    return (
      <Button size="sm" variant="destructive" disabled={loading} onClick={() => handleAction("remove")}>
        {t.admin.removeFromPlatform}
      </Button>
    );
  }

  if (status === "SUSPENDED") {
    return (
      <Button size="sm" disabled={loading} onClick={() => handleAction("reactivate")}>
        {t.admin.reactivatePro}
      </Button>
    );
  }

  return null;
}
