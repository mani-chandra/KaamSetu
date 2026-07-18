import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;
  const isLoggedIn = !!req.auth;

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
  matcher: ["/dashboard/:path*", "/pro/dashboard/:path*", "/admin/:path*"],
};
