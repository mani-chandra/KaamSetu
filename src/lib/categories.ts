import { prisma } from "@/lib/prisma";

export async function getCategoryGroups() {
  return prisma.categoryGroup.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          icon: true,
          metadata: true,
        },
      },
    },
  });
}

export async function getCategoryGroupBySlug(slug: string) {
  return prisma.categoryGroup.findUnique({
    where: { slug },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });
}
