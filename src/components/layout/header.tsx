import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { getDashboardPath } from "@/lib/session";
import { Button } from "@/components/ui/button";
import { ShieldCheck } from "lucide-react";

export async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-brand text-xl">
          <ShieldCheck className="h-6 w-6" />
          KaamSetu
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/search" className="hover:text-foreground">Find Services</Link>
          <Link href="/services" className="hover:text-foreground">Categories</Link>
          <Link href="/pro/register" className="hover:text-foreground">Become a Professional</Link>
        </nav>

        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <Button variant="ghost" asChild>
                <Link href={getDashboardPath(session.user.role)}>Dashboard</Link>
              </Button>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="outline" type="submit" size="sm">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">Sign up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
