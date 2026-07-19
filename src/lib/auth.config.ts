import type { NextAuthConfig } from "next-auth";

type AppRole = "CUSTOMER" | "PROFESSIONAL" | "ADMIN";

/**
 * Edge-safe Auth.js config — used by middleware only.
 * Keep Prisma, bcrypt, and Credentials provider in auth.ts.
 */
export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id!;
        token.role = (user as { role: AppRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AppRole;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
