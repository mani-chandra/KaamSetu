import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const city = searchParams.get("city") || undefined;
  const category = searchParams.get("category") || undefined;
  const minRating = searchParams.get("minRating") || undefined;
  const minExperience = searchParams.get("minExperience") || undefined;
  const language = searchParams.get("language") || undefined;
  const sort = searchParams.get("sort") || undefined;

  const where: Prisma.ProfessionalProfileWhereInput = {
    status: "APPROVED",
  };

  if (city) {
    where.user = { city: { contains: city } };
  }
  if (minRating) {
    where.avgRating = { gte: parseFloat(minRating) };
  }
  if (minExperience) {
    where.experienceYears = { gte: parseInt(minExperience, 10) };
  }
  if (language) {
    where.bio = { contains: language };
  }
  if (category) {
    where.services = { some: { category: { slug: category } } };
  }
  if (q) {
    where.OR = [
      { bio: { contains: q } },
      { user: { name: { contains: q } } },
      { services: { some: { category: { name: { contains: q } } } } },
    ];
  }

  const orderBy: Prisma.ProfessionalProfileOrderByWithRelationInput =
    sort === "experience"
      ? { experienceYears: "desc" }
      : sort === "jobs"
        ? { completedJobs: "desc" }
        : { avgRating: "desc" };

  const professionals = await prisma.professionalProfile.findMany({
    where,
    orderBy,
    include: {
      user: { select: { name: true, image: true, city: true } },
      badges: { select: { label: true } },
      services: {
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  return NextResponse.json({ professionals, total: professionals.length });
}
