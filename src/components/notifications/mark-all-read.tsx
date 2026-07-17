"use client";

import { Button } from "@/components/ui/button";

export function MarkAllReadButton() {
  async function handleClick() {
    await fetch("/api/notifications", { method: "PATCH" });
    window.location.reload();
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick}>
      Mark all as read
    </Button>
  );
}
