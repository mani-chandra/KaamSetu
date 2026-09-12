import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@prisma/client";

const MOBILE_TOKEN_EXPIRY = "30d";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export type MobileTokenPayload = {
  sub: string;
  email: string;
  name?: string | null;
  role: UserRole;
  image?: string | null;
};

export async function signMobileToken(user: {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  image?: string | null;
}): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name ?? null,
    role: user.role,
    image: user.image ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(MOBILE_TOKEN_EXPIRY)
    .sign(getSecret());
}

export async function verifyMobileToken(token: string): Promise<MobileTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.role !== "string") {
      return null;
    }
    return {
      sub: payload.sub,
      email: payload.email,
      name: (payload.name as string | null | undefined) ?? null,
      role: payload.role as UserRole,
      image: (payload.image as string | null | undefined) ?? null,
    };
  } catch {
    return null;
  }
}
