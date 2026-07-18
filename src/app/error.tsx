"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="text-4xl font-bold text-destructive mb-4">Something went wrong</h1>
      <p className="text-muted-foreground mb-8">An unexpected error occurred. Please try again.</p>
      <div className="flex gap-4 justify-center">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" asChild><Link href="/">Go home</Link></Button>
      </div>
    </div>
  );
}
