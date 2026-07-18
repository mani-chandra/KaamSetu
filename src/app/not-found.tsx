import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-32 text-center">
      <h1 className="text-8xl font-bold shimmer-text mb-4">404</h1>
      <p className="text-xl text-muted-foreground mb-8">This page doesn&apos;t exist in our dimension.</p>
      <Button asChild><Link href="/">Return Home</Link></Button>
    </div>
  );
}
