import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-bold text-lg text-brand mb-3">KaamSetu</h3>
            <p className="text-sm text-muted-foreground">
              India&apos;s trusted platform for local services. Find verified professionals for every need.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">For Customers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/search" className="hover:text-foreground">Find Services</Link></li>
              <li><Link href="/auth/register" className="hover:text-foreground">Sign Up</Link></li>
              <li><Link href="/dashboard/support" className="hover:text-foreground">Support</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">For Professionals</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/pro/register" className="hover:text-foreground">Join as Professional</Link></li>
              <li><Link href="/pro/dashboard" className="hover:text-foreground">Pro Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/memberships" className="hover:text-foreground">Memberships</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} KaamSetu. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
