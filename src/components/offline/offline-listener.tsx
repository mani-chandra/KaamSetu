"use client";

import { useCallback, useEffect, useState } from "react";
import { OfflinePage } from "@/components/offline/offline-page";

export function OfflineListener() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(typeof navigator !== "undefined" && !navigator.onLine);

    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* SW optional — offline overlay still works */
      });
    }

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const retry = useCallback(() => {
    if (navigator.onLine) {
      setOffline(false);
      return;
    }
    window.location.reload();
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-[#070b10]">
      <OfflinePage onRetry={retry} />
    </div>
  );
}
