import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session;
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = z.object({
    title: z.string().min(2),
    subtitle: z.string().optional(),
    linkUrl: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }).parse(await req.json());

  const banner = await prisma.promotionalBanner.create({ data });
  return NextResponse.json({ banner });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = z.object({
    id: z.string(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    linkUrl: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }).parse(await req.json());

  const banner = await prisma.promotionalBanner.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json({ banner });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();
  await prisma.promotionalBanner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
