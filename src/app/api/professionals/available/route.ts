import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  findAvailableProfessionals,
  suggestAlternateSlots,
} from "@/lib/pro-availability";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categorySlug = searchParams.get("categorySlug");
  const categoryId = searchParams.get("categoryId");
  const scheduledDate = searchParams.get("date");
  const scheduledTime = searchParams.get("time") || searchParams.get("preferredTime");
  const city = searchParams.get("city") || undefined;
  const preferredProId = searchParams.get("pro") || undefined;
  const includeAlternates = searchParams.get("alternates") === "1";

  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId && categorySlug) {
    const cat = await prisma.serviceCategory.findUnique({
      where: { slug: categorySlug },
      select: { id: true },
    });
    resolvedCategoryId = cat?.id ?? null;
  }

  if (!resolvedCategoryId) {
    return NextResponse.json({ error: "Category is required" }, { status: 400 });
  }

  if (!scheduledDate || !scheduledTime) {
    return NextResponse.json({ error: "Date and time are required" }, { status: 400 });
  }

  const professionals = await findAvailableProfessionals({
    categoryId: resolvedCategoryId,
    scheduledDate,
    scheduledTime,
    city,
    preferredProId,
  });

  const alternates =
    includeAlternates && professionals.length === 0
      ? await suggestAlternateSlots({
          categoryId: resolvedCategoryId,
          city,
          fromDate: scheduledDate,
        })
      : [];

  return NextResponse.json({
    professionals,
    alternates,
    total: professionals.length,
  });
}
