import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pages = await prisma.servicePage.findMany({
    include: { category: { select: { id: true, name: true, slug: true } } },
    orderBy: { category: { sortOrder: "asc" } },
  });
  return NextResponse.json({ pages });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = z.object({
    categoryId: z.string(),
    headline: z.string().optional(),
    content: z.string().optional(),
    pricingGuidance: z.string().optional(),
    whatsIncluded: z.array(z.string()).optional(),
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  }).parse(await req.json());

  const page = await prisma.servicePage.update({
    where: { categoryId: data.categoryId },
    data: {
      headline: data.headline,
      content: data.content,
      pricingGuidance: data.pricingGuidance,
      whatsIncluded: data.whatsIncluded,
      faq: data.faq,
    },
    include: { category: true },
  });
  return NextResponse.json({ page });
}
