import { auth } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-token";
import type { UserRole } from "@prisma/client";

export type RequestSession = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: UserRole;
    image?: string | null;
  };
};

export async function getRequestSession(req: Request): Promise<RequestSession | null> {
  const session = await auth();
  if (session?.user) {
    return session;
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return null;
  }

  const payload = await verifyMobileToken(token);
  if (!payload) {
    return null;
  }

  return {
    user: {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      image: payload.image,
    },
  };
}
