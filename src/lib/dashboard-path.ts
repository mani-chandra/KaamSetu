import type { UserRole } from "@prisma/client";

export function getDashboardPath(role: UserRole | undefined) {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "PROFESSIONAL":
      return "/pro/dashboard";
    default:
      return "/dashboard";
  }
}
