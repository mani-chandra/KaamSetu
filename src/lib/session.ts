import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { UserRole } from "@prisma/client";

export async function getSession() {
  return auth();
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }
  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    redirect(getDashboardPath(session.user.role));
  }
  return session;
}

export function getDashboardPath(role: UserRole) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "PROFESSIONAL":
      return "/pro/dashboard";
    default:
      return "/dashboard";
  }
}
