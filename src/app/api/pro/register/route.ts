import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { createNotification } from "@/lib/notifications";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  city: z.string().optional(),
  bio: z.string().optional(),
  experienceYears: z.number().int().min(0).default(0),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  serviceAreas: z.array(z.string()).default([]),
  categoryIds: z.array(z.string()).default([]),
  documentUrls: z.array(z.string()).default([]),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        city: data.city,
        role: "PROFESSIONAL",
        professionalProfile: {
          create: {
            bio: data.bio,
            experienceYears: data.experienceYears,
            skills: data.skills,
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
