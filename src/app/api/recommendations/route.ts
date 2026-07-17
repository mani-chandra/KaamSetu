import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    const pros = await prisma.professionalProfile.findMany({
      where: { status: "APPROVED" },
      orderBy: { avgRating: "desc" },
      take: 6,
      include: { user: true, badges: true, services: { include: { category: true } } },
    });
    return NextResponse.json({ recommendations: pros });
  }

  const customer = await prisma.customerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      bookings: { include: { category: true }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const bookedCategories = customer?.bookings.map((b) => b.categoryId) ?? [];

  const recommendations = await prisma.professionalProfile.findMany({
    where: {
      status: "APPROVED",
      ...(bookedCategories.length > 0
        ? { services: { some: { categoryId: { in: bookedCategories } } } }
        : {}),
      ...(user?.city ? { user: { city: { contains: user.city } } } : {}),
    },
    orderBy: [{ isPremium: "desc" }, { avgRating: "desc" }],
    take: 6,
    include: { user: true, badges: true, services: { include: { category: true } } },
  });

  return NextResponse.json({ recommendations });
}
