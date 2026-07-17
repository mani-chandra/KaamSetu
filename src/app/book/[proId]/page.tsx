import { Suspense } from "react";
import { BookForm } from "@/components/booking/book-form";

export default function BookPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-12 text-center">Loading...</div>}>
      <BookForm />
    </Suspense>
  );
}
