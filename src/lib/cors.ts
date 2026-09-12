import { NextResponse } from "next/server";

/** Routes called by the Expo mobile app (cross-origin). */
const MOBILE_CORS_PREFIXES = [
  "/api/mobile",
  "/api/categories",
  "/api/cities",
  "/api/recommendations",
  "/api/bookings",
  "/api/notifications",
  "/api/account",
  "/api/professionals",
];

export function isMobileCorsRoute(pathname: string): boolean {
  return MOBILE_CORS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function withCors(response: NextResponse, origin?: string | null): NextResponse {
  // Bearer-token API — no cookies; allow Expo web and dev origins.
  const allowOrigin = origin || "*";
  response.headers.set("Access-Control-Allow-Origin", allowOrigin);
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Max-Age", "86400");
  return response;
}

export function handleCorsPreflight(req: Request): NextResponse | null {
  if (req.method !== "OPTIONS") return null;
  return withCors(new NextResponse(null, { status: 204 }), req.headers.get("origin"));
}
