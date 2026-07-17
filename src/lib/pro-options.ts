import { prisma } from "@/lib/prisma";

export async function getSkillsForCategories(categorySlugs: string[]): Promise<string[]> {
  const skills = new Set<string>();

  const allCategories = await prisma.serviceCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true },
  });

  // Every service category name is always selectable (Electrician, Cleaner, etc.)
  for (const category of allCategories) {
    skills.add(category.name);
  }

  const offeredCategories = categorySlugs.length
    ? allCategories.filter((c) => categorySlugs.includes(c.slug))
    : allCategories;

  const categoryIds = offeredCategories.map((c) => c.id);
  const dbSkills = await prisma.predefinedSkill.findMany({
    where: {
      isActive: true,
      OR: [
        { categoryId: null },
        ...(categoryIds.length ? [{ categoryId: { in: categoryIds } }] : []),
      ],
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { name: true },
  });

  for (const skill of dbSkills) {
    skills.add(skill.name);
  }

  return Array.from(skills).sort();
}

export async function getServiceAreasForCity(city: string): Promise<string[]> {
  if (!city) return getAllServiceAreas();

  const cityRecord = await prisma.city.findFirst({
    where: { name: { equals: city } },
    select: { id: true },
  });
  if (!cityRecord) return getAllServiceAreas();

  const areas = await prisma.predefinedServiceArea.findMany({
    where: { cityId: cityRecord.id, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { name: true },
  });

  return areas.map((a) => a.name);
}

export async function getAllServiceAreas(): Promise<string[]> {
  const areas = await prisma.predefinedServiceArea.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { name: true },
  });
  return Array.from(new Set(areas.map((a) => a.name))).sort();
}

export async function getLanguageOptions(): Promise<string[]> {
  const languages = await prisma.predefinedLanguage.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { name: true },
  });
  return languages.map((l) => l.name);
}

export async function getActiveCities(): Promise<{ id: string; name: string }[]> {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function validateProSelections(input: {
  skills?: string[];
  serviceAreas?: string[];
  languages?: string[];
  city?: string | null;
  categorySlugs?: string[];
}) {
  const errors: string[] = [];
  const [allowedSkills, allowedAreas, allowedLanguages] = await Promise.all([
    getSkillsForCategories(input.categorySlugs ?? []),
    input.city ? getServiceAreasForCity(input.city) : getAllServiceAreas(),
    getLanguageOptions(),
  ]);

  const skillSet = new Set(allowedSkills);
  const areaSet = new Set(allowedAreas);
  const langSet = new Set(allowedLanguages);

  for (const skill of input.skills ?? []) {
    if (!skillSet.has(skill)) errors.push(`Invalid skill: ${skill}`);
  }
  for (const area of input.serviceAreas ?? []) {
    if (!areaSet.has(area)) errors.push(`Invalid service area: ${area}`);
  }
  for (const lang of input.languages ?? []) {
    if (!langSet.has(lang)) errors.push(`Invalid language: ${lang}`);
  }

  return errors;
}

/** Keep only values that exist in the current predefined lists. */
export async function sanitizeProSelections(input: {
  skills?: string[];
  serviceAreas?: string[];
  languages?: string[];
  city?: string | null;
  categorySlugs?: string[];
}) {
  const [allowedSkills, allowedAreas, allowedLanguages] = await Promise.all([
    getSkillsForCategories(input.categorySlugs ?? []),
    input.city ? getServiceAreasForCity(input.city) : getAllServiceAreas(),
    getLanguageOptions(),
  ]);

  const skillSet = new Set(allowedSkills);
  const areaSet = new Set(allowedAreas);
  const langSet = new Set(allowedLanguages);

  return {
    skills: input.skills?.filter((s) => skillSet.has(s)) ?? [],
    serviceAreas: input.serviceAreas?.filter((a) => areaSet.has(a)) ?? [],
    languages: input.languages?.filter((l) => langSet.has(l)) ?? [],
  };
}

/** Ensures a service category name exists as a selectable skill. */
export async function syncCategoryNameAsSkill(categoryId: string, categoryName: string) {
  await prisma.predefinedSkill.upsert({
    where: { categoryId_name: { categoryId, name: categoryName } },
    update: { isActive: true },
    create: { categoryId, name: categoryName, sortOrder: 0 },
  });
}
