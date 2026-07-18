"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function FooterContent() {
  const { t } = useI18n();

  return (
    <footer className="glass-panel border-t border-white/10 mt-auto rounded-none">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-bold text-lg bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent mb-3">
              KaamSetu
            </h3>
            <p className="text-sm text-muted-foreground">{t.footer.tagline}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground/90">{t.footer.forCustomers}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/search" className="hover:text-brand transition-colors">{t.footer.findServices}</Link></li>
              <li><Link href="/auth/register" className="hover:text-brand transition-colors">{t.footer.signUp}</Link></li>
              <li><Link href="/dashboard/support" className="hover:text-brand transition-colors">{t.footer.support}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground/90">{t.footer.forProfessionals}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/pro/register" className="hover:text-brand transition-colors">{t.footer.joinProfessional}</Link></li>
              <li><Link href="/pro/dashboard" className="hover:text-brand transition-colors">{t.footer.professionalDashboard}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground/90">{t.footer.company}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-brand transition-colors">{t.footer.aboutUs}</Link></li>
              <li><Link href="/terms" className="hover:text-brand transition-colors">{t.footer.terms}</Link></li>
              <li><Link href="/privacy" className="hover:text-brand transition-colors">{t.footer.privacy}</Link></li>
              <li><Link href="/memberships" className="hover:text-brand transition-colors">{t.nav.memberships}</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} KaamSetu. {t.footer.rights}
        </div>
      </div>
    </footer>
  );
}
