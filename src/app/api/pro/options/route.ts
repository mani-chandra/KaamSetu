import { NextResponse } from "next/server";
import {
  getLanguageOptions,
  getServiceAreasForCity,
  getSkillsForCategories,
  getSpecializationsForCategories,
} from "@/lib/pro-options";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city") || "";
  let categorySlugs = searchParams.get("categories")?.split(",").filter(Boolean) ?? [];

  if (categorySlugs.length === 0 && searchParams.get("userId")) {
    const pro = await prisma.professionalProfile.findFirst({
      where: { userId: searchParams.get("userId")! },
      include: { services: { include: { category: true } }, user: true },
    });
    if (pro) {
      categorySlugs = pro.services.map((s) => s.category.slug);
      const [skills, specializations, serviceAreas, languages] = await Promise.all([
        getSkillsForCategories(categorySlugs),
        getSpecializationsForCategories(categorySlugs),
        getServiceAreasForCity(pro.user.city || city),
        getLanguageOptions(),
      ]);
      return NextResponse.json({
        skills,
        specializations,
        serviceAreas,
        languages,
        city: pro.user.city,
      });
    }
  }

  const [skills, specializations, serviceAreas, languages] = await Promise.all([
    getSkillsForCategories(categorySlugs),
    getSpecializationsForCategories(categorySlugs),
    getServiceAreasForCity(city),
    getLanguageOptions(),
  ]);

  return NextResponse.json({
    skills,
    specializations,
    serviceAreas,
    languages,
    city,
  });
}
