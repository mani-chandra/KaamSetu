"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthScene } from "@/components/3d/auth-scene";
import { useI18n } from "@/lib/i18n/context";
import { Users, ArrowRight, Sparkles } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const { t } = useI18n();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        phone: formData.get("phone"),
        city: formData.get("city"),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }

    router.push("/auth/login?registered=true");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-center px-12 overflow-hidden">
        <AuthScene />
        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full glass-panel px-4 py-1.5 text-sm text-brand mb-6">
            <Sparkles className="h-4 w-4" />
            KaamSetu
          </div>
          <h2 className="text-3xl font-bold shimmer-text mb-4">{t.auth.createAccount}</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">{t.auth.registerSubtitle}</p>
          <div className="space-y-4">
            {[
              { icon: Users, text: t.auth.trustedServicesDesc },
              { icon: Sparkles, text: t.auth.growBusinessDesc },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 items-start glass-panel rounded-xl p-4 border border-white/5">
                <item.icon className="h-5 w-5 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="glass-panel border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">{t.auth.createAccount}</h1>
              <p className="text-sm text-muted-foreground">{t.auth.registerSubtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.auth.fullName}</Label>
                <Input id="name" name="name" required className="bg-background/50 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t.auth.email}</Label>
                <Input id="email" name="email" type="email" required className="bg-background/50 border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.auth.phone}</Label>
                  <Input id="phone" name="phone" type="tel" className="bg-background/50 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t.auth.city}</Label>
                  <Input id="city" name="city" placeholder="Mumbai" className="bg-background/50 border-white/10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t.auth.password}</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  minLength={6}
                  required
                  className="bg-background/50 border-white/10"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full bg-brand hover:bg-brand-dark group" disabled={loading}>
                {loading ? t.auth.creatingAccount : t.auth.createAccount}
                {!loading && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>

            <p className="text-sm text-muted-foreground mt-6 text-center">
              {t.auth.alreadyHaveAccount}{" "}
              <Link href="/auth/login" className="text-brand hover:underline font-medium">
                {t.auth.signIn}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
