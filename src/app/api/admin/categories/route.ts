import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { syncCategoryNameAsSkill } from "@/lib/pro-options";

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

  const body = await req.json();
  const data = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    icon: z.string().optional(),
    sortOrder: z.number().int().optional(),
  }).parse(body);

  const slug = slugify(data.name);
  const category = await prisma.serviceCategory.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      icon: data.icon,
      sortOrder: data.sortOrder ?? 0,
      servicePage: {
        create: {
          headline: `Professional ${data.name} Services`,
          content: data.description,
          whatsIncluded: ["Verified professionals", "Transparent pricing"],
        },
      },
    },
  });

  await syncCategoryNameAsSkill(category.id, category.name);

  return NextResponse.json({ category });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = z.object({
    id: z.string(),
    name: z.string().min(2).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  }).parse(body);

  const existing = await prisma.serviceCategory.findUnique({ where: { id: data.id } });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const category = await prisma.serviceCategory.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description,
      icon: data.icon,
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
  });

  if (data.name && data.name !== existing.name) {
    await prisma.predefinedSkill.updateMany({
      where: { categoryId: category.id, name: existing.name },
      data: { name: data.name },
    });
    await syncCategoryNameAsSkill(category.id, category.name);
  } else if (data.name) {
    await syncCategoryNameAsSkill(category.id, category.name);
  }

  return NextResponse.json({ category });
}
