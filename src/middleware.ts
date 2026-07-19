import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";
import { getDashboardPath } from "@/lib/dashboard-path";

export default NextAuth(authConfig).auth((req) => {
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

  if (pathname.startsWith("/account")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/book/:path*",
    "/dashboard/:path*",
    "/pro/dashboard/:path*",
    "/admin/:path*",
    "/account/:path*",
  ],
};
