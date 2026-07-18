"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function HeaderNav() {
  const { t } = useI18n();

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
      <Link href="/search" className="hover:text-brand transition-colors">{t.nav.findServices}</Link>
      <Link href="/services" className="hover:text-brand transition-colors">{t.nav.categories}</Link>
      <Link href="/memberships" className="hover:text-brand transition-colors">{t.nav.memberships}</Link>
      <Link href="/pro/register" className="hover:text-brand transition-colors">{t.nav.becomeProfessional}</Link>
    </nav>
  );
}

export function HeaderAuthButtons({
  session,
  dashboardPath,
}: {
  session: { user: { name?: string | null } } | null;
  dashboardPath: string;
}) {
  const { t } = useI18n();

  if (session?.user) {
    return (
      <>
        <Link
          href={dashboardPath}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 hover:text-brand transition-colors"
        >
          {t.nav.dashboard}
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/auth/login"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 hover:bg-accent transition-colors"
      >
        {t.nav.logIn}
      </Link>
      <Link
        href="/auth/register"
        className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 bg-brand hover:bg-brand-dark text-white transition-colors"
      >
        {t.nav.signUp}
      </Link>
    </>
  );
}
