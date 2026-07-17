import Link from "next/link";

export function DashboardNav() {
  const links = [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/bookings", label: "Bookings" },
    { href: "/dashboard/favorites", label: "Favorites" },
    { href: "/dashboard/payments", label: "Payments" },
    { href: "/dashboard/notifications", label: "Notifications" },
    { href: "/dashboard/support", label: "Support" },
  ];

  return (
    <nav className="space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-3 py-2 rounded-md text-sm hover:bg-slate-100"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function ProDashboardNav() {
  const links = [
    { href: "/pro/dashboard", label: "Overview" },
    { href: "/pro/dashboard/bookings", label: "Bookings" },
    { href: "/pro/dashboard/profile", label: "Profile" },
    { href: "/pro/dashboard/availability", label: "Availability" },
    { href: "/pro/dashboard/earnings", label: "Earnings" },
    { href: "/pro/dashboard/reviews", label: "Reviews" },
    { href: "/dashboard/notifications", label: "Notifications" },
  ];

  return (
    <nav className="space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-3 py-2 rounded-md text-sm hover:bg-slate-100"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function AdminNav() {
  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/professionals", label: "Professionals" },
    { href: "/admin/bookings", label: "Bookings" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/banners", label: "Banners" },
    { href: "/admin/reports", label: "Reports" },
  ];

  return (
    <nav className="space-y-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="block px-3 py-2 rounded-md text-sm hover:bg-slate-100"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
