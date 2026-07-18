import Link from "next/link";
import { auth } from "@/lib/auth";
import { getDashboardPath } from "@/lib/session";
import { ShieldCheck, Sparkles } from "lucide-react";
import { SiteControls } from "@/components/layout/site-controls";
import { HeaderNav, HeaderAuthButtons } from "@/components/layout/header-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";

export async function Header() {
  const session = await auth();
  const dashboardPath = session?.user ? getDashboardPath(session.user.role) : "/dashboard";

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-white/10 rounded-none">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-2">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand text-xl group shrink-0">
          <div className="relative">
            <ShieldCheck className="h-6 w-6 group-hover:scale-110 transition-transform" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-brand-light animate-pulse" />
          </div>
          <span className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent hidden sm:inline">
            KaamSetu
          </span>
        </Link>

        <HeaderNav />

        <div className="flex items-center gap-1 sm:gap-2">
          <SiteControls />
          {session?.user ? (
            <>
              <HeaderAuthButtons session={session} dashboardPath={dashboardPath} />
              <SignOutButton />
            </>
          ) : (
            <HeaderAuthButtons session={session} dashboardPath={dashboardPath} />
          )}
        </div>
      </div>
    </header>
  );
}
