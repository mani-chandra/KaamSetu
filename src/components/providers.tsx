"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { OfflineListener } from "@/components/offline/offline-listener";
import { I18nProvider } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/translations";

export function Providers({
  children,
  initialLocale = "en",
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  return (
    <SessionProvider>
      <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <I18nProvider initialLocale={initialLocale}>
          {children}
          <OfflineListener />
        </I18nProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}
