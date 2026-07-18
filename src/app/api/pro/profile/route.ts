import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { mergeSkillsWithServices, sanitizeProSelections } from "@/lib/pro-options";

const profileSchema = z.object({
  bio: z.string().optional(),
  experienceYears: z.number().int().min(0).optional(),
  skills: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  certifications: z.array(z.string()).optional(),
  serviceAreas: z.array(z.string()).optional(),
  responseTime: z.number().int().min(0).optional().nullable(),
  image: z.string().optional(),
});

const serviceSchema = z.object({
  serviceId: z.string(),
  price: z.number().optional().nullable(),
  minPrice: z.number().optional().nullable(),
  maxPrice: z.number().optional().nullable(),
  priceType: z.enum(["fixed", "quote"]).optional(),
  description: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      services: { include: { category: true } },
      portfolio: true,
      availability: { orderBy: { dayOfWeek: "asc" } },
      user: { select: { name: true, image: true, phone: true, city: true } },
    },
  });

  return NextResponse.json({ profile: pro });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data = profileSchema.parse(body);

  const pro = await prisma.professionalProfile.findUnique({
    where: { userId: session.user.id },
    include: { services: { include: { category: true } }, user: { select: { city: true } } },
  });
  if (!pro) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const categorySlugs = pro.services.map((s) => s.category.slug);
  const categoryNames = pro.services.map((s) => s.category.name);
  const mergedSkills = data.skills
    ? mergeSkillsWithServices(categoryNames, data.skills)
    : undefined;

  const sanitized = await sanitizeProSelections({
    skills: mergedSkills,
    serviceAreas: data.serviceAreas,
    languages: data.languages,
    city: pro.user.city,
    categorySlugs,
  });

  await prisma.professionalProfile.update({
    where: { id: pro.id },
    data: {
      bio: data.bio,
      experienceYears: data.experienceYears,
      skills: sanitized.skills,
      languages: sanitized.languages,
      certifications: data.certifications ?? undefined,
      serviceAreas: sanitized.serviceAreas,
      responseTime: data.responseTime ?? undefined,
    },
  });

  if (data.image) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: data.image },
    });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "PROFESSIONAL") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  if (body.type === "service") {
    const data = serviceSchema.parse(body);
    const pro = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!pro) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.professionalService.update({
      where: { id: data.serviceId, professionalId: pro.id },
      data: {
        price: data.price,
        minPrice: data.minPrice,
        maxPrice: data.maxPrice,
        priceType: data.priceType,
        description: data.description,
      },
    });
    return NextResponse.json({ success: true });
  }

  if (body.type === "availability") {
    const pro = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!pro) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const slots = z.array(z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      isAvailable: z.boolean().default(true),
    })).parse(body.slots);

    await prisma.availability.deleteMany({ where: { professionalId: pro.id } });
    if (slots.length > 0) {
      await prisma.availability.createMany({
        data: slots.map((s) => ({ ...s, professionalId: pro.id })),
      });
    }
    return NextResponse.json({ success: true });
  }

  if (body.type === "categories") {
    const categoryIds = z.array(z.string()).parse(body.categoryIds);
    const pro = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
      include: { services: true },
    });
    if (!pro) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const existingIds = pro.services.map((s) => s.categoryId);
    const toRemove = pro.services.filter((s) => !categoryIds.includes(s.categoryId));
    const toAdd = categoryIds.filter((id) => !existingIds.includes(id));

    await prisma.$transaction([
      ...toRemove.map((s) =>
        prisma.professionalService.delete({ where: { id: s.id } })
      ),
      ...toAdd.map((categoryId) =>
        prisma.professionalService.create({
          data: {
            professionalId: pro.id,
            categoryId,
            title: "General Service",
            priceType: "quote",
          },
        })
      ),
    ]);
    return NextResponse.json({ success: true });
  }

  if (body.type === "portfolio") {
    const pro = await prisma.professionalProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!pro) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { title, description, imageUrl } = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string(),
    }).parse(body);

    const item = await prisma.portfolioItem.create({
      data: { professionalId: pro.id, title, description, imageUrl },
    });
    return NextResponse.json({ item });
  }

  return NextResponse.json({ error: "Invalid update type" }, { status: 400 });
}
