"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/context";

export function DashboardNav() {
  const { t } = useI18n();
  const links = [
    { href: "/dashboard", label: t.dashboard.overview },
    { href: "/dashboard/bookings", label: t.dashboard.bookings },
    { href: "/dashboard/favorites", label: t.dashboard.favorites },
    { href: "/dashboard/payments", label: t.dashboard.payments },
    { href: "/dashboard/notifications", label: t.dashboard.notifications },
    { href: "/dashboard/support", label: t.dashboard.support },
  ];

  return (
    <nav className="space-y-1 glass-panel rounded-xl p-2 border border-white/10">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-3 py-2 rounded-md text-sm hover:bg-brand/10 hover:text-brand transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function ProDashboardNav() {
  const { t } = useI18n();
  const links = [
    { href: "/pro/dashboard", label: t.dashboard.overview },
    { href: "/pro/dashboard/bookings", label: t.dashboard.bookings },
    { href: "/pro/dashboard/profile", label: t.dashboard.profile },
    { href: "/pro/dashboard/availability", label: t.dashboard.availability },
    { href: "/pro/dashboard/earnings", label: t.dashboard.earnings },
    { href: "/pro/dashboard/reviews", label: t.dashboard.reviews },
    { href: "/dashboard/notifications", label: t.dashboard.notifications },
  ];

  return (
    <nav className="space-y-1 glass-panel rounded-xl p-2 border border-white/10">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-3 py-2 rounded-md text-sm hover:bg-brand/10 hover:text-brand transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminNav() {
  const { t } = useI18n();
  const links = [
    { href: "/admin", label: t.dashboard.adminDashboard },
    { href: "/admin/professionals", label: t.dashboard.professionals },
    { href: "/admin/bookings", label: t.dashboard.bookings },
    { href: "/admin/users", label: t.dashboard.users },
    { href: "/admin/categories", label: t.dashboard.categories },
    { href: "/admin/pro-options", label: t.dashboard.professionalOptions },
    { href: "/admin/cities", label: t.dashboard.cities },
    { href: "/admin/service-pages", label: t.dashboard.servicePages },
    { href: "/admin/memberships", label: t.dashboard.memberships },
    { href: "/admin/support", label: t.dashboard.support },
    { href: "/admin/disputes", label: t.dashboard.disputes },
    { href: "/admin/banners", label: t.dashboard.banners },
    { href: "/admin/reports", label: t.dashboard.reports },
  ];

  return (
    <nav className="space-y-1 glass-panel rounded-xl p-2 border border-white/10">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-3 py-2 rounded-md text-sm hover:bg-brand/10 hover:text-brand transition-colors"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
