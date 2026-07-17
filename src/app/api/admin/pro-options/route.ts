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

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [skills, serviceAreas, languages, categories, cities] = await Promise.all([
    prisma.predefinedSkill.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { category: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.predefinedServiceArea.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: { city: { select: { id: true, name: true } } },
    }),
    prisma.predefinedLanguage.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  return NextResponse.json({ skills, serviceAreas, languages, categories, cities });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = z.discriminatedUnion("type", [
    z.object({
      type: z.literal("skill"),
      name: z.string().min(1),
      categoryId: z.string().nullable().optional(),
      sortOrder: z.number().int().optional(),
    }),
    z.object({
      type: z.literal("serviceArea"),
      name: z.string().min(1),
      cityId: z.string(),
      sortOrder: z.number().int().optional(),
    }),
    z.object({
      type: z.literal("language"),
      name: z.string().min(1),
      sortOrder: z.number().int().optional(),
    }),
  ]).parse(body);

  if (data.type === "skill") {
    const skill = await prisma.predefinedSkill.create({
      data: {
        name: data.name.trim(),
        categoryId: data.categoryId ?? null,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json({ item: skill });
  }

  if (data.type === "serviceArea") {
    const area = await prisma.predefinedServiceArea.create({
      data: {
        name: data.name.trim(),
        cityId: data.cityId,
        sortOrder: data.sortOrder ?? 0,
      },
      include: { city: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ item: area });
  }

  const language = await prisma.predefinedLanguage.create({
    data: { name: data.name.trim(), sortOrder: data.sortOrder ?? 0 },
  });
  return NextResponse.json({ item: language });
}

export async function PATCH(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = z.discriminatedUnion("type", [
    z.object({
      type: z.literal("skill"),
      id: z.string(),
      name: z.string().min(1).optional(),
      categoryId: z.string().nullable().optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
    }),
    z.object({
      type: z.literal("serviceArea"),
      id: z.string(),
      name: z.string().min(1).optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
    }),
    z.object({
      type: z.literal("language"),
      id: z.string(),
      name: z.string().min(1).optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
    }),
  ]).parse(body);

  if (data.type === "skill") {
    const skill = await prisma.predefinedSkill.update({
      where: { id: data.id },
      data: {
        name: data.name?.trim(),
        categoryId: data.categoryId,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
    });
    return NextResponse.json({ item: skill });
  }

  if (data.type === "serviceArea") {
    const area = await prisma.predefinedServiceArea.update({
      where: { id: data.id },
      data: {
        name: data.name?.trim(),
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
      include: { city: { select: { id: true, name: true } } },
    });
    return NextResponse.json({ item: area });
  }

  const language = await prisma.predefinedLanguage.update({
    where: { id: data.id },
    data: {
      name: data.name?.trim(),
      isActive: data.isActive,
      sortOrder: data.sortOrder,
    },
  });
  return NextResponse.json({ item: language });
}

export async function DELETE(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const id = searchParams.get("id");

  if (!type || !id) {
    return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
  }

  if (type === "skill") {
    const skill = await prisma.predefinedSkill.findUnique({
      where: { id },
      include: { category: true },
    });
    if (skill?.category && skill.name === skill.category.name) {
      return NextResponse.json(
        { error: "Cannot delete the service category name skill. Deactivate it instead." },
        { status: 400 }
      );
    }
    await prisma.predefinedSkill.delete({ where: { id } });
  } else if (type === "serviceArea") {
    await prisma.predefinedServiceArea.delete({ where: { id } });
  } else if (type === "language") {
    await prisma.predefinedLanguage.delete({ where: { id } });
  } else {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
