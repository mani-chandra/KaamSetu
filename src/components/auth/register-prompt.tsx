"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

const STORAGE_KEY = "kaamsetu-register-prompt-dismissed";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;
const MIN_DELAY_MS = 25_000;
const MAX_DELAY_MS = 70_000;

function shouldSkipPath(pathname: string) {
  return (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/pro/register") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/pro/dashboard")
  );
}

function wasRecentlyDismissed() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    return Number.isFinite(ts) && Date.now() - ts < COOLDOWN_MS;
  } catch {
    return false;
  }
}

function dismissPrompt() {
  try {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* storage optional */
  }
}

export function RegisterPrompt() {
  const { status } = useSession();
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => {
    dismissPrompt();
    setOpen(false);
  }, []);

  useEffect(() => {
    if (status === "loading" || status === "authenticated") return;
    if (shouldSkipPath(pathname)) return;
    if (wasRecentlyDismissed()) return;

    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
    const timer = window.setTimeout(() => setOpen(true), delay);
    return () => window.clearTimeout(timer);
  }, [status, pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label={t.auth.registerPromptLater}
        className="fixed inset-0 z-[150] bg-black/55 backdrop-blur-sm"
        onClick={close}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="register-prompt-title"
        className="fixed left-1/2 top-1/2 z-[151] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 animate-in fade-in zoom-in-95 duration-300"
      >
        <div className="glass-panel relative overflow-hidden rounded-2xl border border-white/10 p-6 shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/20 blur-3xl" />

          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
            aria-label={t.auth.registerPromptLater}
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            KaamSetu
          </div>

          <h2 id="register-prompt-title" className="text-xl font-bold sm:text-2xl">
            {t.auth.registerPromptTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t.auth.registerPromptDesc}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild className="w-full bg-brand hover:bg-brand-dark group sm:flex-1">
              <Link href="/auth/register" onClick={close}>
                {t.auth.registerPromptCta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full border-white/10 sm:flex-1" onClick={close}>
              {t.auth.registerPromptLater}
            </Button>
          </div>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {t.auth.alreadyHaveAccount}{" "}
            <Link href="/auth/login" className="font-medium text-brand hover:underline" onClick={close}>
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
