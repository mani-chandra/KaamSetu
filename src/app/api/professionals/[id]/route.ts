import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const professional = await prisma.professionalProfile.findUnique({
    where: { id, status: "APPROVED" },
    include: {
      user: { select: { name: true, image: true, city: true } },
      services: { include: { category: true } },
    },
  });

  if (!professional) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ professional });
}
