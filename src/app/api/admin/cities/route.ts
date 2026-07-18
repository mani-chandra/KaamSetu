import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cities = await prisma.city.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { serviceAreas: true } } },
  });
  return NextResponse.json({ cities });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = z.object({
    name: z.string().min(2),
    state: z.string().optional(),
  }).parse(await req.json());

  const city = await prisma.city.create({
    data: { name: data.name, slug: slugify(data.name), state: data.state },
  });
  return NextResponse.json({ city });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = z.object({
    id: z.string(),
    name: z.string().min(2).optional(),
    state: z.string().optional(),
    isActive: z.boolean().optional(),
  }).parse(await req.json());

  const city = await prisma.city.update({
    where: { id: data.id },
    data: { name: data.name, state: data.state, isActive: data.isActive },
  });
  return NextResponse.json({ city });
}
