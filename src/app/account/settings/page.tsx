import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AccountSettingsForm } from "@/components/account/account-settings-form";
import { getDashboardPath } from "@/lib/dashboard-path";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AccountSettingsPage() {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, city: true, role: true },
  });

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href={getDashboardPath(user.role)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <AccountSettingsForm user={user} />
    </div>
  );
}
