"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n/context";
import type { UserRole } from "@prisma/client";

type AccountUser = {
  name: string | null;
  email: string;
  phone: string | null;
  city: string | null;
  role: UserRole;
};

export function AccountSettingsForm({ user }: { user: AccountUser }) {
  const router = useRouter();
  const { t } = useI18n();
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [detailsMessage, setDetailsMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  async function handleDetailsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setDetailsLoading(true);
    setDetailsError("");
    setDetailsMessage("");

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone") || null,
        city: formData.get("city") || null,
      }),
    });

    const data = await res.json();
    setDetailsLoading(false);

    if (!res.ok) {
      setDetailsError(data.error === "Email already in use" ? t.account.emailInUse : data.error || t.account.saveFailed);
      return;
    }

    setDetailsMessage(t.account.accountUpdated);
    router.refresh();
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordMessage("");

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setPasswordLoading(false);
      setPasswordError(t.auth.passwordsDoNotMatch);
      return;
    }

    const res = await fetch("/api/account/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: formData.get("currentPassword"),
        newPassword,
      }),
    });

    const data = await res.json();
    setPasswordLoading(false);

    if (!res.ok) {
      setPasswordError(
        data.error === "Current password is incorrect"
          ? t.account.currentPasswordIncorrect
          : data.error || t.account.passwordChangeFailed
      );
      return;
    }

    setPasswordMessage(t.account.passwordChanged);
    e.currentTarget.reset();
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">{t.account.settings}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t.account.settingsSubtitle}</p>
      </div>

      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle>{t.account.accountDetails}</CardTitle>
          <CardDescription>{t.account.accountDetailsDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.auth.fullName}</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name ?? ""}
                required
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t.auth.email}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email}
                required
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">{t.auth.phone}</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  defaultValue={user.phone ?? ""}
                  className="bg-background/50 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t.auth.city}</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={user.city ?? ""}
                  className="bg-background/50 border-white/10"
                />
              </div>
            </div>
            {detailsError && <p className="text-sm text-destructive">{detailsError}</p>}
            {detailsMessage && <p className="text-sm text-brand">{detailsMessage}</p>}
            <Button type="submit" className="bg-brand hover:bg-brand-dark" disabled={detailsLoading}>
              {detailsLoading ? t.account.saving : t.account.saveChanges}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="glass-panel border-white/10">
        <CardHeader>
          <CardTitle>{t.account.changePassword}</CardTitle>
          <CardDescription>{t.account.changePasswordDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">{t.account.currentPassword}</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                required
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t.auth.newPassword}</Label>
              <Input
                id="newPassword"
                name="newPassword"
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
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            {passwordMessage && <p className="text-sm text-brand">{passwordMessage}</p>}
            <Button type="submit" variant="outline" className="border-white/10" disabled={passwordLoading}>
              {passwordLoading ? t.account.updatingPassword : t.account.updatePassword}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
