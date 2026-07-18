import { Suspense } from "react";
import { BookWizard } from "@/components/booking/book-wizard";

export default function EmergencyBookPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center">Loading...</div>}>
      <BookWizard mode="emergency" />
    </Suspense>
  );
}
