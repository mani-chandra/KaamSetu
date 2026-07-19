import { Suspense } from "react";
import { ResetPasswordPageClient } from "@/components/auth/reset-password-page-client";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Suspense fallback={null}>
        <ResetPasswordPageClient />
      </Suspense>
    </div>
  );
}
