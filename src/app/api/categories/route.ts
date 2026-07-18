import { NextResponse } from "next/server";
import { getCategoryGroups } from "@/lib/categories";
import { getServiceIcon } from "@/lib/service-icons";

export async function GET() {
  const groups = await getCategoryGroups();

  const categories = groups.flatMap((g) =>
    g.categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      icon: c.icon,
      description: c.description,
      groupSlug: g.slug,
      groupName: g.name,
    }))
  );

  return NextResponse.json({
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      icon: g.icon,
      description: g.description,
      categories: g.categories.map((c) => ({
        ...c,
        icon: getServiceIcon(c.slug, c.icon),
      })),
    })),
    categories,
  });
}
