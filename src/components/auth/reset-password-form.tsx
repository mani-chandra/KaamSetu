"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useI18n } from "@/lib/i18n/context";
import { ArrowRight } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError(t.auth.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || t.auth.passwordResetInvalid);
      return;
    }

    router.push("/auth/login?reset=success");
  }

  if (!token) {
    return (
      <div className="glass-panel border-white/10 rounded-2xl p-8 shadow-2xl max-w-md w-full text-center">
        <p className="text-muted-foreground mb-6">{t.auth.passwordResetInvalid}</p>
        <Button asChild className="bg-brand hover:bg-brand-dark">
          <Link href="/auth/forgot-password">{t.auth.sendResetLink}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-panel border-white/10 rounded-2xl p-8 shadow-2xl max-w-md w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{t.auth.resetPasswordTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.resetPasswordSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="password">{t.auth.newPassword}</Label>
          <Input
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
            className="bg-background/50 border-white/10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t.auth.confirmPassword}</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            minLength={6}
            required
            className="bg-background/50 border-white/10"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full bg-brand hover:bg-brand-dark group" disabled={loading}>
          {loading ? t.auth.resettingPassword : t.auth.resetPassword}
          {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </form>
    </div>
  );
}
