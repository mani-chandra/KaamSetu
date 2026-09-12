import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function generateUniqueShopSlug(shopName: string): Promise<string> {
  const base = slugify(shopName) || "shop";
  let slug = base;
  let suffix = 0;

  while (true) {
    const existing = await prisma.shopProfile.findUnique({ where: { slug } });
    if (!existing) return slug;
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
}
