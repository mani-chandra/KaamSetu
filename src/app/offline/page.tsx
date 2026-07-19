"use client";

import { OfflinePage } from "@/components/offline/offline-page";

export default function OfflineRoutePage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-[#070b10]">
      <OfflinePage onRetry={() => window.location.reload()} />
    </div>
  );
}
