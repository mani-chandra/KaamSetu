"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthScene } from "@/components/3d/auth-scene";
import { useI18n } from "@/lib/i18n/context";
import { getDashboardPath } from "@/lib/dashboard-path";
import { ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import type { UserRole } from "@prisma/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const callbackUrl = searchParams.get("callbackUrl");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(t.auth.invalidCredentials);
      return;
    }

    const session = await getSession();
    const role = session?.user?.role as UserRole | undefined;
    const destination = callbackUrl || getDashboardPath(role);
    router.push(destination);
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-center px-12 overflow-hidden">
        <AuthScene />
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck className="h-8 w-8 text-brand" />
            <Sparkles className="h-4 w-4 text-brand-light animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold shimmer-text mb-4">{t.auth.trustedServices}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed">{t.auth.trustedServicesDesc}</p>
          <div className="mt-8 flex gap-3">
            {["Plumber", "Electrician", "Tutor", "Chef"].map((role) => (
              <span
                key={role}
                className="rounded-full glass-panel px-3 py-1 text-xs text-brand border border-brand/20"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="glass-panel border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">{t.auth.welcomeBack}</h1>
              <p className="text-sm text-muted-foreground">{t.auth.signInSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="bg-background/50 border-white/10 focus:border-brand/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.auth.password}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="bg-background/50 border-white/10 focus:border-brand/50"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full bg-brand hover:bg-brand-dark group" disabled={loading}>
                {loading ? t.auth.signingIn : t.auth.signIn}
                {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm text-muted-foreground">
              <p>
                {t.auth.noAccount}{" "}
                <Link href="/auth/register" className="text-brand hover:underline font-medium">
                  {t.nav.signUp}
                </Link>
              </p>
              <p>
                {t.auth.areProfessional}{" "}
                <Link href="/pro/register" className="text-brand hover:underline font-medium">
                  {t.auth.registerHere}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
