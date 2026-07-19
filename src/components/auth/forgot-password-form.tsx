"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/context";
import { ArrowLeft, ArrowRight } from "lucide-react";

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: formData.get("email") }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || t.auth.forgotPasswordFailed);
      return;
    }

    setSent(true);
  }

  return (
    <div className="glass-panel border-white/10 rounded-2xl p-8 shadow-2xl max-w-md w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{t.auth.forgotPasswordTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.forgotPasswordSubtitle}</p>
      </div>

      {sent ? (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground leading-relaxed">{t.auth.resetLinkSent}</p>
          <Button asChild variant="outline" className="w-full border-white/10">
            <Link href="/auth/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t.auth.backToSignIn}
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              className="bg-background/50 border-white/10"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full bg-brand hover:bg-brand-dark group" disabled={loading}>
            {loading ? t.auth.sendingResetLink : t.auth.sendResetLink}
            {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-brand hover:underline font-medium">
              {t.auth.backToSignIn}
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
