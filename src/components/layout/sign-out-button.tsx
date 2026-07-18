"use client";

import { signOut } from "next-auth/react";
import { useI18n } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const { t } = useI18n();

  return (
    <Button
      variant="outline"
      size="sm"
      className="glass-panel border-white/10 hidden sm:inline-flex"
      onClick={() => signOut({ redirectTo: "/" })}
    >
      {t.nav.signOut}
    </Button>
  );
}
