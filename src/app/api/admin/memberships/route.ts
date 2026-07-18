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

  const plans = await prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ plans });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = z.object({
    name: z.string().min(2),
    target: z.enum(["CUSTOMER", "PROFESSIONAL"]),
    description: z.string().optional(),
    price: z.number().positive(),
    features: z.array(z.string()).default([]),
  }).parse(await req.json());

  const plan = await prisma.membershipPlan.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
      target: data.target,
      description: data.description,
      price: data.price,
      features: data.features,
    },
  });
  return NextResponse.json({ plan });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = z.object({
    id: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().optional(),
    features: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }).parse(await req.json());

  const plan = await prisma.membershipPlan.update({
    where: { id: data.id },
    data,
  });
  return NextResponse.json({ plan });
}
