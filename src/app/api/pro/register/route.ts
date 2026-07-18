import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createNotification } from "@/lib/notifications";
import { validateProSelections, mergeSkillsWithServices } from "@/lib/pro-options";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  experienceYears: z.number().int().min(0).default(0),
  skills: z.array(z.string()).default([]), // specializations only; category names merged server-side
  languages: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  serviceAreas: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  documentUrls: z.array(z.string()).min(1, "At least one verification document is required"),
  profilePhotoUrl: z.string().min(1, "Profile photo is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const categories = data.categoryIds.length
      ? await prisma.serviceCategory.findMany({
          where: { id: { in: data.categoryIds } },
          select: { slug: true, name: true },
        })
      : [];

    const categoryNames = categories.map((c) => c.name);
    const mergedSkills = mergeSkillsWithServices(categoryNames, data.skills);

    const validationErrors = await validateProSelections({
      skills: mergedSkills,
      serviceAreas: data.serviceAreas,
      languages: data.languages,
      city: data.city,
      categorySlugs: categories.map((c) => c.slug),
    });
    if (validationErrors.length > 0) {
      return NextResponse.json({ error: validationErrors[0] }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        city: data.city,
        image: data.profilePhotoUrl,
        role: "PROFESSIONAL",
        professionalProfile: {
          create: {
            bio: data.bio,
            experienceYears: data.experienceYears,
            skills: mergedSkills,
            languages: data.languages,
            certifications: data.certifications,
            serviceAreas: data.serviceAreas,
            documentUrls: data.documentUrls,
            status: "PENDING",
            services: data.categoryIds.length
              ? {
                  create: data.categoryIds.map((categoryId) => ({
                    categoryId,
                    title: "General Service",
                    priceType: "quote",
                  })),
                }
              : undefined,
          },
        },
      },
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          userId: admin.id,
          type: "ANNOUNCEMENT",
          title: "New professional registration",
          message: `${data.name} has submitted a professional registration for review.`,
          link: "/admin/professionals",
        })
      )
    );

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
