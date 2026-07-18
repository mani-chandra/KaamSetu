import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getDashboardPath } from "@/lib/dashboard-path";

export default auth((req) => {
  const { pathname, search } = req.nextUrl;
  const role = req.auth?.user?.role;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith("/book")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
    if (role === "PROFESSIONAL") {
      return NextResponse.redirect(new URL(getDashboardPath(role), req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  if (pathname.startsWith("/pro/dashboard")) {
    if (!isLoggedIn || role !== "PROFESSIONAL") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!isLoggedIn || (role !== "CUSTOMER" && role !== "ADMIN")) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/book/:path*", "/dashboard/:path*", "/pro/dashboard/:path*", "/admin/:path*"],
};
