"use client";

import { WifiOff } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

type OfflinePageProps = {
  onRetry?: () => void;
  compact?: boolean;
};

export function OfflinePage({ onRetry, compact }: OfflinePageProps) {
  const { t } = useI18n();

  return (
    <div
      className={`relative flex flex-col items-center justify-center text-center text-white ${
        compact ? "px-6 py-10" : "min-h-[70vh] px-6 py-16"
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -left-1/4 top-0 h-[50vh] w-[50vw] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute -right-1/4 bottom-0 h-[40vh] w-[40vw] rounded-full bg-amber-500/8 blur-[100px]" />
      </div>

      <div className="relative max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md">
          <WifiOff className="h-8 w-8 text-amber-300/90" strokeWidth={1.5} />
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-white/45">KaamSetu</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white/95 md:text-3xl">{t.common.offlineTitle}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/55 md:text-base">{t.common.offlineMessage}</p>

        <ul className="mt-6 space-y-2 text-left text-sm text-white/45">
          <li className="flex gap-2">
            <span className="text-teal-400">·</span>
            {t.common.offlineTipBrowse}
          </li>
          <li className="flex gap-2">
            <span className="text-teal-400">·</span>
            {t.common.offlineTipBookings}
          </li>
        </ul>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-8 rounded-full border border-white/15 bg-teal-600/80 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-500"
          >
            {t.common.offlineRetry}
          </button>
        )}
      </div>
    </div>
  );
}
